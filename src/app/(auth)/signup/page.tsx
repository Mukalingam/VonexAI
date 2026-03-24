"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, Lock, User, Github, Chrome, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { signUpSchema, type SignUpInput } from "@/lib/validations";

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { level: "Weak", color: "bg-red-500", width: "w-1/4" };
  if (score <= 3)
    return { level: "Fair", color: "bg-orange-500", width: "w-2/4" };
  if (score <= 4)
    return { level: "Good", color: "bg-yellow-500", width: "w-3/4" };
  return { level: "Strong", color: "bg-green-500", width: "w-full" };
}

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      accept_terms: false as unknown as true,
    },
  });

  const watchPassword = watch("password", "");
  const watchTerms = watch("accept_terms");

  const passwordStrength = useMemo(
    () => getPasswordStrength(watchPassword),
    [watchPassword]
  );

  async function onSubmit(data: SignUpInput) {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
          },
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(
        "Account created! Please check your email to verify your account."
      );
      router.push("/signin");
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOAuthSignIn(provider: "google" | "github") {
    setOauthLoading(provider);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setOauthLoading(null);
    }
  }

  return (
    <Card className="w-full border-white/10 bg-white/[0.03] shadow-2xl backdrop-blur-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-white">
          Create an account
        </CardTitle>
        <CardDescription className="text-slate-400">
          Get started building your AI voice agents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="border-white/10 bg-white/[0.08] text-white hover:bg-white/10 hover:text-white"
            onClick={() => handleOAuthSignIn("google")}
            disabled={!!oauthLoading || isLoading}
          >
            {oauthLoading === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Chrome className="h-4 w-4" />
            )}
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-white/10 bg-white/[0.08] text-white hover:bg-white/10 hover:text-white"
            onClick={() => handleOAuthSignIn("github")}
            disabled={!!oauthLoading || isLoading}
          >
            {oauthLoading === "github" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Github className="h-4 w-4" />
            )}
            GitHub
          </Button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0F172A] px-2 text-slate-400">
              or continue with email
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-slate-300">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                id="full_name"
                placeholder="John Doe"
                className="border-white/10 bg-white/[0.08] pl-10 text-white placeholder:text-slate-500 focus-visible:ring-[#818CF8]"
                {...register("full_name")}
                disabled={isLoading}
              />
            </div>
            {errors.full_name && (
              <p className="text-sm text-red-400">{errors.full_name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="border-white/10 bg-white/[0.08] pl-10 text-white placeholder:text-slate-500 focus-visible:ring-[#818CF8]"
                {...register("email")}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                className="border-white/10 bg-white/[0.08] pl-10 text-white placeholder:text-slate-500 focus-visible:ring-[#818CF8]"
                {...register("password")}
                disabled={isLoading}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}

            {/* Password Strength Indicator */}
            {watchPassword.length > 0 && (
              <div className="space-y-1.5">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Password strength:{" "}
                  <span
                    className={
                      passwordStrength.level === "Strong"
                        ? "text-green-400"
                        : passwordStrength.level === "Good"
                          ? "text-yellow-400"
                          : passwordStrength.level === "Fair"
                            ? "text-orange-400"
                            : "text-red-400"
                    }
                  >
                    {passwordStrength.level}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Accept Terms */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Checkbox
                id="accept_terms"
                checked={watchTerms === true}
                onCheckedChange={(checked) =>
                  setValue("accept_terms", checked === true ? true : (false as unknown as true), {
                    shouldValidate: true,
                  })
                }
                className="mt-0.5 border-white/30 data-[state=checked]:bg-[#818CF8] data-[state=checked]:border-[#818CF8]"
                disabled={isLoading}
              />
              <Label
                htmlFor="accept_terms"
                className="text-sm font-normal leading-snug text-slate-400"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-[#818CF8] underline-offset-4 hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-[#818CF8] underline-offset-4 hover:underline"
                >
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {errors.accept_terms && (
              <p className="text-sm text-red-400">
                {errors.accept_terms.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-[#2E3192] text-white hover:bg-[#1a1d5e]"
            size="lg"
            disabled={isLoading || !!oauthLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        {/* Sign In Link */}
        <p className="text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-medium text-[#818CF8] underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
