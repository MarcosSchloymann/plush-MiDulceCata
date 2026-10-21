import { Globe, Medal, Sparkles } from "lucide-react";
import type { Settings } from "@/lib/types";
import { media } from "@/lib/utils";

export function Features({ settings }: { settings: Settings }) {
  const items = [
    {
      label: settings.feature1,
      image: settings.feature1Image,
      fallback: <Medal className="h-5 w-5" strokeWidth={1.4} />,
    },
    {
      label: settings.feature2,
      image: settings.feature2Image,
      fallback: <Sparkles className="h-5 w-5" strokeWidth={1.4} />,
    },
    {
      label: settings.feature3,
      image: settings.feature3Image,
      fallback: <Globe className="h-5 w-5" strokeWidth={1.4} />,
    },
  ];

  return (
    <section
      style={{
        backgroundColor: "#251911",
        backgroundImage: "linear-gradient(90deg, rgba(37, 25, 17, 1), rgba(0, 0, 0, 1) 100%)",
        color: "var(--secondary)",
      }}
      aria-label="Valores"
    >
      <ul className="mx-auto grid max-w-4xl grid-cols-3 gap-2 px-3 py-3 text-center sm:gap-3 sm:px-4">
        {items.map((item) => {
          const src = media(item.image);
          return (
            <li key={item.label} className="min-w-0">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center sm:h-11 sm:w-11">
                {src ? (
                  <img
                    src={src}
                    alt=""
                    width={44}
                    height={44}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  item.fallback
                )}
              </div>
              <p className="text-[9px] font-medium leading-tight tracking-[0.12em] sm:text-[11px] sm:tracking-[0.22em]">
                {item.label}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
