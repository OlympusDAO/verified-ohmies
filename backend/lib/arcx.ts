import fetch from "node-fetch";

export const fetchScore = async (address: string) => {
  const url = `${process.env.ARCX_ENDPOINT}/${address}/${process.env.ARCX_SCORE_ID}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  return response.json();
};
