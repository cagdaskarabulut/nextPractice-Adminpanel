#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Functions for colored console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

console.log(
  `${colors.bright}${colors.blue}Easy-AdminPanel ${colors.yellow}Integration Assistant${colors.reset}\n`
);

// Project root directory
const projectRoot = process.cwd();

// Helper directory location
const helperDir = path.join(__dirname);

// Clean up old files (if they exist)
const cleanupOldFiles = () => {
  // We no longer delete the admin folder since we're using easy-adminpanel
  // Check for and remove old admin directory
  const adminDir = path.join(projectRoot, "src", "app", "admin");
  if (fs.existsSync(adminDir)) {
    console.log(
      `${colors.yellow}⚠️ ${colors.reset}Old admin directory found. Removing...`
    );
    try {
      fs.rmSync(adminDir, { recursive: true, force: true });
      console.log(
        `${colors.green}✓ ${colors.reset}Old directory successfully removed.`
      );
    } catch (error) {
      console.error(
        `${colors.red}✗ ${colors.reset}Couldn't remove old directory: ${error.message}`
      );
    }
  }
};

// Create target directories
const createDirectories = () => {
  const dirs = [
    path.join(projectRoot, "src", "components", "ui"),
    path.join(projectRoot, "src", "components", "utils"),
    path.join(projectRoot, "src", "components", "dialogs"),
    path.join(projectRoot, "src", "components", "layout"),
    path.join(projectRoot, "src", "styles"),
    path.join(projectRoot, "src", "app", "easy-adminpanel"), // using easy-adminpanel instead of admin folder
    // API directories
    path.join(projectRoot, "src", "app", "api", "tables"),
    path.join(projectRoot, "src", "app", "api", "all-tables"),
    path.join(projectRoot, "src", "app", "api", "save-tables"),
    path.join(projectRoot, "src", "app", "api", "create-table"),
    path.join(projectRoot, "src", "app", "api", "resources", "[table]"),
    // Additional directories for enhanced UI
    path.join(projectRoot, "src", "components", "icons"),
    path.join(projectRoot, "src", "components", "navigation"),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`${colors.green}✓ ${colors.reset}Directory created: ${dir}`);
    }
  });
};

