import fetch from "node-fetch";

export const hasuraRequest = (query, variables) => {
  return fetch(process.env.HASURA_ENDPOINT as string, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET as string,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });
};
