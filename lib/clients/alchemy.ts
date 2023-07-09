import { Alchemy, Network } from "alchemy-sdk";

const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY_POLYGON,
  network:
    process.env.NEXT_PUBLIC_CHAIN_ID === "137" ? Network.MATIC_MAINNET : Network.MATIC_TESTNET,
};

export const alchemy = new Alchemy(config);

const configLens = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY_POLYGON,
  network: Network.MATIC_MAINNET,
};

export const alchemyLens = new Alchemy(configLens);
