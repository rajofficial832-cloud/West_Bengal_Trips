import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { AnalyticsSummary } from '@/api/admin';
import { fetchAnalytics } from '@/api/admin';
import { useAdminAuth, useRequireAdmin } from '@/context/AdminAuthContext';

export default function AdminDashboardScreen() {
  const router = useRouter();
  useRequireAdmin();
  const { admin, logout } = useAdminAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!admin) {
      return;
    }
    fetchAnalytics()
      .then(setAnalytics)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load analytics.'))
      .finally(() => setIsLoading(false));
  }, [admin]);

  const handleLogout = async () => {
    await logout();
    router.replace('/admin/login');
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1f2937" size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Welcome, {admin?.name}</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      {analytics && (
        <>
          <View style={styles.cardRow}>
            <StatCard label="Users" value={analytics.totals.totalUsers} />
            <StatCard label="Itineraries" value={analytics.totals.totalItineraries} />
          </View>
          <View style={styles.cardRow}>
            <StatCard label="Orders" value={analytics.totals.totalOrders} />
            <StatCard label="Revenue" value={`₹${analytics.totals.totalRevenue.toLocaleString('en-IN')}`} />
          </View>

          <Text style={styles.sectionTitle}>Order breakdown</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Active</Text>
            <Text style={styles.rowValue}>
              {analytics.breakdown.active.count} orders · ₹{analytics.breakdown.active.revenue.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Cancelled</Text>
            <Text style={styles.rowValue}>
              {analytics.breakdown.cancelled.count} orders · ₹
              {analytics.breakdown.cancelled.revenue.toLocaleString('en-IN')}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Top itineraries</Text>
          {analytics.topItineraries.length === 0 ? (
            <Text style={styles.emptyText}>No bookings yet.</Text>
          ) : (
            analytics.topItineraries.map((item) => (
              <View key={item.itineraryId} style={styles.row}>
                <Text style={styles.rowLabel}>{item.title}</Text>
                <Text style={styles.rowValue}>
                  {item.bookings} bookings · ₹{item.revenue.toLocaleString('en-IN')}
                </Text>
              </View>
            ))
          )}

          <Text style={styles.sectionTitle}>Monthly trend</Text>
          {analytics.timeSeries.length === 0 ? (
            <Text style={styles.emptyText}>No orders yet.</Text>
          ) : (
            analytics.timeSeries.map((row) => (
              <View key={row.month} style={styles.row}>
                <Text style={styles.rowLabel}>{row.month}</Text>
                <Text style={styles.rowValue}>
                  {row.orders} orders · ₹{row.revenue.toLocaleString('en-IN')}
                </Text>
              </View>
            ))
          )}
        </>
      )}

      <Text style={styles.sectionTitle}>Manage</Text>
      <Link href="/admin/users" asChild>
        <Pressable style={styles.navButton}>
          <Text style={styles.navButtonText}>Users</Text>
        </Pressable>
      </Link>
      <Link href="/admin/itineraries" asChild>
        <Pressable style={styles.navButton}>
          <Text style={styles.navButtonText}>Itineraries</Text>
        </Pressable>
      </Link>
      <Link href="/admin/orders" asChild>
        <Pressable style={styles.navButton}>
          <Text style={styles.navButtonText}>Orders</Text>
        </Pressable>
      </Link>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' },
  greeting: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 16 },
  error: { color: '#b3463f', marginBottom: 12 },
  cardRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#1f2937' },
  statLabel: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 20, marginBottom: 10 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  rowLabel: { fontSize: 14, color: '#374151', flexShrink: 1, marginRight: 8 },
  rowValue: { fontSize: 13, color: '#6b7280' },
  emptyText: { color: '#9ca3af', fontSize: 13 },
  navButton: { backgroundColor: '#1f2937', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10 },
  navButtonText: { color: '#fff', fontWeight: '700' },
  logoutButton: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#b3463f',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  logoutButtonText: { color: '#b3463f', fontWeight: '700' },
});
