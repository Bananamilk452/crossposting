import { Agent } from "@atproto/api";
import { imageSize } from "image-size";

import { blueskyClient } from "~/lib/bluesky/client";

export async function getAgent(did: string) {
  const session = await blueskyClient.restore(did);
  const agent = new Agent(session);

  return agent;
}

export async function blueskyUploadBlob(agent: Agent, file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const sizes = imageSize(buffer);

  const upload = await agent.uploadBlob(file);

  return {
    alt: "",
    aspectRatio: {
      height: sizes.height,
      width: sizes.width,
    },
    image: upload.data.blob.toJSON(),
  };
}
