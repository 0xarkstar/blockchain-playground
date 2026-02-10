"use client";

import { useState, useCallback } from "react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import {
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  ChevronRight,
} from "lucide-react";

interface DemoStep {
  id: string;
  title: string;
  description: string;
  highlight?: string;
}

interface InteractiveDemoProps {
  title: string;
  description: string;
  steps: readonly DemoStep[];
}

export function InteractiveDemo({
  title,
  description,
  steps,
}: InteractiveDemoProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handlePlay = useCallback(() => {
    if (completed) {
      setCurrentStep(0);
      setCompleted(false);
    }
    setIsPlaying(true);
  }, [completed]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setCompleted(true);
      setIsPlaying(false);
    }
  }, [currentStep, steps.length]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setCompleted(false);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={currentStep === 0 && !isPlaying}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={isPlaying ? handleNext : handlePlay}
              disabled={completed}
            >
              {isPlaying ? (
                <>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" /> Start
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          {steps.map((step, i) => (
            <div
              key={step.id}
              className={`h-2 flex-1 rounded-full transition-colors ${
                completed || i < currentStep
                  ? "bg-green-500"
                  : i === currentStep && isPlaying
                    ? "bg-primary"
                    : "bg-muted"
              }`}
            />
          ))}
        </div>

        {completed ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 dark:text-green-400 mx-auto mb-4" />
            <h4 className="font-semibold text-lg">Demo Complete</h4>
            <p className="text-muted-foreground">
              You&apos;ve walked through all the steps. Press reset to try again.
            </p>
          </div>
        ) : isPlaying ? (
          <div className="p-6 bg-muted rounded-lg">
            <Badge className="mb-2">Step {currentStep + 1}</Badge>
            <h4 className="font-semibold text-lg mb-2">
              {steps[currentStep].title}
            </h4>
            <p className="text-muted-foreground">
              {steps[currentStep].description}
            </p>
            {steps[currentStep].highlight && (
              <div className="mt-4 p-3 bg-background rounded border font-mono text-sm overflow-x-auto">
                {steps[currentStep].highlight}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Press Start to begin the interactive walkthrough
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SimpleProofDemoProps {
  title?: string;
}

export function SimpleProofDemo({ title }: SimpleProofDemoProps) {
  const [secret, setSecret] = useState(3);
  const [publicValue, setPublicValue] = useState(9);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);

  const handleVerify = useCallback(() => {
    setIsVerifying(true);
    setResult(null);

    setTimeout(() => {
      const isValid = secret * secret === publicValue;
      setResult(isValid);
      setIsVerifying(false);
    }, 1000);
  }, [secret, publicValue]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {title ?? "Simple ZK Proof Demo"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Prove you know a secret number whose square equals a public value
          &mdash; without revealing the secret.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="proof-secret" className="text-sm font-medium">
              Secret (private input)
            </label>
            <input
              id="proof-secret"
              type="number"
              value={secret}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setSecret(Math.min(Math.max(val, -1000000), 1000000));
              }}
              min={-1000000}
              max={1000000}
              className="w-full mt-1 p-2 border rounded-md bg-background"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Only you know this value
            </p>
          </div>
          <div>
            <label htmlFor="proof-public" className="text-sm font-medium">
              Public value (public input)
            </label>
            <input
              id="proof-public"
              type="number"
              value={publicValue}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setPublicValue(Math.min(Math.max(val, 0), 1000000000000));
              }}
              min={0}
              max={1000000000000}
              className="w-full mt-1 p-2 border rounded-md bg-background"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Everyone can see this
            </p>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg font-mono text-sm">
          <div className="text-muted-foreground">Claim:</div>
          <div>
            &ldquo;I know a secret x such that x * x = {publicValue}&rdquo;
          </div>
        </div>

        <Button
          onClick={handleVerify}
          disabled={isVerifying}
          className="w-full"
        >
          {isVerifying ? "Generating & Verifying Proof..." : "Generate & Verify Proof"}
        </Button>

        {result !== null && (
          <div
            className={`p-4 rounded-lg flex items-center gap-3 ${
              result
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
          >
            {result ? (
              <>
                <CheckCircle className="h-5 w-5" />
                <span>Proof verified! The prover knows a valid secret.</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5" />
                <span>
                  Proof failed. The secret does not match the public value.
                </span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
