import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const resizeImage = async (
  file: File,
  limit?: number,
): Promise<File> => {
  const image = await createImageFromFile(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Failed to get canvas context");
  }

  const quality = 0.8;

  const resizedBlob = await encodeAndResizeIfNeeded(
    canvas,
    context,
    image,
    image.width,
    image.height,
    quality,
    limit,
  );

  return new File([resizedBlob], file.name.replace(/\.[^/.]+$/, ".webp"), {
    type: "image/webp",
    lastModified: Date.now(),
  });
};

const createImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      resolve(image);
      URL.revokeObjectURL(url);
    };
    image.onerror = (error) => {
      reject(error);
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });
};

const encodeAndResizeIfNeeded = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  quality: number,
  limit?: number,
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          return reject(new Error("Canvas to Blob conversion failed"));
        }

        if (limit && blob.size > limit && (width > 1 || height > 1)) {
          const newWidth = Math.floor(width / 2);
          const newHeight = Math.floor(height / 2);
          resolve(
            encodeAndResizeIfNeeded(
              canvas,
              context,
              image,
              newWidth,
              newHeight,
              quality,
              limit,
            ),
          );
        } else {
          resolve(blob);
        }
      },
      "image/webp",
      quality,
    );
  });
};
