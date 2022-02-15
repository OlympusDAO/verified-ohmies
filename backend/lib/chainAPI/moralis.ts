import { ChainId } from "../../constants";
import { Token, BalancesAPIError } from ".";
import fetch from "node-fetch";
import { ethers } from "ethers";
import { currentIndex } from "./contracts";

const MoralisApi = "https://deep-index.moralis.io/api/v2";
const MoralisKey = process.env.MORALIS_API_KEY;

enum ChainNames {
  "eth" = 1,
  "ropsten" = 3,
  "rinkeby" = 4,
  "kovan" = 42,
  "polygon" = 137,
  "mumbai" = 13881,
  "bsc" = 56,
  "avalanche" = 43114,
  "avalanche%20testnet" = 43113,
  "fantom" = 250,
}

const fetchBalances = async ({ address, chainId, tokenAddresses }) => {
  var url = `${MoralisApi}/${address}/erc20?`;
  const chainName = ChainNames[chainId];
  if (!chainName) throw Error(`Moralis API doesn't support chain with ID ${chainId}`);
  url = url.concat(`chain=${chainName}`);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [_, tokenAddress] of Object.entries(tokenAddresses)) {
    url = url.concat(`&token_addresses=${tokenAddress}`);
  }
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-API-Key": MoralisKey,
    },
  });

  return response.json();
};

export const tokensBalances = async ({
  address,
  chainId,
  tokenAddresses,
}: {
  address: string;
  chainId: ChainId;
  tokenAddresses: { [key: string]: string };
}): Promise<Token[]> => {
  const response = await fetchBalances({
    address,
    chainId,
    tokenAddresses,
  });
  if (response.message) {
    console.log(`Moralis error fetching balances: ${response.message}`);
    throw new BalancesAPIError(response.message);
  }
  var balances: Token[] = [];

  Object.keys(tokenAddresses).map((tokenName) => {
    const tokenAddress = tokenAddresses[tokenName];
    // balance
    const token = response.filter((t: { token_address: string }) => t.token_address.toLowerCase() === tokenAddress);
    var balance = 0;
    if (token.length === 1) {
      balance = parseFloat(ethers.utils.formatUnits(token[0].balance, token[0].decimals).toString());
    }
    balances.push({
      contractAddress: tokenAddress,
      symbol: tokenName,
      balance,
    });
  });

  // console.log("Moralis `tokensBalances`. Result:", { balances });

  return balances;
};

export const tokensOwned = async ({
  address,
  chainId,
  tokenAddresses,
  minThreshold,
}: {
  address: string;
  chainId: ChainId;
  tokenAddresses: { [key: string]: string };
  minThreshold: number;
}): Promise<string[]> => {
  // debug
  console.log("Moralis `tokensOwned`. Arguments:", {
    address,
    chainId,
    tokenAddresses,
  });
  // debug

  var idx = await currentIndex({ chainId });
  var balances = await tokensBalances({ address, chainId, tokenAddresses });

  // Returning only the names in `tokenAddresses` and not
  // directly the ones given by covalent to assure consistency
  var tokensNames: string[] = [];
  for (const t of balances) {
    for (const tokenName in tokenAddresses) {
      // These are all in lowercase already
      if (t.contractAddress === tokenAddresses[tokenName]) {
        // Convert balance to OHM equivalent
        var balance = tokenName === "GOHM" ? t.balance * idx : t.balance;
        // If above threshold add token name to results
        if (balance >= minThreshold) {
          tokensNames.push(tokenName);
        }
      }
    }
  }

  // console.log("Moralis `tokensOwned`. Result:", { tokensNames });

  return tokensNames;
};
