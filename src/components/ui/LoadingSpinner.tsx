"use client";

import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
}) => {
  const sizeClass = {
    sm: "h-6 w-6 border-2",
    md: "h-12 w-12 border-t-2 border-b-2",
    lg: "h-16 w-16 border-[3px]",
  };

  return (
    <div className="flex justify-center items-center h-64">
      <div
        className={`animate-spin rounded-full ${sizeClass[size]} border-blue-500 ${className}`}
      />
    </div>
  );
};

export default LoadingSpinner;
