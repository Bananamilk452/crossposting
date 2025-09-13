import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2Icon } from "lucide-react";
import { SVGProps } from "react";
import { toast } from "sonner";

import { BlueskyIcon } from "~/components/icons/BlueskyIcon";
import { MisskeyIcon } from "~/components/icons/MisskeyIcon";
import { TwitterIcon } from "~/components/icons/TwitterIcon";
import { ProfileBanner } from "~/components/profile/ProfileBanner";
import { Spinner } from "~/components/Spinner";
import { Button } from "~/components/ui/button";
import { Session, User } from "~/lib/session";
import { blueskySignOut } from "~/server/bluesky";
import { misskeySignOut } from "~/server/misskey";
import { getSessionQueryOptions } from "~/server/session";
import { twitterSignOut } from "~/server/twitter";

import { Checkbox } from "./ui/checkbox";

interface AccountBase {
  user: User;
  Icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
}

type Account =
  | ({
      platform: "twitter";
      signOut: typeof twitterSignOut;
    } & AccountBase)
  | ({
      platform: "bluesky";
      signOut: typeof blueskySignOut;
    } & AccountBase)
  | ({
      platform: "misskey";
      signOut: typeof misskeySignOut;
    } & AccountBase);

interface AccountListProps {
  session: Session;
  selection: string[];
  setSelection: (selection: string[]) => void;
}

export function AccountList({
  session,
  selection,
  setSelection,
}: AccountListProps) {
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
    <>
      {accounts.map((account) => (
        <AccountListItem
          key={account.platform}
          account={account}
          defaultValue={selection.includes(account.platform)}
          onSelect={() => {
            if (selection.includes(account.platform)) {
              setSelection(selection.filter((p) => p !== account.platform));
            } else {
              setSelection([...selection, account.platform]);
            }
          }}
        />
      ))}
    </>
  );
}

function AccountListItem({
  account,
  defaultValue,
  onSelect,
}: {
  account: Account;
  defaultValue?: boolean;
  onSelect?: () => void;
}) {
  const queryClient = useQueryClient();
  const { user, Icon, signOut: signOutFunction } = account;

  const { mutate: signOut, status } = useMutation({
    mutationFn: () => signOutFunction(),
    onSuccess: () => {
      queryClient.invalidateQueries(getSessionQueryOptions);
      toast.success("계정이 성공적으로 로그아웃되었습니다.");
    },
  });

  return (
    <div className="flex items-center gap-2">
      <Checkbox defaultChecked={defaultValue} onCheckedChange={onSelect} />
      <Icon className="size-6 shrink-0" />
      <ProfileBanner className="grow" user={user} />
      {status === "pending" && <Spinner />}
      <Button
        variant="destructive"
        className="size-9"
        disabled={status === "pending"}
        onClick={() => signOut()}
      >
        <Trash2Icon />
      </Button>
    </div>
  );
}
