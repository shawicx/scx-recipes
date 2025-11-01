import React from "react";
import {
  Button as HeroUIButton,
  type ButtonProps as HeroUIButtonProps,
} from "@heroui/react";

export interface ButtonProps
  extends Omit<HeroUIButtonProps, "variant" | "size"> {
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  onClick,
  type = "button",
  className = "",
  ...props
}) => {
  // Map our custom variants to hero-ui variants
  let heroVariant: HeroUIButtonProps["variant"] = "solid";
  switch (variant) {
    case "outline":
      heroVariant = "bordered";
      break;
    case "secondary":
      heroVariant = "light";
      break;
    case "danger":
      heroVariant = "solid";
      break;
    default:
      heroVariant = "solid";
  }

  // Map our custom sizes to hero-ui sizes
  let heroSize: HeroUIButtonProps["size"] = "md";
  switch (size) {
    case "small":
      heroSize = "sm";
      break;
    case "large":
      heroSize = "lg";
      break;
    default:
      heroSize = "md";
  }

  const color = variant === "danger" ? "danger" : "primary";

  return (
    <HeroUIButton
      variant={heroVariant}
      size={heroSize}
      color={color}
      disabled={disabled}
      onClick={onClick}
      type={type}
      className={className}
      {...props}
    >
      {children}
    </HeroUIButton>
  );
};

export default Button;
