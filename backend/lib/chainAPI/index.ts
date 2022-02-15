// Adapted from https://github.com/greg-schrammel/address-tracker

// Moralis API Interaction
import * as moralis from "./moralis";
// Covalent API Interaction
import * as covalent from "./covalent";
// Etherscan API Interaction
// import * as etherscan from "./etherscan";
// Direct contract interaction
import * as contracts from "./contracts";

import { ChainId } from "../../constants";
export class BalancesAPIError extends Error {
  constructor(message) {
    super(message);
    this.name = "BalancesAPIError";
  }
}

export type Token = {
  contractAddress: string;
  symbol: string;
  balance: number;
};

type ChainConfig = {
  fullName: string;
  tokensBalances: ({ address, tokenAddresses }) => Promise<Token[]>;
  tokensOwned: ({ address, tokenAddresses, minThreshold }) => Promise<string[]>;
  currentIndex: () => Promise<number> | null;
};

export const Chain: { [chainId in ChainId]?: ChainConfig } = {
  [ChainId.Ethereum]: {
    fullName: "Ethereum",
    tokensBalances: ({ address, tokenAddresses }) =>
      moralis.tokensBalances({
        address,
        chainId: ChainId.Ethereum,
        tokenAddresses,
      }),
    tokensOwned: ({ address, tokenAddresses, minThreshold }) =>
      moralis.tokensOwned({
        address,
        chainId: ChainId.Ethereum,
        tokenAddresses,
        minThreshold,
      }),
    currentIndex: () => contracts.currentIndex({ chainId: ChainId.Ethereum }),
  },
  // Rinkeby is not available on Covalent
  [ChainId.Rinkeby]: {
    fullName: "Rinkeby",
    tokensBalances: ({ address, tokenAddresses }) =>
      moralis.tokensBalances({
        address,
        chainId: ChainId.Rinkeby,
        tokenAddresses,
      }),
    tokensOwned: ({ address, tokenAddresses, minThreshold }) =>
      moralis.tokensOwned({
        address,
        chainId: ChainId.Rinkeby,
        tokenAddresses,
        minThreshold,
      }),
    currentIndex: () => contracts.currentIndex({ chainId: ChainId.Rinkeby }),
  },
  [ChainId.Polygon]: {
    fullName: "Polygon",
    tokensBalances: ({ address, tokenAddresses }) =>
      moralis.tokensBalances({
        address,
        chainId: ChainId.Polygon,
        tokenAddresses,
      }),
    tokensOwned: ({ address, tokenAddresses, minThreshold }) =>
      moralis.tokensOwned({
        address,
        chainId: ChainId.Polygon,
        tokenAddresses,
        minThreshold,
      }),
    currentIndex: () => {
      return null;
    },
  },
  [ChainId.Arbitrum]: {
    fullName: "Arbitrum",
    tokensBalances: ({ address, tokenAddresses }) =>
      covalent.tokensBalances({
        address,
        chainId: ChainId.Arbitrum,
        tokenAddresses,
      }),
    tokensOwned: ({ address, tokenAddresses, minThreshold }) =>
      covalent.tokensOwned({
        address,
        chainId: ChainId.Arbitrum,
        tokenAddresses,
        minThreshold,
      }),
    currentIndex: () => {
      return null;
    },
  },
  [ChainId.Fantom]: {
    fullName: "Fantom",
    tokensBalances: ({ address, tokenAddresses }) =>
      moralis.tokensBalances({
        address,
        chainId: ChainId.Fantom,
        tokenAddresses,
      }),
    tokensOwned: ({ address, tokenAddresses, minThreshold }) =>
      moralis.tokensOwned({
        address,
        chainId: ChainId.Fantom,
        tokenAddresses,
        minThreshold,
      }),
    currentIndex: () => {
      return null;
    },
  },
  [ChainId.Avalanche]: {
    fullName: "Avalanche C-Chain",
    tokensBalances: ({ address, tokenAddresses }) =>
      moralis.tokensBalances({
        address,
        chainId: ChainId.Avalanche,
        tokenAddresses,
      }),
    tokensOwned: ({ address, tokenAddresses, minThreshold }) =>
      moralis.tokensOwned({
        address,
        chainId: ChainId.Avalanche,
        tokenAddresses,
        minThreshold,
      }),
    currentIndex: () => {
      return null;
    },
  },
  [ChainId.AvalancheFujiTestnet]: {
    fullName: "Avalanche Fuji Testnet",
    tokensBalances: ({ address, tokenAddresses }) =>
      moralis.tokensBalances({
        address,
        chainId: ChainId.AvalancheFujiTestnet,
        tokenAddresses,
      }),
    tokensOwned: ({ address, tokenAddresses, minThreshold }) =>
      moralis.tokensOwned({
        address,
        chainId: ChainId.AvalancheFujiTestnet,
        tokenAddresses,
        minThreshold,
      }),
    currentIndex: () => {
      return null;
    },
  },
  [ChainId.BSC]: {
    fullName: "Binance Smart Chain",
    tokensBalances: ({ address, tokenAddresses }) =>
      moralis.tokensBalances({
        address,
        chainId: ChainId.BSC,
        tokenAddresses,
      }),
    tokensOwned: ({ address, tokenAddresses, minThreshold }) =>
      moralis.tokensOwned({
        address,
        chainId: ChainId.BSC,
        tokenAddresses,
        minThreshold,
      }),
    currentIndex: () => {
      return null;
    },
  },
};
