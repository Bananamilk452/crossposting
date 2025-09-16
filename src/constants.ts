export const TWITTER = {
  STATE_COOKIE_NAME: "twitter_state",
  CODE_VERIFIER_COOKIE_NAME: "twitter_code_verifier",
  SCOPES: ["users.read", "tweet.read", "tweet.write", "media.write"],
};

export const BLUESKY = {
  MAX_IMAGE_SIZE: 970000, // 970kb
};

export const MISSKEY = {
  STATE_COOKIE_NAME: "misskey_state",
  CODE_VERIFIER_COOKIE_NAME: "misskey_code_verifier",
  SCOPES: ["read:account", "write:notes", "write:drive"],
  CLIENT_ID: process.env.PUBLIC_URL!,
  REDIRECT_URI: `${process.env.PUBLIC_URL}/callback/misskey`,
  VISIBILITIES: ["public", "home", "followers"],
};

export const SELECTION_LOCAL_STORAGE_KEY = "selected_platforms";
export const VISIBILITY_LOCAL_STORAGE_KEY = "post_visibility";
