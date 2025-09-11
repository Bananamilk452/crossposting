import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "@tanstack/react-start/server";
import * as arctic from "arctic";

export const twitterSignIn = createServerFn({
  method: "GET",
}).handler(async () => {
  const twitter = new arctic.Twitter(
    process.env.TWITTER_CLIENT_ID!,
    process.env.TWITTER_CLIENT_SECRET!,
    `${process.env.PUBLIC_URL}/callback/twitter`,
  );

  const state = arctic.generateState();
  const codeVerifier = arctic.generateCodeVerifier();
  const scopes = ["users.read", "tweet.read", "tweet.write"];
  const url = twitter.createAuthorizationURL(state, codeVerifier, scopes);

  setCookie("state", state, {
    secure: true, // set to false in localhost
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10, // 10 min
  });

  // store code verifier as cookie
  setCookie("code_verifier", codeVerifier, {
    secure: true, // set to false in localhost
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10, // 10 min
  });

  return {
    url: url.toString(),
  };
});
