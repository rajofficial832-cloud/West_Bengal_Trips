import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { logIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await logIn(email, password);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Log in to manage your bookings</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
      />

      <Link href="/auth/forgot-password" style={styles.forgotLink}>
        Forgot password?
      </Link>

      <Pressable style={styles.submitButton} onPress={handleLogin} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Log In</Text>}
      </Pressable>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Don&apos;t have an account? </Text>
        <Link href="/auth/signup" replace style={styles.footerLink}>
          Sign Up
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 48 },
  title: { fontSize: 26, fontWeight: '700', color: '#17332c' },
  subtitle: { fontSize: 14, color: '#6a7a73', marginTop: 6, marginBottom: 20 },
  error: { color: '#b3463f', marginBottom: 12, fontSize: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#3a4a44', marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#e4e9e7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#17332c',
  },
  forgotLink: { color: '#0f6e5f', fontWeight: '600', marginTop: 14, textAlign: 'right' },
  submitButton: {
    marginTop: 24,
    backgroundColor: '#0f6e5f',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#6a7a73', fontSize: 14 },
  footerLink: { color: '#0f6e5f', fontWeight: '700', fontSize: 14 },
});
