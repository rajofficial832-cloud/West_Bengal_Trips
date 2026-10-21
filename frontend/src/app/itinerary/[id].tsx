import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useItineraries } from '@/context/ItinerariesContext';

const MIN_GROUP_SIZE = 1;
const MAX_GROUP_SIZE = 12;
const SELECTABLE_DAYS_AHEAD = 30;

function buildSelectableDates(count: number): { iso: string; weekday: string; day: string; month: string }[] {
  const dates = [];
  for (let offset = 1; offset <= count; offset += 1) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    dates.push({
      iso: date.toISOString().slice(0, 10),
      weekday: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      day: date.toLocaleDateString('en-IN', { day: '2-digit' }),
      month: date.toLocaleDateString('en-IN', { month: 'short' }),
    });
  }
  return dates;
}

export default function ItineraryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { getItineraryById } = useItineraries();
  const [groupSize, setGroupSize] = useState(MIN_GROUP_SIZE);
  const [added, setAdded] = useState(false);
  const selectableDates = useMemo(() => buildSelectableDates(SELECTABLE_DAYS_AHEAD), []);
  const [travelDate, setTravelDate] = useState(selectableDates[0].iso);

  const itinerary = getItineraryById(id);

  if (!itinerary) {
    return (
      <View style={styles.center}>
        <Text>Trip not found.</Text>
      </View>
    );
  }

  const totalPrice = itinerary.basePricePerPerson * groupSize;

  const changeGroupSize = (delta: number) => {
    setGroupSize((current) => Math.min(MAX_GROUP_SIZE, Math.max(MIN_GROUP_SIZE, current + delta)));
    setAdded(false);
  };

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    await addToCart(itinerary.id, groupSize, travelDate);
    setAdded(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: itinerary.image }} style={styles.image} />
      <Text style={styles.title}>{itinerary.title}</Text>
      <Text style={styles.meta}>
        {itinerary.location} · {itinerary.durationDays} days
      </Text>
      <Text style={styles.description}>{itinerary.description}</Text>

      <Text style={styles.sectionLabel}>Highlights</Text>
      {itinerary.highlights.map((highlight) => (
        <Text key={highlight} style={styles.highlight}>
          • {highlight}
        </Text>
      ))}

      <View style={styles.groupCard}>
        <Text style={styles.sectionLabel}>Group size</Text>
        <View style={styles.stepperRow}>
          <Pressable
            onPress={() => changeGroupSize(-1)}
            style={styles.stepperButton}
            disabled={groupSize <= MIN_GROUP_SIZE}
          >
            <Text style={styles.stepperButtonText}>−</Text>
          </Pressable>
          <Text style={styles.groupSizeValue}>{groupSize}</Text>
          <Pressable
            onPress={() => changeGroupSize(1)}
            style={styles.stepperButton}
            disabled={groupSize >= MAX_GROUP_SIZE}
          >
            <Text style={styles.stepperButtonText}>+</Text>
          </Pressable>
        </View>
        <Text style={styles.priceBreakdown}>
          ₹{itinerary.basePricePerPerson.toLocaleString('en-IN')} × {groupSize}
        </Text>
        <Text style={styles.totalPrice}>₹{totalPrice.toLocaleString('en-IN')}</Text>
      </View>

      <Text style={styles.sectionLabel}>Travel date</Text>
      <FlatList
        horizontal
        data={selectableDates}
        keyExtractor={(date) => date.iso}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateListContent}
        renderItem={({ item }) => {
          const isSelected = item.iso === travelDate;
          return (
            <Pressable
              onPress={() => {
                setTravelDate(item.iso);
                setAdded(false);
              }}
              style={[styles.dateChip, isSelected && styles.dateChipSelected]}
            >
              <Text style={[styles.dateChipWeekday, isSelected && styles.dateChipTextSelected]}>
                {item.weekday}
              </Text>
              <Text style={[styles.dateChipDay, isSelected && styles.dateChipTextSelected]}>{item.day}</Text>
              <Text style={[styles.dateChipMonth, isSelected && styles.dateChipTextSelected]}>{item.month}</Text>
            </Pressable>
          );
        }}
      />

      <Pressable style={styles.addButton} onPress={handleAddToCart}>
        <Text style={styles.addButtonText}>{added ? 'Added ✓ — Update cart' : 'Add to Cart'}</Text>
      </Pressable>

      {added && (
        <Pressable style={styles.viewCartButton} onPress={() => router.push('/cart')}>
          <Text style={styles.viewCartButtonText}>View Cart</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: 220 },
  title: { fontSize: 22, fontWeight: '700', color: '#17332c', marginHorizontal: 20, marginTop: 16 },
  meta: { fontSize: 14, color: '#6a7a73', marginHorizontal: 20, marginTop: 4 },
  description: { fontSize: 15, color: '#3a4a44', marginHorizontal: 20, marginTop: 12, lineHeight: 21 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#17332c', marginHorizontal: 20, marginTop: 18 },
  highlight: { fontSize: 14, color: '#3a4a44', marginHorizontal: 20, marginTop: 6 },
  groupCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f6f8f7',
    borderRadius: 16,
  },
  dateListContent: { paddingHorizontal: 20, paddingTop: 10, gap: 10 },
  dateChip: {
    width: 56,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#f6f8f7',
    alignItems: 'center',
    marginRight: 10,
  },
  dateChipSelected: { backgroundColor: '#0f6e5f' },
  dateChipWeekday: { fontSize: 11, color: '#6a7a73', fontWeight: '600' },
  dateChipDay: { fontSize: 18, color: '#17332c', fontWeight: '700', marginTop: 2 },
  dateChipMonth: { fontSize: 11, color: '#6a7a73', fontWeight: '600' },
  dateChipTextSelected: { color: '#fff' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0f6e5f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  groupSizeValue: { fontSize: 20, fontWeight: '700', color: '#17332c', marginHorizontal: 24 },
  priceBreakdown: { fontSize: 13, color: '#6a7a73', marginTop: 14 },
  totalPrice: { fontSize: 24, fontWeight: '800', color: '#0f6e5f', marginTop: 4 },
  addButton: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#0f6e5f',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  viewCartButton: { marginHorizontal: 20, marginTop: 12, alignItems: 'center' },
  viewCartButtonText: { color: '#0f6e5f', fontSize: 15, fontWeight: '600' },
});
