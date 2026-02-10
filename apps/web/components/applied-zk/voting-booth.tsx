"use client";

import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type VoteChoice = "yes" | "no";

interface VotingBoothProps {
  readonly voteChoice: VoteChoice;
  readonly phase: string;
  readonly progressMessage: string;
  readonly onVoteChoiceChange: (choice: VoteChoice) => void;
  readonly onVoteAndProve: () => void;
}

export function VotingBooth({
  voteChoice,
  phase,
  progressMessage,
  onVoteChoiceChange,
  onVoteAndProve,
}: VotingBoothProps) {
  if (phase === "setup" || phase === "registering") {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">
          Step 2: Cast Your Vote
        </p>
        <p className="text-xs text-muted-foreground">
          Your vote is private: the ZK proof shows you are a registered voter
          and your vote is valid, without revealing which voter you are.
        </p>
        <div>
          <Label htmlFor="azk-voting-proposal">Proposal</Label>
          <Input
            id="azk-voting-proposal"
            value="Should the DAO fund the ZK education initiative?"
            readOnly
          />
        </div>
        <p className="text-sm font-medium">
          Your Vote:
        </p>
        <div className="flex items-center gap-0 rounded-lg border border-border overflow-hidden">
          <Button
            type="button"
            variant={voteChoice === "yes" ? "default" : "secondary"}
            className={`flex-1 rounded-none ${
              voteChoice === "yes"
                ? ""
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            onClick={() => onVoteChoiceChange("yes")}
            disabled={phase !== "registered"}
          >
            Yes
          </Button>
          <Button
            type="button"
            variant={voteChoice === "no" ? "default" : "secondary"}
            className={`flex-1 rounded-none ${
              voteChoice === "no"
                ? ""
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            onClick={() => onVoteChoiceChange("no")}
            disabled={phase !== "registered"}
          >
            No
          </Button>
        </div>
        {progressMessage && (
          <div className="flex items-center gap-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {progressMessage}
            </p>
          </div>
        )}
        <Button
          onClick={onVoteAndProve}
          disabled={phase !== "registered"}
        >
          Vote & Generate ZK Proof
        </Button>
      </div>
    </div>
  );
}
