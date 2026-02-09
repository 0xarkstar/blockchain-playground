"use client";

import { useState, useCallback } from "react";
import { Database, Search, Info } from "lucide-react";
import { DemoLayout } from "../shared/demo-layout";
import { EducationPanel } from "../shared/education-panel";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";

interface AccountState {
  address: string;
  balance: string;
  nonce: string;
  codeHash: string;
  storageRoot: string;
}

const EXAMPLE_ACCOUNTS: AccountState[] = [
  {
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    balance: "1,234.56 ETH",
    nonce: "892",
    codeHash:
      "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
    storageRoot:
      "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
  },
  {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    balance: "0.00 ETH",
    nonce: "1",
    codeHash: "0x7f5c764cbc14f9669b88837ca1490cca17c31607...",
    storageRoot: "0x3a8f4c9d2e7b1f6a5c8d3e2b7a4f9c1d6e8b3a5f...",
  },
];

function StateTrieVisual({ account }: { account: AccountState }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4" data-testid="state-trie-visual">
      <p className="text-sm font-semibold mb-2">
        State Trie Structure
      </p>
      <div className="flex justify-center">
        <svg width="300" height="260" viewBox="0 0 300 260">
          {/* State Root */}
          <rect
            x="100"
            y="5"
            width="100"
            height="30"
            rx="6"
            fill="hsl(263.4 70% 50.4% / 0.15)"
            stroke="hsl(263.4 70% 50.4%)"
            strokeWidth="2"
          />
          <text
            x="150"
            y="25"
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill="hsl(var(--foreground))"
          >
            State Root
          </text>

          {/* Line to account node */}
          <line
            x1="150"
            y1="35"
            x2="150"
            y2="55"
            stroke="hsl(var(--muted-foreground) / 0.3)"
            strokeWidth="1.5"
          />

          {/* Account node (keyed by address) */}
          <rect
            x="60"
            y="55"
            width="180"
            height="30"
            rx="4"
            fill="hsl(217.2 91.2% 59.8% / 0.15)"
            stroke="hsl(217.2 91.2% 59.8% / 0.5)"
            strokeWidth="1.5"
          />
          <text
            x="150"
            y="73"
            textAnchor="middle"
            fontSize="8"
            fontFamily="monospace"
            fill="hsl(var(--foreground))"
          >
            {account.address.slice(0, 20)}...
          </text>

          {/* Lines to 4 account fields */}
          {[0, 1, 2, 3].map((i) => {
            const x = 30 + i * 75;
            return (
              <line
                key={i}
                x1="150"
                y1="85"
                x2={x}
                y2="110"
                stroke="hsl(var(--muted-foreground) / 0.2)"
                strokeWidth="1"
              />
            );
          })}

          {/* Nonce */}
          <rect
            x="5"
            y="110"
            width="60"
            height="44"
            rx="4"
            fill="hsl(142.1 76.2% 36.3% / 0.15)"
            stroke="hsl(142.1 76.2% 36.3% / 0.5)"
            strokeWidth="1"
          />
          <text
            x="35"
            y="127"
            textAnchor="middle"
            fontSize="8"
            fontWeight="600"
            fill="hsl(var(--foreground))"
          >
            Nonce
          </text>
          <text
            x="35"
            y="145"
            textAnchor="middle"
            fontSize="9"
            fontFamily="monospace"
            fill="hsl(var(--foreground))"
          >
            {account.nonce}
          </text>

          {/* Balance */}
          <rect
            x="75"
            y="110"
            width="60"
            height="44"
            rx="4"
            fill="hsl(47.9 95.8% 53.1% / 0.15)"
            stroke="hsl(47.9 95.8% 53.1% / 0.5)"
            strokeWidth="1"
          />
          <text
            x="105"
            y="127"
            textAnchor="middle"
            fontSize="8"
            fontWeight="600"
            fill="hsl(var(--foreground))"
          >
            Balance
          </text>
          <text
            x="105"
            y="145"
            textAnchor="middle"
            fontSize="7"
            fontFamily="monospace"
            fill="hsl(var(--foreground))"
          >
            {account.balance}
          </text>

          {/* Storage Root */}
          <rect
            x="155"
            y="110"
            width="60"
            height="44"
            rx="4"
            fill="hsl(24.6 95% 53.1% / 0.15)"
            stroke="hsl(24.6 95% 53.1% / 0.5)"
            strokeWidth="1"
          />
          <text
            x="185"
            y="127"
            textAnchor="middle"
            fontSize="7"
            fontWeight="600"
            fill="hsl(var(--foreground))"
          >
            storageRoot
          </text>
          <text
            x="185"
            y="145"
            textAnchor="middle"
            fontSize="6"
            fontFamily="monospace"
            fill="hsl(var(--muted-foreground))"
          >
            {account.storageRoot.slice(0, 10)}...
          </text>

          {/* Code Hash */}
          <rect
            x="230"
            y="110"
            width="60"
            height="44"
            rx="4"
            fill="hsl(var(--destructive) / 0.15)"
            stroke="hsl(var(--destructive) / 0.5)"
            strokeWidth="1"
          />
          <text
            x="260"
            y="127"
            textAnchor="middle"
            fontSize="7"
            fontWeight="600"
            fill="hsl(var(--foreground))"
          >
            codeHash
          </text>
          <text
            x="260"
            y="145"
            textAnchor="middle"
            fontSize="6"
            fontFamily="monospace"
            fill="hsl(var(--muted-foreground))"
          >
            {account.codeHash.slice(0, 10)}...
          </text>

          {/* Storage Trie sub-tree indicator */}
          <line
            x1="185"
            y1="154"
            x2="185"
            y2="175"
            stroke="hsl(24.6 95% 53.1% / 0.3)"
            strokeWidth="1"
            strokeDasharray="3 2"
          />
          <rect
            x="145"
            y="175"
            width="80"
            height="26"
            rx="4"
            fill="hsl(24.6 95% 53.1% / 0.08)"
            stroke="hsl(24.6 95% 53.1% / 0.3)"
            strokeWidth="1"
            strokeDasharray="3 2"
          />
          <text
            x="185"
            y="192"
            textAnchor="middle"
            fontSize="8"
            fill="hsl(var(--muted-foreground))"
          >
            Storage Trie
          </text>

          {/* Legend */}
          <text x="5" y="230" fontSize="8" fill="hsl(var(--muted-foreground))">
            Merkle Patricia Trie: accounts keyed by keccak256(address)
          </text>
          <text x="5" y="245" fontSize="8" fill="hsl(var(--muted-foreground))">
            Each account stores: nonce, balance, storageRoot, codeHash
          </text>
        </svg>
      </div>
    </div>
  );
}