// Create API route files
const createApiRoutes = () => {
  console.log(`${colors.yellow}» ${colors.reset}Creating API route files...`);

  // API file contents
  const tablesApiContent = `import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const tablesPath = path.join(process.cwd(), 'tables.json');
    
    if (!fs.existsSync(tablesPath)) {
      return NextResponse.json({ tables: [] });
    }
    
    const tablesData = fs.readFileSync(tablesPath, 'utf8');
    const tables = JSON.parse(tablesData);
    
    return NextResponse.json({ tables });
  } catch (error) {
    console.error('Error getting tables:', error);
    return NextResponse.json(
      { error: 'Failed to get tables' },
      { status: 500 }
    );
  }
}`;

  const allTablesApiContent = `import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    
    const result = await client.query(\`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    \`);
    
    client.release();
    
    const tables = result.rows.map(row => row.table_name);
    
    return NextResponse.json({ tables });
  } catch (error) {
    console.error('Error getting database tables:', error);
    return NextResponse.json(
      { error: 'Failed to get database tables' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}`;

  const saveTablesApiContent = `import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { tables } = await request.json();
    
    const tablesPath = path.join(process.cwd(), 'tables.json');
    fs.writeFileSync(tablesPath, JSON.stringify(tables, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving tables:', error);
    return NextResponse.json(
      { error: 'Failed to save tables' },
      { status: 500 }
    );
  }
}`;

  const createTableApiContent = `import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST(request: Request) {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const { tableName, columns } = await request.json();
    
    if (!tableName || !columns || !Array.isArray(columns) || columns.length === 0) {
      return NextResponse.json(
        { error: 'Invalid table information' },
        { status: 400 }
      );
    }
    
    const client = await pool.connect();
    
    // Create column definitions
    const columnDefinitions = columns
      .map(col => \`\${col.name} \${col.type}\${col.constraints ? ' ' + col.constraints : ''}\`)
      .join(', ');
    
    const createTableQuery = \`
      CREATE TABLE IF NOT EXISTS \${tableName} (
        id SERIAL PRIMARY KEY,
        \${columnDefinitions}
      )
    \`;
    
    await client.query(createTableQuery);

    client.release();
    
    return NextResponse.json({ 
      success: true,
      message: \`Table \${tableName} created successfully\` 
    });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}`;

  const resourcesApiContent = `import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// GET - Get all records or a specific record
export async function GET(
  request: Request,
  { params }: { params: { table: string } }
) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const range = searchParams.get('range');
  const sort = searchParams.get('sort');
  const filter = searchParams.get('filter');
  
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    let query = '';
    let result;
    
    // Single record query
    if (id) {
      query = \`SELECT * FROM \${params.table} WHERE id = $1\`;
      result = await client.query(query, [id]);
      client.release();
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Record not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(result.rows[0]);
    }
    
    // Range query
    else if (range) {
      const [start, end] = JSON.parse(range);
      const limit = end - start + 1;
      const offset = start;
      
      // Sorting
      let orderBy = '';
      if (sort) {
        const [field, order] = JSON.parse(sort);
        orderBy = \`ORDER BY \${field} \${order === 'ASC' ? 'ASC' : 'DESC'}\`;
      }
      
      // Filtering
      let whereClause = '';
      let queryParams: any[] = [];
      if (filter) {
        const filterObj = JSON.parse(filter);
        const conditions = [];
        let paramIndex = 1;
        
        for (const [key, value] of Object.entries(filterObj)) {
          if (value !== undefined && value !== null) {
            conditions.push(\`\${key} = $\${paramIndex}\`);
            queryParams.push(value);
            paramIndex++;
          }
        }
        
        if (conditions.length > 0) {
          whereClause = \`WHERE \${conditions.join(' AND ')}\`;
        }
      }
      
      // Count query
      const countQuery = \`SELECT COUNT(*) FROM \${params.table} \${whereClause}\`;
      const countResult = await client.query(countQuery, queryParams);
      const totalCount = parseInt(countResult.rows[0].count);
      
      // Data query
      query = \`
        SELECT * FROM \${params.table}
        \${whereClause}
        \${orderBy}
        LIMIT \${limit} OFFSET \${offset}
      \`;
      
      result = await client.query(query, queryParams);
      client.release();
      
      // Response with Content-Range header
      const headers = new Headers();
      headers.append('Content-Range', \`\${params.table} \${start}-\${end}/\${totalCount}\`);
      
      return new NextResponse(JSON.stringify(result.rows), {
        headers,
        status: 200
      });
    }
    
    // Get all records
    else {
      query = \`SELECT * FROM \${params.table}\`;
      result = await client.query(query);
      client.release();
      
      return NextResponse.json(result.rows);
    }
  } catch (error) {
    console.error(\`Error getting data from \${params.table} table:\`, error);
    return NextResponse.json(
      { error: 'Failed to get data' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}

// POST - Create a new record
export async function POST(
  request: Request,
  { params }: { params: { table: string } }
) {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const data = await request.json();
    const client = await pool.connect();
    
    // Create arrays of fields and values from the data object
    const fields = Object.keys(data);
    const values = Object.values(data);
    
    // Create a parameterized query
    const placeholders = fields.map((_, index) => \`$\${index + 1}\`).join(', ');
    const query = \`
      INSERT INTO \${params.table} (\${fields.join(', ')})
      VALUES (\${placeholders})
      RETURNING *
    \`;
    
    const result = await client.query(query, values);
    client.release();
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error(\`Error adding record to \${params.table} table:\`, error);
    return NextResponse.json(
      { error: 'Failed to create record' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}

// PUT - Update an existing record
export async function PUT(
  request: Request,
  { params }: { params: { table: string } }
) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { error: 'ID parameter is required' },
      { status: 400 }
    );
  }
  
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const data = await request.json();
    const client = await pool.connect();
    
    // Prepare fields to update
    const updates = Object.entries(data)
      .map(([key, _], index) => \`\${key} = $\${index + 1}\`)
      .join(', ');
    
    // Put id value at the end
    const values = [...Object.values(data), id];
    
    const query = \`
      UPDATE \${params.table}
      SET \${updates}
      WHERE id = $\${values.length}
      RETURNING *
    \`;
    
    const result = await client.query(query, values);
    client.release();
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Record to update not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(\`Error updating record in \${params.table} table:\`, error);
    return NextResponse.json(
      { error: 'Failed to update record' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}

// DELETE - Delete a record
export async function DELETE(
  request: Request,
  { params }: { params: { table: string } }
) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { error: 'ID parameter is required' },
      { status: 400 }
    );
  }
  
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    
    const query = \`
      DELETE FROM \${params.table}
      WHERE id = $1
      RETURNING *
    \`;
    
    const result = await client.query(query, [id]);
    client.release();
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Record to delete not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(\`Error deleting record from \${params.table} table:\`, error);
    return NextResponse.json(
      { error: 'Failed to delete record' },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}`;

  // Create API files
  const tablesApiPath = path.join(
    projectRoot,
    "src",
    "app",
    "api",
    "tables",
    "route.ts"
  );
  const allTablesApiPath = path.join(
    projectRoot,
    "src",
    "app",
    "api",
    "all-tables",
    "route.ts"
  );
  const saveTablesApiPath = path.join(
    projectRoot,
    "src",
    "app",
    "api",
    "save-tables",
    "route.ts"
  );
  const createTableApiPath = path.join(
    projectRoot,
    "src",
    "app",
    "api",
    "create-table",
    "route.ts"
  );
  const resourcesApiPath = path.join(
    projectRoot,
    "src",
    "app",
    "api",
    "resources",
    "[table]",
    "route.ts"
  );

  // Write API files
  fs.writeFileSync(tablesApiPath, tablesApiContent);
  console.log(`${colors.green}✓ ${colors.reset}Created: ${tablesApiPath}`);

  fs.writeFileSync(allTablesApiPath, allTablesApiContent);
  console.log(`${colors.green}✓ ${colors.reset}Created: ${allTablesApiPath}`);

  fs.writeFileSync(saveTablesApiPath, saveTablesApiContent);
  console.log(`${colors.green}✓ ${colors.reset}Created: ${saveTablesApiPath}`);

  fs.writeFileSync(createTableApiPath, createTableApiContent);
  console.log(`${colors.green}✓ ${colors.reset}Created: ${createTableApiPath}`);

  fs.writeFileSync(resourcesApiPath, resourcesApiContent);
  console.log(`${colors.green}✓ ${colors.reset}Created: ${resourcesApiPath}`);
};

