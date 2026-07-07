import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import {
  BUTTON_BASE_CLASSES,
  SIZE_CLASSES,
  VARIANT_CLASSES,
  type ButtonSize,
  type ButtonVariant,
} from "./Button";

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  external?: boolean;
}

const NATIVE_LINK_PREFIXES = ["http://", "https://", "tel:", "mailto:"];

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  external,
  children,
  ...rest
}: LinkButtonProps) {
  const classes = cn(BUTTON_BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className);
  const isNativeLink = external || NATIVE_LINK_PREFIXES.some((prefix) => href.startsWith(prefix));

  if (isNativeLink) {
    return (
      <a
        href={href}
        className={classes}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}
