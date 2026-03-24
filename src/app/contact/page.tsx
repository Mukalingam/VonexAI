import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Building2,
  Globe,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const offices = [
  {
    country: "USA",
    icon: Globe,
    address:
      "1 Glenwood Ave #5, Raleigh, NC 27603, United States.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    country: "India",
    icon: Building2,
    address:
      "Unit No. 308 & 309, Jains Sadguru Image's Capital Park, Image Gardens Road, Madhapur, Hyderabad 500084.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2E3192]/20 bg-[#2E3192]/5 px-4 py-1.5 text-sm font-medium text-[#2E3192]">
              Contact Us
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Get in Touch
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Have questions about Vonex AI or need enterprise solutions? Our team
              is here to help. Reach out and we&apos;ll get back to you promptly.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {/* Phone */}
            <Card className="text-center">
              <CardHeader className="pb-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2E3192]/10">
                  <Phone className="h-5 w-5 text-[#2E3192]" />
                </div>
                <CardTitle className="text-lg">Phone</CardTitle>
                <CardDescription>
                  Speak to our team directly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href="tel:+919989442002"
                  className="text-lg font-semibold text-[#2E3192] hover:underline"
                >
                  +91 99894 42002
                </a>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="text-center">
              <CardHeader className="pb-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2E3192]/10">
                  <Mail className="h-5 w-5 text-[#2E3192]" />
                </div>
                <CardTitle className="text-lg">Email</CardTitle>
                <CardDescription>
                  Send us an email anytime
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href="mailto:reachus@iicl.in"
                  className="text-lg font-semibold text-[#2E3192] hover:underline"
                >
                  reachus@iicl.in
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Office Locations */}
          <div className="mt-12">
            <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">
              Our Offices
            </h2>
            <p className="mt-2 text-center text-muted-foreground">
              Visit us at any of our global locations
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {offices.map((office) => (
                <Card key={office.country}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${office.bg}`}
                      >
                        <office.icon
                          className={`h-5 w-5 ${office.color}`}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {office.country}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {office.address}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Company Info */}
          <div className="mt-16 rounded-2xl border bg-muted/30 p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground">
              Intelligence India.Com Limited (IICL)
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Vonex AI is a product developed by IICL &mdash; a technology
              company specializing in AI-powered solutions for businesses
              worldwide.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Business Hours: Mon &ndash; Fri, 9:00 AM &ndash; 6:00 PM IST</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
