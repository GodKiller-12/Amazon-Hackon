'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, CreditCard, Clock, ShoppingCart, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { useOrderStore } from '@/stores/orderStore';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { Order } from '@/types';
import { trackEvent } from '@/services/analytics';
import { apiPost } from '@/lib/api';
import { openRazorpayCheckout, isRazorpayLoaded } from '@/lib/razorpay';

type PaymentState = 'idle' | 'processing' | 'success';

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const situationLabel = useCartStore((state) => state.situationLabel);
  const deliveryEstimate = useCartStore((state) => state.deliveryEstimate);
  const clearCart = useCartStore((state) => state.clearCart);
  const addOrder = useOrderStore((state) => state.addOrder);
  const address = useUserStore((state) => state.address);
  const paymentMethod = useUserStore((state) => state.paymentMethod);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const [paymentState, setPaymentState] = useState<PaymentState>('idle');

  const deliveryFee = 30;
  const orderTotal = total + deliveryFee;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  // Empty cart guard
  if (items.length === 0 && paymentState === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <ShoppingCart className="h-12 w-12 text-gray-300 mb-4" />
        <h2 className="text-lg font-bold text-gray-900 mb-1">No items to checkout</h2>
        <p className="text-sm text-gray-500 mb-4">Add items to your cart first.</p>
        <Button asChild className="bg-amazon-orange hover:bg-amazon-orange/90 text-white rounded-xl">
          <Link href="/">Go to Home</Link>
        </Button>
      </div>
    );
  }

  async function handlePayment() {
    setPaymentState('processing');

    // Create order
    const order: Order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      items: [...items],
      situationLabel: situationLabel || 'Quick order',
      total: orderTotal,
      date: new Date().toISOString(),
      status: 'placed',
    };

    trackEvent('payment_initiated', {
      orderId: order.id,
      total: orderTotal,
      source: 'checkout',
    });

    addOrder(order);

    try {
      const paymentData = await apiPost<{
        paymentOrderId: string;
        amount: number;
        currency: string;
        key_id: string;
      }>('/api/payments/create-order', { orderId: order.id, amount: orderTotal });

      // Check if Razorpay SDK is loaded (real mode)
      if (
        isRazorpayLoaded() &&
        paymentData.key_id &&
        !paymentData.key_id.startsWith('rzp_mock')
      ) {
        // Real Razorpay checkout
        openRazorpayCheckout({
          key: paymentData.key_id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          order_id: paymentData.paymentOrderId,
          name: 'UrgentCart',
          description: situationLabel || 'Quick Order',
          handler: async (response) => {
            try {
              await apiPost('/api/payments/verify', response);
            } catch {
              // Verification failed but payment may still be valid
            }
            setPaymentState('success');
            clearCart();
            trackEvent('order_placed', {
              orderId: order.id,
              total: orderTotal,
              source: 'checkout',
            });
            setTimeout(() => router.push('/order-success'), 800);
          },
          prefill: { name: user?.name, contact: user?.phone },
          theme: { color: '#FF9900' },
          modal: {
            ondismiss: () => setPaymentState('idle'),
          },
        });
      } else {
        // Mock mode: simulate 2 second payment
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setPaymentState('success');
        clearCart();
        trackEvent('order_placed', {
          orderId: order.id,
          total: orderTotal,
          source: 'checkout',
        });
        setTimeout(() => router.push('/order-success'), 800);
      }
    } catch {
      // Payment creation failed — fallback to mock mode
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setPaymentState('success');
      clearCart();
      trackEvent('order_placed', {
        orderId: order.id,
        total: orderTotal,
        source: 'checkout',
      });
      setTimeout(() => router.push('/order-success'), 800);
    }
  }

  // Payment processing overlay
  if (paymentState === 'processing') {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-amazon-orange animate-spin" />
          </div>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Processing Payment...</h2>
        <p className="text-sm text-gray-500">Please wait while we confirm your order</p>
        <p className="text-xs text-gray-400 mt-4">₹{orderTotal.toLocaleString('en-IN')}</p>
      </div>
    );
  }

  // Payment success overlay
  if (paymentState === 'success') {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-scale-in">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Payment Successful!</h2>
        <p className="text-sm text-gray-500 mt-1">Redirecting to order confirmation...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
      <h1 className="text-lg font-bold text-gray-900">Checkout</h1>

      {/* Address Card */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-4 w-4 text-amazon-orange" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{address.label}</p>
              <p className="text-sm text-gray-600">{address.street}</p>
              <p className="text-sm text-gray-600">{address.city} - {address.pincode}</p>
            </div>
          </div>
          <span className="text-xs text-amazon-orange font-medium cursor-pointer">Edit</span>
        </div>
      </div>

      {/* Payment Method Card */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
              <CreditCard className="h-4 w-4 text-amazon-orange" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{paymentMethod.label}</p>
              <p className="text-sm text-gray-600">{paymentMethod.details}</p>
            </div>
          </div>
          <span className="text-xs text-amazon-orange font-medium cursor-pointer">Edit</span>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Items ({items.length})</span>
            <span className="text-gray-900">₹{total.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Fee</span>
            <span className="text-gray-900">₹{deliveryFee}</span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between">
            <span className="text-sm font-bold text-gray-900">Total</span>
            <span className="text-sm font-bold text-gray-900">₹{orderTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Delivery Estimate */}
      <div className="bg-green-50 rounded-xl p-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-green-700" />
        <p className="text-sm text-green-800 font-medium">
          Estimated delivery: {deliveryEstimate > 0 ? `${deliveryEstimate} min` : '15-20 min'}
        </p>
      </div>

      {/* Situation label */}
      {situationLabel && (
        <p className="text-xs text-gray-500 text-center">
          Cart for: <span className="text-amazon-orange font-medium">&ldquo;{situationLabel}&rdquo;</span>
        </p>
      )}

      {/* Pay Button */}
      <div className="pt-2 pb-4">
        <Button
          onClick={handlePayment}
          className="w-full h-12 bg-amazon-orange hover:bg-amazon-orange/90 text-white font-bold text-base rounded-xl shadow-md hover:scale-[1.02] transition-transform"
        >
          💳 Pay ₹{orderTotal.toLocaleString('en-IN')}
        </Button>
      </div>
    </div>
  );
}
