"use client";

import React from "react";
import "./Card.css";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  className = "",
}) => {
  return (
    <div className={`admin-card ${className}`}>
      {(title || subtitle) && (
        <div className="admin-card-header">
          {title && <h3 className="admin-card-title">{title}</h3>}
          {subtitle && <div className="admin-card-subtitle">{subtitle}</div>}
        </div>
      )}
      <div className="admin-card-content">{children}</div>
      {footer && <div className="admin-card-footer">{footer}</div>}
    </div>
  );
};

export default Card;
