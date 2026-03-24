import Image from "next/image";
import { cn } from "@/lib/utils";

interface VonexLogoProps {
  className?: string;
  height?: number;
  variant?: "default" | "white" | "mono";
}

/**
 * Vonex AI full logo — uses the PNG logo image for default variant,
 * and applies CSS filter for white variant on dark backgrounds.
 * Brand colors: Deep Indigo (#2E3192) + Orange (#DE6C33).
 */
export function VonexLogo({
  className,
  height = 32,
  variant = "default",
}: VonexLogoProps) {
  const w = Math.round(height * 3.6);

  return (
    <Image
      src="/Vonex-AI-logo.png"
      alt="Vonex AI"
      width={w}
      height={height}
      className={cn(
        "shrink-0 object-contain",
        variant === "mono" && "brightness-0 invert opacity-70",
        className
      )}
      priority
    />
  );
}

interface VonexIconProps {
  className?: string;
  size?: number;
  variant?: "default" | "white" | "mono";
}

/**
 * Vonex AI compact icon — stylized "V" with wave accents.
 * For collapsed sidebar, favicons, embed widget button.
 */
export function VonexIcon({
  className,
  size = 24,
  variant = "default",
}: VonexIconProps) {
  const colors = {
    default: { from: "#DE6C33", to: "#2E3192", wave: "#F2A339" },
    white: { from: "#ffffff", to: "#ffffff", wave: "#ffffffcc" },
    mono: { from: "currentColor", to: "currentColor", wave: "currentColor" },
  };
  const c = colors[variant];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      fill="none"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-label="Vonex AI icon"
    >
      <defs>
        <linearGradient id={`vonex-grad-${variant}`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={c.from} />
          <stop offset="1" stopColor={c.to} />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="9" fill={`url(#vonex-grad-${variant})`} />
      {/* V letterform */}
      <path
        d="M12 12 L20 30 L28 12"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Wave accents */}
      <path
        d="M29 18c1.5 2 1.5 6 0 8"
        stroke={c.wave}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M32 15c2.5 3.5 2.5 10 0 14"
        stroke={c.wave}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );
}
