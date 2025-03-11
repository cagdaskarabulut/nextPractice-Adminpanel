# Easy Admin Panel

This package is an admin panel solution that can be easily integrated into your Next.js projects, creating an automatic CRUD interface for your PostgreSQL database.

## Features

- **Easy Setup**: Integrates into your Next.js project with a single command
- **Dynamic Table Management**: Automatically detects PostgreSQL tables in your application
- **Automatic CRUD Interfaces**: Provides listing, adding, editing, and deletion screens for selected tables
- **Modern UI**: Features a modern interface using Tailwind CSS and ShadCN UI
- **Secure**: Runs within your own project, giving you full access control
- **Multi-database Support**: Works with PostgreSQL, MySQL, and MSSQL (SQL Server)

## Installation

```bash
# With NPM
npm install easy-adminpanel

# or with Yarn
yarn add easy-adminpanel

# or with PNPM
pnpm add easy-adminpanel
```

After installation, run the following command to integrate the admin panel into your project:

```bash
npx easy-adminpanel init
```

or with custom options:

```bash
npx easy-adminpanel init --route=/admin --envVar=DATABASE_URL --title="Custom Admin Panel"
```

## Usage

After installation, follow these steps:

1. Add your database connection information to the `.env` file (supports PostgreSQL, MySQL, or MSSQL):
   ```
   # PostgreSQL
   POSTGRES_URL="postgres://user:password@host:port/database"
   
   # or MySQL
   DATABASE_URL="mysql://user:password@host:port/database"
   
   # or MSSQL
   DATABASE_URL="mssql://user:password@host:port/database"
   ```

2. Start your application:
   ```bash
   npm run dev
   ```

3. Access the admin panel from your browser: 
   ```
   http://localhost:3000/easy-adminpanel
   ```

4. On first use, select the tables you want to manage.

## Component Usage

You can also use the AdminPanel component directly in your application:

```jsx
import { AdminPanel } from 'easy-adminpanel';

// Then use the component anywhere in your application
export default function AdminPage() {
  return (
    <div>
      <h1>My Admin Panel</h1>
      <AdminPanel 
        connectionString="postgres://user:password@host:port/database"
        databaseType="postgresql" // Optional: 'postgresql', 'mysql', or 'mssql'
        title="My Database Admin" // Optional: custom panel title
      />
    </div>
  );
}
```

This gives you more flexibility to integrate the admin panel into your existing layouts or add custom elements around it.

> **Note**: The AdminPanel component includes all necessary styles internally, so you don't need to import any additional CSS files. The dark blue theme will be automatically applied to ensure a consistent look and feel across all projects.

## Styling Guide: Preserving the Design in New Projects

Easy-AdminPanel is designed to maintain a consistent look and feel across all projects, regardless of the host project's styling configuration. Here's how it works and how to ensure you always get the beautiful dark blue design:

### How the Styling Works

1. **Self-Contained Styles**: All CSS is embedded directly in the component and injected into the DOM at runtime, with no external dependencies.

2. **CSS Variables and Isolation**: The component uses CSS variables and unique class names to avoid conflicts with your project's styling.

3. **No Configuration Required**: You don't need to add any special configuration to your Tailwind setup or import any CSS files.

### Troubleshooting Style Issues

If you encounter any styling issues when using the component in a new project:

1. **Check Component Wrapping**: Make sure the `<AdminPanel />` component is not wrapped in a container that might override its styles with conflicting rules.

2. **CSS Isolation**: The AdminPanel component is contained within the `.easy-adminpanel` class. Ensure your CSS doesn't have overly aggressive global styles that might override this.

3. **z-index Issues**: If elements appear behind other content, check for z-index conflicts in your main application.

### For Projects Without Tailwind

Even if your project doesn't use Tailwind CSS, the AdminPanel component will work perfectly:

```jsx
// Works in any Next.js project, with or without Tailwind
import { AdminPanel } from 'easy-adminpanel';

export default function AdminPage() {
  return <AdminPanel />; // All styles are included within the component
}
```

### Custom Styling (Advanced)

If you need to customize the appearance of the admin panel:

1. **Override CSS Variables**: You can override the CSS variables in your global styles:

```css
:root {
  --admin-dark-blue-900: #0D1F36; /* Custom primary color */
  --admin-blue-500: #3378FF; /* Custom accent color */
}
```

2. **Target Specific Classes**: For more detailed customization, you can target the component's classes:

```css
.easy-adminpanel-header {
  /* Your custom header styling */
}

.easy-adminpanel-button-primary {
  /* Your custom button styling */
}
```

## Supported Databases

Easy-AdminPanel supports the following database systems:

- **PostgreSQL**: Full support for all features
- **MySQL**: Full support for all features
- **MSSQL (SQL Server)**: Full support for all features

The database type is automatically detected from the connection string. If you need to specify it manually, you can use the `databaseType` prop.

## Integration with Your Next.js Project

To integrate programmatically, you can use it in your `next.config.js` file as follows:

```javascript
const { setupEasyAdminPanel } = require('easy-adminpanel');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... your existing configuration
};

module.exports = setupEasyAdminPanel(nextConfig, {
  route: '/admin',   // Optional: URL where admin panel will be accessible
  envVar: 'DATABASE_URL', // Optional: Environment variable for database connection string
  title: 'Admin Panel', // Optional: Panel title
  databaseType: 'mysql' // Optional: Explicitly set database type ('postgresql', 'mysql', or 'mssql')
});
```

## Features

### Table Management
- Select which database tables to include in the admin panel
- Automatic schema detection for all tables
- Dynamic form generation based on column types

### CRUD Operations
- **List**: View all records with pagination
- **Create**: Add new records with auto-generated forms
- **Update**: Edit existing records with pre-filled forms
- **Delete**: Remove records with confirmation dialog

### User Interface
- Clean, responsive design using Tailwind CSS
- Modern components from ShadCN UI
- Intuitive navigation between tables and operations

## License

MIT
