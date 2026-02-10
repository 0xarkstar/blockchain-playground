"use client";

import { useCallback } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "../ui/command";
import { tracks } from "../../lib/tracks/registry";
import { useProgress } from "../../lib/tracks/use-progress";

const trackHrefMap: Record<string, string> = {
  fundamentals: "fundamentals",
  defi: "defi",
  solidity: "solidity",
  tokens: "tokens",
  zk: "zk",
  appliedZk: "applied-zk",
};

interface CommandPaletteProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const locale = useLocale();
  const router = useRouter();
  const { isComplete } = useProgress();

  const handleSelect = useCallback(
    (trackHref: string, slug: string) => {
      onOpenChange(false);
      router.push(`/${locale}/${trackHref}/demo/${slug}`);
    },
    [locale, router, onOpenChange],
  );

  const handleNavigate = useCallback(
    (path: string) => {
      onOpenChange(false);
      router.push(`/${locale}${path}`);
    },
    [locale, router, onOpenChange],
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search Demos"
      description="Search across all blockchain learning demos"
    >
      <CommandInput placeholder="Search demos..." />
      <CommandList>
        <CommandEmpty>No demos found.</CommandEmpty>
        {tracks.map((track) => {
          const Icon = track.icon;
          const href = trackHrefMap[track.key] ?? track.key;
          return (
            <CommandGroup key={track.key} heading={track.key === "appliedZk" ? "Applied ZK" : track.i18nNamespace.charAt(0).toUpperCase() + track.i18nNamespace.slice(1)}>
              {track.demos.map((demo) => {
                const completed = isComplete(track.key, demo.slug);
                return (
                  <CommandItem
                    key={`${track.key}/${demo.slug}`}
                    value={`${demo.key} ${track.key}`}
                    onSelect={() => handleSelect(href, demo.slug)}
                  >
                    {completed ? (
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    <span>{demo.key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim()}</span>
                  </CommandItem>
                );
              })}
              {track.key === "appliedZk" && (
                <>
                  <CommandItem
                    key="applied-zk/education/snark"
                    value="SNARK Education Applied ZK"
                    onSelect={() => handleNavigate("/applied-zk/education/snark")}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Education: SNARK</span>
                  </CommandItem>
                  <CommandItem
                    key="applied-zk/education/stark"
                    value="STARK Education Applied ZK"
                    onSelect={() => handleNavigate("/applied-zk/education/stark")}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Education: STARK</span>
                  </CommandItem>
                  <CommandItem
                    key="applied-zk/education/comparison"
                    value="Comparison Education Applied ZK"
                    onSelect={() => handleNavigate("/applied-zk/education/comparison")}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Education: Comparison</span>
                  </CommandItem>
                  <CommandItem
                    key="applied-zk/visualization/circuit"
                    value="Circuit Visualization Applied ZK"
                    onSelect={() => handleNavigate("/applied-zk/visualization/circuit")}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Visualization: Circuit</span>
                  </CommandItem>
                  <CommandItem
                    key="applied-zk/visualization/proof"
                    value="Proof Visualization Applied ZK"
                    onSelect={() => handleNavigate("/applied-zk/visualization/proof")}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Visualization: Proof</span>
                  </CommandItem>
                </>
              )}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
