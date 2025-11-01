import React from "react";
import { Button } from "@heroui/react";
import "./Alert.css";

export interface AlertProps {
  type?: "info" | "success" | "warning" | "error";
  message: string;
  onClose?: () => void;
  showIcon?: boolean;
}

const Alert: React.FC<AlertProps> = ({
  type = "info",
  message,
  onClose,
  showIcon = false,
}) => {
  const typeToIcon = {
    info: "ℹ️",
    success: "✓",
    warning: "⚠️",
    error: "❌",
  };

  return (
    <div className={`alert alert--${type}`}>
      {showIcon && <span className="alert__icon">{typeToIcon[type]}</span>}
      <span className="alert__message">{message}</span>
      {onClose && (
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={onClose}
          aria-label="关闭提示"
          className="alert__close-btn"
        >
          &times;
        </Button>
      )}
    </div>
  );
};

export default Alert;
