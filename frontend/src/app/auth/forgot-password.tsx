import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';

// No backend/email service exists, so this demo flow skips sending a real code.
const DEMO_RESET_CODE = '123456';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = () => {
    setError(null);
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    setStep('reset');
  };

  const handleReset = async () => {
    setError(null);
    if (code !== DEMO_RESET_CODE) {
      setError('Invalid reset code.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(email, newPassword);
      router.replace('/auth/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'email') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Forgot password</Text>
        <Text style={styles.subtitle}>Enter your account email to reset your password</Text>

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

        <Pressable style={styles.submitButton} onPress={handleContinue}>
          <Text style={styles.submitButtonText}>Continue</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset password</Text>
      <Text style={styles.subtitle}>Demo mode: use code {DEMO_RESET_CODE} (no real email is sent)</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.label}>Reset code</Text>
      <TextInput style={styles.input} value={code} onChangeText={setCode} keyboardType="number-pad" placeholder="123456" />

      <Text style={styles.label}>New password</Text>
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        placeholder="At least 6 characters"
      />

      <Pressable style={styles.submitButton} onPress={handleReset} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Reset Password</Text>}
      </Pressable>
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
});
