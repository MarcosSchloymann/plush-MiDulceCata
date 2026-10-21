import { media } from "@/lib/utils";

export function Logo({
  variant = "dark",
  name = "MI DULCE CATA",
  script = "El Chocolate de las Reinas",
  compact = false,
  image,
}: {
  variant?: "dark" | "light";
  name?: string;
  script?: string;
  compact?: boolean;
  image?: string;
}) {
  const title = variant === "light" ? "#f6f0e8" : "var(--text)";
  const accent = "var(--secondary)";
  const src = media(image);

  if (src) {
    return (
      <span className={`inline-flex items-center ${compact ? "scale-90" : ""}`}>
        <img
          src={src}
          alt={name}
          width={364}
          height={116}
          className="h-[58px] w-auto max-w-[182px] object-contain object-left sm:max-w-[190px]"
          decoding="async"
        />
      </span>
    );
  }

  return (
    <span className={`flex flex-col items-center leading-none ${compact ? "scale-90" : ""}`}>
      <svg viewBox="0 0 64 36" className="mb-1 h-5 w-8" aria-hidden="true">
        <path
          d="M32 2l3.2 7.2 7.6.7-5.7 4.8 1.7 7.4L32 18.4 25.2 22.1l1.7-7.4L21.2 9.9l7.6-.7L32 2z"
          fill={accent}
        />
        <path d="M8 30c6-6 12-6 16 0 4-6 10-6 16 0 4-6 10-6 16 0" fill="none" stroke={accent} strokeWidth="1.4" />
      </svg>
      <span
        className="font-display text-[1.05rem] font-medium tracking-[0.18em] sm:text-[1.15rem]"
        style={{ color: title }}
      >
        {name}
      </span>
      <span className="font-script -mt-1 text-[1.25rem]" style={{ color: accent }}>
        {script}
      </span>
    </span>
  );
}
