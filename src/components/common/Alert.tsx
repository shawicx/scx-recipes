import React from "react";
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
        <button
          className="alert__close-btn"
          onClick={onClose}
          aria-label="关闭提示"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;
