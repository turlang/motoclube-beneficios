import { Shield, Skull, Wrench } from "lucide-react";

export function BrandCrest({ active = true, size = "default", compact = false }) {
  const wrapperSize = size === "large" ? "h-48 w-44" : "h-32 w-28";
  const iconSize = size === "large" ? "h-8 w-8" : "h-6 w-6";
  const skullSize = size === "large" ? "h-16 w-16" : "h-11 w-11";

  return (
    <div className={`relative ${wrapperSize}`} aria-hidden="true">
      <div
        className={[
          "absolute inset-0 rounded-[2.25rem] border bg-gradient-to-b from-zinc-950 to-black [clip-path:polygon(50%_0%,94%_15%,94%_62%,50%_100%,6%_62%,6%_15%)]",
          active
            ? "border-amber-400/40 shadow-[0_0_36px_rgba(251,191,36,0.22)]"
            : "border-zinc-700 grayscale"
        ].join(" ")}
      />

      <div
        className={[
          "absolute inset-[8%] rounded-[2rem] border [clip-path:polygon(50%_0%,94%_15%,94%_62%,50%_100%,6%_62%,6%_15%)]",
          active ? "border-amber-300/30" : "border-zinc-800"
        ].join(" ")}
      />

      <div className="absolute inset-x-0 top-4 text-center">
        <p className={[
          "text-[10px] font-black uppercase tracking-[0.35em]",
          active ? "text-amber-200" : "text-zinc-600"
        ].join(" ")}>
          Irmãos
        </p>
        <p className={[
          compact ? "text-[11px]" : "text-xs",
          "font-black uppercase tracking-[0.22em]",
          active ? "text-amber-400" : "text-zinc-500"
        ].join(" ")}>
          do Asfalto
        </p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <div className={[
            "absolute -left-2 top-8",
            active ? "text-amber-300" : "text-zinc-600"
          ].join(" ")}>
            <Wrench className={iconSize} strokeWidth={1.5} />
          </div>
          <div className={[
            "absolute -right-2 top-8",
            active ? "text-amber-300" : "text-zinc-600"
          ].join(" ")}>
            <Shield className={iconSize} strokeWidth={1.5} />
          </div>
          <div className={[
            active ? "text-amber-200 drop-shadow-[0_0_18px_rgba(251,191,36,0.55)]" : "text-zinc-500",
          ].join(" ")}>
            <Skull className={skullSize} strokeWidth={1.8} />
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-4 text-center">
        <p className={[
          "text-[9px] font-black uppercase tracking-[0.4em]",
          active ? "text-amber-300" : "text-zinc-600"
        ].join(" ")}>
          Motoclube
        </p>
      </div>
    </div>
  );
}
