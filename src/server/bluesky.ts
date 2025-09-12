import { Agent, RichText } from "@atproto/api";
import {
  isRecord as isPost,
  validateRecord as validatePost,
} from "@atproto/api/dist/client/types/app/bsky/feed/post";
import {
  isCreate,
  validateCreate,
} from "@atproto/api/dist/client/types/com/atproto/repo/applyWrites";
import { TID } from "@atproto/common";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { blueskyClient } from "~/lib/bluesky/client";
import { getOptionalSession } from "~/lib/session";

export const BlueskySignInSchema = z.object({
  handle: z
    .string()
    .min(1, "Bluesky 핸들을 입력해주세요.")
    .regex(
      new RegExp(
        "^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$",
      ),
      {
        message: "유효한 Bluesky 핸들을 입력해주세요.",
      },
    )
    .trim(),
});

export const blueskySignin = createServerFn({
  method: "GET",
})
  .validator((data: unknown) => {
    return BlueskySignInSchema.parse(data);
  })
  .handler(async (ctx) => {
    const { handle } = ctx.data;

    const url = await blueskyClient.authorize(handle, {
      prompt: "none",
      state: JSON.stringify({
        handle,
        redirectTo: "/",
      }),
    });

    return { url: url.toString() };
  });

export const blueskySignOut = createServerFn({
  method: "POST",
}).handler(async () => {
  const session = await getOptionalSession();

  const data = session.data;

  delete data.bluesky;

  await session.update(data);

  return {};
});

const writerFormSchema = z.object({
  content: z.string().min(1, "내용을 입력해주세요"),
});

export const blueskyPost = createServerFn({
  method: "POST",
})
  .validator((data: unknown) => {
    return writerFormSchema.parse(data);
  })
  .handler(async (ctx) => {
    const { content } = ctx.data;

    const session = await getOptionalSession();

    if (!session.data.bluesky) {
      throw new Error("Bluesky 계정이 없습니다.");
    }

    const client = await blueskyClient.restore(session.data.bluesky.id);
    const agent = new Agent(client);

    const rkey = TID.nextStr();

    const rt = new RichText({ text: content });
    await rt.detectFacets(agent);

    const post = {
      $type: "app.bsky.feed.post",
      text: rt.text,
      facets: rt.facets,
      langs: ["ko"],
      createdAt: new Date().toISOString(),
    };

    const writes = {
      $type: "com.atproto.repo.applyWrites#create",
      collection: "app.bsky.feed.post",
      rkey,
      value: post,
    };

    const postValidation = validatePost(post);
    const writeValidation = validateCreate(writes);

    if (
      postValidation.success &&
      writeValidation.success &&
      isPost(post) &&
      isCreate(writes)
    ) {
      await agent.com.atproto.repo.applyWrites({
        repo: session.data.bluesky.id,
        validate: true,
        writes: [writes],
      });
    } else {
      throw new Error("Post validation failed");
    }

    return {
      id: rkey,
    };
  });
