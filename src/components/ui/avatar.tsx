"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    src?: string | null;
    alt?: string;
    fallback?: string;
  }
>(({ className, src, alt, fallback, ...props }, ref) => {
  const [error, setError] = React.useState(false);

  if (!src || error) {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-notix-bg",
          className
        )}
        {...props}
      >
        <span className="flex h-full w-full items-center justify-center text-sm font-medium text-notix-textMuted">
          {fallback || alt?.charAt(0).toUpperCase() || "?"}
        </span>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <img
        src={src}
        alt={alt || ""}
        className="aspect-square h-full w-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
});
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, ...props }, ref) => (
  <img
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-notix-bg",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };