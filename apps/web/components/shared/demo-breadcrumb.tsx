"use client";

import { useTranslations } from "next-intl";
import { Link } from "../../i18n/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { getTrackByKey } from "../../lib/tracks/registry";

interface DemoBreadcrumbProps {
  readonly trackKey: string;
  readonly demoSlug: string;
}

export function DemoBreadcrumb({ trackKey, demoSlug }: DemoBreadcrumbProps) {
  const tTracks = useTranslations("tracks");
  const tDemo = useTranslations(`${trackKey === "appliedZk" ? "appliedZk" : trackKey}`);
  const track = getTrackByKey(trackKey);
  if (!track) return null;

  const demo = track.demos.find((d) => d.slug === demoSlug);
  if (!demo) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={track.href}>{tTracks(`${trackKey}.title`)}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{tDemo(`demos.${demo.key}.title`)}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
