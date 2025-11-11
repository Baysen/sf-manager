# Cloud Sharing System

## Overview

Enable users to share their factories via cloud storage with a provider-agnostic architecture. Initial implementation uses GitHub Gists with Device Flow authentication.

## Architecture

### Storage Provider Interface

All storage providers implement a common interface:

```typescript
interface StorageProvider {
  name: string;
  requiresAuth: boolean;
  isAuthenticated: boolean;

  // Auth
  login(): Promise<void>;
  logout(): Promise<void>;

  // Storage operations
  save(factoryData: any, name: string): Promise<string>; // returns share code
  load(shareCode: string): Promise<any>;
  update(shareCode: string, factoryData: any): Promise<void>;
  list(): Promise<SharedFactory[]>;
  delete(shareCode: string): Promise<void>;
}
```

**Benefits:**
- Easy to add new providers later (Supabase, Firebase, etc.)
- Settings can allow user to choose preferred provider
- Testing/mocking is straightforward

## GitHub Gists Provider

### Why GitHub Gists?
- ✅ Free, reliable, owned by Microsoft
- ✅ Version history built-in
- ✅ Can update existing gists
- ✅ No backend required (Device Flow auth)
- ✅ Tech-savvy audience likely has GitHub accounts
- ✅ 5000 API requests/hour is generous

### Authentication: Device Flow

**Why Device Flow?**
- No client secret needed (secure for frontend-only apps)
- No redirect URL needed (works on any domain)
- Simple polling-based flow

**Flow:**
1. App requests device code from GitHub
2. Show user code (e.g., `A1B2-C3D4`) and URL (`github.com/login/device`)
3. User enters code on GitHub website
4. App polls GitHub until user authorizes
5. Receive access token, store in localStorage

**GitHub API Endpoints:**
- `POST https://github.com/login/device/code` - Request device code
- `POST https://github.com/login/oauth/access_token` - Poll for token
- Requires: GitHub OAuth App with client ID (public, no secret needed)

### Gist Structure

Each shared factory is a single gist:

```json
{
  "description": "Satisfactory Factory: Iron Production",
  "public": false, // unlisted (only accessible via direct link)
  "files": {
    "factory.json": {
      "content": "{...factory data...}"
    },
    "metadata.json": {
      "content": "{\"appVersion\": \"1.0.0\", \"created\": \"2025-01-11T...\"}"
    }
  }
}
```

**Gist Operations:**
- Create: `POST /gists`
- Read: `GET /gists/{gist_id}`
- Update: `PATCH /gists/{gist_id}`
- Delete: `DELETE /gists/{gist_id}`
- List user's gists: `GET /gists` (requires auth)

### Share Codes

Share codes use a **provider prefix** format for future multi-provider support:

**Format:** `<provider-prefix>:<share-id>`

**Example:** `gh:a1b2c3d4e5f6` (GitHub Gists)

**URL Format:**
- `https://myapp.com/?share=gh:a1b2c3d4e5f6`
- On load, parse prefix to determine provider → fetch from correct service → show import dialog

**Provider Prefix:**
- `gh` - GitHub Gists (only provider currently)

**Implementation:**
```typescript
// Creating share URL
function createShareUrl(provider: string, code: string): string {
  const prefix = providerPrefixes[provider]; // 'gh' for GitHub
  return `${window.location.origin}/?share=${prefix}:${code}`;
}

// Parsing share code
function parseShareCode(shareParam: string): { provider: string, code: string } {
  const [prefix, code] = shareParam.split(':');
  const provider = prefixToProvider[prefix] || 'github-gists'; // default to GitHub
  return { provider, code };
}
```

**Benefits:**
- Clean single-parameter URL
- Explicit provider identification
- Human-readable
- Fast loading (know which service to fetch from)
- Extensible if other providers are added later

## User Flows

### Share a Factory (Authenticated)

1. User clicks "Share Factory" button
2. **If not authenticated:**
   - Show modal with "Login with GitHub" button
   - User clicks → start Device Flow
   - Show code and instructions
   - Poll until authorized
   - Store access token
3. **If authenticated:**
   - Show share options:
     - [ ] Create new share
     - [ ] Update existing share (dropdown of user's gists)
   - User clicks "Share"
   - Create/update gist
   - Show success with shareable URL
   - Copy to clipboard button

### Load a Shared Factory

1. User opens URL with `?share=abc123`
2. App fetches gist (no auth required for reading)
3. Show preview modal:
   - Factory name
   - Locations count
   - Last modified date
   - [Import to My Factories] button
4. User clicks import → save to localStorage
5. Remove `?share` from URL (clean history)

### Manage Shared Factories

New section in settings/sidebar:
- "My Shared Factories" (only visible when authenticated)
- List of user's gists with:
  - Name
  - Last modified
  - [Update] [Delete] [Copy Link] buttons

## UI Components

### ShareModal.vue
- Login flow (Device Flow instructions)
- Share options (new vs update)
- Success state with shareable link

### ImportSharedFactoryDialog.vue
- Preview shared factory details
- Import button
- Error handling (gist not found, invalid data)

### SharedFactoriesList.vue
- List user's gists
- Management actions

## Data Storage

### LocalStorage Keys
- `satisfactory-manager-github-token`: Access token
- `satisfactory-manager-github-user`: User info (username, avatar)

### Settings
```typescript
{
  storageProvider: 'github-gists', // future: 'supabase', etc.
  // ... existing settings
}
```

## Security Considerations

- ✅ Access token stored in localStorage (acceptable for read-only gist operations)
- ✅ Gists are unlisted by default (not discoverable without link)
- ✅ No server-side secrets required
- ⚠️ Users should not share sensitive data (this is a game tracker, low risk)
- ⚠️ Token has gist scope only (minimal permissions)

## Error Handling

- Network failures → retry with exponential backoff
- Invalid gist ID → show friendly "not found" message
- Rate limit exceeded → show error with retry time
- Auth failures → clear token, prompt re-login

## Future Enhancements

- Real-time collaboration (requires different provider like Supabase)
- Public factory gallery (browse public gists)
- Gist comments for collaboration
- Fork tracking (who forked whose factory)

## Implementation Checklist

- [ ] Create `StorageProvider` interface (`src/types/storage.ts`)
- [ ] Implement `GitHubGistsProvider` (`src/lib/storage/github-gists.ts`)
  - [ ] Device Flow authentication
  - [ ] Token storage/retrieval
  - [ ] CRUD operations for gists
- [ ] Create `ShareModal.vue` component
- [ ] Create `ImportSharedFactoryDialog.vue` component
- [ ] Add URL parameter handling to `App.vue`
- [ ] Add "Share Factory" button to UI
- [ ] Add "My Shared Factories" section
- [ ] Update settings to include storage provider choice
- [ ] Error handling and loading states
- [ ] Documentation and user help text