// Create admin pages
const createAdminPages = () => {
  console.log(
    `${colors.yellow}» ${colors.reset}Creating Enhanced Easy-AdminPanel pages...`
  );

  // Default content for admin pages - updated to use full screen theme
  const defaultLayoutContent = `import React from "react";
import ClientStyleInjector from "./ClientStyleInjector";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen easy-adminpanel">
      <ClientStyleInjector />
      {children}
    </div>
  );
}`.trim();

  const defaultPageContent = `"use client";

import { AdminPanel } from "@/components/AdminPanel";

export default function EasyAdminPage() {
  const title = process.env.EASY_ADMIN_TITLE || "Easy Admin Panel";

  return <AdminPanel title={title} />;
}`.trim();

  const recordsPageContent = `"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
// İcon bileşenlerini direkt olarak tanımlayalım
// import { DatabaseIcon, GridIcon, TableIcon } from '@/styles/adminpanel';

// Icons
const DatabaseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);

const TableIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M3 3h18v18H3zM3 9h18M9 21V9"></path>
  </svg>
);

const GridIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

export default function RecordsPage() {
  const searchParams = useSearchParams();
  const table = searchParams.get('table');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cssLoaded, setCssLoaded] = useState(false);
  const [dbInfo, setDbInfo] = useState({
    connected: true,
    type: "postgresql",
  });

  useEffect(() => {
    // Mark CSS as loaded after a small delay to match AdminPanel behavior
    setTimeout(() => {
      setCssLoaded(true);
    }, 300);
    
    if (!table) return;
    
    // Get records
    setLoading(true);
    fetch(\`/api/resources/\${table}\`)
      .then(res => res.json())
      .then(data => {
        setRecords(data);
        if (data.length > 0) {
          // Dynamically determine table columns
          setColumns(Object.keys(data[0]));
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error getting records:", error);
        setLoading(false);
      });
  }, [table]);

  const handleBack = () => {
    window.location.href = '/easy-adminpanel';
  };

  const handleEdit = (id) => {
    window.location.href = \`/easy-adminpanel/edit-record?table=\${table}&id=\${id}\`;
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this record?')) {
      fetch(\`/api/resources/\${table}/\${id}\`, {
        method: 'DELETE',
      })
        .then(res => {
          if (res.ok) {
            setRecords(records.filter(record => record.id !== id));
          }
        })
        .catch(error => {
          console.error("Error deleting record:", error);
        });
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div
      className={\`easy-adminpanel w-full min-h-screen flex \${
        !cssLoaded ? "loading" : ""
      }\`}
    >
      {/* Enhanced Sidebar with better organization */}
      <div
        className={\`easy-adminpanel-sidebar transition-all duration-300 ease-in-out \${
          !sidebarOpen ? "w-0 opacity-0" : "w-64 opacity-100"
        }\`}
        style={{
          overflow: sidebarOpen ? "visible" : "hidden",
          visibility: sidebarOpen ? "visible" : "hidden",
          boxShadow: sidebarOpen ? "2px 0 8px rgba(0, 0, 0, 0.15)" : "none",
          paddingTop: "4.5rem" /* Add padding to account for fixed header */,
        }}
      >
        <div className="easy-adminpanel-sidebar-header">
          <div className="easy-adminpanel-sidebar-logo">
            <DatabaseIcon />
            <span>Easy Admin Panel</span>
          </div>
        </div>

        <div className="easy-adminpanel-sidebar-nav">
          {/* Main Menu Section */}
          <div className="easy-adminpanel-sidebar-section">
            <h3 className="easy-adminpanel-sidebar-section-title">Menu</h3>
            <div
              className="easy-adminpanel-sidebar-nav-item"
              onClick={() => (window.location.href = "/easy-adminpanel")}
            >
              <DatabaseIcon />
              <span>Database Tables</span>
            </div>
            <div
              className="easy-adminpanel-sidebar-nav-item"
            >
              <GridIcon />
              <span>Card View</span>
            </div>
          </div>

          {/* Tables Section */}
          <div className="easy-adminpanel-sidebar-section">
            <h3 className="easy-adminpanel-sidebar-section-title">Tables</h3>
            <div
              className="easy-adminpanel-sidebar-nav-item active"
              onClick={() => (window.location.href = \`/easy-adminpanel/records?table=\${table}\`)}
            >
              <TableIcon />
              <span>{table}</span>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-admin-dark-blue-700 text-admin-gray-400 text-xs">
          <p>Easy AdminPanel v3.5.0</p>
        </div>
      </div>

      <div className="easy-adminpanel-main flex-1 transition-all duration-300">
        {/* Fixed Header */}
        <header className="easy-adminpanel-header">
          <div className="admin-container">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="mr-4 p-2 rounded hover:bg-admin-dark-blue-700 transition-colors duration-200"
                  aria-label="Toggle sidebar"
                  title="Toggle sidebar"
                >
                  {sidebarOpen ? (
                    // Arrow left icon when sidebar is open
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-200"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  ) : (
                    // Hamburger menu icon when sidebar is closed
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-200"
                    >
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  )}
                </button>
                <div className="flex items-center">
                  <DatabaseIcon />
                  <h1 className="easy-adminpanel-title mb-0 ml-2">{table} Records</h1>
                </div>
              </div>

              {/* Header Icons */}
              <div className="flex items-center">
                <div className="easy-adminpanel-header-icons">
                  <div
                    className="easy-adminpanel-header-icon"
                    onClick={() => (window.location.href = "/easy-adminpanel")}
                    title="Admin Home"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </div>
                  <div className="easy-adminpanel-header-icon" title="Settings">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                  </div>
                  <div
                    className="easy-adminpanel-header-icon"
                    title="User Profile"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                </div>

                {/* Enhanced database connection status indicator */}
                <div className="relative group">
                  <div
                    className={\`admin-status-indicator \${
                      dbInfo.connected
                        ? "admin-status-online"
                        : "admin-status-offline"
                    } cursor-help\`}
                  >
                    <span className="admin-status-indicator-dot"></span>
                    <span>{dbInfo.connected ? "Bağlı" : "Bağlantı Yok"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="admin-container py-6">
          <div className="mb-6 flex items-center">
            <button 
              className="easy-adminpanel-button easy-adminpanel-button-secondary mr-4"
              onClick={handleBack}
            >
              ← Back
            </button>
            <div className="flex-grow"></div>
            <button 
              className="easy-adminpanel-button easy-adminpanel-button-primary"
              onClick={() => window.location.href = \`/easy-adminpanel/add-record?table=\${table}\`}
            >
              + Add New
            </button>
          </div>

          {loading ? (
            <div className="easy-adminpanel-card p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-blue-500"></div>
            </div>
          ) : records.length === 0 ? (
            <div className="easy-adminpanel-card">
              <p className="text-admin-gray-400 mb-4">
                No records found. You can add a new record using the "Add New" button.
              </p>
            </div>
          ) : (
            <div className="easy-adminpanel-card overflow-x-auto">
              <table className="admin-table w-full">
                <thead>
                  <tr>
                    {columns.map(column => (
                      <th key={column}>{column.toUpperCase()}</th>
                    ))}
                    <th className="text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(record => (
                    <tr key={record.id}>
                      {columns.map(column => (
                        <td key={\`\${record.id}-\${column}\`}>
                          {typeof record[column] === 'boolean' 
                            ? String(record[column]) 
                            : record[column] === null 
                              ? 'null' 
                              : String(record[column])}
                        </td>
                      ))}
                      <td>
                        <div className="admin-action-buttons">
                          <button 
                            onClick={() => handleEdit(record.id)}
                            className="admin-edit-button"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-4 h-4 mr-2"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(record.id)}
                            className="admin-delete-button"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-4 h-4 mr-2"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}`.trim();

  const addRecordPageContent = `"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AddRecordPage() {
  const searchParams = useSearchParams();
  const table = searchParams.get('table');
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState({});
  const [tableSample, setTableSample] = useState(null);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    if (!table) return;
    
    // Get a sample record to understand table structure
    fetch(\`/api/resources/\${table}\`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          setTableSample(data[0]);
          // Get all columns except ID
          const cols = Object.keys(data[0]).filter(key => key !== 'id');
          setColumns(cols);
          
          // Create an empty record
          const emptyRecord = {};
          cols.forEach(col => {
            emptyRecord[col] = '';
          });
          setRecord(emptyRecord);
        }
      })
      .catch(error => {
        console.error("Error determining table structure:", error);
      });
  }, [table]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRecord({
      ...record,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    fetch(\`/api/resources/\${table}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record)
    })
      .then(res => {
        if (res.ok) {
          // Success
          window.location.href = \`/easy-adminpanel/records?table=\${table}\`;
        } else {
          setLoading(false);
          alert('An error occurred while adding the record!');
        }
      })
      .catch(error => {
        console.error("Error adding record:", error);
        setLoading(false);
        alert('An error occurred while adding the record!');
      });
  };

  const handleBack = () => {
    window.location.href = \`/easy-adminpanel/records?table=\${table}\`;
  };

  return (
    <div className="admin-container py-6">
      <div className="mb-6 flex items-center">
        <button 
          className="easy-adminpanel-button easy-adminpanel-button-secondary mr-4"
          onClick={handleBack}
        >
          ← Back
        </button>
        <h1 className="easy-adminpanel-title">
          {table} - Add New Record
        </h1>
      </div>

      <div className="easy-adminpanel-card">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-blue-500"></div>
          </div>
        ) : columns.length === 0 ? (
          <p className="text-admin-gray-400">
            Could not determine table structure. Please ensure there is at least one record in the table.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {columns.map(column => (
              <div key={column} className="space-y-1">
                <label className="block text-sm">
                  {column}
                </label>
                <input
                  type="text"
                  name={column}
                  value={record[column] || ''}
                  onChange={handleInputChange}
                  className="admin-input w-full"
                  required
                />
              </div>
            ))}
            
            <div className="flex justify-end space-x-2 pt-4">
              <button 
                type="button"
                className="easy-adminpanel-button easy-adminpanel-button-secondary"
                onClick={handleBack}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="easy-adminpanel-button easy-adminpanel-button-primary"
                disabled={loading}
              >
                Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}`.trim();

  const defaultClientStyleInjectorContent = `"use client";

import { useEffect } from "react";
// injectStylesheet fonksiyonunu doğrudan içeri tanımlayalım
// import { injectStylesheet } from "../../styles/adminpanel";

export default function ClientStyleInjector() {
  // Stil enjeksiyon fonksiyonunu doğrudan burada tanımlayalım
  const injectStylesheet = () => {
    // Return a promise to track when stylesheet is loaded
    return new Promise((resolve) => {
      // If style is already loaded, don't load it again
      if (document.getElementById("easy-adminpanel-styles")) {
        resolve();
        return;
      }

      // Create a style element
      const style = document.createElement("style");
      style.id = "easy-adminpanel-styles";
      
      // Shortened CSS for brevity - actual CSS will be more extensive
      style.innerHTML = \`
        :root {
          --admin-dark-blue-900: #0D1F36;
          --admin-dark-blue-800: #12263F;
          --admin-dark-blue-700: #183054;
          --admin-dark-blue-600: #1D3A6A;
          --admin-dark-blue-500: #2E4780;
          --admin-blue-500: #3378FF;
          --admin-blue-400: #4A8CFF;
          --admin-blue-300: #75AAFF;
          --admin-gray-100: #F7F9FC;
          --admin-gray-200: #EAF0F7;
          --admin-gray-300: #D9E2EC;
          --admin-gray-400: #B3C2D1;
          --admin-gray-500: #8696A7;
          --admin-red-500: #FF3358;
          --admin-red-400: #FF5C7A;
          --admin-green-500: #10B981;
          --admin-green-400: #34D399;
        }

        .easy-adminpanel {
          min-height: 100vh;
          background-color: var(--admin-dark-blue-900);
          color: white;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .easy-adminpanel-header {
          border-bottom: 1px solid var(--admin-dark-blue-700);
          background-color: var(--admin-dark-blue-800);
          padding: 1.25rem 0;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 40;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .admin-container {
          max-width: 95%;
          margin-left: auto;
          margin-right: auto;
          padding-left: 0.5rem;
          padding-right: 0.5rem;
        }

        .easy-adminpanel-sidebar {
          width: 250px;
          background-color: var(--admin-dark-blue-800);
          min-height: 100vh;
          border-right: 1px solid var(--admin-dark-blue-700);
          padding: 0;
          display: flex;
          flex-direction: column;
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
        }

        .easy-adminpanel-main {
          flex: 1;
          min-width: 0;
          padding-top: 4.5rem;
        }

        .easy-adminpanel-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
        }

        .easy-adminpanel-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.6rem 1.2rem;
          border-radius: 0.5rem;
          font-weight: 500;
          margin-right: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .easy-adminpanel-button-primary {
          background-color: var(--admin-blue-500);
          color: white;
        }

        .easy-adminpanel-button-primary:hover {
          background-color: var(--admin-blue-400);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .easy-adminpanel-button-secondary {
          background-color: var(--admin-dark-blue-700);
          color: white;
        }

        .easy-adminpanel-button-secondary:hover {
          background-color: var(--admin-dark-blue-600);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .easy-adminpanel-card {
          background-color: var(--admin-dark-blue-800);
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 10px -2px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          border: 1px solid var(--admin-dark-blue-700);
          overflow: hidden;
        }

        .admin-table {
          width: 100%;
          text-align: left;
        }
        
        .admin-table th {
          padding: 0.75rem 1rem;
          color: var(--admin-gray-400);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          border-bottom: 1px solid var(--admin-dark-blue-700);
        }
        
        .admin-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--admin-dark-blue-700);
        }
        
        .admin-table tr:hover {
          background-color: var(--admin-dark-blue-700);
        }

        .admin-input {
          background-color: var(--admin-dark-blue-700);
          border: 1px solid var(--admin-dark-blue-600);
          color: white;
          border-radius: 0.375rem;
          padding: 0.5rem 1rem;
        }
        
        .admin-input:focus {
          outline: none;
          box-shadow: 0 0 0 2px var(--admin-blue-500);
        }

        /* Header Icons Styles */
        .easy-adminpanel-header-icons {
          display: flex;
          gap: 1rem;
          margin-right: 1rem;
        }
        
        .easy-adminpanel-header-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 0.5rem;
          color: var(--admin-gray-300);
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .easy-adminpanel-header-icon:hover {
          background-color: var(--admin-dark-blue-700);
          color: white;
          transform: translateY(-1px);
        }
        
        .easy-adminpanel-header-icon.active {
          background-color: var(--admin-blue-500);
          color: white;
        }

        /* Status Indicator Styles */
        .admin-status-indicator {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 500;
          font-size: 0.875rem;
        }
        
        .admin-status-online {
          background-color: rgba(34, 197, 94, 0.2);
          color: rgb(74, 222, 128);
        }
        
        .admin-status-offline {
          background-color: rgba(239, 68, 68, 0.2);
          color: rgb(248, 113, 113);
        }
        
        .admin-status-indicator-dot {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 9999px;
          margin-right: 0.5rem;
        }
        
        .admin-status-online .admin-status-indicator-dot {
          background-color: rgb(34, 197, 94);
        }
        
        .admin-status-offline .admin-status-indicator-dot {
          background-color: rgb(239, 68, 68);
        }

        /* Action Button Styles for Tables */
        .admin-action-buttons {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }
        
        .admin-edit-button {
          background-color: var(--admin-blue-500);
          color: white;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: none;
          cursor: pointer;
        }
        
        .admin-edit-button:hover {
          background-color: var(--admin-blue-400);
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
        }
        
        .admin-delete-button {
          background-color: var(--admin-red-500);
          color: white;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: none;
          cursor: pointer;
        }
        
        .admin-delete-button:hover {
          background-color: var(--admin-red-400);
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
        }

        /* Sidebar Styles */
        .easy-adminpanel-sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--admin-dark-blue-700);
          margin-bottom: 0;
          background-color: var(--admin-dark-blue-800);
        }
        
        .easy-adminpanel-sidebar-logo {
          display: flex;
          align-items: center;
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
        }
        
        .easy-adminpanel-sidebar-logo svg {
          margin-right: 0.75rem;
          color: var(--admin-blue-400);
          width: 1.5rem;
          height: 1.5rem;
        }
        
        .easy-adminpanel-sidebar-nav {
          padding: 1rem 0;
          overflow-y: auto;
          flex-grow: 1;
        }
        
        .easy-adminpanel-sidebar-section {
          margin-bottom: 1.5rem;
        }
        
        .easy-adminpanel-sidebar-section-title {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--admin-gray-500);
          padding: 0 1.5rem;
          margin-bottom: 0.5rem;
          letter-spacing: 0.05em;
        }
        
        .easy-adminpanel-sidebar-nav-item {
          display: flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          color: var(--admin-gray-300);
          transition: all 0.2s;
          cursor: pointer;
          margin: 0;
          border-left: 3px solid transparent;
        }
        
        .easy-adminpanel-sidebar-nav-item:hover {
          color: white;
          background-color: var(--admin-dark-blue-700);
          border-left-color: var(--admin-blue-400);
        }
        
        .easy-adminpanel-sidebar-nav-item.active {
          color: white;
          background-color: var(--admin-dark-blue-700);
          border-left-color: var(--admin-blue-500);
        }
        
        .easy-adminpanel-sidebar-nav-item svg {
          margin-right: 0.75rem;
          width: 1.25rem;
          height: 1.25rem;
        }

        /* Specific styles for Turkish titles */
        .admin-table th.İŞLEMLER, 
        .admin-table th.ISLEMLER, 
        .admin-table th.ACTIONS {
          text-align: right;
        }

        /* Loading Screen Styles */
        .easy-adminpanel-loading {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #0D1F36;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          transition: opacity 0.5s ease-out;
        }
        
        .easy-adminpanel-loading.loaded {
          opacity: 0;
          pointer-events: none;
        }
        
        .easy-adminpanel-loading-spinner {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: #3378FF;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        .easy-adminpanel-loading-text {
          color: white;
          font-size: 1rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin-top: 1rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Hide content until fully loaded */
        .easy-adminpanel.loading {
          visibility: hidden;
        }
      \`;
      
      document.head.appendChild(style);

      // Font eklemek için link elementi
      const fontLink = document.createElement("link");
      fontLink.rel = "stylesheet";
      fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
      document.head.appendChild(fontLink);

      // Add a small delay to ensure styles are applied
      setTimeout(() => {
        resolve();
      }, 100);
    });
  };

  useEffect(() => {
    // Inject styles
    injectStylesheet();
  }, []);

  // A component that doesn't render anything
  return null;
}`.trim();

  // Create admin pages - easy-adminpanel folder
  const layoutPath = path.join(
    projectRoot,
    "src",
    "app",
    "easy-adminpanel",
    "layout.tsx"
  );
  const pagePath = path.join(
    projectRoot,
    "src",
    "app",
    "easy-adminpanel",
    "page.tsx"
  );
  const clientStyleInjectorPath = path.join(
    projectRoot,
    "src",
    "app",
    "easy-adminpanel",
    "ClientStyleInjector.tsx"
  );

  // Directories for records and add-record pages
  const recordsDirPath = path.join(
    projectRoot,
    "src",
    "app",
    "easy-adminpanel",
    "records"
  );
  const addRecordDirPath = path.join(
    projectRoot,
    "src",
    "app",
    "easy-adminpanel",
    "add-record"
  );

  // Create directories
  if (!fs.existsSync(recordsDirPath)) {
    fs.mkdirSync(recordsDirPath, { recursive: true });
  }
  if (!fs.existsSync(addRecordDirPath)) {
    fs.mkdirSync(addRecordDirPath, { recursive: true });
  }

  // Records and add-record page files
  const recordsPagePath = path.join(recordsDirPath, "page.tsx");
  const addRecordPagePath = path.join(addRecordDirPath, "page.tsx");

  // Try to copy from templates directory first
  let templatesFound = false;
  try {
    // Try different potential template directories
    const possibleTemplateDirs = [
      path.join(path.dirname(path.dirname(helperDir)), "templates"),
      path.join(path.dirname(helperDir), "templates"),
      path.join(helperDir, "templates"),
      path.join(projectRoot, "node_modules", "easy-adminpanel", "templates"),
      path.join(
        projectRoot,
        "node_modules",
        "easy-adminpanel",
        "dist",
        "templates"
      ),
    ];

    for (const templateDir of possibleTemplateDirs) {
      if (fs.existsSync(templateDir)) {
        console.log(
          `${colors.blue}ℹ ${colors.reset}Templates directory found: ${templateDir}`
        );

        // We have template files but we'll still use our custom files
        templatesFound = true;
        break;
      }
    }
  } catch (error) {
    console.log(
      `${colors.yellow}⚠️ ${colors.reset}Template search error: ${error.message}`
    );
  }

  // Create files with custom content regardless of template status
  console.log(
    `${colors.green}✓ ${colors.reset}Creating custom admin pages with enhanced UI...`
  );

  // Create layout file
  fs.writeFileSync(layoutPath, defaultLayoutContent);
  console.log(
    `${colors.green}✓ ${colors.reset}Layout.tsx created: ${layoutPath}`
  );

  // Create page file
  fs.writeFileSync(pagePath, defaultPageContent);
  console.log(`${colors.green}✓ ${colors.reset}Page.tsx created: ${pagePath}`);

  // Create ClientStyleInjector file
  fs.writeFileSync(clientStyleInjectorPath, defaultClientStyleInjectorContent);
  console.log(
    `${colors.green}✓ ${colors.reset}ClientStyleInjector.tsx created: ${clientStyleInjectorPath}`
  );

  // Create Records page
  fs.writeFileSync(recordsPagePath, recordsPageContent);
  console.log(
    `${colors.green}✓ ${colors.reset}Records/page.tsx created: ${recordsPagePath}`
  );

  // Create Add-record page
  fs.writeFileSync(addRecordPagePath, addRecordPageContent);
  console.log(
    `${colors.green}✓ ${colors.reset}Add-record/page.tsx created: ${addRecordPagePath}`
  );
};

