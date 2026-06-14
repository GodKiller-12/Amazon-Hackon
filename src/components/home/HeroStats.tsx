'use client';

export function HeroStats() {
  const stats = [
    { icon: '⚡', value: '60 sec', label: 'avg order time' },
    { icon: '📦', value: '250+', label: 'products' },
    { icon: '🚨', value: '5 Emergency', label: 'kits ready' },
  ];

  return (
    <section className="w-full">
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm animate-fade-in-up"
          >
            <span className="text-lg block mb-0.5">{stat.icon}</span>
            <p className="text-sm font-bold text-gray-900">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
