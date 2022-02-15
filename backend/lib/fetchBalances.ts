import { Addresses, ChainId } from "../constants";
import { Chain, Token } from "./chainAPI";
import { TOKENS_AUTH } from "../config";

const filterTokens = (allAddresses, allowedTokenNames) => {
  return Object.keys(allAddresses)
    .filter((key) => allowedTokenNames.includes(key))
    .reduce((obj, key) => {
      return {
        ...obj,
        [key]: allAddresses[key],
      };
    }, {});
};

// Returns the balances of the tokens we're interested in, that the user owns.
export const tokensBalances = async (address: string, chainId: ChainId): Promise<Token[]> => {
  const olympusTokenAddresses = filterTokens(Addresses[chainId], TOKENS_AUTH);
  // Convert all the token addresses to lowercase
  for (var t in olympusTokenAddresses) {
    olympusTokenAddresses[t] = olympusTokenAddresses[t].toLowerCase();
  }
  const chain = Chain[chainId];

  if (!chain) throw Error(`ChainId ${chainId} not supported.`);
  return chain.tokensBalances({
    address,
    tokenAddresses: olympusTokenAddresses,
  });
};

// Returns the names of the tokens we're interested in, that the user owns, if above
// minimum threshold of OHM equivalent
export const tokensOwned = async (address: string, chainId: ChainId, minThreshold: number): Promise<string[]> => {
  const olympusTokenAddresses = filterTokens(Addresses[chainId], TOKENS_AUTH);
  // Convert all the token addresses to lowercase
  for (var t in olympusTokenAddresses) {
    olympusTokenAddresses[t] = olympusTokenAddresses[t].toLowerCase();
  }
  const chain = Chain[chainId];
  if (!chain) throw Error(`ChainId ${chainId} not supported.`);
  return chain.tokensOwned({ address, tokenAddresses: olympusTokenAddresses, minThreshold });
};
