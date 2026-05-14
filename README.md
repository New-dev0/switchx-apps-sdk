# @switchx/apps-sdk

Official TypeScript SDK for building mini apps on [SwitchX](https://switchx.gg) - the AI-powered social platform.

## Installation

```bash
npm install @switchx/apps-sdk
```

## Quick Start

### React (with hooks)

```tsx
import { useAuth, useCommunity } from '@switchx/apps-sdk/react';

function App() {
  const { user, isAuthenticated, client } = useAuth();
  const { data: community } = useCommunity();

  // Direct client usage
  const messages = await client.searchMessages('hello');

  return <div>{community?.name}</div>;
}
```

### Core (Universal - Client + Server)

```typescript
import { SwitchXCore } from '@switchx/apps-sdk/core';

const client = new SwitchXCore(token);

// Read operations
const community = await client.getCommunity();
const members = await client.getMembers();
const channels = await client.getChannels();

// AI operations
const response = await client.chatWithAI([
  { role: 'user', content: 'Hello!' }
]);

const imageUrl = await client.generateImage('a beautiful sunset');

// File upload (client-side)
const url = await client.uploadFile(file);
```

### Database (Runtime API)

```typescript
import { SwitchXCore } from '@switchx/apps-sdk/core';

const client = new SwitchXCore(token);

// Query rows
const posts = await client.db.query<{ title: string; published: boolean }>({
  table: 'posts',
  filter: { published: true },
  limit: 20
});

// Query alias
const samePosts = await client.db.find({
  table: 'posts',
  filter: { published: true }
});

// Community scoped records (scope auto-defaults to app-community when communityId exists)
const communityPosts = await client.db.query({
  table: 'posts',
  communityId: 'community-id'
});

// CRUD
const created = await client.db.insert({
  table: 'posts',
  values: { title: 'Hello SwitchX', published: false }
});

const single = await client.db.get({ table: 'posts', id: 'row-id' });

const updated = await client.db.update({
  table: 'posts',
  filter: { id: 'row-id' },
  values: { published: true }
});

await client.db.delete({
  table: 'posts',
  filter: { id: 'row-id' }
});
```

Database auth behavior:
- Token **must** be a JWT that contains the `project_id` claim.
- You do **not** pass `projectId` manually to DB methods.
- SDK derives project routing context from token claim and sends required runtime headers.

## Key Features

✅ **React Hooks** - `useAuth()`, `useCommunity()`, `useMembers()`, etc.
✅ **AI Operations** - Chat with AI and generate images
✅ **File Upload** - Direct client-side upload support
✅ **Universal Core** - Works in browser, Node.js, Edge functions
✅ **TypeScript** - Full type safety and auto-complete
✅ **Zero Config** - Works with SwitchX Bridge out of the box

## Core API Methods

**Community & Users:**
- `getCommunity(communityId?)` - Get community info
- `getMembers(communityId?)` - Get all members
- `getUser(userId)` - Get user info
- `getCurrentUser()` - Get current user

**Channels & Groups:**
- `getChannels(communityId?)` - Get all channels
- `getGroups(communityId?)` - Get all groups
- `getChannelMessages(channelId, options?)` - Get messages
- `getGroupMessages(groupId, options?)` - Get messages

**Search & Utility:**
- `searchMessages(query, options?)` - Search messages
- `isAdmin(userId, communityId?)` - Check admin status

**AI Operations:**
- `chatWithAI(messages, options?)` - Chat with Gemini AI
- `generateImage(prompt, options?)` - Generate images

**File Operations:**
- `uploadFile(file, filename?)` - Upload file (browser)

**Database Operations:**
- `db.query(input)` / `db.find(input)` - Query records
- `db.get(input)` - Get record by ID
- `db.insert(input)` - Insert one or many records
- `db.update(input)` - Update matching records
- `db.delete(input)` - Delete matching records

## React Hooks

All hooks return `{ data, loading, error, refetch }`:

- `useAuth()` - Auth state, user, token, client
- `useCommunity(communityId?)` - Community info
- `useMembers(communityId?)` - Members list
- `useChannels(communityId?)` - Channels
- `useGroups(communityId?)` - Groups
- `useChannelMessages(channelId, options?)` - Channel messages
- `useSearchMessages(query, options?)` - Search results
- `useIsAdmin(userId, communityId?)` - Admin status

## Module Structure

| Module | Environment | Use Case |
|--------|-------------|----------|
| `@switchx/apps-sdk/core` | Universal | Works everywhere (client + server) |
| `@switchx/apps-sdk/react` | Client-only | React hooks with AuthContext |

## Examples

### File Upload Example

```tsx
import { useAuth } from '@switchx/apps-sdk/react';

function FileUpload() {
  const { client } = useAuth();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const url = await client.uploadFile(file);
    console.log('Uploaded:', url);
  };

  return <input type="file" onChange={handleUpload} />;
}
```

### AI Chat Example

```tsx
import { useAuth } from '@switchx/apps-sdk/react';

function AIChat() {
  const { client } = useAuth();

  const chat = async () => {
    const response = await client.chatWithAI([
      { role: 'user', content: 'What is SwitchX?' }
    ], {
      model: 'gemini-2.5-flash',
      temperature: 0.7
    });
    console.log(response);
  };

  return <button onClick={chat}>Ask AI</button>;
}
```

## Environment Variables

```bash
SWITCHX_TOKEN=your-token
SWITCHX_COMMUNITY_ID=your-community-id
```

## TypeScript

Full TypeScript support with auto-complete:

```typescript
import type { CommunityInfo, Message, UserInfo } from '@switchx/apps-sdk/types';
```

## License

MIT

## Links

- Website: [https://switchx.gg](https://switchx.gg)
- GitHub: [https://github.com/new-dev0/switchx-apps-sdk](https://github.com/new-dev0/switchx-apps-sdk)
