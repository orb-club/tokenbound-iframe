# Tokenbound iframe

This repository is Orb's fork of [tokenbound/iframe](https://github.com/tokenbound/iframe).

The app is a Next.js pages-router page.
The package name is `iframe`.
The route is one NFT: `/{contractAddress}/{tokenId}`.
The page file is `pages/[contractAddress]/[tokenId].js`.
This tree has no `app/` directory.
The page resolves that NFT's tokenbound account.
The response image shows a Lens profile and NFTs from that account.

Contract reads use viem.
The declared viem range is `^1.0.7`.
NFT reads use native `fetch` against the Alchemy HTTP API.
`lib/clients/alchemy.ts` calls Polygon mainnet NFT v3 and JSON-RPC v2.
The dependency list has no `alchemy-sdk` package.
The dependency list has no `ethers` package.

## Setup

Copy `.env.example` to `.env.local`.

```bash
cp .env.example .env.local
```

This repo contains `package-lock.json` and `pnpm-lock.yaml`.

```bash
npm install
```

```bash
pnpm install
```

`.env.example` defines these variables.

`NEXT_PUBLIC_ALCHEMY_KEY_POLYGON` is the Alchemy API key.
`lib/clients/alchemy.ts` sends that key to Polygon mainnet.
`NEXT_PUBLIC_PROVIDER_ENDPOINT` is the HTTP RPC URL for `rpcClient`.
`NEXT_PUBLIC_CHAIN_ID` is the chain id argument for the tokenbound `account` call.
The example value is `137`.
`NEXT_PUBLIC_TOKENBOUND_ADDRESS` is the tokenbound registry address.
`NEXT_PUBLIC_IMPLEMENTATION_ADDRESS` is the account implementation address.
`NEXT_PUBLIC_SALT` is the salt for the account address.
The example value is `0`.
`NEXT_PUBLIC_MAX_TOKEN_ID` is the upper bound for `getNftAsset`.
The example value is `15000`.
`NEXT_PUBLIC_BASE_URL` is the origin for the generated image.
The example value is the placeholder `forImageApi`.

`lib/clients/viem.ts` builds `rpcClient` on the Goerli chain.
Goerli is a retired testnet.
`rpcClient` stays on Goerli when `NEXT_PUBLIC_CHAIN_ID` is `137`.
The page reads the tokenbound account with `rpcClient`.
`publicClient` uses mainnet only when `NEXT_PUBLIC_CHAIN_ID` is `1`.
Any other chain id selects Goerli for `publicClient`.
The page does not call `publicClient`.

`next.config.js` allows `next/image` from `localhost` only.

## Run

Start the dev server.

```bash
npm run dev
```

`package.json` also defines `build`, `start`, and `lint`.

Open `http://localhost:3000/{contractAddress}/{tokenId}`.

## Page data

The page derives the tokenbound account with `getAccount`.
It loads NFTs owned by that account through Alchemy.
It keeps Lens NFTs from contract `0xdb46d1dc155634fbc732f92e853b10b288ad5a1d`.
It loads the token image with Alchemy `getNFTMetadata`.
The image route does not draw that token image.
It rejects token ids above `NEXT_PUBLIC_MAX_TOKEN_ID`.
It reads the token owner through `rpcClient`.
`pages/api/getProfileIdFromRegistry.js` scans registry logs for a Lens profile id.
That file uses fixed addresses.
Its registry address matches `NEXT_PUBLIC_TOKENBOUND_ADDRESS` in `.env.example`.
Its Lens token contract is `0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d`.
The page loads that profile from `https://api.lens.dev/`.
It requests `{NEXT_PUBLIC_BASE_URL}/api/{contractAddress}/{tokenId}`.
`pages/api/[contractAddress]/[tokenId].tsx` draws the profile and up to 12 account NFTs.

The page does not import `lib/hooks/`.
The page does not read `NEXT_PUBLIC_NFT_ENDPOINT`.
`useGetApprovals` still reads `NEXT_PUBLIC_NXYZ_API_KEY` and `NEXT_PUBLIC_NXYZ_ENDPOINT`.
Those two names are absent from `.env.example`.
