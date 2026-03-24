import { cn } from "@/lib/utils";

interface ZentaraLogoProps {
  className?: string;
  height?: number;
  variant?: "default" | "white" | "mono";
}

/**
 * Zentara full logo — inline SVG with "Z" letterform + sound wave elements.
 * Deep Indigo (#2E3192) + Orange (#DE6C33) brand colors.
 */
export function ZentaraLogo({
  className,
  height = 32,
  variant = "default",
}: ZentaraLogoProps) {
  const w = Math.round(height * 4.2);
  const colors = {
    default: { z: "#2E3192", wave: "#DE6C33", text: "#2E3192" },
    white: { z: "#ffffff", wave: "#ffffff", text: "#ffffff" },
    mono: { z: "currentColor", wave: "currentColor", text: "currentColor" },
  };
  const c = colors[variant];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 168 40"
      fill="none"
      width={w}
      height={height}
      className={cn("shrink-0", className)}
      aria-label="Zentara"
    >
      {/* Z icon with sound waves */}
      <rect x="0" y="2" width="36" height="36" rx="9" fill={c.z} />
      <path
        d="M10 12h16l-16 16h16"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Sound wave arcs */}
      <path
        d="M31 14c2 2.5 2 9 0 12"
        stroke={c.wave}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M34 11c3 4 3 14 0 18"
        stroke={c.wave}
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />
      {/* Wordmark */}
      <text
        x="44"
        y="29"
        fontFamily="Geist, system-ui, sans-serif"
        fontSize="24"
        fontWeight="700"
        letterSpacing="-0.5"
        fill={c.text}
      >
        Zentara
      </text>
    </svg>
  );
}

interface ZentaraIconProps {
  className?: string;
  size?: number;
  variant?: "default" | "white" | "mono";
}

/**
 * Zentara compact icon — "Z" letterform with wave accents.
 * For collapsed sidebar, favicons, embed widget button.
 */
export function ZentaraIcon({
  className,
  size = 24,
  variant = "default",
}: ZentaraIconProps) {
  const colors = {
    default: { bg: "#2E3192", wave: "#DE6C33" },
    white: { bg: "#ffffff", wave: "#ffffffcc" },
    mono: { bg: "currentColor", wave: "currentColor" },
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
      aria-label="Zentara icon"
    >
      <rect x="2" y="2" width="36" height="36" rx="9" fill={c.bg} />
      <path
        d="M12 13h16l-16 14h16"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M32 15c2 2.5 2 8 0 10"
        stroke={c.wave}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M35 12c3 4 3 12 0 16"
        stroke={c.wave}
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />
    </svg>
  );
}