// Copy files
const copyFiles = () => {
  console.log(
    `${colors.yellow}» ${colors.reset}Copying design files and components...`
  );

  // UI components
  const uiFiles = fs.readdirSync(path.join(helperDir, "components", "ui"));
  uiFiles.forEach((file) => {
    const src = path.join(helperDir, "components", "ui", file);
    const dest = path.join(projectRoot, "src", "components", "ui", file);
    fs.copyFileSync(src, dest);
    console.log(`${colors.green}✓ ${colors.reset}Copied: ${dest}`);
  });

  // Utils components
  const utilsFiles = fs.readdirSync(
    path.join(helperDir, "components", "utils")
  );
  utilsFiles.forEach((file) => {
    const src = path.join(helperDir, "components", "utils", file);
    const dest = path.join(projectRoot, "src", "components", "utils", file);
    fs.copyFileSync(src, dest);
    console.log(`${colors.green}✓ ${colors.reset}Copied: ${dest}`);
  });

  // Dialog components
  const dialogFiles = fs.readdirSync(
    path.join(helperDir, "components", "dialogs")
  );
  dialogFiles.forEach((file) => {
    const src = path.join(helperDir, "components", "dialogs", file);
    const dest = path.join(projectRoot, "src", "components", "dialogs", file);
    fs.copyFileSync(src, dest);
    console.log(`${colors.green}✓ ${colors.reset}Copied: ${dest}`);
  });

  // Layout components if available
  const layoutDir = path.join(helperDir, "components", "layout");
  if (fs.existsSync(layoutDir)) {
    const layoutFiles = fs.readdirSync(layoutDir);
    layoutFiles.forEach((file) => {
      const src = path.join(layoutDir, file);
      const dest = path.join(projectRoot, "src", "components", "layout", file);
      fs.copyFileSync(src, dest);
      console.log(`${colors.green}✓ ${colors.reset}Copied: ${dest}`);
    });
  }

  // Icon components if available
  const iconsDir = path.join(helperDir, "components", "icons");
  if (fs.existsSync(iconsDir)) {
    const iconFiles = fs.readdirSync(iconsDir);
    iconFiles.forEach((file) => {
      const src = path.join(iconsDir, file);
      const dest = path.join(projectRoot, "src", "components", "icons", file);
      fs.copyFileSync(src, dest);
      console.log(`${colors.green}✓ ${colors.reset}Copied: ${dest}`);
    });
  }

  // Navigation components if available
  const navDir = path.join(helperDir, "components", "navigation");
  if (fs.existsSync(navDir)) {
    const navFiles = fs.readdirSync(navDir);
    navFiles.forEach((file) => {
      const src = path.join(navDir, file);
      const dest = path.join(
        projectRoot,
        "src",
        "components",
        "navigation",
        file
      );
      fs.copyFileSync(src, dest);
      console.log(`${colors.green}✓ ${colors.reset}Copied: ${dest}`);
    });
  }

  // Main components
  const componentFiles = fs
    .readdirSync(path.join(helperDir, "components"))
    .filter((file) => file.endsWith(".tsx") || file.endsWith(".ts"));

  componentFiles.forEach((file) => {
    const src = path.join(helperDir, "components", file);
    const dest = path.join(projectRoot, "src", "components", file);
    fs.copyFileSync(src, dest);
    console.log(`${colors.green}✓ ${colors.reset}Copied: ${dest}`);
  });

  // Styles
  console.log(
    `${colors.yellow}» ${colors.reset}Setting up enhanced UI styles...`
  );
  const stylesFile = path.join(helperDir, "styles", "styles.tsx");
  const stylesDest = path.join(projectRoot, "src", "styles", "adminpanel.tsx");
  fs.copyFileSync(stylesFile, stylesDest);
  console.log(`${colors.green}✓ ${colors.reset}Copied: ${stylesDest}`);

  // IMPORTANT: Copy the styles.tsx directly as AdminPanel.tsx to ensure full layout is used
  const adminPanelDest = path.join(
    projectRoot,
    "src",
    "components",
    "AdminPanel.tsx"
  );
  fs.copyFileSync(stylesFile, adminPanelDest);
  console.log(
    `${colors.green}✓ ${colors.reset}Copied styles directly as AdminPanel component: ${adminPanelDest}`
  );

  // Copy additional style files if they exist
  const additionalStylesDir = path.join(helperDir, "styles");
  if (fs.existsSync(additionalStylesDir)) {
    const styleFiles = fs
      .readdirSync(additionalStylesDir)
      .filter((file) => file !== "styles.tsx"); // Skip the main styles file we already copied

    styleFiles.forEach((file) => {
      const src = path.join(additionalStylesDir, file);
      const dest = path.join(projectRoot, "src", "styles", file);
      fs.copyFileSync(src, dest);
      console.log(
        `${colors.green}✓ ${colors.reset}Copied additional style: ${dest}`
      );
    });
  }
};

