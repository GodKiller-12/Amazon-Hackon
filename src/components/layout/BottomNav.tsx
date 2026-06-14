"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Home", icon: "🏠", href: "/" },
  { label: "Ask AI", icon: "✨", href: "/ask-ai" },
  { label: "Emergency", icon: "🚨", href: "/emergency" },
  { label: "Reorder", icon: "📦", href: "/reorder" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-2 py-1 rounded-lg transition-colors ${
                isActive
                  ? "text-amazon-orange"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span
                className={`text-xs mt-0.5 ${
                  isActive ? "font-semibold" : "font-medium"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
