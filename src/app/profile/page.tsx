'use client';

import { useRouter } from 'next/navigation';
import { User, MapPin, CreditCard, Leaf, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';

export default function ProfilePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const address = useUserStore((state) => state.address);
  const paymentMethod = useUserStore((state) => state.paymentMethod);
  const preferences = useUserStore((state) => state.preferences);

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
      {/* User Info Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-amazon-orange/10 flex items-center justify-center">
          <User className="h-7 w-7 text-amazon-orange" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">{user?.name || 'User'}</h1>
          {user?.email && <p className="text-sm text-gray-500">{user.email}</p>}
          {user?.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-amazon-orange" />
          <h3 className="text-sm font-semibold text-gray-900">Delivery Address</h3>
        </div>
        <p className="text-sm text-gray-600">{address.label}</p>
        <p className="text-sm text-gray-600">{address.street}</p>
        <p className="text-sm text-gray-600">{address.city} - {address.pincode}</p>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="h-4 w-4 text-amazon-orange" />
          <h3 className="text-sm font-semibold text-gray-900">Payment Method</h3>
        </div>
        <p className="text-sm text-gray-600">{paymentMethod.label} • {paymentMethod.details}</p>
      </div>

      {/* Dietary Preferences */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Leaf className="h-4 w-4 text-amazon-orange" />
          <h3 className="text-sm font-semibold text-gray-900">Preferences</h3>
        </div>
        <p className="text-sm text-gray-600">
          Household size: {preferences.householdSize}
        </p>
        {preferences.dietary.length > 0 ? (
          <div className="flex flex-wrap gap-1 mt-1">
            {preferences.dietary.map((pref) => (
              <span key={pref} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                {pref}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 mt-1">No dietary preferences set</p>
        )}
      </div>

      {/* Logout */}
      <div className="pt-4">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-11 rounded-xl font-medium text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
