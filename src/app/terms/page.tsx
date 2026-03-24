import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-4 text-muted-foreground">
            Last updated: February 2026
          </p>

          <div className="mt-10 space-y-8 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                1. Acceptance of Terms
              </h2>
              <p className="mt-2">
                By accessing or using Vonex AI, you agree to be bound by these
                Terms of Service. If you do not agree, please do not use the
                platform. Vonex AI is operated by Intelligence India.Com Limited
                (IICL).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                2. Description of Service
              </h2>
              <p className="mt-2">
                Vonex AI provides a platform for creating, configuring, testing,
                and deploying AI-powered voice agents. The service includes agent
                builder tools, voice synthesis, knowledge base management,
                analytics, and integration options.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                3. Account Responsibilities
              </h2>
              <p className="mt-2">
                You are responsible for maintaining the confidentiality of your
                account credentials and API keys. You must not share your
                account or use the platform for any unlawful purposes. You are
                responsible for all activity that occurs under your account.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                4. Acceptable Use
              </h2>
              <p className="mt-2">
                You agree not to use Vonex AI to create agents that engage in
                harassment, generate harmful content, impersonate real
                individuals without consent, or violate any applicable laws. We
                reserve the right to suspend accounts that violate these terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                5. Pricing and Billing
              </h2>
              <p className="mt-2">
                Free tier usage is subject to the limits described on our
                pricing page. Paid plans are billed monthly and can be cancelled
                at any time. Refunds are handled on a case-by-case basis.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                6. Intellectual Property
              </h2>
              <p className="mt-2">
                You retain ownership of the content and configurations you
                create using Vonex AI. IICL retains all rights to the Vonex AI
                platform, its technology, and branding. You may not reverse
                engineer or redistribute any part of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                7. Limitation of Liability
              </h2>
              <p className="mt-2">
                Vonex AI is provided &quot;as is&quot; without warranties of any
                kind. IICL shall not be liable for any indirect, incidental, or
                consequential damages arising from the use of the platform. Our
                total liability shall not exceed the amount paid by you in the
                12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                8. Contact
              </h2>
              <p className="mt-2">
                For questions about these terms, contact us at{" "}
                <a
                  href="mailto:reachus@iicl.in"
                  className="text-[#2E3192] hover:underline"
                >
                  reachus@iicl.in
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
