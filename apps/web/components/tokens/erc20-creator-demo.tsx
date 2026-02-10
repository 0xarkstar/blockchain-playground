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
  createERC20,
  mint,
  burn,
  transfer,
  balanceOf,
  formatTokenAmount,
  type ERC20State,
} from "../../lib/tokens/erc20";
import { SimplePieChart } from "../shared";

export function ERC20CreatorDemo() {
  const [tokenName, setTokenName] = useState("MyToken");
  const [tokenSymbol, setTokenSymbol] = useState("MTK");
  const [decimals, setDecimals] = useState(18);
  const [state, setState] = useState<ERC20State>(() =>
    createERC20("MyToken", "MTK", 18),
  );

  const [mintTo, setMintTo] = useState("alice");
  const [mintAmount, setMintAmount] = useState(1000);
  const [burnFrom, setBurnFrom] = useState("alice");
  const [burnAmount, setBurnAmount] = useState(100);
  const [transferFrom, setTransferFrom] = useState("alice");
  const [transferTo, setTransferTo] = useState("bob");
  const [transferAmount, setTransferAmount] = useState(50);
  const [lastMessage, setLastMessage] = useState("");

  const addresses = useMemo(() => {
    const addrs = new Set<string>();
    for (const addr of Object.keys(state.balances)) {
      addrs.add(addr);
    }
    return Array.from(addrs);
  }, [state.balances]);

  const handleCreate = () => {
    setState(createERC20(tokenName, tokenSymbol, decimals));
    setLastMessage(
      `Created ${tokenName} (${tokenSymbol}) with ${decimals} decimals`,
    );
  };

  const handleMint = () => {
    const result = mint(state, mintTo, BigInt(mintAmount));
    setState(result.newState);
    setLastMessage(result.message);
  };

  const handleBurn = () => {
    const result = burn(state, burnFrom, BigInt(burnAmount));
    setState(result.newState);
    setLastMessage(result.message);
  };

  const handleTransfer = () => {
    const result = transfer(
      state,
      transferFrom,
      transferTo,
      BigInt(transferAmount),
    );
    setState(result.newState);
    setLastMessage(result.message);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Token Configuration</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tok-erc20-name">Name</Label>
              <Input
                id="tok-erc20-name"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tok-erc20-symbol">Symbol</Label>
              <Input
                id="tok-erc20-symbol"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tok-erc20-decimals">Decimals</Label>
              <Input
                id="tok-erc20-decimals"
                type="number"
                value={decimals}
                onChange={(e) => setDecimals(Number(e.target.value) || 0)}
                min={0}
                max={18}
              />
            </div>
          </div>
          <Button variant="secondary" onClick={handleCreate}>
            Create Token
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Mint</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tok-erc20-mintTo">To</Label>
              <Input
                id="tok-erc20-mintTo"
                value={mintTo}
                onChange={(e) => setMintTo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tok-erc20-mintAmount">Amount</Label>
              <Input
                id="tok-erc20-mintAmount"
                type="number"
                value={mintAmount}
                onChange={(e) => setMintAmount(Number(e.target.value) || 0)}
                min={1}
              />
            </div>
          </div>
          <Button variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800" onClick={handleMint}>
            Mint
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Burn</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tok-erc20-burnFrom">From</Label>
              <Input
                id="tok-erc20-burnFrom"
                value={burnFrom}
                onChange={(e) => setBurnFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tok-erc20-burnAmount">Amount</Label>
              <Input
                id="tok-erc20-burnAmount"
                type="number"
                value={burnAmount}
                onChange={(e) => setBurnAmount(Number(e.target.value) || 0)}
                min={1}
              />
            </div>
          </div>
          <Button variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800" onClick={handleBurn}>
            Burn
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Transfer</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tok-erc20-txFrom">From</Label>
              <Input
                id="tok-erc20-txFrom"
                value={transferFrom}
                onChange={(e) => setTransferFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tok-erc20-txTo">To</Label>
              <Input
                id="tok-erc20-txTo"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tok-erc20-txAmount">Amount</Label>
              <Input
                id="tok-erc20-txAmount"
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(Number(e.target.value) || 0)}
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
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Token State</p>
            <Badge variant="secondary">
              {state.name} ({state.symbol})
            </Badge>
          </div>
          <p className="text-sm">
            Total Supply:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{formatTokenAmount(state.totalSupply, state.decimals)}</code>
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addresses.map((addr) => (
                <TableRow key={addr}>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{addr}</code>
                  </TableCell>
                  <TableCell className="text-right">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                      {formatTokenAmount(
                        balanceOf(state, addr),
                        state.decimals,
                      )}
                    </code>
                  </TableCell>
                </TableRow>
              ))}
              {addresses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    <p className="text-sm text-muted-foreground">
                      No balances yet
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {addresses.length > 0 && (
            <SimplePieChart
              data={addresses.map((addr) => ({
                holder: addr,
                balance: Number(balanceOf(state, addr)),
              }))}
              nameKey="holder"
              valueKey="balance"
              height={250}
            />
          )}
        </div>
      </div>
    </div>
  );
}
