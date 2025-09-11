import { useSession } from "@tanstack/react-start/server";

interface TwitterUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  accessToken: string;
}

export type Session = {
  twitter?: TwitterUser;
};

export async function getOptionalSession() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return await useSession<Session>({
    password: process.env.COOKIE_PASSWORD as string,
  });
}