export function StateExplorerDemo() {
  const [address, setAddress] = useState(EXAMPLE_ACCOUNTS[0].address);
  const [account, setAccount] = useState<AccountState | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const found = EXAMPLE_ACCOUNTS.find(
        (a) => a.address.toLowerCase() === address.toLowerCase(),
      );
      setAccount(
        found ?? {
          address,
          balance: "0.00 ETH",
          nonce: "0",
          codeHash:
            "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
          storageRoot:
            "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
        },
      );
      setLoading(false);
    }, 300);
  }, [address]);

  const inputPanel = (
    <div className="flex flex-col gap-4">
      <Alert className="border-blue-500">
        <Info className="h-4 w-4" />
        <AlertDescription>
          This demo simulates browsing Ethereum state. In a full implementation,
          it would query live RPC endpoints to fetch real account data.
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Account Lookup
          </p>
          <div className="flex items-center gap-2">
            <Input
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleLookup}
              disabled={loading}
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? "Loading..." : "Lookup"}
            </Button>
          </div>
          <div className="flex items-center gap-1">
            {EXAMPLE_ACCOUNTS.map((a) => (
              <Badge
                key={a.address}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setAddress(a.address)}
              >
                {a.address.slice(0, 8)}...
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {account && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                Account State
              </p>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Database className="h-3 w-3" /> State Trie
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">
                  Balance
                </p>
                <p className="text-lg font-bold">
                  {account.balance}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">
                  Nonce (TX Count)
                </p>
                <p className="text-lg font-bold">
                  {account.nonce}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Code Hash (keccak256 of contract bytecode)
              </p>
              <pre className="rounded-lg bg-muted p-3 overflow-x-auto break-all" style={{ fontSize: "0.7rem" }}>
                <code>{account.codeHash}</code>
              </pre>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Storage Root (Merkle Patricia Trie root of contract storage)
              </p>
              <pre className="rounded-lg bg-muted p-3 overflow-x-auto break-all" style={{ fontSize: "0.7rem" }}>
                <code>{account.storageRoot}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const resultPanel = (
    <div className="flex flex-col gap-4">
      {account ? (
        <StateTrieVisual account={account} />
      ) : (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground text-center py-8">
            Look up an account to see its state trie structure
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
              title: "Global State Trie",
              description:
                "Ethereum maintains a Merkle Patricia Trie mapping every address to its account state.",
            },
            {
              title: "Account Fields",
              description:
                "Each account stores: nonce (tx count), balance, storageRoot (for contract storage), and codeHash.",
              details: [
                "EOAs (externally owned accounts) have empty codeHash",
                "Contracts have a storageRoot pointing to their own storage trie",
              ],
            },
            {
              title: "State Root",
              description:
                "The root hash of the state trie is included in every block header, committing to the entire world state.",
            },
          ]}
          whyItMatters="The state trie is how Ethereum stores all account data. Its Merkle structure allows light clients to verify any account's state with a compact proof, without downloading the entire blockchain."
          tips={[
            "An empty codeHash means the account is an EOA (user account), not a contract",
            "The storageRoot is itself a Merkle Patricia Trie — a trie within a trie",
            "State growth is one of Ethereum's biggest scalability challenges",
          ]}
        />
      }
    />
  );
}
