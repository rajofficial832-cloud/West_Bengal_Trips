import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { Text } from 'react-native';

import { useCart } from '@/context/CartContext';

function TabIcon({ glyph, color }: { glyph: string; color: ColorValue }) {
  return <Text style={{ fontSize: 20, color }}>{glyph}</Text>;
}

export default function TabsLayout() {
  const { entries } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#0f6e5f' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
        tabBarActiveTintColor: '#0f6e5f',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'West Bengal Trips',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <TabIcon glyph="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Your Cart',
          tabBarLabel: 'Cart',
          tabBarBadge: entries.length > 0 ? entries.length : undefined,
          tabBarIcon: ({ color }) => <TabIcon glyph="🛒" color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Order History',
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color }) => <TabIcon glyph="🧾" color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarLabel: 'Account',
          tabBarIcon: ({ color }) => <TabIcon glyph="👤" color={color} />,
        }}
      />
    </Tabs>
  );
}
