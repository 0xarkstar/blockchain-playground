"use client";

import { useState } from "react";
import { ShieldCheck, Check, Copy } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

function truncateHex(hex: string, chars: number = 10): string {
  if (hex.length <= chars * 2 + 2) return hex;
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;
}

interface CredentialPanelProps {
  readonly birthYear: number | "";
  readonly birthMonth: number | "";
  readonly birthDay: number | "";
  readonly minAge: number | "";
  readonly phase: string;
  readonly identityCommitment: string;
  readonly isInputValid: boolean;
  readonly onBirthYearChange: (val: number | "") => void;
  readonly onBirthMonthChange: (val: number | "") => void;
  readonly onBirthDayChange: (val: number | "") => void;
  readonly onMinAgeChange: (val: number | "") => void;
  readonly onComputeCommitment: () => void;
}

export function CredentialPanel({
  birthYear,
  birthMonth,
  birthDay,
  minAge,
  phase,
  identityCommitment,
  isInputValid,
  onBirthYearChange,
  onBirthMonthChange,
  onBirthDayChange,
  onMinAgeChange,
  onComputeCommitment,
}: CredentialPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(identityCommitment);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">
            Step 1: Enter Birthday (Private)
          </p>
          <p className="text-xs text-muted-foreground">
            Your birthday is the private input. It will never be revealed to the
            verifier.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Birth Year</Label>
              <Input
                type="number"
                value={birthYear}
                onChange={(e) => {
                  const v = e.target.value;
                  onBirthYearChange(v === "" ? "" : Number(v));
                }}
                min={1900}
                max={new Date().getFullYear()}
                disabled={phase !== "input"}
              />
            </div>
            <div>
              <Label>Birth Month</Label>
              <Input
                type="number"
                value={birthMonth}
                onChange={(e) => {
                  const v = e.target.value;
                  onBirthMonthChange(v === "" ? "" : Number(v));
                }}
                min={1}
                max={12}
                disabled={phase !== "input"}
              />
            </div>
            <div>
              <Label>Birth Day</Label>
              <Input
                type="number"
                value={birthDay}
                onChange={(e) => {
                  const v = e.target.value;
                  onBirthDayChange(v === "" ? "" : Number(v));
                }}
                min={1}
                max={31}
                disabled={phase !== "input"}
              />
            </div>
          </div>
          <div>
            <Label>Minimum Age Threshold</Label>
            <p className="text-xs text-muted-foreground mb-1">
              The age requirement to prove (e.g., 18 for adult content, 21 for alcohol)
            </p>
            <Input
              type="number"
              value={minAge}
              onChange={(e) => {
                const v = e.target.value;
                onMinAgeChange(v === "" ? "" : Number(v));
              }}
              min={1}
              max={150}
              disabled={phase !== "input"}
            />
          </div>
          <Button
            onClick={onComputeCommitment}
            disabled={phase !== "input" || !isInputValid}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Compute Identity Commitment
          </Button>
        </div>
      </div>

      {identityCommitment && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">
              Step 2: Identity Commitment (Public)
            </p>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                Public
              </Badge>
              <p className="text-xs text-muted-foreground">
                Poseidon hash of (year, month, day). Hides actual birthday.
              </p>
            </div>
            <div className="flex items-center gap-1">
              <pre className="flex-1 rounded-lg bg-muted p-3 text-sm overflow-x-auto font-mono">
                <code>{truncateHex(identityCommitment, 16)}</code>
              </pre>
              <Button variant="ghost" size="icon" onClick={handleCopy} title={copied ? "Copied" : "Copy"}>
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
