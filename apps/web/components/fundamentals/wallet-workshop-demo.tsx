"use client";

import { useState, useCallback } from "react";
import { Wallet, Copy, Check, Info } from "lucide-react";
import {
  generateNewMnemonic,
  isValidMnemonic,
} from "../../lib/wallet/mnemonic";
import {
  deriveAccountsFromMnemonic,
  type HDWalletInfo,
} from "../../lib/wallet/hd-wallet";
import { DemoLayout } from "../shared/demo-layout";
import { EducationPanel } from "../shared/education-panel";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

function KeyDerivationTree({ walletInfo }: { walletInfo: HDWalletInfo }) {
  const accounts = walletInfo.accounts.slice(0, 5);
  const treeWidth = 320;
  const rowHeight = 40;
  const svgHeight = 80 + accounts.length * rowHeight;

  return (
    <div className="rounded-lg border border-border bg-card p-4" data-testid="key-derivation-tree">
      <p className="text-sm font-semibold mb-2">
        BIP32 Key Derivation Tree
      </p>
      <div className="overflow-x-auto">
        <svg
          width={treeWidth}
          height={svgHeight}
          viewBox={`0 0 ${treeWidth} ${svgHeight}`}
        >
          {/* Master seed */}
          <rect
            x={treeWidth / 2 - 60}
            y={5}
            width={120}
            height={30}
            rx={6}
            style={{ fill: "var(--viz-purple)", fillOpacity: 0.15, stroke: "var(--viz-purple)" }}
            strokeWidth="2"
          />
          <text
            x={treeWidth / 2}
            y={25}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill="hsl(var(--foreground))"
          >
            Master Seed
          </text>

          {/* Line to path root */}
          <line
            x1={treeWidth / 2}
            y1={35}
            x2={treeWidth / 2}
            y2={50}
            stroke="hsl(var(--muted-foreground) / 0.3)"
            strokeWidth="1.5"
          />

          {/* Path root m/44'/60'/0'/0 */}
          <rect
            x={treeWidth / 2 - 70}
            y={50}
            width={140}
            height={26}
            rx={4}
            style={{ fill: "var(--viz-blue)", fillOpacity: 0.15, stroke: "var(--viz-blue)", strokeOpacity: 0.5 }}
            strokeWidth="1.5"
          />
          <text
            x={treeWidth / 2}
            y={67}
            textAnchor="middle"
            fontSize="9"
            fill="hsl(var(--foreground))"
          >
            {"m/44'/60'/0'/0"}
          </text>

          {/* Child accounts */}
          {accounts.map((account, i) => {
            const y = 90 + i * rowHeight;
            return (
              <g key={account.index}>
                <line
                  x1={treeWidth / 2}
                  y1={76}
                  x2={treeWidth / 2}
                  y2={y}
                  stroke="hsl(var(--muted-foreground) / 0.2)"
                  strokeWidth="1"
                />
                <line
                  x1={treeWidth / 2}
                  y1={y}
                  x2={treeWidth / 2 - 40}
                  y2={y}
                  stroke="hsl(var(--muted-foreground) / 0.2)"
                  strokeWidth="1"
                />
                <rect
                  x={10}
                  y={y - 12}
                  width={treeWidth / 2 - 55}
                  height={24}
                  rx={4}
                  style={{ fill: "var(--viz-green)", fillOpacity: 0.15, stroke: "var(--viz-green)", strokeOpacity: 0.5 }}
                  strokeWidth="1"
                />
                <text
                  x={16}
                  y={y + 4}
                  fontSize="8"
                  fill="hsl(var(--foreground))"
                >
                  /{account.index}
                </text>
                <text
                  x={treeWidth / 2 - 50}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="7"
                  fontFamily="monospace"
                  fill="hsl(var(--muted-foreground))"
                >
                  {account.address.slice(0, 14)}...
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export function WalletWorkshopDemo() {
  const [strength, setStrength] = useState<"128" | "256">("128");
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [walletInfo, setWalletInfo] = useState<HDWalletInfo | null>(null);
  const [accountCount, setAccountCount] = useState<number>(5);
  const [deriving, setDeriving] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    const m = generateNewMnemonic(Number(strength) as 128 | 256);
    setMnemonic(m);
    setWalletInfo(null);
  }, [strength]);

  const handleDerive = useCallback(() => {
    if (!mnemonic) return;
    setDeriving(true);
    setTimeout(() => {
      const info = deriveAccountsFromMnemonic(mnemonic, accountCount);
      setWalletInfo(info);
      setDeriving(false);
    }, 10);
  }, [mnemonic, accountCount]);

  const handleCopyMnemonic = () => {
    if (!mnemonic) return;
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputPanel = (
    <div className="flex flex-col gap-4">
      <Alert className="border-orange-500">
        <Info className="h-4 w-4" />
        <AlertDescription>
          This demo generates real BIP39 mnemonics. Never use demo-generated
          mnemonics for real funds.
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Step 1: Generate BIP39 Mnemonic
          </p>
          <Tabs value={strength} onValueChange={(v) => setStrength(v as "128" | "256")}>
            <TabsList className="w-full">
              <TabsTrigger value="128" className="flex-1">12 words (128-bit)</TabsTrigger>
              <TabsTrigger value="256" className="flex-1">24 words (256-bit)</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={handleGenerate}>
            <Wallet className="h-4 w-4 mr-2" />
            Generate Mnemonic
          </Button>

          {mnemonic && (
            <div className="rounded-lg border border-border bg-zinc-900 p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">
                  Mnemonic Phrase ({mnemonic.split(" ").length} words)
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopyMnemonic}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-teal-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {mnemonic.split(" ").map((word, i) => (
                  <Badge key={i} variant="secondary" className="text-sm">
                    {i + 1}. {word}
                  </Badge>
                ))}
              </div>
              <Badge
                className={`mt-1 ${isValidMnemonic(mnemonic) ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"}`}
                variant="secondary"
              >
                {isValidMnemonic(mnemonic) ? "Valid BIP39" : "Invalid"}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {mnemonic && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">
              Step 2: Derive HD Wallet Accounts (BIP44)
            </p>
            <p className="text-xs text-muted-foreground">
              Derivation path: m/44&apos;/60&apos;/0&apos;/0/index
            </p>
            <div>
              <Label>Number of Accounts</Label>
              <Input
                type="number"
                value={accountCount}
                onChange={(e) => setAccountCount(Number(e.target.value))}
                min={1}
                max={20}
              />
            </div>
            <Button onClick={handleDerive} disabled={deriving} variant="outline">
              {deriving ? "Deriving..." : "Derive Accounts"}
            </Button>

            {walletInfo && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Master Seed
                  </p>
                  <pre className="rounded-lg bg-muted p-3 overflow-x-auto break-all" style={{ fontSize: "0.6rem" }}>
                    <code>{walletInfo.seed.slice(0, 64)}...</code>
                  </pre>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Index</TableHead>
                      <TableHead>Path</TableHead>
                      <TableHead>Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {walletInfo.accounts.map((account) => (
                      <TableRow key={account.index}>
                        <TableCell>{account.index}</TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{account.path}</code>
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-1.5 py-0.5 font-mono" style={{ fontSize: "0.7rem" }}>
                            {account.address}
                          </code>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const resultPanel = (
    <div className="flex flex-col gap-4">
      {walletInfo ? (
        <KeyDerivationTree walletInfo={walletInfo} />
      ) : (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground text-center py-8">
            Generate a mnemonic and derive accounts to see the key derivation
            tree
          </p>
        </div>
      )}
    </div>
  );

  return (
    <DemoLayout
      inputPanel={inputPanel}
      resultPanel={resultPanel}
      learnContent={
        <EducationPanel
          howItWorks={[
            {
              title: "Generate Entropy",
              description:
                "Random bytes (128 or 256 bits) are generated securely as the seed for the mnemonic.",
            },
            {
              title: "BIP39 Mnemonic",
              description:
                "The entropy is converted to a human-readable 12 or 24 word phrase using a standard wordlist.",
            },
            {
              title: "Derive Master Key",
              description:
                "The mnemonic + optional passphrase is converted to a 512-bit seed using PBKDF2, then to a master key.",
            },
            {
              title: "BIP44 Child Keys",
              description:
                "Using the path m/44'/60'/0'/0/index, deterministic child keys are derived for each account.",
            },
          ]}
          whyItMatters="HD wallets allow you to manage unlimited accounts from a single backup (the mnemonic). This is the standard used by MetaMask, Ledger, and virtually all modern wallets."
          tips={[
            "The same mnemonic always produces the same accounts — this is what makes it a backup",
            "24-word mnemonics provide 256-bit security vs 128-bit for 12 words",
            "Never share your mnemonic — anyone with it can access all your accounts",
          ]}
        />
      }
    />
  );
}
