import { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchScore } from "../../lib/arcx";

type Query = {
  address: string;
};

const scores = async (request: VercelRequest, response: VercelResponse) => {
  const { address } = request.query as Query;

  const responseData = await fetchScore(address).catch((e) => {
    console.log(`/api/v1/scores GET error: ${e.message} (address: ${address})`);
    response.status(400).json(e.message);
  });
  console.log({ responseData });
  if (responseData.score === null) responseData.score = 0;
  const responseTrimmed = {
    account: responseData.account,
    score: responseData.score,
    protocol: responseData.protocol,
  };
  console.log({ responseTrimmed });
  response.status(200).json(responseTrimmed);
};

export default scores;
