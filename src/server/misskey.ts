import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "@tanstack/react-start/server";
import { z } from "zod";

import { MISSKEY } from "~/constants";
import { getOAuth2CallbackURL, getOAuth2Endpoint } from "~/lib/misskey";

const MisskeySignInSchema = z.object({
  hostname: z.string().regex(z.regexes.hostname),
});

export const misskeySignin = createServerFn({
  method: "GET",
})
  .validator((data: unknown) => {
    return MisskeySignInSchema.parse(data);
  })
  .handler(async (ctx) => {
    const { hostname } = ctx.data;

    const { authorizationEndpoint } = await getOAuth2Endpoint(hostname);

    const {
      url: redirectURL,
      codeVerifier,
      state,
    } = await getOAuth2CallbackURL(authorizationEndpoint);

    setCookie(MISSKEY.STATE_COOKIE_NAME, state, {
      secure: true,
      path: "/",
      httpOnly: true,
      maxAge: 60 * 10,
    });

    setCookie(MISSKEY.CODE_VERIFIER_COOKIE_NAME, codeVerifier, {
      secure: true,
      path: "/",
      httpOnly: true,
      maxAge: 60 * 10,
    });

    return {
      url: redirectURL,
    };
  });
