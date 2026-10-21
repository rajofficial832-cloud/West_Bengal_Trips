import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSignUp = async () => {
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await signUp(name, email, password);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an account</Text>
      <Text style={styles.subtitle}>Sign up to start booking trips</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.label}>Full name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" />

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
        placeholder="At least 6 characters"
      />

      <Text style={styles.label}>Confirm password</Text>
      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        placeholder="Re-enter password"
      />

      <Pressable style={styles.submitButton} onPress={handleSignUp} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Sign Up</Text>}
      </Pressable>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="/auth/login" replace style={styles.footerLink}>
          Log In
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
