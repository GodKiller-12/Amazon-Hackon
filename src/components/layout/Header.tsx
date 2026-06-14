"use client";

import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";

export function Header() {
  const itemCount = useCartStore((state) => state.items.length);

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

        {/* Profile icon */}
        <button className="p-2" aria-label="Profile">
          <User className="h-5 w-5 text-white" />
        </button>
      </div>
    </header>
  );
}
