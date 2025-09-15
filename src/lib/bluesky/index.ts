import { Agent } from "@atproto/api";
import { imageSize } from "image-size";

import { BLUESKY } from "~/constants";
import { blueskyClient } from "~/lib/bluesky/client";
import { resizeImage } from "~/server/utils";

export async function getAgent(did: string) {
  const session = await blueskyClient.restore(did);
  const agent = new Agent(session);

  return agent;
}

export async function blueskyUploadBlob(agent: Agent, file: File) {
  const image = await resizeImage(file, BLUESKY.MAX_IMAGE_SIZE);
  const sizes = imageSize(image);

  const upload = await agent.uploadBlob(
    new Blob([image], { type: "image/webp" }),
  );

  return {
    alt: "",
    aspectRatio: {
      height: sizes.height,
      width: sizes.width,
    },
    image: upload.data.blob.toJSON(),
  };
}
