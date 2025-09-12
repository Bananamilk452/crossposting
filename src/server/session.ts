import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { getOptionalSession } from "~/lib/session";

export const getSessionServer = createServerFn({
  method: "GET",
}).handler(async () => {
  const session = await getOptionalSession();

  return session.data;
});

export const getSessionQueryOptions = queryOptions({
  queryKey: ["session"],
  queryFn: () => getSessionServer(),
});
