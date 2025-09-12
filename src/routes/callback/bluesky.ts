import { Agent } from "@atproto/api";
import { OAuthCallbackError } from "@atproto/oauth-client-node";
import { createServerFileRoute } from "@tanstack/react-start/server";

import { blueskyClient } from "~/lib/bluesky/client";
import { getOptionalSession } from "~/lib/session";

export const ServerRoute = createServerFileRoute("/callback/bluesky").methods({
  GET: async ({ request }) => {
    try {
      const { session: s, state } = await blueskyClient.callback(
        new URL(request.url).searchParams,
      );

      if (!state) {
        throw new Error("Missing state in OAuth callback");
      }

      const rt = JSON.parse(state).redirectTo;
      const redirectTo = rt ? rt : "/home";

      const agent = new Agent(s);

      const { data } = await agent.getProfile({
        actor: s.did,
      });

      const session = await getOptionalSession();
      await session.update({
        bluesky: {
          id: data.did,
          name: data.displayName || data.handle,
          handle: data.handle,
          avatar: data.avatar,
        },
      });

      return Response.redirect(`${process.env.PUBLIC_URL}${redirectTo}`);
    } catch (err: unknown) {
      if (isReAuthorizableOAuthCallbackError(err)) {
        return reAuthorizeWhenSilentSignInFailed(err);
      }

      return handleError(err);
    }
  },
});

function isReAuthorizableOAuthCallbackError(
  err: unknown,
): err is OAuthCallbackError {
  return Boolean(
    err instanceof OAuthCallbackError &&
      ["login_required", "consent_required"].includes(
        err.params.get("error") || "",
      ) &&
      err.state,
  );
}

async function reAuthorizeWhenSilentSignInFailed(err: OAuthCallbackError) {
  try {
    if (!err.state) {
      throw new Error("Missing state in OAuthCallbackError");
    }

    const { handle, redirectTo } = JSON.parse(err.state);

    const url = await blueskyClient.authorize(handle, {
      state: JSON.stringify({
        handle,
        redirectTo,
      }),
    });

    return Response.redirect(url);
  } catch (error) {
    return handleError(error);
  }
}

function handleError(err: unknown) {
  console.error("Error during Bluesky OAuth callback:", err);

  if (err instanceof Error) {
    // Bluesky error
    return Response.redirect(
      `${process.env.PUBLIC_URL}/auth/error?error=${err.message}`,
    );
  } else {
    // Unknown error
    return Response.redirect(
      `${process.env.PUBLIC_URL}/auth/error?error=Unknown error`,
    );
  }
}