// Check documentation
const checkDocumentation = () => {
  const readmePath = path.join(helperDir, "README.md");
  if (fs.existsSync(readmePath)) {
    console.log(
      `\n${colors.bright}${colors.yellow}IMPORTANT:${colors.reset} Please read the integration guide: ${readmePath}`
    );
  }

  const apiDocsPath = path.join(helperDir, "api-docs.md");
  if (fs.existsSync(apiDocsPath)) {
    console.log(
      `${colors.bright}${colors.yellow}IMPORTANT:${colors.reset} For API integration, please read: ${apiDocsPath}`
    );
  }
};

// Check Lucide React dependency
const checkDependencies = () => {
  try {
    const packageJsonPath = path.join(projectRoot, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    const hasDependency =
      packageJson.dependencies && packageJson.dependencies["lucide-react"];
    const hasDevDependency =
      packageJson.devDependencies &&
      packageJson.devDependencies["lucide-react"];

    if (!hasDependency && !hasDevDependency) {
      console.log(
        `\n${colors.bright}${colors.yellow}WARNING:${colors.reset} lucide-react package not found. You may need to install it.`
      );
      console.log(
        `To install: ${colors.bright}npm install lucide-react${colors.reset} or ${colors.bright}yarn add lucide-react${colors.reset}`
      );
    }
  } catch (error) {
    console.log(
      `\n${colors.bright}${colors.red}ERROR:${colors.reset} Cannot read package.json. Dependencies could not be checked.`
    );
  }
};

// Check for enhanced UI dependencies
const checkEnhancedUIDependencies = () => {
  try {
    const packageJsonPath = path.join(projectRoot, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    // List of UI dependencies needed for enhanced UI
    const enhancedUIDeps = [
      "lucide-react",
      "tailwindcss",
      "postcss",
      "autoprefixer",
    ];

    const missingDeps = [];

    enhancedUIDeps.forEach((dep) => {
      const hasDependency =
        (packageJson.dependencies && packageJson.dependencies[dep]) ||
        (packageJson.devDependencies && packageJson.devDependencies[dep]);

      if (!hasDependency) {
        missingDeps.push(dep);
      }
    });

    if (missingDeps.length > 0) {
      console.log(
        `\n${colors.bright}${colors.yellow}WARNING:${
          colors.reset
        } The following packages might be required for enhanced UI: ${missingDeps.join(
          ", "
        )}`
      );
      console.log(
        `To install: ${colors.bright}npm install ${missingDeps.join(" ")}${
          colors.reset
        }`
      );
    }
  } catch (error) {
    console.log(
      `\n${colors.bright}${colors.red}ERROR:${colors.reset} Cannot read package.json. Dependencies could not be checked.`
    );
  }
};

// Run main operations
try {
  cleanupOldFiles();
  createDirectories();
  copyFiles();
  createApiRoutes(); // Create API files
  createAdminPages(); // Create admin pages
  checkDependencies();
  checkEnhancedUIDependencies(); // Check for enhanced UI dependencies
  checkDocumentation();

  console.log(
    `\n${colors.bright}${colors.green}Integration complete!${colors.reset} Enhanced Easy-AdminPanel components have been successfully added to your project.\n`
  );
  console.log(
    `You can access the admin panel at: ${colors.bright}${colors.blue}http://localhost:3000/easy-adminpanel${colors.reset}\n`
  );
  console.log(
    `${colors.yellow}NOTE:${colors.reset} This version includes enhanced UI with sidebars, status indicators, and improved card designs.\n`
  );
} catch (error) {
  console.error(
    `\n${colors.bright}${colors.red}ERROR:${colors.reset} ${error.message}`
  );
  process.exit(1);
}
