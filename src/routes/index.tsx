import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { blueskySignin } from "~/server/bluesky";
import { getSessionServer } from "~/server/session";
import { twitterSignIn } from "~/server/twitter";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [handle, setHandle] = useState("");

  async function handleTwitterSignin() {
    const { url } = await twitterSignIn();
    window.location.href = url;
  }

  async function handleBlueskySignin() {
    const { url } = await blueskySignin({
      data: {
        handle,
      },
    });
    window.location.href = url;
  }

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: () => getSessionServer(),
  });

  console.log(session);

  return (
    <div className="p-2">
      <h3>Welcome Home!!!</h3>
      <Button onClick={handleTwitterSignin}>Twitter Sign-in</Button>
      <Input
        placeholder="Enter your handle"
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
      />
      <Button onClick={handleBlueskySignin}>Bluesky Sign-in</Button>
    </div>
  );
}
