import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "@tanstack/react-start/server";
import * as arctic from "arctic";
import { Client } from "twitter-api-sdk";
import z from "zod/v3";

import { TWITTER } from "~/constants";
import { getOptionalSession } from "~/lib/session";
import { twitterUploadMedia } from "~/lib/twitter";

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
  delete data.twitterAccessToken;

  await session.update(data);

  return {};
});

const writerFormSchema = z.object({
  content: z.string(),
  images: z.array(z.string().min(1)),
});

export const twitterPost = createServerFn({
  method: "POST",
})
  .validator((data: unknown) => {
    return writerFormSchema.parse(data);
  })
  .handler(async (ctx) => {
    const { content, images } = ctx.data;

    if (content.length === 0 && images.length === 0) {
      throw new Error("내용이나 파일이 필요합니다.");
    }

    const session = await getOptionalSession();

    if (!session.data.twitter || !session.data.twitterAccessToken) {
      throw new Error("Twitter 계정이 없습니다.");
    }

    const twitter = new Client(session.data.twitterAccessToken);

    const tweet = await twitter.tweets.createTweet({
      text: content,
      media: images.length > 0 ? { media_ids: images } : undefined,
    });

    return {
      id: tweet.data?.id,
    };
  });

export const twitterUploadFile = createServerFn({
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

    if (!session.data.twitter || !session.data.twitterAccessToken) {
      throw new Error("Twitter 계정이 없습니다.");
    }

    const { id } = await twitterUploadMedia(
      session.data.twitterAccessToken,
      file,
    );

    return { id };
  });
