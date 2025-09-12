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
