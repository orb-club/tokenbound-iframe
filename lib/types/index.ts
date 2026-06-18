// Local type definitions replacing the alchemy-sdk types previously imported
// here (`Nft`, `OwnedNft`, `NftContract`). The Alchemy client (lib/clients/alchemy.ts)
// normalizes the v3 REST JSON onto these shapes, which mirror only the fields the
// call sites actually consume.

export interface NftMedia {
  gateway?: string;
  thumbnail?: string;
  raw?: string;
}

export interface OpenSeaCollectionMetadata {
  imageUrl?: string;
  [key: string]: any;
}

export interface NftContract {
  address: string;
  openSea?: OpenSeaCollectionMetadata;
  [key: string]: any;
}

export interface NftRawMetadata {
  image?: string;
  [key: string]: any;
}

export interface Nft {
  contract: NftContract;
  tokenId: string;
  title: string;
  media: NftMedia[];
  rawMetadata?: NftRawMetadata;
  [key: string]: any;
}

export type OwnedNft = Nft;

export interface NftMetadataBatchToken {
  contractAddress: string;
  tokenId: string;
  tokenType?: string;
}

export interface TokenBalance {
  contractAddress: string;
  tokenBalance: string | null;
}

export interface TokenBalancesResponse {
  address: string;
  tokenBalances: TokenBalance[];
}

export interface TokenMetadataResponse {
  decimals: number | null;
  logo: string | null;
  name: string | null;
  symbol: string | null;
}

export interface TbaOwnedNft extends OwnedNft {
  hasApprovals?: boolean | undefined;
  [key: string]: any;
}

export interface TokenInfo {
  collection: string | undefined;
  title: string | undefined;
  approvals?: boolean | undefined;
}

export interface NftApprovalStatus {
  contract: string | NftContract;
  hasApprovals?: boolean;
  tokenId: string;
}
