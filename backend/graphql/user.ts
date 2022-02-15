export const INSERT_ONE_USER = /* GraphQL */ `
  mutation InsertOneUser($discordUserId: String, $publicAddress: String, $nonce: String, $chainId: Int) {
    insert_discord_ohmies_one(
      object: {
        publicAddress: $publicAddress
        discordUserId: $discordUserId
        nonce: null
        ownedTokens: null
        chainId: $chainId
      }
    ) {
      publicAddress
      updated_at
    }
  }
`;

export const FIND_ONE_USER = /* GraphQL */ `
  query GetUser($discordUserId: String) {
    discord_ohmies(where: { discordUserId: { _eq: $discordUserId }, nonce: { _is_null: false } }) {
      discordUserId
      publicAddress
      nonce
      ownedTokens
      chainId
    }
  }
`;

export const GET_AUTH_USERS_BATCH = /* GraphQL */ `
  query GetUsersBatch($limit: Int, $lastBatchCreatedAt: timestamptz) {
    discord_ohmies(
      limit: $limit
      where: { authStatus: { _eq: "AUTH_SUCCESS" }, created_at: { _gt: $lastBatchCreatedAt } }
      order_by: { created_at: asc }
    ) {
      discordUserId
      publicAddress
      chainId
      created_at
    }
  }
`;

export const SET_USER_NONCE = /* GraphQL */ `
  mutation SetUserNonce($discordUserId: String, $nonce: String) {
    update_discord_ohmies(where: { discordUserId: { _eq: $discordUserId } }, _set: { nonce: $nonce }) {
      returning {
        nonce
      }
    }
  }
`;

export const SET_USER_ADDRESS = /* GraphQL */ `
  mutation SetUserAddress($discordUserId: String, $publicAddress: String, $chainId: Int) {
    update_discord_ohmies(
      where: { discordUserId: { _eq: $discordUserId } }
      _set: { publicAddress: $publicAddress, chainId: $chainId, ownedTokens: null }
    ) {
      returning {
        publicAddress
        chainId
      }
    }
  }
`;

export const SET_USER_OWNEDTOKENS = /* GraphQL */ `
  mutation SetUserOwnedTokens($discordUserId: String, $ownedTokens: jsonb) {
    update_discord_ohmies(where: { discordUserId: { _eq: $discordUserId } }, _set: { ownedTokens: $ownedTokens }) {
      returning {
        ownedTokens
      }
    }
  }
`;

export const SET_USER_AUTHSTATUS = /* GraphQL */ `
  mutation SetUserAuthStatus($discordUserId: String, $authStatus: String) {
    update_discord_ohmies(where: { discordUserId: { _eq: $discordUserId } }, _set: { authStatus: $authStatus }) {
      returning {
        authStatus
      }
    }
  }
`;
