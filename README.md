# Easy Admin Panel

This package is an admin panel solution that can be easily integrated into your Next.js projects, creating an automatic CRUD interface for your PostgreSQL database.

## Features

- **Easy Setup**: Integrates into your Next.js project with a single command
- **Dynamic Table Management**: Automatically detects PostgreSQL tables in your application
- **Automatic CRUD Interfaces**: Provides listing, adding, editing, and deletion screens for selected tables
- **Modern UI**: Features a modern interface using Tailwind CSS and ShadCN UI
- **Secure**: Runs within your own project, giving you full access control

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

1. Add your database connection information to the `.env` file:
   ```
   POSTGRES_URL="postgres://user:password@host:port/database"
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
      <AdminPanel />
    </div>
  );
}
```

This gives you more flexibility to integrate the admin panel into your existing layouts or add custom elements around it.

> **Note**: The AdminPanel component includes all necessary styles internally, so you don't need to import any additional CSS files. The dark blue theme will be automatically applied to ensure a consistent look and feel across all projects.

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
