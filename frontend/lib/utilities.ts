import supportedChains from './chains';
import { IChainData } from './types';
import { CHAIN_IDS_PRODUCTION, CHAIN_IDS_DEVELOPMENT } from '../config'

export function ellipseAddress(address: String | undefined) {
  if (!address) {
    return '';
  }
  return address;
}

export function truncateHash(hash: string, length = 38): string {
  return hash.replace(hash.substring(6, length), '...');
}

export function getChainData(chainId?: number): IChainData | undefined {
  if (!chainId) {
    return undefined;
  }

  var allowedChainIds;
  const env = process.env.NODE_ENV;
  if (env === "production") allowedChainIds = CHAIN_IDS_PRODUCTION;
  else if (env === "development") allowedChainIds = CHAIN_IDS_DEVELOPMENT;

  const chainData = supportedChains
    // Keep only the chains allowed for production / development
    .filter(
      (chain: any) => allowedChainIds.includes(chain.chain_id)
    )
    .filter(
      (chain: any) => chain.chain_id === chainId
    )[0];

  if (!chainData) {
    console.log(`Chain with ID ${chainId} is not supported`);
  }
 
  return chainData;
}