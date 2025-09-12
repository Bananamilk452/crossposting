import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "@tanstack/react-start/server";
import { z } from "zod";

import { MISSKEY } from "~/constants";
import {
  createNote,
  getOAuth2CallbackURL,
  getOAuth2Endpoint,
} from "~/lib/misskey";
import { getOptionalSession } from "~/lib/session";

export const MisskeySignInSchema = z.object({
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

export const misskeySignOut = createServerFn({
  method: "POST",
}).handler(async () => {
  const session = await getOptionalSession();

  const data = session.data;

  delete data.misskey;
  delete data.misskeyAccessToken;

  await session.update(data);

  return {};
});

const writerFormSchema = z.object({
  content: z.string().min(1, "내용을 입력해주세요"),
  visibility: z.enum(MISSKEY.VISIBILITIES),
});

export const misskeyPost = createServerFn({
  method: "POST",
})
  .validator((data: unknown) => {
    return writerFormSchema.parse(data);
  })
  .handler(async (ctx) => {
    const { content, visibility } = ctx.data;

    const session = await getOptionalSession();

    if (
      !session.data.misskey ||
      !session.data.misskeyAccessToken ||
      !session.data.misskey.host
    ) {
      throw new Error("Misskey 계정이 연결되어 있지 않습니다.");
    }

    const id = await createNote(
      session.data.misskey.host,
      session.data.misskeyAccessToken,
      {
        content,
        visibility,
      },
    );

    return { id };
  });
