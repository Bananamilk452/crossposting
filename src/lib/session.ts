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

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  host?: string;
}

export type Session = {
  twitter?: User;
  bluesky?: User;
  misskey?: User;
  twitterAccessToken?: string;
  misskeyAccessToken?: string;
};

export async function getOptionalSession() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return await useSession<Session>({
    password: process.env.COOKIE_PASSWORD as string,
  });
}
