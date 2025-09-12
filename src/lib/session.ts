import { useSession } from "@tanstack/react-start/server";

export interface TwitterUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}
export interface BlueskyUser {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
  description?: string;
  banner?: string;
}

export interface MisskeyUser {
  id: string;
  name: string;
  username: string;
  host: string;
  avatarUrl?: string;
}

export type Session = {
  twitter?: TwitterUser & { accessToken: string };
  bluesky?: BlueskyUser;
  misskey?: MisskeyUser & { accessToken: string };
};

export async function getOptionalSession() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return await useSession<Session>({
    password: process.env.COOKIE_PASSWORD as string,
  });
}
