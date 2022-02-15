import { ChainId } from "../../constants";
import { Token, BalancesAPIError } from ".";
import fetch from "node-fetch";
import { ethers } from "ethers";
import { currentIndex } from "./contracts";

const CovalentApi = "https://api.covalenthq.com/v1";
const CovalentKey = process.env.COVALENTHQ_API_KEY;

const fetchBalances = async ({ addressOrENS, chainId }) => {
  const response = await fetch(`${CovalentApi}/${chainId}/address/${addressOrENS}/balances_v2/?key=${CovalentKey}`);
  return response.json();
};

// Return the balance info of the tokens that the user owns and are specified in `tokenAddresses`
export const tokensBalances = async ({
  address,
  chainId,
  tokenAddresses,
}: {
  address: string;
  chainId: ChainId;
  tokenAddresses: { [key: string]: string };
}): Promise<Token[]> => {
  /*
  console.log("Covalent `tokensBalances`. Arguments:", {
    address,
    chainId,
    tokenAddresses,
  });
  */

  // The endpoint balances_v2 from Covalent doesn't have any pagination. All the tokens come on the same
  // response
  const { data, error_message } = await fetchBalances({
    addressOrENS: address,
    chainId,
  });
  if (error_message) {
    console.log(`Covalent error fetching balances: ${error_message}`);
    throw new BalancesAPIError(error_message);
  }

  var balances: Token[] = [];

  Object.keys(tokenAddresses).map((tokenName) => {
    const tokenAddress = tokenAddresses[tokenName];
    // balance
    const item = data.items.filter((t) => t.contract_address.toLowerCase() === tokenAddress);
    var balance = 0;
    if (item.length === 1) {
      balance = parseFloat(ethers.utils.formatUnits(item[0].balance, item[0].contract_decimals).toString());
    }
    balances.push({
      contractAddress: tokenAddress,
      symbol: tokenName,
      balance,
    });
  });

  return balances;
};

// Return the names of the tokens that the user owns and are specified in `tokenAddresses`
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
  /*
  console.log("Covalent `tokensOwned`. Arguments:", {
    address,
    chainId,
    tokenAddresses,
  });
  */

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

  return tokensNames;
};
