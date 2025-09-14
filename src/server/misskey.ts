import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "@tanstack/react-start/server";
import { z } from "zod";

import { MISSKEY } from "~/constants";
import {
  createNote,
  driveCreate,
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
  content: z.string(),
  visibility: z.enum(MISSKEY.VISIBILITIES),
  images: z.array(z.string().min(1)),
});

export const misskeyPost = createServerFn({
  method: "POST",
})
  .validator((data: unknown) => {
    return writerFormSchema.parse(data);
  })
  .handler(async (ctx) => {
    const { content, visibility, images } = ctx.data;

    if (content.length === 0 && images.length === 0) {
      throw new Error("내용이나 파일이 필요합니다.");
    }

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
        mediaIds: images,
      },
    );

    return { id };
  });

export const misskeyUploadFile = createServerFn({
  method: "POST",
})
  .validator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error("Invalid form data");
    }

    const body = Object.fromEntries(data);
    return { file: body.file as File };
  })
  .handler(async (ctx) => {
    const { file } = ctx.data;

    const session = await getOptionalSession();

    if (
      !session.data.misskey ||
      !session.data.misskey.host ||
      !session.data.misskeyAccessToken
    ) {
      throw new Error("Misskey 계정이 없습니다.");
    }

    const { id } = await driveCreate(
      session.data.misskey.host,
      session.data.misskeyAccessToken,
      file,
    );

    return { id };
  });
