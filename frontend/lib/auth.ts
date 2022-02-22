// Back-end API request
function apiRequest(path: string, method = "GET", data: any) {
  return fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${path}`, {
    mode: "cors",
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: data ? JSON.stringify(data) : undefined,
  })
    .then(res => res.json())
    .catch(function (err) {
      console.log("Fetch Error:" + err);
      throw new Error(err);
    });
}

// 1. Request nonce
export const requestNonce = async (signer: any, userIdToken: string) => {
  console.log("Request nonce");
  console.log({ signer });
  try {
    const { chainId } = await signer.provider.getNetwork();
    console.log({ chainId })
    const address = await signer.getAddress();
    console.log({ address });
    // Request nonce
    const nonceResult = await apiRequest(
      `/api/authentication?address=${address}&userIdToken=${userIdToken}&chainId=${chainId}`,
      "GET",
      null
    );
    return nonceResult
  }
  catch (e) {
    return { error: e.message }
  }

}

// 2. Sign nonce
// 3. Send userIdToken + signed nonce
export const signNonce = async (signer: any, nonce: string, userIdToken: string) => {
  console.log("Sign nonce");
  try {
    const signature = await signer.signMessage(nonce);
    // Send address + signature
    const authResult = await apiRequest(
      "/api/authentication",
      "POST",
      {
        userIdToken,
        signature
      },
    );
    return authResult;
  }
  catch(e) {
    let error;
    // User canceled signature on metamask
    if (e.code == 4001) {
      error = "You've canceled the signature on MetaMask."
    }
    else {
      error = e.message;
    }
    return { error }
  }
}