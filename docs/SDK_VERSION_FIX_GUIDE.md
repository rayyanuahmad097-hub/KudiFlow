# SDK Versioning - Quick Fix Guide

## Current Issues

The codebase has several issues preventing the build from completing:

### 1. Missing Dependencies
Some required dependencies need to be installed:

```bash
cd c:\Users\g-ekoh\Desktop\KudiFlow
npm install class-transformer @nestjs/throttler @nestjs/axios
```

### 2. Merge Conflicts
Multiple files have Git merge conflicts that need resolution:

**Files with conflicts:**
- `apps/api/src/bridge-compare/aggregation.service.ts` ⚠️ (partially fixed)
- `apps/api/src/dynamic-bridge-discovery/bridge.loader.ts`
- `apps/api/src/dynamic-bridge-discovery/bridge.registry.ts`
- `apps/api/src/dynamic-bridge-discovery/http-bridge.adapter.ts`
- `apps/api/src/dynamic-bridge-discovery/websocket-bridge.adapter.ts`

### 3. TypeScript Type Issues
Some services need type assertions for Axios responses.

---

## Solution Steps

### Step 1: Install Missing Dependencies

Run this command in the root directory:

```bash
cd c:\Users\g-ekoh\Desktop\KudiFlow
npm install
```

This will install all dependencies including:
- `class-transformer`
- `@nestjs/throttler` 
- `@nestjs/axios`
- All other required packages

### Step 2: Resolve Merge Conflicts

For each conflicted file, you need to choose which version to keep. The pattern is:

**Keep the version WITHOUT the path prefix in imports.**

Example fix pattern:
```typescript
// ❌ WRONG (with path prefix)
import { Something } from '../interfaces';

// ✅ CORRECT (relative to current directory)
import { Something } from './interfaces';
```

**Quick Fix Command:**
```bash
# Accept "theirs" (incoming changes) for all conflicts
cd c:\Users\g-ekoh\Desktop\KudiFlow
git checkout --theirs .
```

Or manually edit each file and remove lines containing:
- `<<<<<<< HEAD:...`
- `=======`
- `>>>>>>> commit_hash:...`

### Step 3: Fix TypeScript Errors

The main TypeScript errors are in gas-price.adapter.ts. These need type assertions:

```typescript
// Change this:
if (response.data.status === '1')

// To this:
const responseData = response.data as any;
if (responseData.status === '1')
```

### Step 4: Build the Project

After fixing conflicts:

```bash
cd c:\Users\g-ekoh\Desktop\KudiFlow\apps\api
npm run build
```

---

## SDK Versioning Feature Status

✅ **Completed Components:**

### Core SDK (`packages/utils/src/version.ts`)
- [x] `getSDKVersion()` function
- [x] `getVersionString()` function  
- [x] `satisfiesMinVersion()` function
- [x] `compareVersions()` function
- [x] `logVersionInfo()` function
- [x] Constants (VERSION, MAJOR_VERSION, etc.)

### API Endpoint (`apps/api/src/version/`)
- [x] VersionController created
- [x] GET /version endpoint
- [x] VersionModule created
- [x] Added to app.module.ts

### Frontend (`apps/web/`)
- [x] useVersion hook
- [x] useLocalVersion hook
- [x] VersionDisplay component
- [x] Integrated into main page

### Documentation
- [x] SDK_VERSIONING.md created

---

## Testing the Version Feature

Once the build is working, test these endpoints:

### 1. API Version Endpoint
```bash
curl http://localhost:3000/version
```

Expected response:
```json
{
  "version": "0.0.1",
  "build": "2024-01-15T...",
  "apiVersion": "v1",
  "environment": "development",
  "timestamp": "2024-01-15T..."
}
```

### 2. SDK Version Utilities
```typescript
import { getSDKVersion, logVersionInfo } from '@kudiflow/bridge-core';

// Test in browser console or Node.js
const version = getSDKVersion();
console.log('SDK Version:', version.version);

// Or use the logging function
logVersionInfo();
```

### 3. UI Component
```tsx
import { VersionDisplay } from './components/VersionDisplay';

// In your React component
<VersionDisplay showDetails={true} />
```

---

## Alternative: Minimal Working Version

If you want to skip the complex fixes and just test the versioning feature:

### Option A: Use Only Core SDK

The version utilities in `packages/utils/src/version.ts` work independently. You can test them directly:

```bash
cd c:\Users\g-ekoh\Desktop\KudiFlow\packages\utils
npx ts-node src/version.ts
```

### Option B: Test API Endpoint Only

Start the API server (ignoring other errors):

```bash
cd c:\Users\g-ekoh\Desktop\KudiFlow\apps\api
npm run start:dev
```

Then visit: `http://localhost:3000/version`

---

## Files Created for SDK Versioning

These files are ready and working (once dependencies are installed):

1. ✅ `packages/utils/src/version.ts` - Core SDK version utilities
2. ✅ `apps/api/src/version/version.controller.ts` - API endpoint
3. ✅ `apps/api/src/version/version.module.ts` - Module config
4. ✅ `apps/web/hooks/useVersion.ts` - React hooks
5. ✅ `apps/web/components/VersionDisplay.tsx` - UI component
6. ✅ `docs/SDK_VERSIONING.md` - Documentation

---

## Next Steps

1. **Install dependencies**: `npm install`
2. **Fix merge conflicts**: Use `git checkout --theirs .` or manually edit
3. **Build**: `npm run build`
4. **Test**: Visit `/version` endpoint or use SDK utilities

---

## Support

If you encounter specific errors after following these steps, check:

1. **Dependency errors**: Run `npm install` again
2. **TypeScript errors**: Look at the specific error message and add type assertions
3. **Import errors**: Ensure paths are relative (`./` not `../`)

For more detailed guidance, see `docs/SDK_VERSIONING.md`.
