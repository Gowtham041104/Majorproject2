import React from "react";
import { resolveImageUrl } from "../utils/imageUrl";

function Avatar({
  src,
  alt,
  size = 50,
  rounded = true,
  className = "",
  border = true,
}) {
  const pixelSize = typeof size === "number" ? `${size}px` : size;
  const classes = `${rounded ? "rounded-circle" : ""} ${className}`.trim();
  const style = {
    width: pixelSize,
    height: pixelSize,
    objectFit: "cover",
    ...(border ? { border: "2px solid #e9ecef" } : {}),
  };

  return (
    <img
      src={resolveImageUrl(src || "https://via.placeholder.com/50")}
      alt={alt}
      className={classes}
      style={style}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = "https://via.placeholder.com/50";
      }}
    />
  );
}

export default Avatar;


