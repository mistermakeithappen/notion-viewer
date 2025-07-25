# Notion Database Viewer

A Next.js application for viewing and managing Notion databases with advanced sorting and filtering capabilities.

## Features

- Connect to Notion using your API key
- Browse and select databases from your workspace
- View database entries in a table format
- Advanced filtering with multiple conditions
- Multi-level sorting with drag-and-drop reordering
- View individual page content with rich text rendering
- Support for all Notion property types
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js 18+ installed
- A Notion account with an integration API key
- Access to at least one Notion database

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd notion-viewer
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Getting Your Notion API Key

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Give your integration a name and select the workspace
4. Copy the "Internal Integration Secret"
5. Share your database with the integration:
   - Open your database in Notion
   - Click the "..." menu
   - Click "Add connections"
   - Select your integration

## Usage

1. Enter your Notion API key when prompted
2. Select a database from the list
3. Use the Filter and Sort buttons to customize your view
4. Click on any row to view the full page content

### Button Webhook Integration

Notion buttons can now trigger webhooks to services like Make.com! When a button is clicked, it sends all the row data to a configured webhook URL.

#### Setup:

1. **Option 1: Default Webhook (All Buttons)**
   - Create a `.env.local` file in the root directory
   - Add: `NEXT_PUBLIC_DEFAULT_WEBHOOK_URL=https://hook.us1.make.com/your-webhook-id`
   - All buttons will use this webhook URL

2. **Option 2: Button-Specific Webhooks**
   - Edit `components/PropertyRenderer.tsx`
   - Find the `webhookUrls` object
   - Add entries for each button name:
   ```javascript
   const webhookUrls: Record<string, string> = {
     'Send Email': 'https://hook.us1.make.com/email-webhook-id',
     'Create Task': 'https://hook.us1.make.com/task-webhook-id',
     default: process.env.NEXT_PUBLIC_DEFAULT_WEBHOOK_URL || ''
   };
   ```

#### Webhook Payload:

When a button is clicked, this JSON payload is sent to the webhook:

```json
{
  "buttonName": "Button Name",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "notionPageId": "page-id-from-notion",
  "notionPageUrl": "https://notion.so/...",
  "properties": {
    // All Notion properties for this row
  },
  "rawData": {
    // Complete raw data from Notion API
  }
}
```

#### Visual Feedback:
- **Green**: Webhook sent successfully
- **Gray**: Webhook failed
- **Red**: Default button state

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **@notionhq/client** - Official Notion API client
- **@dnd-kit** - Drag and drop for sort reordering
- **lucide-react** - Icons
- **date-fns** - Date formatting

## Project Structure

```
notion-viewer/
├── app/
│   ├── api/          # API routes for Notion integration
│   ├── globals.css   # Global styles
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Home page
├── components/       # React components
├── lib/             # Utility functions
├── types/           # TypeScript types
└── public/          # Static assets
```

## API Routes

- `GET /api/notion/databases` - List all databases
- `GET /api/notion/databases/[id]` - Get database info
- `GET /api/notion/databases/[id]/query` - Query database entries
- `GET /api/notion/pages/[id]` - Get page details
- `GET /api/notion/blocks/[id]` - Get page blocks

## Environment Variables

No environment variables are required. The API key is passed via request headers.

## License

MIT