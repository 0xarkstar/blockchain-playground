"use client";

import { useState, useMemo, useRef } from "react";
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
import {
  buildMetadataJSON,
  buildTokenURI,
  type NFTMetadata,
} from "../../lib/tokens/erc721";

interface AttributeWithId {
  readonly id: number;
  readonly traitType: string;
  readonly value: string;
}

export function NFTMetadataDemo() {
  const nextId = useRef(3);
  const [name, setName] = useState("Cool NFT #1");
  const [description, setDescription] = useState("A very cool NFT");
  const [image, setImage] = useState("ipfs://QmExampleHash");
  const [externalUrl, setExternalUrl] = useState("");
  const [baseUri, setBaseUri] = useState("https://api.example.com/token/");
  const [tokenId, setTokenId] = useState("1");
  const [attributes, setAttributes] = useState<readonly AttributeWithId[]>([
    { id: 1, traitType: "Background", value: "Blue" },
    { id: 2, traitType: "Rarity", value: "Legendary" },
  ]);
  const [newTraitType, setNewTraitType] = useState("");
  const [newTraitValue, setNewTraitValue] = useState("");

  const metadata: NFTMetadata = useMemo(
    () => ({
      name,
      description,
      image,
      externalUrl: externalUrl || undefined,
      attributes: attributes.map((a) => ({
        trait_type: a.traitType,
        value: a.value,
      })),
    }),
    [name, description, image, externalUrl, attributes],
  );

  const json = useMemo(() => buildMetadataJSON(metadata), [metadata]);
  const uri = useMemo(
    () => buildTokenURI(Number(tokenId) || 0, baseUri),
    [tokenId, baseUri],
  );

  const addAttribute = () => {
    if (!newTraitType.trim()) return;
    setAttributes([
      ...attributes,
      { id: nextId.current++, traitType: newTraitType, value: newTraitValue },
    ]);
    setNewTraitType("");
    setNewTraitValue("");
  };

  const removeAttribute = (id: number) => {
    setAttributes(attributes.filter((a) => a.id !== id));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">NFT Metadata</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tok-meta-name">Name</Label>
              <Input
                id="tok-meta-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tok-meta-image">Image URI</Label>
              <Input
                id="tok-meta-image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="tok-meta-desc">Description</Label>
            <textarea
              id="tok-meta-desc"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="tok-meta-extUrl">External URL (optional)</Label>
            <Input
              id="tok-meta-extUrl"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Attributes</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trait Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attributes.map((attr) => (
                <TableRow key={attr.id}>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{attr.traitType}</code>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{attr.value}</code>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                      onClick={() => removeAttribute(attr.id)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              placeholder="Trait type"
              value={newTraitType}
              onChange={(e) => setNewTraitType(e.target.value)}
            />
            <Input
              placeholder="Value"
              value={newTraitValue}
              onChange={(e) => setNewTraitValue(e.target.value)}
            />
          </div>
          <Button variant="secondary" size="sm" onClick={addAttribute}>
            Add Attribute
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Token URI</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tok-meta-baseUri">Base URI</Label>
              <Input
                id="tok-meta-baseUri"
                value={baseUri}
                onChange={(e) => setBaseUri(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tok-meta-tokenId">Token ID</Label>
              <Input
                id="tok-meta-tokenId"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
              />
            </div>
          </div>
          <p className="text-sm">
            Full URI: <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{uri}</code>
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Metadata Tree</p>
          <div className="rounded-lg border border-border bg-muted/50 p-3">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-mono">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs mr-1">
                  object
                </Badge>
                metadata
              </p>
              <div className="rounded-lg border border-border p-2 ml-6">
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs font-mono">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs mr-1">
                      string
                    </Badge>
                    name: <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{metadata.name}</code>
                  </p>
                  <p className="text-xs font-mono">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs mr-1">
                      string
                    </Badge>
                    description:{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                      {metadata.description.slice(0, 40)}
                      {metadata.description.length > 40 ? "..." : ""}
                    </code>
                  </p>
                  <p className="text-xs font-mono">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs mr-1">
                      string
                    </Badge>
                    image: <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{metadata.image}</code>
                  </p>
                  {metadata.externalUrl && (
                    <p className="text-xs font-mono">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs mr-1">
                        string
                      </Badge>
                      external_url: <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{metadata.externalUrl}</code>
                    </p>
                  )}
                  <p className="text-xs font-mono">
                    <Badge variant="secondary" className="bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300 text-xs mr-1">
                      array[{metadata.attributes?.length ?? 0}]
                    </Badge>
                    attributes
                  </p>
                  {metadata.attributes && metadata.attributes.length > 0 && (
                    <div className="rounded-lg border border-border p-2 ml-6">
                      <div className="flex flex-col gap-0.5">
                        {metadata.attributes.map((attr, i) => (
                          <p key={i} className="text-xs font-mono">
                            <Badge
                              variant="outline"
                              className="text-violet-600 border-violet-300 dark:text-violet-400 dark:border-violet-600 text-xs mr-1"
                            >
                              {i}
                            </Badge>
                            {attr.trait_type}: <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{attr.value}</code>
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Generated JSON</p>
            <Badge variant="secondary">{new Blob([json]).size} bytes</Badge>
          </div>
          <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto font-mono" style={{ maxHeight: 300 }}>
            <code>{JSON.stringify(JSON.parse(json), null, 2)}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
