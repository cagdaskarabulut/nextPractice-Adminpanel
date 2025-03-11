"use client";

import React from "react";
import { Layout } from "./components/Layout/Layout";
import { AdminSidebar } from "./components/Sidebar/Sidebar";
import "./styles/global.css";

export interface AdminPanelProps {
  title?: string;
  children?: React.ReactNode;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  title = "Easy-AdminPanel",
  children,
}) => {
  return (
    <Layout title={title}>
      <AdminSidebar />
      <div style={{ paddingLeft: "16rem" }}>{children}</div>
    </Layout>
  );
};

export default AdminPanel;

// Re-export diğer komponentler
export { Layout } from "./components/Layout/Layout";
export { Button } from "./components/Button/Button";
export { Card } from "./components/Card/Card";
export {
  Sidebar,
  SidebarSection,
  SidebarLink,
} from "./components/Sidebar/Sidebar";
export { Table, TablePagination } from "./components/Table/Table";
