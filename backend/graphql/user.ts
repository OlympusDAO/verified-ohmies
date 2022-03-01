export const FIND_USER_BY_ADDRESS = /* GraphQL */ `
  query FIND_USER_BY_ADDRESS($address: String!) {
    user(where: { address: { _eq: $address } }) {
      address
      user_verified {
        discordUserId
      }
    }
  }
`;
export const DELETE_USER_VERIFIED_BY_DISCORDID = /* GraphQL */ `
  mutation DELETE_USER_VERIFIED_BY_DISCORDID($discordUserId: String!) {
    delete_user_verified(where: { discordUserId: { _eq: $discordUserId } }) {
      affected_rows
    }
  }
`;

export const FIND_USER_BY_DISCORDID = /* GraphQL */ `
  query FIND_USER_BY_DISCORDID($discordUserId: String!) {
    user(where: { user_verified: { discordUserId: { _eq: $discordUserId } } }) {
      id
      address
      chainId
      user_verified {
        discordUserId
        nonce
        tokens
      }
    }
  }
`;

export const INSERT_USER_ONE = /* GraphQL */ `
  mutation INSERT_USER_ONE($address: String!, $chainId: Int!, $discordUserId: String!) {
    insert_user_one(
      object: { address: $address, chainId: $chainId, user_verified: { data: { discordUserId: $discordUserId } } }
    ) {
      address
      user_verified {
        discordUserId
      }
    }
  }
`;

export const INSERT_USER_VERIFIED_ONE = /* GraphQL */ `
  mutation INSERT_USER_VERIFIED_ONE($user_id: uuid!, $discordUserId: String!) {
    insert_user_verified_one(object: { user_id: $user_id, discordUserId: $discordUserId, tokens: null }) {
      discordUserId
    }
  }
`;

export const SET_USER_VERIFIED_NONCE = /* GraphQL */ `
  mutation SET_USER_VERIFIED_NONCE($discordUserId: String!, $nonce: String!) {
    update_user_verified(where: { discordUserId: { _eq: $discordUserId } }, _set: { nonce: $nonce }) {
      returning {
        discordUserId
        nonce
      }
    }
  }
`;

export const SET_USER_VERIFIED_TOKENS = /* GraphQL */ `
  mutation SET_USER_VERIFIED_TOKENS($discordUserId: String!, $tokens: jsonb!) {
    update_user_verified(where: { discordUserId: { _eq: $discordUserId } }, _set: { tokens: $tokens }) {
      returning {
        discordUserId
        tokens
      }
    }
  }
`;

export const SET_USER_VERIFIED_AUTHSTATUS = /* GraphQL */ `
  mutation SET_USER_VERIFIED_AUTHSTATUS($discordUserId: String!, $authStatus: String!) {
    update_user_verified(where: { discordUserId: { _eq: $discordUserId } }, _set: { authStatus: $authStatus }) {
      returning {
        discordUserId
        authStatus
      }
    }
  }
`;

export const SET_USER_CHAINID = /* GraphQL */ `
  mutation SET_USER_CHAINID($address: String!, $chainId: Int!) {
    update_user(where: { address: { _eq: $address } }, _set: { chainId: $chainId }) {
      returning {
        id
      }
    }
  }
`;

export const SET_USER_ADDRESS = /* GraphQL */ `
  mutation SET_USER_ADDRESS($discordUserId: String!, $address: String!, $chainId: Int!) {
    update_user(
      where: { user_verified: { discordUserId: { _eq: $discordUserId } } }
      _set: { address: $address, chainId: $chainId }
    ) {
      returning {
        address
        chainId
      }
    }
    update_user_verified(where: { discordUserId: { _eq: $discordUserId } }, _set: { tokens: null }) {
      returning {
        discordUserId
      }
    }
  }
`;

// Used for cron lambda w/ Moralis balances fetching, which will be switched for snapshot
/*
export const GET_AUTH_USERS_BATCH = `
  query GetUsersBatch($limit: Int, $lastBatchCreatedAt: timestamptz) {
    discord_ohmies(
      limit: $limit
      where: { authStatus: { _eq: "AUTH_SUCCESS" }, created_at: { _gt: $lastBatchCreatedAt } }
      order_by: { created_at: asc }
    ) {
      discordUserId
      address
      chainId
      created_at
    }
  }
`;
*/
