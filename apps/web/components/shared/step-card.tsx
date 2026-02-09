"use client";

interface StepCardProps {
  stepNumber: number;
  title: string;
  description: string;
  details?: string[];
  isLast?: boolean;
  color?: string;
}

export function StepCard({
  stepNumber,
  title,
  description,
  details,
  isLast = false,
}: StepCardProps) {
  return (
    <div className="relative">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {stepNumber}
          </div>
          {!isLast && (
            <div className="w-0.5 grow bg-border" style={{ minHeight: 24 }} />
          )}
        </div>

        <div className="flex-1 pb-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">{title}</span>
            <span className="text-sm text-muted-foreground">{description}</span>
            {details && details.length > 0 && (
              <ul className="mt-1 list-disc pl-4 text-sm space-y-1">
                {details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
