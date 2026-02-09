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
  createMarketplace,
  listNFT,
  cancelListing,
  buyNFT,
  calculatePriceBreakdown,
  getActiveListings,
  type MarketplaceState,
} from "../../lib/tokens/marketplace";
import { SimpleLineChart } from "../shared";

export function NFTMarketplaceDemo() {
  const [state, setState] = useState<MarketplaceState>(() =>
    createMarketplace(2.5),
  );
  const [listSeller, setListSeller] = useState("alice");
  const [listTokenId, setListTokenId] = useState(1);
  const [listPrice, setListPrice] = useState(10);
  const [listRoyalty, setListRoyalty] = useState(5);
  const [buyBuyer, setBuyBuyer] = useState("bob");
  const [buyListingId, setBuyListingId] = useState(1);
  const [cancelId, setCancelId] = useState(1);
  const [cancelCaller, setCancelCaller] = useState("alice");
  const [lastMessage, setLastMessage] = useState("");

  const activeListings = useMemo(() => getActiveListings(state), [state]);

  const handleList = () => {
    const result = listNFT(
      state,
      listSeller,
      listTokenId,
      listPrice,
      listRoyalty,
    );
    setState(result.newState);
    setLastMessage(result.message);
  };

  const handleBuy = () => {
    const result = buyNFT(state, buyListingId, buyBuyer);
    setState(result.newState);
    setLastMessage(result.message);
  };

  const handleCancel = () => {
    const result = cancelListing(state, cancelId, cancelCaller);
    setState(result.newState);
    setLastMessage(result.message);
  };

  const previewBreakdown = useMemo(
    () =>
      calculatePriceBreakdown(listPrice, listRoyalty, state.platformFeePercent),
    [listPrice, listRoyalty, state.platformFeePercent],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">List NFT</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Seller</Label>
              <Input
                value={listSeller}
                onChange={(e) => setListSeller(e.target.value)}
              />
            </div>
            <div>
              <Label>Token ID</Label>
              <Input
                type="number"
                value={listTokenId}
                onChange={(e) => setListTokenId(Number(e.target.value) || 0)}
                min={1}
              />
            </div>
            <div>
              <Label>Price (ETH)</Label>
              <Input
                type="number"
                value={listPrice}
                onChange={(e) => setListPrice(Number(e.target.value) || 0)}
                min={0.01}
                step={0.0001}
              />
            </div>
            <div>
              <Label>Royalty %</Label>
              <Input
                type="number"
                value={listRoyalty}
                onChange={(e) => setListRoyalty(Number(e.target.value) || 0)}
                min={0}
                max={50}
              />
            </div>
          </div>
          <Button variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800" onClick={handleList}>
            List
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Price Breakdown Preview</p>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Sale Price</TableCell>
                <TableCell className="text-right">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{previewBreakdown.price.toFixed(4)} ETH</code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  Royalty ({previewBreakdown.royaltyPercent}%)
                </TableCell>
                <TableCell className="text-right">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{previewBreakdown.royaltyAmount.toFixed(4)} ETH</code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  Platform Fee ({previewBreakdown.platformFeePercent}%)
                </TableCell>
                <TableCell className="text-right">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{previewBreakdown.platformFee.toFixed(4)} ETH</code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Seller Receives</TableCell>
                <TableCell className="text-right">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono font-semibold">
                    {previewBreakdown.sellerProceeds.toFixed(4)} ETH
                  </code>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Buy / Cancel</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Buyer</Label>
              <Input
                value={buyBuyer}
                onChange={(e) => setBuyBuyer(e.target.value)}
              />
            </div>
            <div>
              <Label>Listing ID</Label>
              <Input
                type="number"
                value={buyListingId}
                onChange={(e) => setBuyListingId(Number(e.target.value) || 0)}
                min={1}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800" onClick={handleBuy}>
              Buy
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Caller</Label>
              <Input
                value={cancelCaller}
                onChange={(e) => setCancelCaller(e.target.value)}
              />
            </div>
            <div>
              <Label>Listing ID</Label>
              <Input
                type="number"
                value={cancelId}
                onChange={(e) => setCancelId(Number(e.target.value) || 0)}
                min={1}
              />
            </div>
          </div>
          <Button variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800" onClick={handleCancel}>
            Cancel
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
            <p className="text-sm font-semibold">Active Listings</p>
            <Badge variant="secondary">{activeListings.length} active</Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Token</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Royalty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeListings.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <Badge variant="secondary">#{l.id}</Badge>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{l.seller}</code>
                  </TableCell>
                  <TableCell>#{l.tokenId}</TableCell>
                  <TableCell className="text-right">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{l.price} ETH</code>
                  </TableCell>
                  <TableCell className="text-right">{l.royaltyPercent}%</TableCell>
                </TableRow>
              ))}
              {activeListings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    <p className="text-sm text-muted-foreground">
                      No active listings
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {state.sales.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">Sales History</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Seller Got</TableHead>
                  <TableHead className="text-right">Royalty</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.sales.map((s) => (
                  <TableRow key={s.listingId}>
                    <TableCell>#{s.listingId}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{s.buyer}</code>
                    </TableCell>
                    <TableCell className="text-right">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{s.price.toFixed(4)}</code>
                    </TableCell>
                    <TableCell className="text-right">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{s.sellerProceeds.toFixed(4)}</code>
                    </TableCell>
                    <TableCell className="text-right">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{s.royaltyAmount.toFixed(4)}</code>
                    </TableCell>
                    <TableCell className="text-right">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{s.platformFee.toFixed(4)}</code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {state.sales.length > 1 && (
              <SimpleLineChart
                data={state.sales.map((s, i) => ({
                  trade: `Trade ${i + 1}`,
                  price: Number(s.price.toFixed(4)),
                }))}
                xKey="trade"
                yKeys={["price"]}
                height={220}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
