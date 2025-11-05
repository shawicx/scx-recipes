import React from "react";
import { Button as AntButton, type ButtonProps as AntButtonProps } from "antd";

export interface ButtonProps {
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  children?: React.ReactNode;
  [key: string]: any; // Allow other props to be passed through
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
  // Map our custom variants to Ant Design types
  let buttonType: "link" | "text" | "default" | "primary" | "dashed" = "primary";
  switch (variant) {
    case "outline":
      buttonType = "default";
      break;
    case "secondary":
      buttonType = "default";
      break;
    case "danger":
      buttonType = "primary";
      className += " bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600";
      break;
    default:
      buttonType = "primary";
  }

  // Map our custom sizes to Ant Design sizes
  let antSize: "small" | "middle" | "large" | undefined = "middle";
  switch (size) {
    case "small":
      antSize = "small";
      break;
    case "large":
      antSize = "large";
      break;
    default:
      antSize = "middle";
  }

  // Add custom styling for outline variant
  if (variant === "outline") {
    className += " border-2";
  }

  return (
    <AntButton
      type={buttonType}
      size={antSize}
      disabled={disabled}
      onClick={onClick}
      htmlType={type as "button" | "submit" | "reset" | undefined}
      className={className}
      {...props}
    >
      {children}
    </AntButton>
  );
};

export default Button;
