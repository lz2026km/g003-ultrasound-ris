import { useState } from "react";
import { Typography } from "@nous-research/ui";
import { useSidebarStatus } from "@/hooks/useSidebarStatus";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { ChevronUp, X, Zap } from "lucide-react";
import { CHANGELOG } from "@/data/changelog";

export function SidebarFooter() {
  const status = useSidebarStatus();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const version = status?.version ?? "—";

  return (
    <>
      <div
        className={cn(
          "flex shrink-0 items-center justify-between gap-2",
          "px-5 py-2.5",
          "border-t border-current/10",
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          title="查看更新历史"
          className={cn(
            "group flex items-center gap-1.5",
            "cursor-pointer transition-opacity hover:opacity-90",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-midground/40",
          )}
        >
          <Typography
            mondwest
            className="font-mono-ui text-[0.7rem] tabular-nums tracking-[0.1em] text-muted-foreground/70"
          >
            v{version}
          </Typography>
          <ChevronUp
            size={10}
            className="text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors"
          />
        </button>

        <a
          href="https://nousresearch.com"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "font-mondwest text-[0.65rem] tracking-[0.15em] text-midground",
            "transition-opacity hover:opacity-90",
            "focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-midground/40",
          )}
          style={{ mixBlendMode: "plus-lighter" }}
        >
          {t.app.footer.org}
        </a>
      </div>

      {/* Changelog Modal */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Panel */}
          <div
            className={cn(
              "fixed right-0 top-0 z-[101] flex h-dvh w-80 flex-col",
              "bg-background-base border-l border-current/20",
              "shadow-2xl shadow-black/50",
            )}
            style={{
              background: "var(--component-sidebar-background)",
              borderImage: "var(--component-sidebar-border-image)",
            }}
          >
            {/* Header */}
            <div
              className={cn(
                "flex shrink-0 items-center justify-between gap-2",
                "px-5 py-4",
                "border-b border-current/20",
              )}
            >
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-midground/70" />
                <Typography
                  mondwest
                  className="text-[0.85rem] tracking-[0.12em] text-midground"
                  style={{ mixBlendMode: "plus-lighter" }}
                >
                  更新历史
                </Typography>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center",
                  "text-midground/50 hover:text-midground transition-colors cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-midground",
                )}
              >
                <X size={14} />
              </button>
            </div>

            {/* Changelog list */}
            <div className="min-h-0 flex-1 overflow-y-auto py-2">
              {CHANGELOG.map((entry, idx) => (
                <div key={entry.version} className="mb-4 px-5">
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span
                      className={cn(
                        "font-mono-ui text-[0.8rem] tabular-nums tracking-wider",
                        idx === 0
                          ? "text-midground font-semibold"
                          : "text-midground/80",
                      )}
                    >
                      v{entry.version}
                    </span>
                    <span className="text-[0.65rem] text-muted-foreground/50 tracking-widest">
                      {entry.date}
                    </span>
                    {idx === 0 && (
                      <span className="ml-auto">
                        <span
                          className={cn(
                            "inline-block rounded px-1.5 py-0.5",
                            "bg-midground/20 text-[0.55rem] tracking-wider",
                            "font-mono-ui text-midground/90",
                          )}
                        >
                          最新
                        </span>
                      </span>
                    )}
                  </div>
                  <ul className="space-y-1">
                    {entry.changes.map((change, cIdx) => (
                      <li
                        key={cIdx}
                        className={cn(
                          "text-[0.65rem] leading-relaxed",
                          "text-muted-foreground/70",
                        )}
                      >
                        · {change}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div
              className={cn(
                "shrink-0 px-5 py-3",
                "border-t border-current/10",
                "text-center",
              )}
            >
              <span className="text-[0.6rem] text-muted-foreground/40 tracking-widest">
                Hermes Agent · {CHANGELOG[0]?.version}
              </span>
            </div>
          </div>
        </>
      )}
    </>
  );
}
