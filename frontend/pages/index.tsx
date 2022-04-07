import WalletConnectProvider from "@walletconnect/web3-provider";
import WalletLink from "walletlink";
import Web3Modal from "web3modal";
import { providers } from "ethers";
import { getChainData, truncateHash } from "@lib/utilities";
import { requestNonce, signNonce } from "@lib/auth";
import * as url from "url";
import { useCallback, useEffect, useReducer } from "react";
import { Box } from "@material-ui/core";
import Logo from "@components/Logo";
import PoweredByOlympus from "@components/PoweredByOlympus";
import CTAButton from "@components/CTAButton";
import NavBar from "@components/NavBar/NavBar";
import Authentication from "@components/Authentication/Authentication";
import Info from "@components/Info/Info";
import { ErrorNotification } from "@olympusdao/component-library";
import setInitTheme from "../hooks/setInitTheme";
import textDots from "text-dots";

var dots;

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: process.env.NEXT_PUBLIC_INFURA_ID, // required
      qrcode: true,
    },
  },
  "custom-walletlink": {
    package: WalletLink,
    connector: async (_: any, options: any) => {
      const { appName, networkUrl, chainId } = options;
      const walletLink = new WalletLink({
        appName,
      });
      const provider = walletLink.makeWeb3Provider(networkUrl, chainId);
      await provider.enable();
      return provider;
    },
  },
};

let web3Modal: Web3Modal;
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    //network: "mainnet", // optional
    cacheProvider: true,
    providerOptions, // required
  });
}

type StateType = {
  currentPage?: string;
  provider?: any;
  web3Provider?: any;
  signer?: any;
  address?: string;
  chainId?: number;
  score?: number;
  chainIsSupported?: boolean;
  chainData?: any;
  authStatus?: string;
  error?: string;
};

type ActionType =
  | {
      type: "SET_CURRENT_PAGE";
      currentPage: StateType["currentPage"];
    }
  | {
      type: "SET_WEB3_PROVIDER";
      provider: StateType["provider"];
      web3Provider: StateType["web3Provider"];
      signer: StateType["signer"];
      address: StateType["address"];
      chainId: StateType["chainId"];
      score: StateType["score"];
      chainIsSupported: StateType["chainIsSupported"];
      chainData: StateType["chainData"];
    }
  | {
      type: "SET_ADDRESS";
      address: StateType["address"];
      signer: StateType["signer"];
      score: StateType["score"];
    }
  | {
      type: "RESET_WEB3_PROVIDER";
    }
  | {
      type: "SET_AUTH_STATUS";
      authStatus: StateType["authStatus"];
    }
  | {
      type: "SET_ERROR";
      error: StateType["error"];
    };

const initialState: StateType = {
  currentPage: "auth", // "auth", "info"
  provider: null,
  web3Provider: null,
  signer: null,
  address: undefined,
  chainId: undefined,
  score: 0,
  chainIsSupported: true,
  chainData: {},
  authStatus: null,
  error: null,
};

type ScoreResponse = {
  account: string;
  score: string;
  protocol: string;
};

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case "SET_CURRENT_PAGE":
      return {
        ...state,
        currentPage: action.currentPage,
      };
    case "SET_WEB3_PROVIDER":
      return {
        ...state,
        provider: action.provider,
        web3Provider: action.web3Provider,
        signer: action.signer,
        address: action.address,
        chainId: action.chainId,
        score: action.score,
        chainIsSupported: action.chainIsSupported,
        chainData: action.chainData,
      };
    case "SET_ADDRESS":
      return {
        ...state,
        address: action.address,
        signer: action.signer,
        score: action.score,
      };
    case "SET_AUTH_STATUS":
      return {
        ...state,
        authStatus: action.authStatus,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.error,
      };
    case "RESET_WEB3_PROVIDER":
      return initialState;
    default:
      throw new Error();
  }
}

