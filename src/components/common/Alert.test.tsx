import React from "react";
import { render, screen } from "@testing-library/react";
import Alert, { AlertProps } from "../Alert";

describe("Alert Component", () => {
  const defaultProps: AlertProps = {
    message: "Test message",
  };

  it("renders correctly with default props", () => {
    render(<Alert {...defaultProps} />);

    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("renders with correct type class", () => {
    render(<Alert {...defaultProps} type="error" />);

    const alert = screen.getByText("Test message").closest(".alert");
    expect(alert).toHaveClass("alert--error");
  });

  it("renders with icon when showIcon is true", () => {
    render(<Alert {...defaultProps} type="success" showIcon={true} />);

    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("does not render close button when onClose is not provided", () => {
    render(<Alert {...defaultProps} />);

    const closeBtn = screen.queryByRole("button", { name: /close/i });
    expect(closeBtn).not.toBeInTheDocument();
  });

  it("renders close button when onClose is provided", () => {
    const onClose = jest.fn();
    render(<Alert {...defaultProps} onClose={onClose} />);

    const closeBtn = screen.getByRole("button", { name: /close/i });
    expect(closeBtn).toBeInTheDocument();

    closeBtn.click();
    expect(onClose).toHaveBeenCalled();
  });
});
