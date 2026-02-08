import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia, hardhat } from "wagmi/chains";

let _config: ReturnType<typeof getDefaultConfig> | null = null;

export function getWagmiConfig() {
  if (!_config) {
    _config = getDefaultConfig({
      appName: "Blockchain Playground",
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo",
      chains: [baseSepolia, hardhat],
      ssr: true,
    });
  }
  return _config;
}
