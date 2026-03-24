import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-4 text-muted-foreground">
            Last updated: February 2026
          </p>

          <div className="mt-10 space-y-8 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                1. Information We Collect
              </h2>
              <p className="mt-2">
                We collect information you provide directly, such as your name,
                email address, and company name when you create an account. We
                also collect usage data including conversation logs, agent
                configurations, and analytics to improve our services.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                2. How We Use Your Information
              </h2>
              <p className="mt-2">
                Your information is used to provide and maintain the Vonex AI
                platform, process your requests, send service-related
                communications, and improve our AI voice agent technology. We do
                not sell your personal data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                3. Data Storage and Security
              </h2>
              <p className="mt-2">
                Your data is stored securely using industry-standard encryption.
                We use Supabase for data storage with row-level security
                policies. Voice data is processed through our voice synthesis
                provider and is not stored beyond the duration of the conversation session.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                4. Third-Party Services
              </h2>
              <p className="mt-2">
                Vonex AI integrates with third-party services for data storage,
                AI processing, and voice synthesis. Each service has its own
                privacy policy governing the data they process.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                5. Your Rights
              </h2>
              <p className="mt-2">
                You have the right to access, correct, or delete your personal
                data at any time through your account settings. You may also
                request a copy of all data we hold about you by contacting us at{" "}
                <a
                  href="mailto:reachus@iicl.in"
                  className="text-[#2E3192] hover:underline"
                >
                  reachus@iicl.in
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                6. Contact Us
              </h2>
              <p className="mt-2">
                For privacy-related inquiries, contact Intelligence India.Com
                Limited (IICL) at{" "}
                <a
                  href="mailto:reachus@iicl.in"
                  className="text-[#2E3192] hover:underline"
                >
                  reachus@iicl.in
                </a>{" "}
                or call{" "}
                <a
                  href="tel:+919989442002"
                  className="text-[#2E3192] hover:underline"
                >
                  +91 99894 42002
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
