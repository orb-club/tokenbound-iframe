// Alchemy REST / JSON-RPC client built on native fetch (replaces alchemy-sdk).
//
// The previous implementation used the alchemy-sdk `Alchemy`/`Network` helpers.
// We derive the base URLs from the existing network + API key and expose a small
// surface that mirrors only the alchemy-sdk methods this codebase consumed,
// returning the exact response shapes the call sites already read.

import type { Nft, NftMetadataBatchToken, OwnedNft, TokenBalancesResponse, TokenMetadataResponse } from "@/lib/types";

const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY_POLYGON;

// alchemy-sdk Network.MATIC_MAINNET maps to the polygon-mainnet subdomain.
const NETWORK = "polygon-mainnet";

const NFT_BASE_URL = `https://${NETWORK}.g.alchemy.com/nft/v3/${ALCHEMY_KEY}`;
const RPC_URL = `https://${NETWORK}.g.alchemy.com/v2/${ALCHEMY_KEY}`;

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const response = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({ id: 1, jsonrpc: "2.0", method, params }),
  });
  const json = await response.json();
  return json.result as T;
}

// Map a v3 NFT JSON object onto the v2 field shape the call sites consume
// (`.title`, `.media[]`, `.rawMetadata`, `.contract.openSea`).
function mapV3Nft(nft: any): Nft {
  const image = nft?.image ?? {};
  const openSeaMetadata = nft?.contract?.openSeaMetadata ?? undefined;
  return {
    ...nft,
    contract: {
      ...nft?.contract,
      openSea: openSeaMetadata,
    },
    tokenId: nft?.tokenId,
    title: nft?.name ?? "",
    media: [
      {
        gateway: image.cachedUrl ?? undefined,
        thumbnail: image.thumbnailUrl ?? undefined,
        raw: image.originalUrl ?? undefined,
      },
    ],
    rawMetadata: nft?.raw?.metadata ?? {},
  };
}

export const alchemy = {
  nft: {
    async getNftsForOwner(
      owner: string,
      options?: { orderBy?: string }
    ): Promise<{ ownedNfts: OwnedNft[]; totalCount: number; pageKey?: string }> {
      const params = new URLSearchParams({ owner, withMetadata: "true" });
      if (options?.orderBy) params.set("orderBy", options.orderBy);
      const response = await fetch(`${NFT_BASE_URL}/getNFTsForOwner?${params.toString()}`, {
        headers: { accept: "application/json" },
      });
      const json = await response.json();
      const ownedNfts = (json.ownedNfts ?? []).map(mapV3Nft) as OwnedNft[];
      return { ownedNfts, totalCount: json.totalCount, pageKey: json.pageKey };
    },

    async getNftMetadata(contractAddress: string, tokenId: string | number): Promise<Nft> {
      const params = new URLSearchParams({
        contractAddress,
        tokenId: String(tokenId),
        refreshCache: "false",
      });
      const response = await fetch(`${NFT_BASE_URL}/getNFTMetadata?${params.toString()}`, {
        headers: { accept: "application/json" },
      });
      const json = await response.json();
      return mapV3Nft(json);
    },

    async getNftMetadataBatch(tokens: NftMetadataBatchToken[]): Promise<Nft[]> {
      const response = await fetch(`${NFT_BASE_URL}/getNFTMetadataBatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({ tokens }),
      });
      const json = await response.json();
      return (json.nfts ?? []).map(mapV3Nft);
    },
  },

  core: {
    async getTokenBalances(address: string): Promise<TokenBalancesResponse> {
      const result = await rpc<TokenBalancesResponse>("alchemy_getTokenBalances", [address]);
      return result;
    },

    async getTokenMetadata(contractAddress: string): Promise<TokenMetadataResponse> {
      const result = await rpc<TokenMetadataResponse>("alchemy_getTokenMetadata", [contractAddress]);
      return result;
    },
  },
};

// The Lens client previously used the same network/key config as the default
// client, so it is identical here.
export const alchemyLens = alchemy;
