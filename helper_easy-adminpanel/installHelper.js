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

import { AdminPanel } from "@/styles/adminpanel";

export default function EasyAdminPage() {
  const title = process.env.EASY_ADMIN_TITLE || "Easy Admin Panel";

  return <AdminPanel title={title} />;
}`.trim();

  const recordsPageContent = `"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function RecordsPage() {
  const searchParams = useSearchParams();
  const table = searchParams.get('table');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
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
      fetch(\`/api/resources/\${table}?id=\${id}\`, {
        method: 'DELETE',
      })
        .then(res => {
          if (res.ok) {
            // Successfully deleted, update the list
            setRecords(records.filter(record => record.id !== id));
          }
        })
        .catch(error => {
          console.error("Error deleting record:", error);
        });
    }
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
          {table} Records
        </h1>
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
                  <th key={column}>{column}</th>
                ))}
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id}>
                  {columns.map(column => (
                    <td key={column+record.id}>{String(record[column])}</td>
                  ))}
                  <td className="text-right">
                    <button 
                      className="easy-adminpanel-button easy-adminpanel-button-secondary mr-2"
                      onClick={() => handleEdit(record.id)}
                    >
                      Edit
                    </button>
                    <button 
                      className="easy-adminpanel-button bg-red-600 hover:bg-red-500 text-white"
                      onClick={() => handleDelete(record.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
import { injectStylesheet } from "../../styles/adminpanel";

export default function ClientStyleInjector() {
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
