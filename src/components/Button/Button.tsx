"use client";

import React from "react";
import "./Button.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  ...props
}) => {
  const buttonClasses = [
    "admin-button",
    `admin-button-${variant}`,
    size !== "md" ? `admin-button-${size}` : "",
    fullWidth ? "admin-button-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={buttonClasses} {...props}>
      {leftIcon && <span className="admin-button-icon-left">{leftIcon}</span>}
      {children}
      {rightIcon && (
        <span className="admin-button-icon-right">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;
