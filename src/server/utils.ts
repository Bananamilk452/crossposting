import sharp from "sharp";

export async function resizeImage(file: File, limit?: number) {
  let webp = sharp(Buffer.from(await file.arrayBuffer())).webp({
    quality: 90,
  });

  const metadata = await webp.metadata();

  if (limit && metadata.size && metadata.size > limit) {
    webp = webp.resize({ width: metadata.width / 2, fit: "inside" });
  }

  const buffer = (await webp.toBuffer()) as Buffer<ArrayBuffer>;

  return buffer;
}
