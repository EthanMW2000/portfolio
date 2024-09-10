/* eslint-disable @next/next/no-img-element */

import { S3Object } from "@/types";

export function ImageContainer({ s3Object }: { s3Object: S3Object }) {
  const formattedDate = s3Object.metadata.DateTimeOriginal
    ? new Date(s3Object.metadata.DateTimeOriginal).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown Date";

  return (
    <div className="w-[300px] h-[200px] drop-shadow-xl rounded-lg bg-gray-500">
      <img
        src={s3Object.url}
        alt="A photograph"
        className="rounded-lg object-contain"
      />
      <div className="w-full h-[30px] absolute bottom-0 bg-secondary/50 px-2 flex flex-row items-center">
        <h1 className="text-lg text-primary-button text-shadow-outline">{formattedDate}</h1>
      </div>
    </div>
  );
}
