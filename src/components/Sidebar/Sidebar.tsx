"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, Settings } from "lucide-react";
import "./Sidebar.css";

interface SidebarProps {
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <aside
        className={`admin-sidebar ${
          collapsed ? "admin-sidebar-collapsed" : ""
        }`}
      >
        {children}
      </aside>
      <button
        className={`admin-sidebar-toggle-button ${
          collapsed ? "admin-sidebar-toggle-button-collapsed" : ""
        }`}
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </>
  );
};

interface SidebarSectionProps {
  title?: string;
  children: React.ReactNode;
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({
  title,
  children,
}) => {
  return (
    <div className="admin-sidebar-section">
      {title && <h4 className="admin-sidebar-section-title">{title}</h4>}
      <nav className="admin-sidebar-nav">{children}</nav>
    </div>
  );
};

interface SidebarLinkProps {
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export const SidebarLink: React.FC<SidebarLinkProps> = ({
  href,
  icon,
  active = false,
  children,
  onClick,
}) => {
  return (
    <a
      href={href}
      className={`admin-sidebar-link ${active ? "active" : ""}`}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {icon && <span className="admin-sidebar-link-icon">{icon}</span>}
      <span>{children}</span>
    </a>
  );
};

// Hazır kullanım için örnek sidebar
export const AdminSidebar: React.FC = () => {
  return (
    <Sidebar>
      <SidebarSection>
        <SidebarLink
          href="/easy-adminpanel"
          icon={<LayoutGrid size={18} />}
          active
        >
          Kart Görünümü
        </SidebarLink>
        <SidebarLink
          href="/easy-adminpanel/manage-tables"
          icon={<Settings size={18} />}
        >
          Tabloları Yönet
        </SidebarLink>
      </SidebarSection>
      <SidebarSection title="Tablolar">
        {/* Burada tablolar listelenecek */}
        <div>Tablolar burada listelenecek</div>
      </SidebarSection>
    </Sidebar>
  );
};

export default Sidebar;
