import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { SVGProps, useState } from "react";

import { AddAccountModal } from "~/components/AddAccountModal";
import { BlueskyIcon } from "~/components/icons/BlueskyIcon";
import { MisskeyIcon } from "~/components/icons/MisskeyIcon";
import { TwitterIcon } from "~/components/icons/TwitterIcon";
import {
  BlueskyProfileBanner,
  MisskeyProfileBanner,
  TwitterProfileBanner,
} from "~/components/profile/ProfileBanner";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { BlueskyUser, MisskeyUser, TwitterUser } from "~/lib/session";
import { getSessionQueryOptions } from "~/server/session";

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
    }
  | {
      platform: "bluesky";
      user: BlueskyUser;
      Icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
    }
  | {
      platform: "misskey";
      user: MisskeyUser;
      Icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
    };

function AccountListItem({ account }: { account: Account }) {
  const { platform, user, Icon } = account;
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
      <Button variant="destructive" className="size-9">
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
    });
  }
  if (session.bluesky) {
    accounts.push({
      platform: "bluesky",
      user: session.bluesky,
      Icon: BlueskyIcon,
    });
  }
  if (session.misskey) {
    accounts.push({
      platform: "misskey",
      user: session.misskey,
      Icon: MisskeyIcon,
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
