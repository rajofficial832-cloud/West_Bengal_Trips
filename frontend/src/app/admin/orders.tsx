import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import type { AdminOrder } from '@/api/admin';
import { adminCancelOrderRequest, fetchAdminOrders } from '@/api/admin';
import { useRequireAdmin } from '@/context/AdminAuthContext';
import { useItineraries } from '@/context/ItinerariesContext';

type StatusFilter = 'all' | 'active' | 'cancelled';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminOrdersScreen() {
  const admin = useRequireAdmin();
  const { getItineraryById } = useItineraries();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((status: StatusFilter) => {
    setIsLoading(true);
    setError(null);
    fetchAdminOrders(status === 'all' ? undefined : status)
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load orders.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (admin) {
      load(filter);
    }
  }, [admin, filter, load]);

  const confirmCancel = (order: AdminOrder) => {
    const doCancel = async () => {
      const updated = await adminCancelOrderRequest(order.id);
      setOrders((current) => current.map((item) => (item.id === updated.id ? { ...updated, userId: item.userId } : item)));
    };
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (window.confirm('Cancel this order?')) {
        doCancel();
      }
      return;
    }
    Alert.alert('Cancel order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, cancel', style: 'destructive', onPress: doCancel },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {(['all', 'active', 'cancelled'] as StatusFilter[]).map((option) => (
          <Pressable
            key={option}
            style={[styles.filterChip, filter === option && styles.filterChipActive]}
            onPress={() => setFilter(option)}
          >
            <Text style={[styles.filterChipText, filter === option && styles.filterChipTextActive]}>
              {option[0].toUpperCase() + option.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#1f2937" size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(order) => order.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No orders found.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.customer}>{item.userId?.name ?? 'Unknown user'}</Text>
                <View style={[styles.statusBadge, item.status === 'active' ? styles.statusActive : styles.statusCancelled]}>
                  <Text
                    style={[styles.statusText, item.status === 'active' ? styles.statusTextActive : styles.statusTextCancelled]}
                  >
                    {item.status === 'active' ? 'Active' : 'Cancelled'}
                  </Text>
                </View>
              </View>
              <Text style={styles.customerEmail}>{item.userId?.email}</Text>
              <Text style={styles.date}>Placed {formatDate(item.createdAt)}</Text>
              {item.items.map((orderItem, index) => {
                const itinerary = getItineraryById(orderItem.itineraryId);
                return (
                  <Text key={index} style={styles.itemLine}>
                    {itinerary?.title ?? orderItem.itineraryId} · Group of {orderItem.groupSize} · ₹
                    {orderItem.itemTotal.toLocaleString('en-IN')}
                  </Text>
                );
              })}
              <Text style={styles.total}>Total ₹{item.total.toLocaleString('en-IN')}</Text>
              {item.status === 'active' && (
                <Pressable style={styles.cancelButton} onPress={() => confirmCancel(item)}>
                  <Text style={styles.cancelButtonText}>Cancel Order</Text>
                </Pressable>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { color: '#b3463f', fontSize: 15, textAlign: 'center' },
  emptyText: { color: '#9ca3af', fontSize: 14, textAlign: 'center', marginTop: 40 },
  filterRow: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 0 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e5e7eb' },
  filterChipActive: { backgroundColor: '#1f2937' },
  filterChipText: { color: '#374151', fontWeight: '600', fontSize: 13 },
  filterChipTextActive: { color: '#fff' },
  listContent: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  customer: { fontSize: 15, fontWeight: '700', color: '#111827' },
  customerEmail: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  date: { fontSize: 12, color: '#9ca3af', marginTop: 4, marginBottom: 8 },
  itemLine: { fontSize: 13, color: '#374151', marginTop: 2 },
  total: { fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusActive: { backgroundColor: '#e3f3ef' },
  statusCancelled: { backgroundColor: '#fde8e6' },
  statusText: { fontSize: 12, fontWeight: '700' },
  statusTextActive: { color: '#0f6e5f' },
  statusTextCancelled: { color: '#b3463f' },
  cancelButton: { marginTop: 10, backgroundColor: '#fde8e6', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  cancelButtonText: { color: '#b3463f', fontWeight: '700', fontSize: 13 },
});
