import { ChainId } from "../../constants";
import { Token, BalancesAPIError } from ".";
import { init as etherscanInit } from "etherscan-api";
import { ethers } from "ethers";
import { currentIndex } from "./contracts";

enum ChainNames {
  homestead = 1,
  ropsten = 3,
  rinkeby = 4,
  kovan = 42,
}

// Etherscan doesn't return the number of decimals, so just hardcoding for now
const decimals = {
  GOHM: 18,
  SOHM: 9,
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
  /*
  console.log("Etherscan `tokensBalances`. Arguments:", {
    address,
    chainId,
    tokenAddresses,
  });
  */

  const chainName = ChainNames[chainId];
  if (!chainName) throw Error(`Etherscan API doesn't support chain with ID ${chainId}`);
  const etherscanClient = etherscanInit(process.env.ETHERSCAN_API_KEY, chainName);

  var balances: Token[] = [];

  await Promise.all(
    Object.keys(tokenAddresses).map(async (tokenName) => {
      const tokenAddress = tokenAddresses[tokenName];
      let response;
      try {
        response = await etherscanClient.account.tokenbalance(address, "", tokenAddress);
      } catch (e) {
        throw new BalancesAPIError("Etherscan API error. Probably being rate limited.");
      }

      if (response.status == 1 && response.message === "OK") {
        const balance = parseFloat(ethers.utils.formatUnits(response.result, decimals[tokenName]).toString());
        balances.push({
          contractAddress: tokenAddress,
          symbol: tokenName,
          balance,
        });
      } else {
        throw new BalancesAPIError(`Etherscan API error. Status: ${response.status}. Message: ${response.message}`);
      }
      return response;
    })
  );

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
  /*
  console.log("Etherscan `tokensOwned`. Arguments:", {
    address,
    chainId,
    tokenAddresses,
  });
  */

  var idx = await currentIndex({ chainId });
  var balances = await tokensBalances({ address, chainId, tokenAddresses });

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
