import { Agent } from "@atproto/api";
import { imageSize } from "image-size";

import { blueskyClient } from "~/lib/bluesky/client";
import { getOptionalSession } from "~/lib/session";

export async function getAgent(did: string) {
  const session = await blueskyClient.restore(did);
  const agent = new Agent(session);

  return agent;
}

export async function blueskyUploadBlob(agent: Agent, file: File) {
  const upload = await agent.uploadBlob(new Blob([file], { type: file.type }));

  const arrayBuffer = await file.arrayBuffer();
  const sizes = imageSize(Buffer.from(arrayBuffer));

  return {
    alt: "",
    aspectRatio: {
      height: sizes.height,
      width: sizes.width,
    },
    image: upload.data.blob.toJSON(),
  };
}
