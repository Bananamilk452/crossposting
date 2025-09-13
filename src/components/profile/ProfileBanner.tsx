import { User } from "~/lib/session";
import { cn } from "~/utils";

interface ProfileBannerProps {
  className?: string;
  user: User;
}

export function ProfileBanner({ className, user }: ProfileBannerProps) {
  return (
    <div className={cn("flex min-w-0 gap-2 rounded-lg border p-2", className)}>
      <img src={user.avatar} alt="Avatar" className="size-8 rounded-full" />
      <div className="flex min-w-0 flex-col">
        <h3 className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold">
          {user.name}
        </h3>
        <p className="overflow-hidden text-ellipsis whitespace-nowrap text-xs text-gray-600">
          @{user.handle}
          {user.host ? `@${user.host}` : ""}
        </p>
      </div>
    </div>
  );
}
