import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "@tanstack/react-start/server";
import * as arctic from "arctic";

import { TWITTER } from "~/constants";
import { getOptionalSession } from "~/lib/session";

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
  const scopes = TWITTER.SCOPES;
  const url = twitter.createAuthorizationURL(state, codeVerifier, scopes);

  setCookie(TWITTER.STATE_COOKIE_NAME, state, {
    secure: true,
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10,
  });

  setCookie(TWITTER.CODE_VERIFIER_COOKIE_NAME, codeVerifier, {
    secure: true,
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10,
  });

  return {
    url: url.toString(),
  };
});

export const twitterSignOut = createServerFn({
  method: "POST",
}).handler(async () => {
  const session = await getOptionalSession();

  const data = session.data;

  delete data.twitter;

  await session.update(data);

  return {};
});
