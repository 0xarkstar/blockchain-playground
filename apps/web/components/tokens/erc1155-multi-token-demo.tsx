"use client";

import { useState, useMemo } from "react";
import { Info } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  createERC1155,
  mintERC1155,
  transferERC1155,
  balanceOfERC1155,
  type ERC1155State,
} from "../../lib/tokens/erc1155";
import { SimpleBarChart } from "../shared";

export function ERC1155MultiTokenDemo() {
  const [state, setState] = useState<ERC1155State>(() => createERC1155());
  const [mintTo, setMintTo] = useState("alice");
  const [mintTokenId, setMintTokenId] = useState(1);
  const [mintAmount, setMintAmount] = useState(100);
  const [mintType, setMintType] = useState<"fungible" | "non-fungible">(
    "fungible",
  );
  const [mintUri, setMintUri] = useState("");

  const [tfFrom, setTfFrom] = useState("alice");
  const [tfTo, setTfTo] = useState("bob");
  const [tfTokenId, setTfTokenId] = useState(1);
  const [tfAmount, setTfAmount] = useState(10);
  const [lastMessage, setLastMessage] = useState("");

  const allTokenIds = useMemo(() => {
    return Array.from(new Set(Object.keys(state.totalSupply).map(Number))).sort(
      (a, b) => a - b,
    );
  }, [state.totalSupply]);

  const allAddresses = useMemo(() => {
    return Object.keys(state.balances).sort();
  }, [state.balances]);

  const handleMint = () => {
    const result = mintERC1155(
      state,
      mintTo,
      mintTokenId,
      BigInt(mintAmount),
      mintType,
      mintUri || undefined,
    );
    setState(result.newState);
    setLastMessage(
      result.success
        ? `Minted ${mintAmount} of token #${mintTokenId} to ${mintTo}`
        : result.message,
    );
  };

  const handleTransfer = () => {
    const result = transferERC1155(
      state,
      tfFrom,
      tfTo,
      tfTokenId,
      BigInt(tfAmount),
    );
    setState(result.newState);
    setLastMessage(result.message);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Mint Token</p>
          <div className="flex items-center gap-1">
            <Button
              variant={mintType === "fungible" ? "default" : "outline"}
              size="sm"
              onClick={() => setMintType("fungible")}
            >
              Fungible
            </Button>
            <Button
              variant={mintType === "non-fungible" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setMintType("non-fungible");
                setMintAmount(1);
              }}
            >
              Non-Fungible
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>To</Label>
              <Input
                value={mintTo}
                onChange={(e) => setMintTo(e.target.value)}
              />
            </div>
            <div>
              <Label>Token ID</Label>
              <Input
                type="number"
                value={mintTokenId}
                onChange={(e) => setMintTokenId(Number(e.target.value) || 0)}
                min={1}
              />
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={mintAmount}
                onChange={(e) => setMintAmount(Number(e.target.value) || 0)}
                min={1}
                disabled={mintType === "non-fungible"}
              />
            </div>
          </div>
          <div>
            <Label>URI (optional)</Label>
            <Input
              value={mintUri}
              onChange={(e) => setMintUri(e.target.value)}
              placeholder="ipfs://..."
            />
          </div>
          <Button variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800" onClick={handleMint}>
            Mint
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Transfer</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>From</Label>
              <Input
                value={tfFrom}
                onChange={(e) => setTfFrom(e.target.value)}
              />
            </div>
            <div>
              <Label>To</Label>
              <Input
                value={tfTo}
                onChange={(e) => setTfTo(e.target.value)}
              />
            </div>
            <div>
              <Label>Token ID</Label>
              <Input
                type="number"
                value={tfTokenId}
                onChange={(e) => setTfTokenId(Number(e.target.value) || 0)}
                min={1}
              />
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={tfAmount}
                onChange={(e) => setTfAmount(Number(e.target.value) || 0)}
                min={1}
              />
            </div>
          </div>
          <Button variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800" onClick={handleTransfer}>
            Transfer
          </Button>
        </div>
      </div>

      {lastMessage && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>{lastMessage}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Token Balances</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                {allTokenIds.map((id) => (
                  <TableHead key={id} className="text-right">
                    ID #{id}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allAddresses.map((addr) => (
                <TableRow key={addr}>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{addr}</code>
                  </TableCell>
                  {allTokenIds.map((id) => (
                    <TableCell key={id} className="text-right">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                        {balanceOfERC1155(state, addr, id).toString()}
                      </code>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {allAddresses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={allTokenIds.length + 1} className="text-center">
                    <p className="text-sm text-muted-foreground">
                      No tokens minted
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {allAddresses.length > 0 && allTokenIds.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">Balance Distribution</p>
            <SimpleBarChart
              data={allAddresses.map((addr) => {
                const row: Record<string, unknown> = { address: addr };
                for (const id of allTokenIds) {
                  row[`ID #${id}`] = Number(balanceOfERC1155(state, addr, id));
                }
                return row;
              })}
              xKey="address"
              yKeys={allTokenIds.map((id) => `ID #${id}`)}
              grouped
              height={250}
            />
          </div>
        </div>
      )}

      {allTokenIds.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">Token Info</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Total Supply</TableHead>
                  <TableHead>URI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allTokenIds.map((id) => (
                  <TableRow key={id}>
                    <TableCell>
                      <Badge variant="secondary">#{id}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          state.tokenTypes[id] === "non-fungible"
                            ? "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        }
                      >
                        {state.tokenTypes[id] ?? "fungible"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{state.totalSupply[id]?.toString() ?? "0"}</code>
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                        {state.uris[id] ?? "—"}
                      </code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
