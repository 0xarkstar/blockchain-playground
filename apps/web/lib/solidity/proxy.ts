export type ProxyType = "transparent" | "uups" | "diamond";

export interface ProxyInfo {
  readonly type: ProxyType;
  readonly name: string;
  readonly description: string;
  readonly pros: readonly string[];
  readonly cons: readonly string[];
  readonly eipSlots: {
    readonly implementation: string;
    readonly admin?: string;
    readonly beacon?: string;
  };
}

export interface ProxyState {
  readonly type: ProxyType;
  readonly admin: string;
  readonly implementation: string;
  readonly previousImplementations: readonly string[];
  readonly storageSlots: Record<string, string>;
}

export interface UpgradeResult {
  readonly success: boolean;
  readonly state: ProxyState;
  readonly message: string;
  readonly revertReason?: string;
}

export interface DelegatecallStep {
  readonly step: number;
  readonly from: string;
  readonly to: string;
  readonly description: string;
  readonly context: string;
}

export interface DelegatecallVisualization {
  readonly steps: readonly DelegatecallStep[];
  readonly storageOwner: string;
  readonly codeSource: string;
  readonly msgSender: string;
}

// EIP-1967 storage slots (keccak256 hashes - 1)
const EIP_1967_IMPLEMENTATION =
  "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
const EIP_1967_ADMIN =
  "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";
const EIP_1967_BEACON =
  "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50";

const PROXY_INFO: Record<ProxyType, ProxyInfo> = {
  transparent: {
    type: "transparent",
    name: "Transparent Proxy (EIP-1967)",
    description:
      "Admin can upgrade, users interact directly. Proxy checks if caller is admin; if so, handles upgrades, otherwise delegates to implementation.",
    pros: [
      "Simple mental model — admin upgrades, users delegate",
      "No function selector clashes between proxy and implementation",
      "Well-tested, widely used (OpenZeppelin)",
    ],
    cons: [
      "Extra gas for admin check on every call",
      "Admin cannot interact with implementation functions",
      "Requires separate ProxyAdmin contract in modern versions",
    ],
    eipSlots: {
      implementation: EIP_1967_IMPLEMENTATION,
      admin: EIP_1967_ADMIN,
    },
  },
  uups: {
    type: "uups",
    name: "UUPS Proxy (EIP-1822)",
    description:
      "Upgrade logic lives in the implementation contract itself. The proxy is minimal — just a delegatecall forwarder. Cheaper to deploy.",
    pros: [
      "Cheaper deployment (minimal proxy, no admin logic)",
      "No admin check overhead on each call",
      "More flexible upgrade authorization",
    ],
    cons: [
      "Risk: if implementation omits upgradeTo, proxy becomes immutable",
      "Implementation must inherit upgrade logic",
      "Slightly more complex implementation contract",
    ],
    eipSlots: {
      implementation: EIP_1967_IMPLEMENTATION,
    },
  },
  diamond: {
    type: "diamond",
    name: "Diamond Proxy (EIP-2535)",
    description:
      "Multi-facet proxy that routes function calls to different implementation contracts (facets) based on function selectors.",
    pros: [
      "Unlimited contract size (split across facets)",
      "Granular upgrades — update individual facets",
      "Shared storage across all facets",
    ],
    cons: [
      "Higher complexity and gas for selector routing",
      "Careful storage management needed across facets",
      "More complex tooling and testing",
    ],
    eipSlots: {
      implementation: EIP_1967_IMPLEMENTATION,
    },
  },
};

export function getProxyInfo(type: ProxyType): ProxyInfo {
  return PROXY_INFO[type];
}

export function createProxyState(type: ProxyType, admin: string): ProxyState {
  return {
    type,
    admin: admin.toLowerCase(),
    implementation: "0x0000000000000000000000000000000000000000",
    previousImplementations: [],
    storageSlots: {},
  };
}

export function simulateUpgrade(
  state: ProxyState,
  newImplementation: string,
  caller: string,
): UpgradeResult {
  const normalizedCaller = caller.toLowerCase();
  const normalizedImpl = newImplementation.toLowerCase();

  if (state.type === "transparent" && normalizedCaller !== state.admin) {
    return {
      success: false,
      state,
      message: "Only admin can upgrade transparent proxy",
      revertReason: "TransparentUpgradeableProxy: admin only",
    };
  }

  if (state.type === "uups") {
    // In UUPS, the implementation itself controls upgrades
    // Simplified: we check that caller is admin
    if (normalizedCaller !== state.admin) {
      return {
        success: false,
        state,
        message: "Unauthorized: caller is not authorized to upgrade",
        revertReason: "UUPSUpgradeable: unauthorized",
      };
    }
  }

  if (state.type === "diamond" && normalizedCaller !== state.admin) {
    return {
      success: false,
      state,
      message: "Only diamond owner can cut facets",
      revertReason: "LibDiamond: Must be contract owner",
    };
  }

  const previousImpls =
    state.implementation !== "0x0000000000000000000000000000000000000000"
      ? [...state.previousImplementations, state.implementation]
      : [...state.previousImplementations];

  return {
    success: true,
    state: {
      ...state,
      implementation: normalizedImpl,
      previousImplementations: previousImpls,
    },
    message: `Upgraded implementation to ${normalizedImpl}`,
  };
}

export function visualizeDelegatecall(
  caller: string,
  proxy: string,
  implementation: string,
): DelegatecallVisualization {
  return {
    steps: [
      {
        step: 1,
        from: caller,
        to: proxy,
        description: "User sends transaction to proxy address",
        context: `msg.sender = ${caller}`,
      },
      {
        step: 2,
        from: proxy,
        to: proxy,
        description:
          "Proxy fallback() triggered — no matching function selector",
        context: "Proxy reads implementation address from EIP-1967 slot",
      },
      {
        step: 3,
        from: proxy,
        to: implementation,
        description: "DELEGATECALL to implementation contract",
        context: `Code from ${implementation}, storage of ${proxy}, msg.sender = ${caller}`,
      },
      {
        step: 4,
        from: implementation,
        to: proxy,
        description: "Return data forwarded back through proxy",
        context: "State changes written to proxy's storage",
      },
    ],
    storageOwner: proxy,
    codeSource: implementation,
    msgSender: caller,
  };
}

export function getEIP1967Slots(): {
  readonly implementation: string;
  readonly admin: string;
  readonly beacon: string;
} {
  return {
    implementation: EIP_1967_IMPLEMENTATION,
    admin: EIP_1967_ADMIN,
    beacon: EIP_1967_BEACON,
  };
}
