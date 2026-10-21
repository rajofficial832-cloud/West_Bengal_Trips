import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Order } from '@/context/OrdersContext';
import { useOrders } from '@/context/OrdersContext';
import { useItineraries } from '@/context/ItinerariesContext';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function OrdersScreen() {
  const router = useRouter();
  const { orders, isLoading, cancelOrder } = useOrders();

  const confirmCancel = (orderId: string) => {
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (window.confirm('Cancel this order?')) {
        cancelOrder(orderId);
      }
      return;
    }
    Alert.alert('Cancel order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, cancel', style: 'destructive', onPress: () => cancelOrder(orderId) },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator color="#0f6e5f" size="large" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptySubtitle}>Your booked trips will show up here.</Text>
        <Pressable style={styles.browseButton} onPress={() => router.push('/')}>
          <Text style={styles.browseButtonText}>Browse Trips</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(order) => order.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => <OrderCard order={item} onCancel={() => confirmCancel(item.id)} />}
    />
  );
}

function OrderCard({ order, onCancel }: { order: Order; onCancel: () => void }) {
  const { getItineraryById } = useItineraries();
  const isActive = order.status === 'active';
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderDate}>Placed {formatDate(order.createdAt)}</Text>
        <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusCancelled]}>
          <Text style={styles.statusText}>{isActive ? 'Active' : 'Cancelled'}</Text>
        </View>
      </View>

      {order.items.map((item) => {
        const itinerary = getItineraryById(item.itineraryId);
        return (
          <View key={item.itineraryId} style={styles.itemRow}>
            <Text style={styles.itemTitle}>{itinerary?.title ?? 'Trip'}</Text>
            <Text style={styles.itemMeta}>
              Group of {item.groupSize} · Travel date {formatDate(item.travelDate)}
            </Text>
            <Text style={styles.itemTotal}>₹{item.itemTotal.toLocaleString('en-IN')}</Text>
          </View>
        );
      })}

      <View style={styles.cardFooter}>
        <Text style={styles.orderTotal}>Total ₹{order.total.toLocaleString('en-IN')}</Text>
        {isActive && (
          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: 16, backgroundColor: '#f6f8f7' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderDate: { fontSize: 13, color: '#6a7a73' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusActive: { backgroundColor: '#e3f3ee' },
  statusCancelled: { backgroundColor: '#f6e6e4' },
  statusText: { fontSize: 12, fontWeight: '700', color: '#17332c' },
  itemRow: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#f0f2f1', paddingTop: 10 },
  itemTitle: { fontSize: 15, fontWeight: '700', color: '#17332c' },
  itemMeta: { fontSize: 13, color: '#6a7a73', marginTop: 2 },
  itemTotal: { fontSize: 14, fontWeight: '600', color: '#0f6e5f', marginTop: 4 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f2f1',
    paddingTop: 12,
  },
  orderTotal: { fontSize: 16, fontWeight: '800', color: '#17332c' },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#b3463f',
  },
  cancelButtonText: { color: '#b3463f', fontWeight: '700', fontSize: 13 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#17332c' },
  emptySubtitle: { fontSize: 14, color: '#6a7a73', marginTop: 6, textAlign: 'center' },
  browseButton: { marginTop: 20, backgroundColor: '#0f6e5f', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  browseButtonText: { color: '#fff', fontWeight: '700' },
});
