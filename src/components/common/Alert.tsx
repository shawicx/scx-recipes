import React from "react";
import { Alert as AntAlert, type AlertProps as AntAlertProps } from "antd";
import Button from "./Button";

export interface AlertProps extends AntAlertProps {
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
  ...props
}) => {
  return (
    <AntAlert
      message={message}
      type={type}
      showIcon={showIcon}
      closable={!!onClose}
      onClose={onClose}
      {...props}
    />
  );
};

export default Alert;
