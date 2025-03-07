#!/usr/bin/env node
"use strict";

const path = require("path");
const fs = require("fs");

console.log("🚀 Installing Easy Admin Panel...");

// Target directory
const targetDir = process.cwd();
const args = process.argv.slice(2);

// Default configuration
const defaultConfig = {
  route: "/easy-adminpanel",
  envVar: "POSTGRES_URL",
  title: "Easy Admin Panel",
};

// Get options from arguments
const options = {};
for (let i = 1; i < args.length; i++) {
  if (args[i].startsWith("--")) {
    const [key, value] = args[i].slice(2).split("=");
    if (key && value) {
      options[key] = value;
    }
  }
}

// Merge configurations
const config = {
  ...defaultConfig,
  ...options,
};

// Copy template folder
const templateDir = path.join(__dirname, "templates");

// Check src/app/ or app/ directory
let appPath = path.join(targetDir, "src", "app");
if (!fs.existsSync(appPath)) {
  appPath = path.join(targetDir, "app");
  if (!fs.existsSync(appPath)) {
    // Create src/app if neither exists
    fs.mkdirSync(appPath, { recursive: true });
  }
}

const easyAdminDir = path.join(appPath, config.route.replace(/^\//, ""));
const componentsDir = path.join(targetDir, "src", "components");
const apiDir = path.join(appPath, "api", "admin");

// Create folders
if (!fs.existsSync(easyAdminDir)) {
  fs.mkdirSync(easyAdminDir, { recursive: true });
}

// Create API directory
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

// Create components directory
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

// Copy template files (simple copy function)
function copyDir(src, dest) {
  const files = fs.readdirSync(src);

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  // Copy API and other folders
  copyDir(templateDir, easyAdminDir);

  // Copy API endpoint files
  const apiTemplateDir = path.join(templateDir, "api");
  if (fs.existsSync(apiTemplateDir)) {
    copyDir(apiTemplateDir, apiDir);
  }

  // Create AdminPanel component
  const adminPanelPath = path.join(componentsDir, "AdminPanel.tsx");

  const adminPanelContent = `"use client";

import React, { useState, useEffect } from 'react';

interface Table {
  name: string;
  displayName: string;
}

interface AvailableTable {
  table_name: string;
  selected: boolean;
}

interface TableRecord {
  id: string | number;
  [key: string]: any;
}

export function AdminPanel() {
  const [tables, setTables] = useState<Table[]>([]);
  const [availableTables, setAvailableTables] = useState<AvailableTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // States for table data and forms
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableRecords, setTableRecords] = useState<TableRecord[]>([]);
  const [showRecordList, setShowRecordList] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [tableColumns, setTableColumns] = useState<any[]>([]);
  const [newRecord, setNewRecord] = useState<{[key: string]: any}>({});
  const [editRecord, setEditRecord] = useState<TableRecord | null>(null);
  const [recordLoading, setRecordLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | number | null>(null);

  // API endpoint - compliant with Next.js API routes structure
  const apiUrl = '/api/admin'; 
  
  // Load all tables
  useEffect(() => {
    async function fetchTables() {
      try {
        const response = await fetch(\`\${apiUrl}/tables\`);
        if (!response.ok) {
          throw new Error('Error loading tables');
        }
        
        const data = await response.json();
        setTables(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setLoading(false);
      }
    }
    
    fetchTables();
  }, []);

  // Get all available tables
  const fetchAllTables = async () => {
    try {
      // Get all tables
      const response = await fetch(\`\${apiUrl}/all-tables\`);
      if (!response.ok) {
        throw new Error('Error loading tables');
      }
      
      const allTableNames = await response.json();
      
      // Check selected tables
      const selectedTableNames = tables.map(t => t.name);
      
      // Map tables
      const mappedTables = allTableNames.map((name) => ({
        table_name: name,
        selected: selectedTableNames.includes(name)
      }));
      
      setAvailableTables(mappedTables);
      setIsDialogOpen(true);
    } catch (err) {
      alert('Error loading tables: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Change table selection
  const handleTableSelection = (tableName, isSelected) => {
    setAvailableTables(prev => 
      prev.map(t => t.table_name === tableName ? { ...t, selected: isSelected } : t)
    );
  };

  // Save selections
  const saveTableSelection = async () => {
    try {
      const selectedTables = availableTables
        .filter(t => t.selected)
        .map(t => t.table_name);
      
      const response = await fetch(\`\${apiUrl}/save-tables\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tables: selectedTables }),
      });
      
      if (!response.ok) {
        throw new Error('Error saving table selections');
      }
      
      setIsDialogOpen(false);
      window.location.reload(); // Refresh page
    } catch (err) {
      alert('Error saving selections: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };
  
  // List table records
  const handleListTable = async (tableName: string) => {
    setSelectedTable(tableName);
    setShowRecordList(true);
    setShowAddForm(false);
    setShowEditForm(false);
    setRecordLoading(true);
    
    try {
      // First get table columns
      const schemaResponse = await fetch(\`\${apiUrl}/\${tableName}?_schema=true\`);
      if (schemaResponse.ok) {
        const schema = await schemaResponse.json();
        setTableColumns(schema);
      }
      
      // Then get records
      const response = await fetch(\`\${apiUrl}/\${tableName}\`);
      if (!response.ok) {
        throw new Error('Error retrieving records');
      }
      
      const data = await response.json();
      setTableRecords(data);
      setRecordLoading(false);
    } catch (err) {
      alert('Error retrieving records: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setRecordLoading(false);
    }
  };
  
  // Open new record form
  const handleAddRecord = (tableName: string) => {
    setSelectedTable(tableName);
    setShowAddForm(true);
    setShowRecordList(false);
    setShowEditForm(false);
    setRecordLoading(true);
    setNewRecord({});
    
    // Get table columns
    fetch(\`\${apiUrl}/\${tableName}?_schema=true\`)
      .then(res => res.json())
      .then(schema => {
        setTableColumns(schema);
        
        // Create initial values
        const initialValues = {};
        schema.forEach(column => {
          if (column.name !== 'id') {
            initialValues[column.name] = '';
          }
        });
        
        setNewRecord(initialValues);
        setRecordLoading(false);
      })
      .catch(err => {
        alert('Error getting table schema: ' + (err instanceof Error ? err.message : 'Unknown error'));
        setRecordLoading(false);
      });
  };

  // Open edit record form
  const handleEditRecord = async (id: string | number) => {
    if (!selectedTable) return;
    
    setShowRecordList(false);
    setShowAddForm(false);
    setShowEditForm(true);
    setRecordLoading(true);
    
    try {
      // Get record
      const response = await fetch(\`\${apiUrl}/\${selectedTable}?id=\${id}\`);
      if (!response.ok) {
        throw new Error('Error retrieving record');
      }
      
      const record = await response.json();
      setEditRecord(record);
      setRecordLoading(false);
    } catch (err) {
      alert('Error retrieving record: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setRecordLoading(false);
      setShowRecordList(true);
      setShowEditForm(false);
    }
  };
  
  // Show delete confirmation dialog
  const handleDeleteConfirm = (id: string | number) => {
    setRecordToDelete(id);
    setDeleteConfirmOpen(true);
  };
  
  // Delete record
  const handleDeleteRecord = async () => {
    if (!selectedTable || !recordToDelete) return;
    
    try {
      const response = await fetch(\`\${apiUrl}/\${selectedTable}?id=\${recordToDelete}\`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Error deleting record');
      }
      
      // Deletion successful, update table
      setDeleteConfirmOpen(false);
      setRecordToDelete(null);
      
      // Reload table
      handleListTable(selectedTable);
      
      alert('Record successfully deleted');
    } catch (err) {
      alert('Error deleting record: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };
  
  // Handle input change (for new record)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRecord(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle input change (for editing)
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditRecord(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: value
      };
    });
  };
  
  // Add new record
  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTable) return;
    
    try {
      const response = await fetch(\`\${apiUrl}/\${selectedTable}\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRecord),
      });
      
      if (!response.ok) {
        throw new Error('Error adding record');
      }
      
      alert('Record successfully added!');
      
      // Clear form
      const initialValues = {};
      tableColumns.forEach(column => {
        if (column.name !== 'id') {
          initialValues[column.name] = '';
        }
      });
      
      setNewRecord(initialValues);
      
      // Optionally return to record list
      handleListTable(selectedTable);
    } catch (err) {
      alert('Error adding record: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };
  
  // Update record
  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTable || !editRecord) return;
    
    try {
      const response = await fetch(\`\${apiUrl}/\${selectedTable}\`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editRecord),
      });
      
      if (!response.ok) {
        throw new Error('Error updating record');
      }
      
      alert('Record successfully updated!');
      
      // Return to record list
      handleListTable(selectedTable);
    } catch (err) {
      alert('Error updating record: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };
  
  // Return to panel
  const handleBackToTables = () => {
    setSelectedTable(null);
    setShowRecordList(false);
    setShowAddForm(false);
    setShowEditForm(false);
  };
  
  if (loading) {
    return <div className="text-gray-800">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }
  
  // Table list panel
  if (!selectedTable && !showRecordList && !showAddForm && !showEditForm) {
    return (
      <div>
        <div className="mb-6">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={fetchAllTables}
          >
            Manage Tables
          </button>
        </div>
        
        {/* Table Management Dialog */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-full">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Select Tables to Manage</h2>
              <p className="mb-4 text-gray-600">Select tables to show in the admin panel.</p>
              
              <div className="max-h-60 overflow-y-auto mb-4">
                {availableTables.map(table => (
                  <div key={table.table_name} className="flex items-center mb-2">
                    <input 
                      type="checkbox" 
                      id={table.table_name}
                      checked={table.selected}
                      onChange={(e) => handleTableSelection(table.table_name, e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor={table.table_name} className="text-gray-800">{table.table_name}</label>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-2">
                <button 
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={saveTableSelection}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        
        {tables.length === 0 ? (
          <div className="p-8 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">No tables added yet</h2>
            <p className="mb-4 text-gray-800">Use the "Manage Tables" button to select tables to display in the admin panel.</p>
            <p className="text-sm text-gray-600">Automatic CRUD interfaces will be created for selected tables.</p>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Tables</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map((table) => (
                <div key={table.name} className="p-4 border rounded shadow hover:shadow-md">
                  <h3 className="font-semibold text-gray-800">{table.displayName}</h3>
                  <div className="mt-2 space-x-2">
                    <button 
                      className="px-2 py-1 bg-blue-500 text-white text-sm rounded"
                      onClick={() => handleListTable(table.name)}
                    >
                      List
                    </button>
                    <button 
                      className="px-2 py-1 bg-green-500 text-white text-sm rounded"
                      onClick={() => handleAddRecord(table.name)}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Record list
  if (showRecordList && selectedTable) {
    return (
      <div>
        <div className="mb-6 flex items-center">
          <button 
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mr-3"
            onClick={handleBackToTables}
          >
            ← Back
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {tables.find(t => t.name === selectedTable)?.displayName || selectedTable} List
          </h2>
          <button 
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 ml-auto"
            onClick={() => handleAddRecord(selectedTable)}
          >
            + Add New
          </button>
        </div>
        
        {/* Delete Confirmation Dialog */}
        {deleteConfirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-full">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Delete Record</h2>
              <p className="mb-6 text-gray-600">Are you sure you want to delete this record? This action cannot be undone.</p>
              
              <div className="flex justify-end space-x-2">
                <button 
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  onClick={() => setDeleteConfirmOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={handleDeleteRecord}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        
        {recordLoading ? (
          <div className="text-gray-800">Loading...</div>
        ) : tableRecords.length === 0 ? (
          <div className="p-8 bg-white rounded-lg shadow">
            <p className="text-gray-800">No records found in this table.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {tableColumns.map(column => (
                    <th key={column.name} className="border px-4 py-2 text-left text-gray-800">
                      {column.name}
                    </th>
                  ))}
                  <th className="border px-4 py-2 text-left text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableRecords.map((record, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {tableColumns.map(column => (
                      <td key={column.name} className="border px-4 py-2 text-gray-800">
                        {String(record[column.name] || '-')}
                      </td>
                    ))}
                    <td className="border px-4 py-2">
                      <button 
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded mr-1"
                        onClick={() => handleEditRecord(record.id)}
                      >
                        Edit
                      </button>
                      <button 
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded"
                        onClick={() => handleDeleteConfirm(record.id)}
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
  }
  
  // Add new record form
  if (showAddForm && selectedTable) {
    return (
      <div>
        <div className="mb-6 flex items-center">
          <button 
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mr-3"
            onClick={handleBackToTables}
          >
            ← Back
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            Add {tables.find(t => t.name === selectedTable)?.displayName || selectedTable}
          </h2>
        </div>
        
        {recordLoading ? (
          <div className="text-gray-800">Loading...</div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <form onSubmit={handleSubmitRecord}>
              {tableColumns.map(column => {
                // Don't show id column in form, usually auto-assigned
                if (column.name === 'id') return null;
                
                return (
                  <div key={column.name} className="mb-4">
                    <label className="block text-gray-800 mb-2" htmlFor={column.name}>
                      {column.name}
                    </label>
                    <input
                      type="text"
                      id={column.name}
                      name={column.name}
                      value={newRecord[column.name] || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded text-gray-800"
                    />
                  </div>
                );
              })}
              
              <div className="flex justify-end mt-6">
                <button 
                  type="button" 
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mr-2"
                  onClick={handleBackToTables}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }
  
  // Edit record form
  if (showEditForm && selectedTable && editRecord) {
    return (
      <div>
        <div className="mb-6 flex items-center">
          <button 
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mr-3"
            onClick={() => handleListTable(selectedTable)}
          >
            ← Back
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            Edit {tables.find(t => t.name === selectedTable)?.displayName || selectedTable}
          </h2>
        </div>
        
        {recordLoading ? (
          <div className="text-gray-800">Loading...</div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <form onSubmit={handleUpdateRecord}>
              {tableColumns.map(column => {
                // Show id column as read-only
                if (column.name === 'id') {
                  return (
                    <div key={column.name} className="mb-4">
                      <label className="block text-gray-800 mb-2" htmlFor={column.name}>
                        {column.name}
                      </label>
                      <input
                        type="text"
                        id={column.name}
                        value={editRecord[column.name] || ''}
                        disabled
                        className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-800"
                      />
                    </div>
                  );
                }
                
                return (
                  <div key={column.name} className="mb-4">
                    <label className="block text-gray-800 mb-2" htmlFor={column.name}>
                      {column.name}
                    </label>
                    <input
                      type="text"
                      id={column.name}
                      name={column.name}
                      value={editRecord[column.name] || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border rounded text-gray-800"
                    />
                  </div>
                );
              })}
              
              <div className="flex justify-end mt-6">
                <button 
                  type="button" 
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mr-2"
                  onClick={() => handleListTable(selectedTable)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }
  
  return <div className="text-gray-800">Loading...</div>;
}
`;

  fs.writeFileSync(adminPanelPath, adminPanelContent);

  // Update page.tsx content (simplified)
  const pagePath = path.join(easyAdminDir, "page.tsx");
  const pageContent = `"use client";

import { AdminPanel } from '@/components/AdminPanel';

export default function EasyAdminPage() {
  const title = process.env.EASY_ADMIN_TITLE || 'Easy Admin Panel';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">{title}</h1>
      <AdminPanel />
    </div>
  );
}`;

  fs.writeFileSync(pagePath, pageContent);

  // Create configuration file
  const configFile = path.join(easyAdminDir, "config.ts");
  const configContent = `
export const adminConfig = {
  route: '${config.route}',
  envVar: '${config.envVar}',
  title: '${config.title}',
};
  `.trim();

  fs.writeFileSync(configFile, configContent);

  console.log(`✅ Easy Admin Panel successfully installed!`);
  console.log(`📂 Files copied to: ${easyAdminDir}`);
  console.log(`📂 AdminPanel component added to: ${adminPanelPath}`);
  console.log(
    `🚀 Access the admin panel at: http://localhost:3000${config.route}`
  );

  console.log("\n📝 Post-installation steps:");
  console.log("1. Add your database connection information to your .env file:");
  console.log(
    `   ${config.envVar}="postgres://user:password@host:port/database"`
  );
  console.log("2. Start your application:");
  console.log("   npm run dev");
  console.log(
    `3. Access the admin panel in your browser: http://localhost:3000${config.route}\n`
  );
  console.log(
    "\n⚠️ Note: If you encounter errors, check that your tsconfig.json has proper '@' alias configuration!"
  );
} catch (err) {
  console.error("❌ An error occurred during installation:", err);
  process.exit(1);
}
