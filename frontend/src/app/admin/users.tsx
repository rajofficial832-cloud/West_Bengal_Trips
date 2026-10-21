import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import type { AdminUser } from '@/api/admin';
import { deleteUserRequest, fetchAdminUsers, setUserActiveRequest } from '@/api/admin';
import { useRequireAdmin } from '@/context/AdminAuthContext';

export default function AdminUsersScreen() {
  const admin = useRequireAdmin();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetchAdminUsers()
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load users.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (admin) {
      load();
    }
  }, [admin, load]);

  const toggleActive = async (user: AdminUser) => {
    const updated = await setUserActiveRequest(user.id, !user.isActive);
    setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  };

  const confirmDelete = (user: AdminUser) => {
    const doDelete = async () => {
      await deleteUserRequest(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
    };
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (window.confirm(`Delete ${user.name}? This cannot be undone.`)) {
        doDelete();
      }
      return;
    }
    Alert.alert('Delete user', `Delete ${user.name}? This cannot be undone.`, [
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
    <FlatList
      data={users}
      keyExtractor={(user) => user.id}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={<Text style={styles.emptyText}>No users yet.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardBody}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <Text style={[styles.status, item.isActive ? styles.statusActive : styles.statusInactive]}>
              {item.isActive ? 'Active' : 'Deactivated'}
            </Text>
          </View>
          <View style={styles.actions}>
            <Pressable style={styles.actionButton} onPress={() => toggleActive(item)}>
              <Text style={styles.actionButtonText}>{item.isActive ? 'Deactivate' : 'Reactivate'}</Text>
            </Pressable>
            <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={() => confirmDelete(item)}>
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
            </Pressable>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', padding: 24 },
  errorText: { color: '#b3463f', fontSize: 15, textAlign: 'center' },
  emptyText: { color: '#9ca3af', fontSize: 14, textAlign: 'center', marginTop: 40 },
  listContent: { padding: 16, backgroundColor: '#f3f4f6', flexGrow: 1 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12 },
  cardBody: { marginBottom: 10 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827' },
  email: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  status: { fontSize: 12, fontWeight: '700', marginTop: 6 },
  statusActive: { color: '#0f6e5f' },
  statusInactive: { color: '#b3463f' },
  actions: { flexDirection: 'row', gap: 10 },
  actionButton: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  deleteButton: { backgroundColor: '#fde8e6' },
  deleteButtonText: { color: '#b3463f' },
});
