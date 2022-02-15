// The chains where token ownership will be checked for production
export const CHAIN_IDS_PRODUCTION = [1];

// The chains where token ownership will be checked for development
export const CHAIN_IDS_DEVELOPMENT = [1, 4];

// The names of the tokens allowed for authentication
export const TOKENS_AUTH = ["GOHM"];

// The minimum equivalent of OHM that the user must own to be authenticated
// i.e. for GOHM the equivalent in OHM is calculated by taking into account the current index
// for OHM and SOHM it's just the actual value
export const MINIMUM_OHM_EQUIV_AUTH = 0.01;

// Set to true if notification DM's should be sent to users when their role gets revoked because they don't have tokens anymore
export const SEND_DM_REVOKE = false;
