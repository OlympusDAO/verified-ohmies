import { OlympusStakingv2__factory } from "../typechain";
import { Addresses, ChainId } from "../../constants";
import { ethers } from "ethers";

const getProvider = ({ chainId }: { chainId: ChainId }) => {
  const alchemyAPIKeys = {
    [ChainId.Ethereum]: process.env.ALCHEMY_MAINNET_API_KEY,
    [ChainId.Rinkeby]: process.env.ALCHEMY_RINKEBY_API_KEY,
    [ChainId.Polygon]: null,
    [ChainId.Arbitrum]: null,
    [ChainId.ArbitrumRinkeby]: null,
    [ChainId.BSC]: null,
    [ChainId.Fantom]: null,
    [ChainId.Avalanche]: null,
    [ChainId.AvalancheFujiTestnet]: null,
  };
  const alchemyAPIKey = alchemyAPIKeys[chainId];
  var chainName = "";
  if (chainId == ChainId.Ethereum) {
    chainName = "homestead";
  } else if (chainId === ChainId.Rinkeby) {
    chainName = "rinkeby";
  }
  return new ethers.providers.AlchemyProvider(chainName, alchemyAPIKey);
};

export const currentIndex = async ({ chainId }: { chainId: ChainId }): Promise<number> => {
  const provider = getProvider({ chainId });
  const stakingContract = OlympusStakingv2__factory.connect(Addresses[chainId].STAKING_V2, provider);
  const _currentIndex = await stakingContract.index();
  const currentIndex = parseFloat(ethers.utils.formatUnits(_currentIndex, "gwei"));
  return currentIndex;
};
