interface Step {
  number: string;
  title: string;
  description: string;
}

interface HowItWorksStepsProps {
  steps: Step[];
}

export function HowItWorksSteps({ steps }: HowItWorksStepsProps) {
  return (
    <section className="py-20 border-t border-[#334155]/30">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold sm:text-4xl mb-14">
          How It <span className="bg-gradient-to-r from-[#DE6C33] to-[#F2A339] bg-clip-text text-transparent">Works</span>
        </h2>

        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Connecting line */}
          <div className="absolute top-8 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-[#DE6C33]/40 via-[#F2A339]/40 to-[#DE6C33]/40 hidden md:block" />

          {steps.map((step, i) => (
            <div key={step.title} className="relative text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#DE6C33]/40 bg-[#0F172A] text-xl font-bold text-[#DE6C33]">
                {step.number}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[#F8FAFC]">{step.title}</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">{step.description}</p>
              {i < steps.length - 1 && (
                <div className="mt-4 text-[#DE6C33]/40 md:hidden">&#8595;</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
