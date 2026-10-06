import { Smartphone } from "lucide-react";

interface Props {
  /** true = covers the whole screen (root loader).
      false = fills the page area only, so the dashboard sidebar and
      topbar stay visible while a dashboard page loads. */
  fullscreen?: boolean;
  label?: string;
}

export default function BrandLoader({ fullscreen = true, label = "Loading" }: Props) {
  return (
    <div
      role="status"
      aria-label={label}
      className={
        fullscreen
          ? "fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-white dark:bg-[#050B18]"
          : "flex min-h-[60vh] flex-col items-center justify-center gap-6"
      }
    >
      <div className="relative flex h-28 w-28 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full border-2 border-orange-400/40" />
        <span className="absolute inset-3 animate-ping rounded-full border-2 border-orange-400/30 [animation-delay:300ms]" />
        <div className="relative flex h-16 w-12 -rotate-6 items-center justify-center rounded-lg bg-black shadow-xl dark:bg-[#0b1420]">
          <Smartphone className="h-7 w-7 animate-pulse text-orange-500" />
        </div>
      </div>

      <div className="text-center">
        <div className="text-2xl font-extrabold tracking-tight text-[#071a34] dark:text-white">
          Josh<span className="text-orange-500">Sec</span>Logs
        </div>
        <div className="mt-1 text-[10px] font-medium tracking-[4px] text-slate-500">
          LOGIN · CONNECT · STAY PRIVATE
        </div>
      </div>
    </div>
  );
}
