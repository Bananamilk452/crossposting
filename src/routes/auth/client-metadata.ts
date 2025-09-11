import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";

import { blueskyClient } from "~/lib/bluesky/client";

export const ServerRoute = createServerFileRoute(
  "/auth/client-metadata",
).methods({
  GET: async () => {
    return json(blueskyClient.clientMetadata);
  },
});
