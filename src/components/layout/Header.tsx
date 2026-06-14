"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, User, LogOut } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const router = useRouter();
  const itemCount = useCartStore((state) => state.items.length);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleProfileClick() {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      setShowDropdown((v) => !v);
    }
  }

  function handleLogout() {
    setShowDropdown(false);
    logout();
    router.push("/");
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-amazon-dark flex items-center justify-between px-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-1.5">
        <span className="text-xl">🛒</span>
        <span className="text-lg font-bold text-amazon-orange">UrgentCart</span>
      </Link>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Cart icon with badge */}
        <Link href="/cart" className="relative p-2">
          <ShoppingCart className="h-5 w-5 text-white" />
          {itemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amazon-orange text-[11px] font-bold text-white">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </Link>

        {/* Profile / Auth */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleProfileClick}
            className="p-2 flex items-center gap-1.5"
            aria-label={isAuthenticated ? "User menu" : "Login"}
          >
            <User className="h-5 w-5 text-white" />
            {isAuthenticated && user && (
              <span className="text-xs text-white font-medium hidden sm:inline max-w-[80px] truncate">
                {user.name.split(" ")[0]}
              </span>
            )}
            {!isAuthenticated && (
              <span className="text-xs text-gray-300 font-medium">Login</span>
            )}
          </button>

          {/* Dropdown */}
          {showDropdown && isAuthenticated && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-[60]">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                {user?.email && (
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                )}
              </div>
              <Link
                href="/profile"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
