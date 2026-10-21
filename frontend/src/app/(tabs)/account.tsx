import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';

export default function AccountScreen() {
  const router = useRouter();
  const { user, logOut } = useAuth();

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>You&apos;re not logged in</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/auth/login')}>
          <Text style={styles.primaryButtonText}>Log In</Text>
        </Pressable>
      </View>
    );
  }

  const handleLogOut = async () => {
    await logOut();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <Link href="/orders" asChild>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuItemText}>Order History</Text>
          <Text style={styles.menuItemChevron}>›</Text>
        </Pressable>
      </Link>

      <Pressable style={styles.logoutButton} onPress={handleLogOut}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8f7', padding: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: '700', color: '#17332c', marginBottom: 16 },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  name: { fontSize: 20, fontWeight: '700', color: '#17332c' },
  email: { fontSize: 14, color: '#6a7a73', marginTop: 4 },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemText: { fontSize: 15, fontWeight: '600', color: '#17332c' },
  menuItemChevron: { fontSize: 20, color: '#6a7a73' },
  primaryButton: {
    backgroundColor: '#0f6e5f',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  logoutButton: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#b3463f',
  },
  logoutButtonText: { color: '#b3463f', fontWeight: '700', fontSize: 15 },
});
