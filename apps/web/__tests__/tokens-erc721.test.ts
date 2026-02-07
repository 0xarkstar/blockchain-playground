import { describe, it, expect } from "vitest";
import {
  createERC721, mintNFT, transferNFT, approveNFT,
  ownerOf, balanceOfNFT, tokensOfOwner, totalSupplyNFT,
  buildMetadataJSON, buildTokenURI,
} from "../lib/tokens/erc721";

const sampleMeta = { name: "Art #1", description: "A piece", image: "ipfs://abc", attributes: [] };

describe("createERC721", () => {
  it("creates collection with correct initial state", () => {
    const state = createERC721("MyNFT", "MNFT");
    expect(state.name).toBe("MyNFT");
    expect(state.symbol).toBe("MNFT");
    expect(state.nextTokenId).toBe(1);
    expect(state.soulbound).toBe(false);
  });

  it("creates soulbound collection", () => {
    const state = createERC721("SBT", "SBT", true);
    expect(state.soulbound).toBe(true);
  });
});

describe("mintNFT", () => {
  it("mints token with incrementing ID", () => {
    const state = createERC721("N", "N");
    const r1 = mintNFT(state, "alice", sampleMeta);
    expect(r1.success).toBe(true);
    expect(r1.tokenId).toBe(1);
    expect(ownerOf(r1.newState, 1)).toBe("alice");

    const r2 = mintNFT(r1.newState, "bob", sampleMeta);
    expect(r2.tokenId).toBe(2);
    expect(ownerOf(r2.newState, 2)).toBe("bob");
  });

  it("rejects empty recipient", () => {
    const state = createERC721("N", "N");
    expect(mintNFT(state, "", sampleMeta).success).toBe(false);
  });
});

describe("transferNFT", () => {
  it("transfers ownership", () => {
    let state = createERC721("N", "N");
    state = mintNFT(state, "alice", sampleMeta).newState;
    const result = transferNFT(state, "alice", "bob", 1);
    expect(result.success).toBe(true);
    expect(ownerOf(result.newState, 1)).toBe("bob");
  });

  it("rejects transfer of non-existent token", () => {
    const state = createERC721("N", "N");
    expect(transferNFT(state, "alice", "bob", 99).success).toBe(false);
  });

  it("rejects transfer by non-owner", () => {
    let state = createERC721("N", "N");
    state = mintNFT(state, "alice", sampleMeta).newState;
    expect(transferNFT(state, "bob", "charlie", 1).success).toBe(false);
  });

  it("blocks soulbound transfers", () => {
    let state = createERC721("SBT", "SBT", true);
    state = mintNFT(state, "alice", sampleMeta).newState;
    expect(transferNFT(state, "alice", "bob", 1).success).toBe(false);
    expect(transferNFT(state, "alice", "bob", 1).message).toContain("Soulbound");
  });

  it("clears approval on transfer", () => {
    let state = createERC721("N", "N");
    state = mintNFT(state, "alice", sampleMeta).newState;
    state = approveNFT(state, "alice", "spender", 1).newState;
    state = transferNFT(state, "alice", "bob", 1).newState;
    expect(state.approvals[1]).toBeUndefined();
  });
});

describe("balanceOfNFT and tokensOfOwner", () => {
  it("counts tokens per owner", () => {
    let state = createERC721("N", "N");
    state = mintNFT(state, "alice", sampleMeta).newState;
    state = mintNFT(state, "alice", sampleMeta).newState;
    state = mintNFT(state, "bob", sampleMeta).newState;
    expect(balanceOfNFT(state, "alice")).toBe(2);
    expect(balanceOfNFT(state, "bob")).toBe(1);
    expect(tokensOfOwner(state, "alice")).toEqual([1, 2]);
  });
});

describe("totalSupplyNFT", () => {
  it("counts total minted", () => {
    let state = createERC721("N", "N");
    state = mintNFT(state, "alice", sampleMeta).newState;
    state = mintNFT(state, "bob", sampleMeta).newState;
    expect(totalSupplyNFT(state)).toBe(2);
  });
});

describe("metadata utilities", () => {
  it("builds valid JSON", () => {
    const json = buildMetadataJSON(sampleMeta);
    expect(JSON.parse(json).name).toBe("Art #1");
  });

  it("builds token URI", () => {
    expect(buildTokenURI(42, "https://api.example.com/token/")).toBe("https://api.example.com/token/42");
  });
});
