export const TWITTER = {
  STATE_COOKIE_NAME: "twitter_state",
  CODE_VERIFIER_COOKIE_NAME: "twitter_code_verifier",
  SCOPES: ["users.read", "tweet.read", "tweet.write"],
};

export const MISSKEY = {
  STATE_COOKIE_NAME: "misskey_state",
  CODE_VERIFIER_COOKIE_NAME: "misskey_code_verifier",
  SCOPES: ["read:account", "write:notes", "write:drive"],
  CLIENT_ID: process.env.PUBLIC_URL!,
  REDIRECT_URI: `${process.env.PUBLIC_URL}/callback/misskey`,
};

export const SELECTION_LOCAL_STORAGE_KEY = "selected_platforms";
