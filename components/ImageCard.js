import Image from "next/image";

export default function ImageCard({ src, alt, type, noPaddingBottom, crop }) {
  if (!src) return null;

  const isScreen = type === "screen";
  const isContentful = src.startsWith("https://");

  const cardClasses = [
    "home-card",
    isScreen ? "home-card-screen" : "home-card-component",
    noPaddingBottom ? (isScreen ? "home-card-screen-pb0" : "home-card-component-pb0") : "",
    "animate-in-card",
  ]
    .filter(Boolean)
    .join(" ");

  const imgClasses = ["home-card-img", crop ? "home-card-img-crop" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClasses}>
      <div className={imgClasses}>
        {isContentful ? (
          <Image
            src={src}
            alt={alt}
            width={isScreen ? 4128 : 2000}
            height={isScreen ? 2429 : 1500}
            sizes={isScreen ? "(max-width: 768px) 100vw, 55vw" : "(max-width: 768px) 100vw, 27vw"}
            loading={undefined}
            quality={85}
          />
        ) : (
          <img
            src={src}
            alt={alt}
            width={isScreen ? 4128 : 2000}
            height={isScreen ? 2429 : 1500}
            loading="lazy"
            decoding="async"
          />
        )}
      </div>
    </div>
  );
}
