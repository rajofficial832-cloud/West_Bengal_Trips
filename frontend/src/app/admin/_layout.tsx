import { Stack } from 'expo-router';

import { AdminAuthProvider } from '@/context/AdminAuthContext';

export default function AdminLayout() {
  return (
    <AdminAuthProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1f2937' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        <Stack.Screen name="login" options={{ title: 'Admin Login' }} />
        <Stack.Screen name="index" options={{ title: 'Admin Dashboard' }} />
        <Stack.Screen name="users" options={{ title: 'Users' }} />
        <Stack.Screen name="itineraries" options={{ title: 'Itineraries' }} />
        <Stack.Screen name="itineraries/new" options={{ title: 'New Itinerary' }} />
        <Stack.Screen name="itineraries/[id]/edit" options={{ title: 'Edit Itinerary' }} />
        <Stack.Screen name="orders" options={{ title: 'Orders' }} />
      </Stack>
    </AdminAuthProvider>
  );
}
