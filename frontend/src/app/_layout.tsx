import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ItinerariesProvider } from '@/context/ItinerariesContext';
import { OrdersProvider } from '@/context/OrdersContext';

function OrdersGate({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return <OrdersProvider userId={user?.id ?? null}>{children}</OrdersProvider>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ItinerariesProvider>
        <AuthProvider>
          <OrdersGate>
            <CartProvider>
              <StatusBar style="dark" />
              <Stack
                screenOptions={{
                  headerStyle: { backgroundColor: '#0f6e5f' },
                  headerTintColor: '#fff',
                  headerTitleStyle: { fontWeight: '600' },
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Home' }} />
                <Stack.Screen name="itinerary/[id]" options={{ title: 'Trip Details' }} />
                <Stack.Screen name="auth/login" options={{ title: 'Log In', presentation: 'modal' }} />
                <Stack.Screen name="auth/signup" options={{ title: 'Sign Up', presentation: 'modal' }} />
                <Stack.Screen
                  name="auth/forgot-password"
                  options={{ title: 'Forgot Password', presentation: 'modal' }}
                />
                <Stack.Screen name="admin" options={{ headerShown: false }} />
              </Stack>
            </CartProvider>
          </OrdersGate>
        </AuthProvider>
      </ItinerariesProvider>
    </SafeAreaProvider>
  );
}
