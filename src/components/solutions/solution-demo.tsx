"use client";

const demoStyle = `
@keyframes msg-appear {
  0% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes waveform-demo {
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
}
@keyframes typing-dot {
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
}
`;

interface SolutionDemoProps {
  domainName: string;
  messages: { role: "ai" | "user"; text: string }[];
}

export function SolutionDemo({ domainName, messages }: SolutionDemoProps) {
  return (
    <section className="py-20">
      <style dangerouslySetInnerHTML={{ __html: demoStyle }} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold sm:text-4xl">
            See It In <span className="bg-gradient-to-r from-[#DE6C33] to-[#F2A339] bg-clip-text text-transparent">Action</span>
          </h2>
          <p className="mt-4 text-[#94A3B8] text-lg">
            Watch how a Vonex AI agent handles a typical {domainName.toLowerCase()} conversation
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-[#334155] bg-[#0F172A] overflow-hidden shadow-2xl">
            {/* Window bar */}
            <div className="flex items-center gap-2 border-b border-[#334155] bg-[#1E293B] px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <div className="h-3 w-3 rounded-full bg-green-500/70" />
              </div>
              <div className="ml-3 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-xs text-[#94A3B8]">Vonex AI — {domainName}</span>
              </div>
              {/* Waveform */}
              <div className="ml-auto flex items-end gap-[2px] h-4">
                {[0.4, 0.7, 0.3, 0.9, 0.5, 0.8, 0.4, 0.6].map((h, i) => {
                  const durations = [0.62, 0.85, 0.58, 0.92, 0.7, 0.88, 0.65, 0.78];
                  return (
                    <div
                      key={i}
                      className="w-[2px] rounded-full bg-[#DE6C33]"
                      style={{
                        height: 16,
                        transformOrigin: "bottom",
                        animation: `waveform-demo ${durations[i]}s ease-in-out ${i * 0.08}s infinite`,
                        transform: `scaleY(${h})`,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Chat messages */}
            <div className="space-y-4 p-5" style={{ minHeight: 300 }}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  style={{ animation: `msg-appear 0.4s ease-out ${0.5 + i * 0.8}s both` }}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "rounded-br-sm bg-gradient-to-r from-[#2E3192] to-[#2E3192]/80 text-white"
                        : "rounded-bl-sm border border-[#334155] bg-[#1E293B] text-[#F8FAFC]"
                    }`}
                  >
                    {msg.role === "ai" && (
                      <p className="mb-1 text-[10px] font-medium text-[#DE6C33]">Vonex AI</p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              <div
                className="flex justify-start"
                style={{ animation: `msg-appear 0.4s ease-out ${0.5 + messages.length * 0.8}s both` }}
              >
                <div className="rounded-2xl rounded-bl-sm border border-[#334155] bg-[#1E293B] px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-2 w-2 rounded-full bg-[#94A3B8]"
                        style={{ animation: `typing-dot 1.4s infinite ${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
