import { Link } from 'expo-router';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useItineraries } from '@/context/ItinerariesContext';
import type { Itinerary } from '@/data/itineraries';

export default function HomeScreen() {
  const { itineraries, isLoading, error, refetch } = useItineraries();

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator color="#0f6e5f" size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={itineraries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Discover West Bengal</Text>
            <Text style={styles.heroSubtitle}>
              Hand-picked trip plans across hills, beaches, and heritage towns
            </Text>
          </View>
        }
        renderItem={({ item }) => <ItineraryCard itinerary={item} />}
      />
    </View>
  );
}

function ItineraryCard({ itinerary }: { itinerary: Itinerary }) {
  return (
    <Link href={{ pathname: '/itinerary/[id]', params: { id: itinerary.id } }} asChild>
      <Pressable style={styles.card}>
        <Image source={{ uri: itinerary.image }} style={styles.cardImage} />
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{itinerary.title}</Text>
          <Text style={styles.cardMeta}>
            {itinerary.location} · {itinerary.durationDays} days
          </Text>
          <Text style={styles.cardPrice}>₹{itinerary.basePricePerPerson.toLocaleString('en-IN')} / person</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8f7' },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f6f8f7', padding: 24 },
  errorText: { fontSize: 15, color: '#b3463f', textAlign: 'center', marginBottom: 16 },
  retryButton: { backgroundColor: '#0f6e5f', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  retryButtonText: { color: '#fff', fontWeight: '700' },
  listContent: { paddingBottom: 24 },
  hero: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  heroTitle: { fontSize: 26, fontWeight: '700', color: '#17332c' },
  heroSubtitle: { fontSize: 14, color: '#55675f', marginTop: 6 },
  card: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardImage: { width: '100%', height: 160 },
  cardBody: { padding: 14 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#17332c' },
  cardMeta: { fontSize: 13, color: '#6a7a73', marginTop: 4 },
  cardPrice: { fontSize: 15, fontWeight: '600', color: '#0f6e5f', marginTop: 8 },
});
