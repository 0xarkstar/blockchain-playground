"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import {
  createPrivateState,
  mintShieldedCoin,
  privateTransfer,
  getPrivacyAnalysis,
  type PrivateState,
} from "../../lib/zk/private-transfer";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export function PrivateTransferDemo() {
  const [state, setState] = useState<PrivateState>(createPrivateState);
  const [mintOwner, setMintOwner] = useState("alice");
  const [mintValue, setMintValue] = useState(100);
  const [selectedNote, setSelectedNote] = useState<number | null>(null);
  const [recipient, setRecipient] = useState("bob");
  const [sendAmount, setSendAmount] = useState(60);
  const [lastMessage, setLastMessage] = useState("");
  const [lastSuccess, setLastSuccess] = useState<boolean | null>(null);

  const privacy = getPrivacyAnalysis();

  const handleMint = () => {
    const result = mintShieldedCoin(state, BigInt(mintValue), mintOwner);
    setState(result.newState);
    setLastMessage(result.message);
    setLastSuccess(result.success);
  };

  const handleTransfer = () => {
    if (selectedNote === null || !state.notes[selectedNote]) return;
    const note = state.notes[selectedNote];
    const result = privateTransfer(state, note, recipient, BigInt(sendAmount));
    setState(result.newState);
    setLastMessage(result.message);
    setLastSuccess(result.success);
    if (result.success) setSelectedNote(null);
  };

  const handleReset = () => {
    setState(createPrivateState());
    setSelectedNote(null);
    setLastMessage("");
    setLastSuccess(null);
  };

  // Only show unspent notes
  const unspentNotes = state.notes.filter(
    (n) => !state.nullifiers.includes(n.nullifier),
  );

  return (
    <div className="flex flex-col gap-6">
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Private transfers use commitments and nullifiers (Zcash/Tornado Cash
          style). The verifier sees opaque hashes but NOT who sent what to whom or
          how much.
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">
              Mint Shielded Coin
            </p>
            <Button
              onClick={handleReset}
              variant="secondary"
              size="sm"
            >
              Reset
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zk-transfer-owner">Owner</Label>
              <Input
                id="zk-transfer-owner"
                value={mintOwner}
                onChange={(e) => setMintOwner(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="zk-transfer-value">Value</Label>
              <Input
                id="zk-transfer-value"
                type="number"
                value={mintValue}
                onChange={(e) => setMintValue(Number(e.target.value) || 0)}
                min={1}
              />
            </div>
          </div>
          <Button variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300" onClick={handleMint}>
            Mint
          </Button>
        </div>
      </div>

      {unspentNotes.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">
              Unspent Notes (private view)
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Select</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Commitment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unspentNotes.map((note) => {
                  const idx = state.notes.indexOf(note);
                  return (
                    <TableRow
                      key={idx}
                      className={`cursor-pointer ${
                        selectedNote === idx
                          ? "bg-blue-50 dark:bg-blue-950"
                          : ""
                      }`}
                      onClick={() => setSelectedNote(idx)}
                    >
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            selectedNote === idx
                              ? "bg-blue-500 text-white dark:bg-blue-600"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          }
                        >
                          {selectedNote === idx ? "Selected" : "Select"}
                        </Badge>
                      </TableCell>
                      <TableCell>{note.owner}</TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{note.value.toString()}</code>
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{note.commitment.slice(0, 16)}...</code>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {selectedNote !== null && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">
              Transfer
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zk-transfer-recipient">Recipient</Label>
                <Input
                  id="zk-transfer-recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="zk-transfer-amount">Amount</Label>
                <Input
                  id="zk-transfer-amount"
                  type="number"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(Number(e.target.value) || 0)}
                  min={1}
                />
              </div>
            </div>
            <Button variant="secondary" className="bg-violet-100 text-violet-800 hover:bg-violet-200 dark:bg-violet-900 dark:text-violet-300" onClick={handleTransfer}>
              Send Private Transfer
            </Button>
          </div>
        </div>
      )}

      {lastMessage && (
        <Alert className={
          lastSuccess
            ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
            : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
        }>
          <Info className="h-4 w-4" />
          <AlertDescription>{lastMessage}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            UTXO Flow
          </p>
          <svg width="100%" height={80} viewBox="0 0 520 80">
            {[
              { label: "Mint", x: 10, desc: "Create Note", fill: "fill-green-100 dark:fill-green-900", stroke: "stroke-green-500 dark:stroke-green-400", titleText: "fill-green-900 dark:fill-green-200", descText: "fill-green-700 dark:fill-green-300" },
              { label: "Transfer", x: 140, desc: "Spend + Create", fill: "fill-blue-100 dark:fill-blue-900", stroke: "stroke-blue-500 dark:stroke-blue-400", titleText: "fill-blue-900 dark:fill-blue-200", descText: "fill-blue-700 dark:fill-blue-300" },
              { label: "Nullify", x: 270, desc: "Mark Spent", fill: "fill-red-100 dark:fill-red-900", stroke: "stroke-red-500 dark:stroke-red-400", titleText: "fill-red-900 dark:fill-red-200", descText: "fill-red-700 dark:fill-red-300" },
              { label: "Verify", x: 400, desc: "ZK Proof", fill: "fill-violet-100 dark:fill-violet-900", stroke: "stroke-violet-500 dark:stroke-violet-400", titleText: "fill-violet-900 dark:fill-violet-200", descText: "fill-violet-700 dark:fill-violet-300" },
            ].map((step, i) => (
              <g key={step.label}>
                <rect
                  x={step.x}
                  y={10}
                  width={100}
                  height={55}
                  rx={8}
                  className={`${step.fill} ${step.stroke}`}
                  strokeWidth={1.5}
                />
                <text
                  x={step.x + 50}
                  y={32}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={600}
                  className={step.titleText}
                >
                  {step.label}
                </text>
                <text
                  x={step.x + 50}
                  y={50}
                  textAnchor="middle"
                  fontSize={10}
                  className={step.descText}
                >
                  {step.desc}
                </text>
                {i < 3 && (
                  <text
                    x={step.x + 120}
                    y={42}
                    textAnchor="middle"
                    fontSize={16}
                    className="fill-muted-foreground"
                  >
                    {"\u2192"}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Public State (what the blockchain sees)
          </p>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Commitments</TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{state.commitments.length}</code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Nullifiers (spent)</TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{state.nullifiers.length}</code>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          {state.nullifiers.length > 0 && (
            <>
              <p className="text-xs font-semibold text-muted-foreground">
                Spent nullifiers:
              </p>
              {state.nullifiers.map((n, i) => (
                <pre key={i} className="rounded-lg bg-muted p-3 text-sm overflow-x-auto font-mono">
                  <code>{n.slice(0, 40)}...</code>
                </pre>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">
            Privacy Analysis
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Public
                  </Badge>
                </TableCell>
                <TableCell>{privacy.publicInfo.join(", ")}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                    Hidden
                  </Badge>
                </TableCell>
                <TableCell>{privacy.hiddenInfo.join(", ")}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950 p-2">
            <AlertDescription className="text-xs">
              <strong>Verifier knows:</strong> {privacy.verifierKnows}
            </AlertDescription>
          </Alert>
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 p-2">
            <AlertDescription className="text-xs">
              <strong>Verifier does NOT know:</strong>{" "}
              {privacy.verifierDoesNotKnow}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
