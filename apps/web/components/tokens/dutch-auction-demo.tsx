"use client";

import { useState, useMemo } from "react";
import { Info } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Progress } from "../ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "../ui/table";
import {
  createDutchAuction,
  getAuctionPriceInfo,
  settleDutchAuction,
  generatePriceCurve,
  type DutchAuctionState,
} from "../../lib/tokens/auction";
import { SimpleLineChart } from "../shared";

export function DutchAuctionDemo() {
  const [seller, setSeller] = useState("alice");
  const [tokenId, setTokenId] = useState(1);
  const [startPrice, setStartPrice] = useState(100);
  const [endPrice, setEndPrice] = useState(10);
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(100);
  const [currentTime, setCurrentTime] = useState(50);
  const [buyer, setBuyer] = useState("bob");
  const [lastMessage, setLastMessage] = useState("");

  const [state, setState] = useState<DutchAuctionState>(() =>
    createDutchAuction({
      seller: "alice",
      tokenId: 1,
      startPrice: 100,
      endPrice: 10,
      startTime: 0,
      duration: 100,
    }),
  );

  const priceInfo = useMemo(
    () => getAuctionPriceInfo(state.config, currentTime),
    [state.config, currentTime],
  );

  const curve = useMemo(
    () => generatePriceCurve(state.config, 10),
    [state.config],
  );

  const handleCreate = () => {
    setState(
      createDutchAuction({
        seller,
        tokenId,
        startPrice,
        endPrice,
        startTime,
        duration,
      }),
    );
    setLastMessage("Auction created");
  };

  const handleSettle = () => {
    const result = settleDutchAuction(state, buyer, currentTime);
    setState(result.newState);
    setLastMessage(result.message);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Auction Configuration</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Seller</Label>
              <Input
                value={seller}
                onChange={(e) => setSeller(e.target.value)}
              />
            </div>
            <div>
              <Label>Token ID</Label>
              <Input
                type="number"
                value={tokenId}
                onChange={(e) => setTokenId(Number(e.target.value) || 0)}
                min={1}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Start Price</Label>
              <Input
                type="number"
                value={startPrice}
                onChange={(e) => setStartPrice(Number(e.target.value) || 0)}
                min={1}
                step={0.0001}
              />
            </div>
            <div>
              <Label>End Price</Label>
              <Input
                type="number"
                value={endPrice}
                onChange={(e) => setEndPrice(Number(e.target.value) || 0)}
                min={0}
                step={0.0001}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Start Time</Label>
              <Input
                type="number"
                value={startTime}
                onChange={(e) => setStartTime(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Duration</Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value) || 0)}
                min={1}
              />
            </div>
          </div>
          <Button variant="secondary" onClick={handleCreate}>
            Create Auction
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Bid</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Current Time</Label>
              <Input
                type="number"
                value={currentTime}
                onChange={(e) => setCurrentTime(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Buyer</Label>
              <Input
                value={buyer}
                onChange={(e) => setBuyer(e.target.value)}
              />
            </div>
          </div>
          <Button
            variant="secondary"
            className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
            onClick={handleSettle}
            disabled={state.settled}
          >
            {state.settled ? "Auction Settled" : "Buy Now"}
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
            <p className="text-sm font-semibold">Current Status</p>
            <Badge
              variant="secondary"
              className={
                state.settled
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : priceInfo.isActive
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
              }
            >
              {state.settled
                ? "Settled"
                : priceInfo.isActive
                  ? "Active"
                  : priceInfo.hasEnded
                    ? "Ended"
                    : "Not Started"}
            </Badge>
          </div>
          <Progress value={priceInfo.percentDecayed} className="h-3" />
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Current Price</TableCell>
                <TableCell className="text-right">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{priceInfo.currentPrice.toFixed(4)} ETH</code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Price Decay</TableCell>
                <TableCell className="text-right">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{priceInfo.percentDecayed.toFixed(1)}%</code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Time Elapsed</TableCell>
                <TableCell className="text-right">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{priceInfo.timeElapsed}</code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Time Remaining</TableCell>
                <TableCell className="text-right">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{priceInfo.timeRemaining}</code>
                </TableCell>
              </TableRow>
              {state.settled && (
                <>
                  <TableRow>
                    <TableCell>Winner</TableCell>
                    <TableCell className="text-right">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{state.winner}</code>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Settled Price</TableCell>
                    <TableCell className="text-right">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{state.settledPrice?.toFixed(4)} ETH</code>
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Price Curve</p>
          <SimpleLineChart
            data={curve.map((point) => ({
              time: Number(point.time.toFixed(0)),
              price: Number(point.price.toFixed(4)),
            }))}
            xKey="time"
            yKeys={["price"]}
            colors={["#fa5252"]}
            height={280}
          />
        </div>
      </div>
    </div>
  );
}
