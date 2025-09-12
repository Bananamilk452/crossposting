import { createServerFileRoute, getCookie } from "@tanstack/react-start/server";
import * as arctic from "arctic";
import { Client } from "twitter-api-sdk";

import { TWITTER } from "~/constants";
import { getOptionalSession } from "~/lib/session";

export const ServerRoute = createServerFileRoute("/callback/twitter").methods({
  GET: async ({ request }) => {
    const twitter = new arctic.Twitter(
      process.env.TWITTER_CLIENT_ID!,
      process.env.TWITTER_CLIENT_SECRET!,
      `${process.env.PUBLIC_URL}/callback/twitter`,
    );

    const searchParams = new URL(request.url).searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const storedState = getCookie(TWITTER.STATE_COOKIE_NAME);
    const storedCodeVerifier = getCookie(TWITTER.CODE_VERIFIER_COOKIE_NAME);

    if (!code || !storedState || !storedCodeVerifier || state !== storedState) {
      throw new Error("Invalid request");
    }

    try {
      const tokens = await twitter.validateAuthorizationCode(
        code,
        storedCodeVerifier,
      );
      const accessToken = tokens.accessToken();
      const client = new Client(accessToken);

      const session = await getOptionalSession();
      const { data: user } = await client.users.findMyUser({
        "user.fields": ["id", "name", "username", "profile_image_url"],
      });

      if (!user) {
        throw new Error("Failed to fetch user");
      }

      await session.update({
        twitter: {
          id: user.id,
          name: user.name,
          handle: user.username,
          avatar: user.profile_image_url,
        },
        twitterAccessToken: accessToken,
      });

      return Response.redirect(`${process.env.PUBLIC_URL}`);
    } catch (e) {
      if (e instanceof arctic.OAuth2RequestError) {
        // Invalid authorization code, credentials, or redirect URI
        console.error(e);
        return new Response(e.code, { status: 400 });
      }
      if (e instanceof arctic.ArcticFetchError) {
        console.error(e.cause);
        return new Response(e.cause as string, { status: 400 });
      }
      if (e instanceof Error) {
        console.error(e);
        return new Response(e.message, { status: 400 });
      }
    }
  },
});
