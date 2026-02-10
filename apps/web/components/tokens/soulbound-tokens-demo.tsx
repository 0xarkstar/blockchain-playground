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
  createERC721,
  mintNFT,
  transferNFT,
  balanceOfNFT,
  tokensOfOwner,
  totalSupplyNFT,
  type ERC721State,
  type NFTMetadata,
} from "../../lib/tokens/erc721";

export function SoulboundTokensDemo() {
  const [state, setState] = useState<ERC721State>(() =>
    createERC721("SoulboundID", "SBT", true),
  );
  const [mintTo, setMintTo] = useState("alice");
  const [credentialType, setCredentialType] = useState("Degree");
  const [issuer, setIssuer] = useState("University of Blockchain");
  const [transferFrom, setTransferFrom] = useState("alice");
  const [transferTo, setTransferTo] = useState("bob");
  const [transferTokenId, setTransferTokenId] = useState("1");
  const [lastMessage, setLastMessage] = useState(
    "Soulbound collection created — tokens cannot be transferred",
  );

  const owners = useMemo(() => {
    return Array.from(new Set(Object.values(state.owners)));
  }, [state.owners]);

  const handleMint = () => {
    const meta: NFTMetadata = {
      name: `${credentialType} - ${mintTo}`,
      description: `Issued by ${issuer}`,
      image: "ipfs://soulbound",
      attributes: [
        { trait_type: "Type", value: credentialType },
        { trait_type: "Issuer", value: issuer },
        { trait_type: "Issued To", value: mintTo },
      ],
    };
    const result = mintNFT(state, mintTo, meta);
    if (result.success) {
      setState(result.newState);
      setLastMessage(
        `Minted SBT #${result.tokenId} to ${mintTo}: ${credentialType}`,
      );
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
    const result = transferNFT(state, transferFrom, transferTo, tokenId);
    setState(result.newState);
    setLastMessage(result.message);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Issue SBT Credential</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tok-sbt-recipient">Recipient</Label>
              <Input
                id="tok-sbt-recipient"
                value={mintTo}
                onChange={(e) => setMintTo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tok-sbt-credType">Credential Type</Label>
              <Input
                id="tok-sbt-credType"
                value={credentialType}
                onChange={(e) => setCredentialType(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tok-sbt-issuer">Issuer</Label>
              <Input
                id="tok-sbt-issuer"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
              />
            </div>
          </div>
          <Button variant="secondary" className="bg-violet-100 text-violet-800 hover:bg-violet-200 dark:bg-violet-900 dark:text-violet-300 dark:hover:bg-violet-800" onClick={handleMint}>
            Issue SBT
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Try Transfer (should fail)</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tok-sbt-txFrom">From</Label>
              <Input
                id="tok-sbt-txFrom"
                value={transferFrom}
                onChange={(e) => setTransferFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tok-sbt-txTo">To</Label>
              <Input
                id="tok-sbt-txTo"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tok-sbt-txTokenId">Token ID</Label>
              <Input
                id="tok-sbt-txTokenId"
                value={transferTokenId}
                onChange={(e) => setTransferTokenId(e.target.value)}
              />
            </div>
          </div>
          <Button variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800" onClick={handleTransfer}>
            Attempt Transfer
          </Button>
        </div>
      </div>

      {lastMessage && (
        <Alert variant={lastMessage.includes("Soulbound") ? "destructive" : "default"}>
          <Info className="h-4 w-4" />
          <AlertDescription>{lastMessage}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">
              {state.name} ({state.symbol})
            </p>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300">
                Soulbound
              </Badge>
              <Badge variant="secondary">Total: {totalSupplyNFT(state)}</Badge>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token ID</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Credential</TableHead>
                <TableHead>Issuer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(state.owners).map(([id, owner]) => {
                const meta = state.metadata[Number(id)];
                const issuerAttr = meta?.attributes?.find(
                  (a) => a.trait_type === "Issuer",
                );
                const typeAttr = meta?.attributes?.find(
                  (a) => a.trait_type === "Type",
                );
                return (
                  <TableRow key={id}>
                    <TableCell>
                      <Badge variant="secondary" className="bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300">
                        #{id}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{owner}</code>
                    </TableCell>
                    <TableCell>{typeAttr?.value ?? "—"}</TableCell>
                    <TableCell>{issuerAttr?.value ?? "—"}</TableCell>
                  </TableRow>
                );
              })}
              {Object.keys(state.owners).length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    <p className="text-sm text-muted-foreground">
                      No SBTs issued
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
          <p className="text-sm font-semibold">SBT Holders</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">SBT Count</TableHead>
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
                        <Badge
                          key={id}
                          variant="outline"
                          className="text-xs text-violet-600 border-violet-300 dark:text-violet-400 dark:border-violet-600"
                        >
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

      {owners.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">SBT Binding Diagram</p>
            <svg
              width="100%"
              height={Math.max(120, owners.length * 90)}
              viewBox={`0 0 480 ${Math.max(120, owners.length * 90)}`}
            >
              {owners.map((addr, i) => {
                const y = 45 + i * 90;
                const tokens = Object.entries(state.owners)
                  .filter(([, o]) => o === addr)
                  .map(([id]) => id);
                return (
                  <g key={addr}>
                    <rect
                      x={20}
                      y={y - 22}
                      width={130}
                      height={44}
                      rx={8}
                      className="fill-blue-100 stroke-blue-500 dark:fill-blue-900 dark:stroke-blue-400"
                      strokeWidth={1.5}
                    />
                    <text
                      x={85}
                      y={y + 5}
                      textAnchor="middle"
                      fontSize={13}
                      className="fill-blue-800 dark:fill-blue-200"
                    >
                      {addr}
                    </text>
                    {tokens.map((tId, ti) => {
                      const tx = 250 + ti * 70;
                      return (
                        <g key={tId}>
                          <line
                            x1={150}
                            y1={y}
                            x2={tx - 20}
                            y2={y}
                            className="stroke-violet-400 dark:stroke-violet-500"
                            strokeWidth={2}
                            strokeDasharray="6 3"
                          />
                          <rect
                            x={tx - 20}
                            y={y - 18}
                            width={56}
                            height={36}
                            rx={6}
                            className="fill-violet-100 stroke-violet-500 dark:fill-violet-900 dark:stroke-violet-400"
                            strokeWidth={1.5}
                          />
                          <text
                            x={tx + 8}
                            y={y - 3}
                            textAnchor="middle"
                            fontSize={10}
                            className="fill-violet-700 dark:fill-violet-300"
                          >
                            SBT
                          </text>
                          <text
                            x={tx + 8}
                            y={y + 12}
                            textAnchor="middle"
                            fontSize={12}
                            fontWeight={700}
                            className="fill-violet-800 dark:fill-violet-200"
                          >
                            #{tId}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">About Soulbound Tokens</p>
          <p className="text-sm text-muted-foreground">
            Soulbound tokens (SBTs) are non-transferable NFTs proposed by
            Vitalik Buterin. They represent commitments, credentials, and
            affiliations — things that make up a person&apos;s identity in Web3.
            Unlike regular NFTs, SBTs cannot be sold or transferred, making them
            ideal for degrees, certifications, proof of attendance, and
            reputation scores.
          </p>
        </div>
      </div>
    </div>
  );
}
