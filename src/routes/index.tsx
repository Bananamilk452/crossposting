import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Button } from "~/components/ui/button";
import { getSessionServer } from "~/server/session";
import { twitterSignIn } from "~/server/twitter";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  async function handleTwitterSignin() {
    const { url } = await twitterSignIn();
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
    </div>
  );
}
