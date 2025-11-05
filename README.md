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

const client = new SwitchXCore(token, communityId);

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

### Server (Node.js)

```typescript
import { switchx } from '@switchx/apps-sdk/server';

switchx.setup(process.env.MINIAPPS_TOKEN, process.env.COMMUNITY_ID);

// All Core methods + server-specific
const community = await switchx.getCommunity();

// Upload from Buffer (Node.js only)
const url = await switchx.uploadFromBuffer(buffer, 'image.png', 'image/png');

// AI operations
const response = await switchx.chatWithAI([
  { role: 'user', content: 'Hello!' }
]);
```

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
- `uploadFromBuffer(buffer, filename, mimeType)` - Upload (Node.js only)

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
| `@switchx/apps-sdk/server` | Server-only | Node.js Buffer operations |

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

### Next.js API Route Example

```typescript
// app/api/community/route.ts
import { switchx } from '@switchx/apps-sdk/server';

switchx.setup(process.env.MINIAPPS_TOKEN);

export async function GET() {
  const community = await switchx.getCommunity();
  return Response.json(community);
}
```

## Environment Variables

```bash
MINIAPPS_TOKEN=your-token
COMMUNITY_ID=your-community-id
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
