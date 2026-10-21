import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Login</Text>
      <Text style={styles.subtitle}>Sign in to manage trips, users and orders</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="admin@example.com"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />

      <Pressable style={styles.submitButton} onPress={handleLogin} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Log In</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 48 },
  title: { fontSize: 26, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 6, marginBottom: 20 },
  error: { color: '#b3463f', marginBottom: 12, fontSize: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: '#1f2937',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
