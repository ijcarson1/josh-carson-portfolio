"use client";

import { useLightboxOpen } from "./ImageLightbox";
import ImageCard from "./ImageCard";

export default function ClickableImageCard({ index, ...imageProps }) {
  const openLightbox = useLightboxOpen();

  return (
    <div
      className="lightbox-trigger"
      onClick={() => openLightbox(index)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(index);
        }
      }}
      aria-label={`View ${imageProps.alt || "image"} in lightbox`}
    >
      <ImageCard {...imageProps} />
    </div>
  );
}
