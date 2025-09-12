import { createServerFileRoute, getCookie } from "@tanstack/react-start/server";

import { MISSKEY } from "~/constants";
import {
  getMe,
  getOAuth2Endpoint,
  validateAuthorizationCode,
} from "~/lib/misskey";
import { getOptionalSession } from "~/lib/session";

export const ServerRoute = createServerFileRoute("/callback/misskey").methods({
  GET: async ({ request }) => {
    const searchParams = new URL(request.url).searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const issuer = searchParams.get("iss");
    const storedState = getCookie(MISSKEY.STATE_COOKIE_NAME);
    const storedCodeVerifier = getCookie(MISSKEY.CODE_VERIFIER_COOKIE_NAME);

    if (
      !code ||
      !storedState ||
      !issuer ||
      !storedCodeVerifier ||
      state !== storedState
    ) {
      throw new Error("Invalid request");
    }

    try {
      const hostname = new URL(issuer).hostname;
      const { tokenEndpoint } = await getOAuth2Endpoint(hostname);
      const { accessToken } = await validateAuthorizationCode(
        tokenEndpoint,
        code,
        storedCodeVerifier,
      );

      const session = await getOptionalSession();

      const user = await getMe(hostname, accessToken);

      if (!user) {
        throw new Error("Failed to fetch user");
      }

      await session.update({
        misskey: {
          id: user.id,
          name: user.name,
          handle: user.username,
          avatar: user.avatarUrl,
          host: hostname,
        },
        misskeyAccessToken: accessToken,
      });

      return Response.redirect(`${process.env.PUBLIC_URL}`);
    } catch (e) {
      if (e instanceof Error) {
        console.error(e);
        return new Response(e.message, { status: 400 });
      }
    }
  },
});
