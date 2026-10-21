import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useItineraries } from '@/context/ItinerariesContext';
import { useOrders } from '@/context/OrdersContext';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CartScreen() {
  const router = useRouter();
  const { entries, error, removeFromCart, getEntryTotal, grandTotal, clearCart } = useCart();
  const { getItineraryById } = useItineraries();
  const { user } = useAuth();
  const { placeOrder } = useOrders();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setCheckingOut(true);
    setCheckoutError(null);
    try {
      await placeOrder();
      // Backend clears the cart on order placement; sync local state instead of refetching.
      await clearCart();
      router.replace('/orders');
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Something went wrong</Text>
        <Text style={styles.emptySubtitle}>{error}</Text>
      </View>
    );
  }

  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Browse trips and add one to get started.</Text>
        <Pressable style={styles.browseButton} onPress={() => router.push('/')}>
          <Text style={styles.browseButtonText}>Browse Trips</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={(entry) => entry.itineraryId}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const itinerary = getItineraryById(item.itineraryId);
          if (!itinerary) return null;
          return (
            <View style={styles.row}>
              <Image source={{ uri: itinerary.image }} style={styles.rowImage} />
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{itinerary.title}</Text>
                <Text style={styles.rowMeta}>Group of {item.groupSize}</Text>
                <Text style={styles.rowMeta}>Travel date: {formatDate(item.travelDate)}</Text>
                <Text style={styles.rowPrice}>₹{getEntryTotal(item).toLocaleString('en-IN')}</Text>
              </View>
              <Pressable onPress={() => removeFromCart(item.itineraryId)} style={styles.removeButton}>
                <Text style={styles.removeButtonText}>Remove</Text>
              </Pressable>
            </View>
          );
        }}
      />
      <View style={styles.footer}>
        {checkoutError && <Text style={styles.checkoutError}>{checkoutError}</Text>}
        <View style={styles.footerTotals}>
          <Text style={styles.footerLabel}>Total</Text>
          <Text style={styles.footerTotal}>₹{grandTotal.toLocaleString('en-IN')}</Text>
        </View>
        <Pressable style={styles.checkoutButton} onPress={handleCheckout} disabled={checkingOut}>
          {checkingOut ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.checkoutButtonText}>{user ? 'Checkout' : 'Log In to Checkout'}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8f7' },
  listContent: { padding: 16 },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  rowImage: { width: 64, height: 64, borderRadius: 10 },
  rowBody: { flex: 1, marginLeft: 12 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: '#17332c' },
  rowMeta: { fontSize: 13, color: '#6a7a73', marginTop: 2 },
  rowPrice: { fontSize: 15, fontWeight: '700', color: '#0f6e5f', marginTop: 4 },
  removeButton: { paddingHorizontal: 10, paddingVertical: 6 },
  removeButtonText: { color: '#b3463f', fontWeight: '600', fontSize: 13 },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e4e9e7',
  },
  footerTotals: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  footerLabel: { fontSize: 16, color: '#3a4a44' },
  footerTotal: { fontSize: 22, fontWeight: '800', color: '#0f6e5f' },
  checkoutButton: {
    backgroundColor: '#0f6e5f',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  checkoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  checkoutError: { color: '#b3463f', fontSize: 13, marginBottom: 10, textAlign: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#17332c' },
  emptySubtitle: { fontSize: 14, color: '#6a7a73', marginTop: 6, textAlign: 'center' },
  browseButton: { marginTop: 20, backgroundColor: '#0f6e5f', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  browseButtonText: { color: '#fff', fontWeight: '700' },
});
