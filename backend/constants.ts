export enum ChainId {
  Ethereum = 1,
  Rinkeby = 4,
  Polygon = 137,
  Arbitrum = 42161,
  ArbitrumRinkeby = 421611,
  BSC = 56,
  Fantom = 250,
  Avalanche = 43114,
  AvalancheFujiTestnet = 43113,
  // Solana = 'solana',
}

export const Addresses: { [chainId in ChainId]: { GOHM: string; STAKING_V2: string } } = {
  [ChainId.Ethereum]: {
    // OHM: "",
    // SOHM: "",
    // WSOHM: "",
    GOHM: "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f",
    STAKING_V2: "0xB63cac384247597756545b500253ff8E607a8020",
  },
  [ChainId.Rinkeby]: {
    // OHM: "0xC0b491daBf3709Ee5Eb79E603D73289Ca6060932", // v1
    // SOHM: "0x1Fecda1dE7b6951B248C0B62CaeBD5BAbedc2084", // v1
    // WSOHM: "0xe73384f11Bb748Aa0Bc20f7b02958DF573e6E2ad",
    GOHM: "0xcF2D6893A1CB459fD6B48dC9C41c6110B968611E",
    // OHM: "0xd7B98050962ec7cC8D11a83446B3217257C754B7", // v2
    // SOHM: "0xebED323CEbe4FfF65F7D7612Ea04313F718E5A75", // v2
    STAKING_V2: "0x06984c3A9EB8e3A8df02A4C09770D5886185792D",
  },
  [ChainId.Polygon]: {
    GOHM: "0xd8cA34fd379d9ca3C6Ee3b3905678320F5b45195",
    STAKING_V2: "",
  },
  // TODO: add further addresses when available
  [ChainId.Arbitrum]: {
    GOHM: "0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1",
    STAKING_V2: "",
  },
  // TODO: add further addresses when available
  [ChainId.ArbitrumRinkeby]: {
    GOHM: "",
    STAKING_V2: "",
  },
  [ChainId.Fantom]: {
    GOHM: "0x91fa20244fb509e8289ca630e5db3e9166233fdc",
    STAKING_V2: "",
  },
  // TODO: add further addresses when available
  [ChainId.Avalanche]: {
    // WSOHM: "",
    GOHM: "0x321e7092a180bb43555132ec53aaa65a5bf84251",
    STAKING_V2: "",
  },
  // TODO: add further addresses when available
  [ChainId.AvalancheFujiTestnet]: {
    GOHM: "",
    STAKING_V2: "",
  },
  [ChainId.BSC]: {
    GOHM: "",
    STAKING_V2: "",
  },
};
