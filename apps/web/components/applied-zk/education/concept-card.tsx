"use client";

import { type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { NeonGradientCard } from "../../ui/neon-gradient-card";

interface ConceptCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  badges?: readonly string[];
  className?: string;
  children?: React.ReactNode;
  highlight?: boolean;
  neonColors?: { firstColor: string; secondColor: string };
}

export function ConceptCard({
  title,
  description,
  icon: Icon,
  badges,
  className,
  children,
  highlight = false,
  neonColors,
}: ConceptCardProps) {
  const content = (
    <Card className={highlight ? "border-0 shadow-none bg-transparent" : className}>
      <CardHeader>
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            {badges && badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {badges.map((badge) => (
                  <Badge key={badge} variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{description}</p>
        {children}
      </CardContent>
    </Card>
  );

  if (highlight) {
    return (
      <NeonGradientCard
        className={className}
        neonColors={neonColors ?? { firstColor: "#6366f1", secondColor: "#8b5cf6" }}
        borderSize={2}
        borderRadius={12}
      >
        {content}
      </NeonGradientCard>
    );
  }

  return content;
}
