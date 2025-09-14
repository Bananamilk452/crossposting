import ky from "ky";

export async function twitterUploadMedia(accessToken: string, file: File) {
  const formData = new FormData();
  formData.append("media", file);
  formData.append("media_category", "tweet_image");

  const res = await ky
    .post<{ data: { id: string } }>("https://api.x.com/2/media/upload", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    })
    .json();

  return { id: res.data.id };
}
