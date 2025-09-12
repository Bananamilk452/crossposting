import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { SVGProps, useState } from "react";
import { toast } from "sonner";

import { AddAccountModal } from "~/components/AddAccountModal";
import { BlueskyIcon } from "~/components/icons/BlueskyIcon";
import { MisskeyIcon } from "~/components/icons/MisskeyIcon";
import { TwitterIcon } from "~/components/icons/TwitterIcon";
import {
  BlueskyProfileBanner,
  MisskeyProfileBanner,
  TwitterProfileBanner,
} from "~/components/profile/ProfileBanner";
import { Spinner } from "~/components/Spinner";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { BlueskyUser, MisskeyUser, TwitterUser } from "~/lib/session";
import { blueskySignOut } from "~/server/bluesky";
import { misskeySignOut } from "~/server/misskey";
import { getSessionQueryOptions } from "~/server/session";
import { twitterSignOut } from "~/server/twitter";

export const Route = createFileRoute("/")({
  component: Home,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(getSessionQueryOptions);
  },
});

type Account =
  | {
      platform: "twitter";
      user: TwitterUser;
      Icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
      signOut: typeof twitterSignOut;
    }
  | {
      platform: "bluesky";
      user: BlueskyUser;
      Icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
      signOut: typeof blueskySignOut;
    }
  | {
      platform: "misskey";
      user: MisskeyUser;
      Icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
      signOut: typeof misskeySignOut;
    };

function AccountListItem({ account }: { account: Account }) {
  const queryClient = useQueryClient();
  const { platform, user, Icon, signOut: signOutFunction } = account;

  const { mutate: signOut, status } = useMutation({
    mutationFn: () => signOutFunction(),
    onSuccess: () => {
      queryClient.invalidateQueries(getSessionQueryOptions);
      toast.success("계정이 성공적으로 로그아웃되었습니다.");
    },
  });

  return (
    <div className="flex items-center gap-2">
      <Icon className="size-6" />
      {platform === "twitter" && (
        <TwitterProfileBanner className="grow" user={user} />
      )}
      {platform === "bluesky" && (
        <BlueskyProfileBanner className="grow" user={user} />
      )}
      {platform === "misskey" && (
        <MisskeyProfileBanner className="grow" user={user} />
      )}
      {status === "pending" && <Spinner />}
      <Button
        variant="destructive"
        className="size-9"
        onClick={() => signOut()}
      >
        <Trash2Icon />
      </Button>
    </div>
  );
}

function Home() {
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);

  const { data: session } = useSuspenseQuery(getSessionQueryOptions);

  const accounts: Account[] = [];
  if (session.twitter) {
    accounts.push({
      platform: "twitter",
      user: session.twitter,
      Icon: TwitterIcon,
      signOut: twitterSignOut,
    });
  }
  if (session.bluesky) {
    accounts.push({
      platform: "bluesky",
      user: session.bluesky,
      Icon: BlueskyIcon,
      signOut: blueskySignOut,
    });
  }
  if (session.misskey) {
    accounts.push({
      platform: "misskey",
      user: session.misskey,
      Icon: MisskeyIcon,
      signOut: misskeySignOut,
    });
  }
  return (
    <div className="mx-auto w-1/2 p-4">
      <Card>
        <CardHeader>
          <CardTitle>계정 목록</CardTitle>
          <CardAction>
            <Button onClick={() => setIsAddAccountModalOpen(true)}>
              <PlusIcon />
              계정 추가
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-3">
            {accounts.map((account) => (
              <AccountListItem key={account.platform} account={account} />
            ))}

            {accounts.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-500">
                추가된 계정이 없습니다. "계정 추가" 버튼을 눌러 계정을 추가해
                주세요.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <AddAccountModal
        open={isAddAccountModalOpen}
        setOpen={setIsAddAccountModalOpen}
      />
    </div>
  );
}
