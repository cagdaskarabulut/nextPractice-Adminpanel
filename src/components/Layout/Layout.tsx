"use client";

import React from "react";
import { Database } from "lucide-react";
import "./Layout.css";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title = "Easy-AdminPanel",
}) => {
  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-container">
          <div className="admin-header-inner">
            <a href="/easy-adminpanel" className="admin-logo">
              <Database size={26} className="admin-logo-icon" />
              <h1 className="admin-logo-text">{title}</h1>
            </a>
            <div className="admin-header-actions">
              {/* İsterseniz buraya ekstra butonlar ekleyebilirsiniz */}
            </div>
          </div>
        </div>
      </header>
      <div className="admin-header-spacer"></div>
      <main className="admin-main">
        <div className="admin-container">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
