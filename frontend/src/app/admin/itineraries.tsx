import { Link, useRouter } from 'expo-router';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';

import { deleteItineraryRequest } from '@/api/admin';
import type { Itinerary } from '@/data/itineraries';
import { useRequireAdmin } from '@/context/AdminAuthContext';
import { useItineraries } from '@/context/ItinerariesContext';

export default function AdminItinerariesScreen() {
  useRequireAdmin();
  const router = useRouter();
  const { itineraries, isLoading, error, refetch } = useItineraries();

  const confirmDelete = (itinerary: Itinerary) => {
    const doDelete = async () => {
      await deleteItineraryRequest(itinerary.id);
      refetch();
    };
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (window.confirm(`Delete "${itinerary.title}"? This cannot be undone.`)) {
        doDelete();
      }
      return;
    }
    Alert.alert('Delete itinerary', `Delete "${itinerary.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: doDelete },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1f2937" size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.addButton} onPress={() => router.push('/admin/itineraries/new')}>
        <Text style={styles.addButtonText}>+ Add itinerary</Text>
      </Pressable>
      <FlatList
        data={itineraries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardBody}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>
                {item.location} · {item.durationDays} days · ₹{item.basePricePerPerson.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.actions}>
              <Link href={{ pathname: '/admin/itineraries/[id]/edit', params: { id: item.id } }} asChild>
                <Pressable style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Edit</Text>
                </Pressable>
              </Link>
              <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={() => confirmDelete(item)}>
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', padding: 24 },
  errorText: { color: '#b3463f', fontSize: 15, textAlign: 'center' },
  addButton: { margin: 16, backgroundColor: '#1f2937', borderRadius: 12, padding: 14, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: '700' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12 },
  cardBody: { marginBottom: 10 },
  title: { fontSize: 15, fontWeight: '700', color: '#111827' },
  meta: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10 },
  actionButton: { flex: 1, backgroundColor: '#1f2937', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  actionButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  deleteButton: { backgroundColor: '#fde8e6' },
  deleteButtonText: { color: '#b3463f' },
});
