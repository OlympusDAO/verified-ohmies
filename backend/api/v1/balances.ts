import { VercelRequest, VercelResponse } from "@vercel/node";
import { tokensBalances } from "../../lib/fetchBalances";

type Query = {
  publicAddress: string;
  chainId: string;
};

const balances = async (request: VercelRequest, response: VercelResponse) => {
  const { publicAddress, chainId } = request.query as Query;

  const responseData = await tokensBalances(publicAddress, parseInt(chainId)).catch((e) => {
    console.log(`/api/v1/balances GET error: ${e.message} (publicAddress: ${publicAddress}`);
    response.status(400).json(e.message);
  });
  response.status(200).json(responseData);
};

export default balances;
