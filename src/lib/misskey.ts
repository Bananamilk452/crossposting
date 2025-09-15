import * as arctic from "arctic";
import { createS256CodeChallenge } from "arctic/dist/oauth2";
import ky from "ky";

import { MISSKEY } from "~/constants";
import { MisskeyUser } from "~/lib/session";
import { resizeImage } from "~/server/utils";

interface OAuthEndpoint {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
}

const scope = MISSKEY.SCOPES.join(" ");

export async function getOAuth2Endpoint(hostname: string) {
  const res = await ky
    .get<OAuthEndpoint>(
      `https://${hostname}/.well-known/oauth-authorization-server`,
    )
    .json();

  return {
    issuer: res.issuer,
    authorizationEndpoint: res.authorization_endpoint,
    tokenEndpoint: res.token_endpoint,
  };
}

export async function getOAuth2CallbackURL(authorizationEndpoint: string) {
  const state = arctic.generateState();
  const codeVerifier = arctic.generateCodeVerifier();
  const codeChallenge = createS256CodeChallenge(codeVerifier);

  const searchParams = new URLSearchParams({
    client_id: MISSKEY.CLIENT_ID,
    response_type: "code",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    redirect_uri: MISSKEY.REDIRECT_URI,
    scope,
    state,
  });

  return {
    url: `${authorizationEndpoint}?${searchParams.toString()}`,
    codeVerifier,
    state,
  };
}

export async function validateAuthorizationCode(
  tokenEndpoint: string,
  code: string,
  codeVerifier: string,
) {
  const { access_token } = await ky
    .post<{ access_token: string }>(tokenEndpoint, {
      json: {
        grant_type: "authorization_code",
        // traling slash 붙이는 이유 = 버그
        client_id: MISSKEY.CLIENT_ID + "/",
        redirect_uri: MISSKEY.REDIRECT_URI,
        scope,
        code,
        code_verifier: codeVerifier,
      },
    })
    .json();

  return {
    accessToken: access_token,
  };
}

export async function getMe(hostname: string, accessToken: string) {
  const user = await ky
    .post<MisskeyUser>(`https://${hostname}/api/i`, {
      json: {},
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .json();

  return user;
}

export async function createNote(
  hostname: string,
  accessToken: string,
  params: { content: string; visibility: string; mediaIds?: string[] },
) {
  const { content, visibility } = params;

  const note = await ky
    .post<{ createdNote: { id: string } }>(
      `https://${hostname}/api/notes/create`,
      {
        json: {
          text: content,
          visibility,
          mediaIds:
            params.mediaIds && params.mediaIds?.length > 0
              ? params.mediaIds
              : undefined,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )
    .json();

  return note.createdNote.id;
}

export async function driveCreate(
  hostname: string,
  accessToken: string,
  file: File,
) {
  const image = new Blob([await resizeImage(file)], { type: "image/webp" });

  const formData = new FormData();
  formData.append("file", image);

  const note = await ky
    .post<{ id: string }>(`https://${hostname}/api/drive/files/create`, {
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .json();

  return { id: note.id };
}
