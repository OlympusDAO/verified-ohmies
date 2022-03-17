import { VercelRequest, VercelResponse } from "@vercel/node";
import { tokensBalances } from "../../lib/fetchBalances";

type Query = {
  address: string;
  chainId: string;
};

const balances = async (request: VercelRequest, response: VercelResponse) => {
  const { address, chainId } = request.query as Query;

  const responseData = await tokensBalances(address, parseInt(chainId)).catch((e) => {
    console.log(`/api/v1/balances GET error: ${e.message} (address: ${address})`);
    response.status(400).json(e.message);
  });
  response.status(200).json(responseData);
};

export default balances;