const fetchScore = ({ address }: { address: string }) => {
  return fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/scores?address=${address}`
  ).then(async (d) => {
    const r = await d.json();
    if (!d.ok)
      throw new Error(
        "Something went wrong fetching your score. Try refreshing the page."
      );
    return r;
  }) as Promise<ScoreResponse>;
}

const Home = ({ initialAppTheme }) => {
  setInitTheme(initialAppTheme);
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    currentPage,
    provider,
    web3Provider,
    signer,
    address,
    chainId,
    score,
    chainIsSupported,
    chainData,
    authStatus,
    error,
  } = state;
  const connect = useCallback(async function () {
    // This is the initial `provider` that is returned when
    // using web3Modal to connect. Can be MetaMask or WalletConnect.
    var provider = undefined;
    // Fix for error thrown when user closes WalletConnect QR code modal
    try {
      provider = await web3Modal.connect();
    }
    catch (error) {
      console.log(`web3Modal.connect() error: ${error}`);
      return
    }

    // We plug the initial `provider` into ethers.js and get back
    // a Web3Provider. This will add on methods from ethers.js and
    // event listeners such as `.on()` will be different.
    const web3Provider = new providers.Web3Provider(provider);

    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();

    const network = await web3Provider.getNetwork();

    const chainIsSupported = !(getChainData(network.chainId) === undefined);

    var score = 0;
    var chainData = {};
    if (chainIsSupported) {
      try {
        chainData = getChainData(network.chainId);
        var scoreResponse = await fetchScore({ address });
        score = parseInt(scoreResponse.score);
      } catch (e) {
        dispatch({
          type: "SET_ERROR",
          error: e.message,
        });
      }
    }

    dispatch({
      type: "SET_WEB3_PROVIDER",
      provider,
      signer,
      web3Provider,
      address,
      chainId: network.chainId,
      score,
      chainIsSupported,
      chainData,
    });
  }, []);

  const disconnect = useCallback(
    async function () {
      web3Modal.clearCachedProvider();
      if (provider?.disconnect && typeof provider.disconnect === "function") {
        await provider.disconnect();
      }
      dispatch({
        type: "RESET_WEB3_PROVIDER",
      });
    },
    [provider]
  );

  const authenticate = useCallback(
    async function () {
      const href = window.location.href;
      const userIdToken = url.parse(href, true).query.id as string;

      dispatch({
        type: "SET_AUTH_STATUS",
        authStatus: "waiting",
      });

      const nonceResult = await requestNonce(signer, userIdToken);
      if (nonceResult.error) {
        dispatch({
          type: "SET_ERROR",
          error: nonceResult.error,
        });
        dispatch({
          type: "SET_AUTH_STATUS",
          authStatus: null,
        });
      } else {
        const authResult = await signNonce(
          signer,
          nonceResult.nonce,
          userIdToken
        );
        if (authResult.userOwnsTokens) {
          dispatch({
            type: "SET_AUTH_STATUS",
            authStatus: "success",
          });
        }
        if (authResult.error) {
          dispatch({
            type: "SET_ERROR",
            error: authResult.error,
          });
          dispatch({
            type: "SET_AUTH_STATUS",
            authStatus: null,
          });
        }
      }
    },
    [signer]
  );

  // Auto connect to the cached provider
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connect();
    }
  }, [connect]);

  useEffect(() => {
    if (authStatus === "waiting") {
      dots = textDots(3, {
        element: document.getElementById("CTAButtonText"),
        text: "Authenticating",
        interval: 300,
      });
    } else {
      if (dots) {
        dots.stop();
      }
    }
  }, [authStatus]);

  // A `provider` should come with EIP-1193 events. We'll listen for those events
  // here so that when a user switches accounts or networks, we can update the
  // local React state with that new information.
  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = async (accounts: string[]) => {
        dispatch({
          type: "SET_AUTH_STATUS",
          authStatus: null,
        });
        dispatch({
          type: "SET_ERROR",
          error: null,
        });

        var score = 0;

        if (chainIsSupported) {
          try {
            // eslint-disable-next-line no-console
            const address = accounts && accounts[0];
            const scoreResponse = await fetchScore({ address });
            score = parseInt(scoreResponse.score);
          } catch (e) {
            dispatch({
              type: "SET_ERROR",
              error: e.message,
            });
          }
        }
        
        dispatch({
          type: "SET_ADDRESS",
          address,
          signer,
          score,
        });
      };

      const handleChainChanged = (chain: string[]) => {
        // https://docs.metamask.io/guide/ethereum-provider.html#events
        // Handle the new chain.
        // Correctly handling chain changes can be complicated.
        // We recommend reloading the page unless you have good reason not to.
        window.location.reload();
      };

      const handleDisconnect = (error: { code: number; message: string }) => {
        // eslint-disable-next-line no-console
        console.log("disconnect", error);
        disconnect();
      };

      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);
      provider.on("disconnect", handleDisconnect);

      // Subscription Cleanup
      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
          provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [provider, disconnect, chainId, signer]);

  return (
    <>
      <NavBar
        walletIsConnected={Boolean(web3Provider)}
        disconnect={disconnect}
        currentPage={currentPage}
        dispatch={dispatch}
      />
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="center"
        height={"90vh"}
        width={"75%"}
        margin={"auto"}
      >
        {error && (
          <ErrorNotification
            show={Boolean(error)}
            onDismiss={() =>
              dispatch({
                type: "SET_ERROR",
                error: null,
              })
            }
            dismissible
          >
            {error}
          </ErrorNotification>
        )}
        <Logo currentPage={currentPage} dispatch={dispatch} />
        {/* Info Page */}
        {currentPage == "info" && <Info />}
        {/* Authentication Flow */}
        {currentPage == "auth" &&
          (!web3Provider ? (
            <CTAButton text={"Connect Wallet"} onClick={connect} />
          ) : (
            <Authentication
              chainIsSupported={chainIsSupported}
              chainData={chainData}
              score={score}
              address={truncateHash(address)}
              authenticate={authenticate}
              authStatus={authStatus}
            />
          ))}
        <PoweredByOlympus />
      </Box>
    </>
  );
};

export default Home;

export function getServerSideProps({ req }) {
  return {
    props: {
      initialAppTheme: req.cookies.appTheme || "dark",
    },
  };
}
