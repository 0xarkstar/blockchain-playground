"use client";

import { useState, useMemo } from "react";
import { useTheme } from "next-themes";
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
  createERC721,
  mintNFT,
  transferNFT,
  balanceOfNFT,
  tokensOfOwner,
  totalSupplyNFT,
  type ERC721State,
  type NFTMetadata,
} from "../../lib/tokens/erc721";

export function ERC721MinterDemo() {
  const { resolvedTheme } = useTheme();
  const [state, setState] = useState<ERC721State>(() =>
    createERC721("CryptoArt", "CART"),
  );
  const [mintTo, setMintTo] = useState("alice");
  const [nftName, setNftName] = useState("Art #1");
  const [nftDesc, setNftDesc] = useState("A digital artwork");
  const [nftImage, setNftImage] = useState("ipfs://QmExample");
  const [transferFromAddr, setTransferFromAddr] = useState("alice");
  const [transferToAddr, setTransferToAddr] = useState("bob");
  const [transferTokenId, setTransferTokenId] = useState("1");
  const [lastMessage, setLastMessage] = useState("");

  const owners = useMemo(() => {
    const addrs = new Set<string>();
    for (const owner of Object.values(state.owners)) {
      addrs.add(owner);
    }
    return Array.from(addrs);
  }, [state.owners]);

  const handleMint = () => {
    const meta: NFTMetadata = {
      name: nftName,
      description: nftDesc,
      image: nftImage,
      attributes: [],
    };
    const result = mintNFT(state, mintTo, meta);
    if (result.success) {
      setState(result.newState);
      setLastMessage(`Minted token #${result.tokenId} to ${mintTo}`);
    } else {
      setLastMessage(result.message ?? "Mint failed");
    }
  };

  const handleTransfer = () => {
    const tokenId = parseInt(transferTokenId, 10);
    if (isNaN(tokenId)) {
      setLastMessage("Invalid token ID");
      return;
    }
    const result = transferNFT(
      state,
      transferFromAddr,
      transferToAddr,
      tokenId,
    );
    setState(result.newState);
    setLastMessage(result.message);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Mint NFT</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>To</Label>
              <Input
                value={mintTo}
                onChange={(e) => setMintTo(e.target.value)}
              />
            </div>
            <div>
              <Label>Name</Label>
              <Input
                value={nftName}
                onChange={(e) => setNftName(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Description</Label>
              <Input
                value={nftDesc}
                onChange={(e) => setNftDesc(e.target.value)}
              />
            </div>
            <div>
              <Label>Image URI</Label>
              <Input
                value={nftImage}
                onChange={(e) => setNftImage(e.target.value)}
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
          <p className="text-sm font-semibold">Transfer NFT</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>From</Label>
              <Input
                value={transferFromAddr}
                onChange={(e) => setTransferFromAddr(e.target.value)}
              />
            </div>
            <div>
              <Label>To</Label>
              <Input
                value={transferToAddr}
                onChange={(e) => setTransferToAddr(e.target.value)}
              />
            </div>
            <div>
              <Label>Token ID</Label>
              <Input
                value={transferTokenId}
                onChange={(e) => setTransferTokenId(e.target.value)}
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

      {Object.keys(state.owners).length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">NFT Gallery</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Object.entries(state.owners).map(([id, owner]) => {
                const meta = state.metadata[Number(id)];
                const hue = (Number(id) * 67) % 360;
                return (
                  <div
                    key={id}
                    className="rounded-lg border border-border p-3"
                    style={{
                      background: `linear-gradient(135deg, hsl(${hue}, 60%, ${resolvedTheme === "dark" ? 35 : 85}%), hsl(${(hue + 40) % 360}, 50%, ${resolvedTheme === "dark" ? 45 : 75}%))`,
                    }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Badge>#{id}</Badge>
                      <p className="text-xs font-semibold text-center">
                        {meta?.name ?? `Token #${id}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {owner}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">
              Collection: {state.name} ({state.symbol})
            </p>
            <Badge variant="secondary">Total: {totalSupplyNFT(state)}</Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token ID</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(state.owners).map(([id, owner]) => (
                <TableRow key={id}>
                  <TableCell>
                    <Badge variant="secondary">#{id}</Badge>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{owner}</code>
                  </TableCell>
                  <TableCell>{state.metadata[Number(id)]?.name ?? "—"}</TableCell>
                </TableRow>
              ))}
              {Object.keys(state.owners).length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
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

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Balances by Owner</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead>Token IDs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {owners.map((addr) => (
                <TableRow key={addr}>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{addr}</code>
                  </TableCell>
                  <TableCell className="text-right">{balanceOfNFT(state, addr)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {tokensOfOwner(state, addr).map((id) => (
                        <Badge key={id} variant="outline" className="text-xs">
                          #{id}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
