interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface FeatureGridProps {
  title: string;
  subtitle: string;
  features: Feature[];
}

export function FeatureGrid({ title, subtitle, features }: FeatureGridProps) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
          <p className="mt-4 text-[#94A3B8] text-lg">{subtitle}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-[#334155]/50 bg-[#0F172A]/60 p-6 transition-all hover:-translate-y-1 hover:border-[#DE6C33]/30 hover:shadow-xl hover:shadow-[#DE6C33]/5"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#2E3192]/15 text-[#DE6C33] transition-colors group-hover:bg-[#2E3192]/25">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[#F8FAFC]">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-[#94A3B8]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
