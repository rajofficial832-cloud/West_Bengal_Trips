import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { updateItineraryRequest } from '@/api/admin';
import { useRequireAdmin } from '@/context/AdminAuthContext';
import { useItineraries } from '@/context/ItinerariesContext';

export default function EditItineraryScreen() {
  useRequireAdmin();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getItineraryById, isLoading: itinerariesLoading, refetch } = useItineraries();
  const itinerary = id ? getItineraryById(id) : undefined;

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [basePricePerPerson, setBasePricePerPerson] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [highlights, setHighlights] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (itinerary && !hydrated) {
      setTitle(itinerary.title);
      setLocation(itinerary.location);
      setDurationDays(String(itinerary.durationDays));
      setBasePricePerPerson(String(itinerary.basePricePerPerson));
      setImage(itinerary.image);
      setDescription(itinerary.description);
      setHighlights(itinerary.highlights.join(', '));
      setHydrated(true);
    }
  }, [itinerary, hydrated]);

  if (itinerariesLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1f2937" size="large" />
      </View>
    );
  }

  if (!itinerary) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Itinerary not found.</Text>
      </View>
    );
  }

  const handleSubmit = async () => {
    setError(null);
    const days = Number(durationDays);
    const price = Number(basePricePerPerson);
    if (!title || !location || !days || !price || !image || !description) {
      setError('Please fill in all fields with valid values.');
      return;
    }
    setSubmitting(true);
    try {
      await updateItineraryRequest(itinerary.id, {
        title,
        location,
        durationDays: days,
        basePricePerPerson: price,
        image,
        description,
        highlights: highlights
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      });
      await refetch();
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Edit Itinerary</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      <Field label="Title" value={title} onChangeText={setTitle} />
      <Field label="Location" value={location} onChangeText={setLocation} />
      <Field label="Duration (days)" value={durationDays} onChangeText={setDurationDays} keyboardType="number-pad" />
      <Field
        label="Base price per person"
        value={basePricePerPerson}
        onChangeText={setBasePricePerPerson}
        keyboardType="number-pad"
      />
      <Field label="Image URL" value={image} onChangeText={setImage} autoCapitalize="none" />
      <Field label="Description" value={description} onChangeText={setDescription} multiline />
      <Field label="Highlights (comma separated)" value={highlights} onChangeText={setHighlights} />

      <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Save</Text>}
      </Pressable>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences';
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 24 },
  errorText: { color: '#b3463f', fontSize: 15, textAlign: 'center' },
  content: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 16 },
  error: { color: '#b3463f', marginBottom: 12 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  multilineInput: { minHeight: 90, textAlignVertical: 'top' },
  submitButton: {
    marginTop: 10,
    backgroundColor: '#1f2937',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
