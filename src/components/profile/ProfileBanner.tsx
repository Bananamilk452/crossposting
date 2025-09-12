import { BlueskyUser, MisskeyUser, TwitterUser } from "~/lib/session";
import { cn } from "~/utils";

interface ProfileBannerProps {
  className?: string;
  username: string;
  handle: string;
  avatarUrl?: string;
}

function ProfileBanner({
  className,
  username,
  handle,
  avatarUrl,
}: ProfileBannerProps) {
  return (
    <div className={cn("flex gap-2 rounded-lg border p-2", className)}>
      <img src={avatarUrl} alt="Avatar" className="size-8 rounded-full" />
      <div className="flex flex-col">
        <h3 className="line-clamp-1 overflow-hidden text-ellipsis text-sm font-semibold">
          {username}
        </h3>
        <p className="line-clamp-1 overflow-hidden text-ellipsis text-xs text-gray-600">
          @{handle}
        </p>
      </div>
    </div>
  );
}

export const TwitterProfileBanner = ({
  user,
  className = "",
}: {
  user: TwitterUser;
  className?: string;
}) => {
  return (
    <ProfileBanner
      className={className}
      username={user.name}
      handle={user.username}
      avatarUrl={user.avatar}
    />
  );
};

export const BlueskyProfileBanner = ({
  user,
  className = "",
}: {
  user: BlueskyUser;
  className?: string;
}) => {
  return (
    <ProfileBanner
      className={className}
      username={user.displayName || user.handle}
      handle={user.handle}
      avatarUrl={user.avatar}
    />
  );
};

export const MisskeyProfileBanner = ({
  user,
  className = "",
}: {
  user: MisskeyUser;
  className?: string;
}) => {
  return (
    <ProfileBanner
      className={className}
      username={user.name}
      handle={`${user.username}@${user.host}`}
      avatarUrl={user.avatarUrl}
    />
  );
};
