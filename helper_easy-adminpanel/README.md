# Easy-AdminPanel Integration Guide

This file contains the steps necessary to successfully integrate the Easy-AdminPanel npm package into your project. By following this guide, you can fully utilize all the visual and functional features of our package.

## Installation Steps

### 1. Required Package Installation

First, install our package via npm:

```bash
npm install easy-adminpanel
```

This package is designed to be used in Next.js projects. Make sure to install the additional dependencies:

```bash
npm install lucide-react
```

Then, run the installation assistant:

```bash
npx easy-adminpanel-setup
```

This command will add all necessary components and style files to your project and create an admin panel at the `/admin` path.

### 2. Style Files Integration

Easy-AdminPanel uses a custom CSS style. Follow these steps to include these files in your project:

#### a. Copy Style Files

Copy the `helper_easy-adminpanel/styles/styles.tsx` file to your project (as `src/styles/adminpanel.tsx`). This file contains all style definitions.

#### b. Add Styles Globally

Add the following code to your Next.js project's `_app.tsx` or `layout.tsx` file:

```tsx
import { injectStylesheet } from '../styles/adminpanel';

// ...

// Inside your top-level component (within useEffect)
useEffect(() => {
  // Inject styles
  injectStylesheet();
}, []);
```

### 3. Copying and Editing Components

You need to copy some special components and types from Easy-AdminPanel to your project:

1. Copy the `helper_easy-adminpanel/components/ui` folder to the `src/components/ui` directory
2. Copy the `helper_easy-adminpanel/components/utils` folder to the `src/components/utils` directory
3. Copy the `helper_easy-adminpanel/components/dialogs` folder to the `src/components/dialogs` directory
4. Copy the `helper_easy-adminpanel/components/types.ts` file as `src/components/types.ts`

### 4. Creating API Routes

Easy-AdminPanel expects the following API routes. Create the routes in your API folder accordingly:

1. `/api/tables` - Get all available tables
2. `/api/all-tables` - Get all tables in the database
3. `/api/save-tables` - Save selected tables
4. `/api/create-table` - Create a new table
5. `/api/resources/[table]` - CRUD operations for table data

### 5. Font Integration

The panel uses the Inter font. To add the font to your project:

1. Add the following code to the `<head>` section of your layout file:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

2. Add the font definition to the `html` element in your global CSS file:

```css
html {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

### 6. Using the AdminPanel Component

Now that you have everything set up, you can use the AdminPanel component as follows:

```tsx
import { AdminPanel } from 'easy-adminpanel';

export default function AdminPage() {
  return (
    <div className="easy-adminpanel">
      <AdminPanel />
    </div>
  );
}
```

The panel will be accessible at: `http://localhost:3000/admin`

## Troubleshooting

If you encounter design issues, check the following:

1. Make sure the style file is properly injected
2. Make sure the `easy-adminpanel` CSS class is applied to the top-level container
3. Make sure the Inter font is loaded
4. Make sure the Lucide icon package is properly installed

## Customization

To customize the styles of the AdminPanel, you can edit the `src/styles/adminpanel.tsx` file. You can update the panel colors and basic visual properties by changing the CSS variables.

```css
:root {
  --admin-dark-blue-900: #0D1F36; /* Main background color */
  --admin-dark-blue-800: #12263F; /* Card background color */
  --admin-blue-500: #3378FF; /* Primary color */
  --admin-blue-400: #4A8CFF; /* Primary color (hover) */
  /* Other colors... */
}
```

## API Creation Guide

For more information on how to create API files, please refer to the `helper_easy-adminpanel/api-docs.md` file. 