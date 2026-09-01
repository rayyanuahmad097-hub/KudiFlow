# SDK Versioning Guide

## Overview

KudiFlow now includes comprehensive version tracking and display capabilities for debugging, analytics, and compatibility checking. The versioning system spans across the entire stack:

- **Core SDK** - `@kudiflow/bridge-core` package
- **API** - REST endpoint for version information
- **Frontend** - React components and hooks for UI display

---

## Table of Contents

- [Backend API](#backend-api)
- [Core SDK](#core-sdk)
- [Frontend Components](#frontend-components)
- [Usage Examples](#usage-examples)
- [Environment Detection](#environment-detection)
- [Testing](#testing)

---

## Backend API

### Version Endpoint

The API exposes a `/version` endpoint that returns current SDK and API version information.

**Endpoint:** `GET /version`

**Response:**
```json
{
  "version": "0.0.1",
  "build": "2024-01-15T12:00:00.000Z",
  "apiVersion": "v1",
  "environment": "development",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

**Fields:**
- `version` - Current SDK version from package.json
- `build` - Build timestamp or build number
- `apiVersion` - API version (v1, v2, etc.)
- `environment` - Runtime environment (development/staging/production)
- `timestamp` - Response timestamp

**Example Usage:**
```bash
curl http://localhost:3000/version
```

### Implementation Files

- `apps/api/src/version/version.controller.ts` - REST endpoint
- `apps/api/src/version/version.module.ts` - Module configuration
- `apps/api/src/app.module.ts` - Module registration

---

## Core SDK

### Version Utilities

The Core SDK provides comprehensive version utilities in `packages/utils/src/version.ts`.

#### Installation

```typescript
import { 
  getSDKVersion, 
  getVersionString, 
  satisfiesMinVersion,
  compareVersions,
  logVersionInfo 
} from '@kudiflow/bridge-core';
```

#### Available Functions

##### `getSDKVersion()`

Returns detailed version information object.

```typescript
const version = getSDKVersion();
console.log(version);
// {
//   version: "0.1.0",
//   major: 0,
//   minor: 1,
//   patch: 0,
//   environment: "development"
// }
```

##### `getVersionString()`

Returns the version string (e.g., "0.1.0").

```typescript
const version = getVersionString();
console.log(version); // "0.1.0"
```

##### `satisfiesMinVersion(minVersion)`

Checks if current version meets minimum requirements.

```typescript
if (satisfiesMinVersion('1.0.0')) {
  // Use new features
} else {
  // Fallback for older versions
}
```

##### `compareVersions(v1, v2)`

Compares two semantic versions.

```typescript
compareVersions('1.2.0', '1.1.0'); // 1 (greater)
compareVersions('1.0.0', '1.0.0'); // 0 (equal)
compareVersions('0.9.0', '1.0.0'); // -1 (less)
```

##### `logVersionInfo()`

Logs version information to console (useful for debugging).

```typescript
logVersionInfo();
// Console output:
// 🔗 KudiFlow SDK
//   Version: 0.1.0
//   Major: 0
//   Minor: 1
//   Patch: 0
//   Environment: development
```

##### Constants

```typescript
import { VERSION, MAJOR_VERSION, MINOR_VERSION, PATCH_VERSION } from '@kudiflow/bridge-core';

console.log(VERSION); // "0.1.0"
console.log(MAJOR_VERSION); // 0
console.log(MINOR_VERSION); // 1
console.log(PATCH_VERSION); // 0
```

---

## Frontend Components

### React Hooks

#### useVersion Hook

Fetches and displays API version information.

```typescript
import { useVersion } from './hooks/useVersion';

function MyComponent() {
  const { version, loading, error, refetch } = useVersion({
    apiUrl: 'http://localhost:3000',
    refreshInterval: 60000, // Refresh every minute
    enableLogging: true,
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <p>SDK Version: {version?.version}</p>
      <p>Environment: {version?.environment}</p>
    </div>
  );
}
```

**Options:**
- `apiUrl` - API base URL (default: `process.env.NEXT_PUBLIC_API_URL`)
- `refreshInterval` - Auto-refresh interval in ms (0 = disabled)
- `enableLogging` - Log version to console on mount

#### useLocalVersion Hook

Gets local package version without API call.

```typescript
import { useLocalVersion } from './hooks/useVersion';

function MyComponent() {
  const version = useLocalVersion();
  return <span>v{version}</span>;
}
```

### React Components

#### VersionDisplay Component

A ready-to-use component for displaying version information.

```typescript
import { VersionDisplay } from './components/VersionDisplay';

function App() {
  return (
    <header>
      <h1>My App</h1>
      <VersionDisplay />
    </header>
  );
}
```

**Props:**
- `className` - Custom CSS class
- `showDetails` - Show detailed view (default: false)
- `enableLogging` - Enable console logging (default: true)
- `apiUrl` - Override API URL
- `onClick` - Click handler with version data

**Examples:**

Simple badge:
```tsx
<VersionDisplay />
```

Detailed view:
```tsx
<VersionDisplay showDetails={true} />
```

With custom styling:
```tsx
<VersionDisplay className="fixed bottom-4 right-4" />
```

With click handler:
```tsx
<VersionDisplay 
  onClick={(v) => {
    alert(`Running version ${v.version}`);
  }}
/>
```

---

## Usage Examples

### Debug Mode

Enable version logging in development:

```typescript
// app.tsx
import { logVersionInfo } from '@kudiflow/bridge-core';

if (process.env.NODE_ENV === 'development') {
  logVersionInfo();
}
```

### Version Compatibility Check

Check SDK version before using features:

```typescript
import { satisfiesMinVersion } from '@kudiflow/bridge-core';

function useAdvancedFeature() {
  if (!satisfiesMinVersion('1.2.0')) {
    throw new Error('Advanced feature requires SDK v1.2.0 or higher');
  }
  
  // Use advanced feature
}
```

### Analytics Tracking

Track SDK version with analytics:

```typescript
import { getSDKVersion } from '@kudiflow/bridge-core';

const version = getSDKVersion();

analytics.track('app_initialized', {
  sdk_version: version.version,
  environment: version.environment,
});
```

### Error Reporting

Include version in error reports:

```typescript
import { getVersionString } from '@kudiflow/bridge-core';

try {
  // Some operation
} catch (error) {
  errorReporter.report(error, {
    sdkVersion: getVersionString(),
    timestamp: new Date().toISOString(),
  });
}
```

---

## Environment Detection

The SDK automatically detects the runtime environment:

- **development** - Local development (`NODE_ENV=development`)
- **test** - Testing environment (`NODE_ENV=test`)
- **production** - Production builds (`NODE_ENV=production`)
- **staging** - Staging servers (custom detection)

Environment affects version badge colors:
- 🟢 **Green** - Production
- 🟡 **Yellow** - Staging
- 🔵 **Blue** - Development/Test

---

## Testing

### Unit Tests

Test version utilities:

```typescript
import { 
  getSDKVersion, 
  satisfiesMinVersion, 
  compareVersions 
} from '@kudiflow/bridge-core';

describe('Version Utilities', () => {
  test('getSDKVersion returns correct structure', () => {
    const version = getSDKVersion();
    expect(version).toHaveProperty('version');
    expect(version).toHaveProperty('major');
    expect(version).toHaveProperty('minor');
    expect(version).toHaveProperty('patch');
  });

  test('satisfiesMinVersion works correctly', () => {
    expect(satisfiesMinVersion('0.0.1')).toBe(true);
    expect(satisfiesMinVersion('99.0.0')).toBe(false);
  });

  test('compareVersions handles all cases', () => {
    expect(compareVersions('1.0.0', '0.9.0')).toBe(1);
    expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
    expect(compareVersions('0.9.0', '1.0.0')).toBe(-1);
  });
});
```

### Integration Tests

Test API endpoint:

```typescript
import request from 'supertest';

describe('Version API', () => {
  it('returns version information', async () => {
    const response = await request(app).get('/version');
    
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      version: expect.any(String),
      apiVersion: expect.any(String),
      environment: expect.any(String),
      timestamp: expect.any(String),
    });
  });
});
```

### Component Tests

Test VersionDisplay component:

```typescript
import { render, screen } from '@testing-library/react';
import { VersionDisplay } from './VersionDisplay';

describe('VersionDisplay', () => {
  it('renders version badge', async () => {
    render(<VersionDisplay />);
    
    // Wait for version to load
    const badge = await screen.findByText(/v\d+\.\d+\.\d+/);
    expect(badge).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<VersionDisplay />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

---

## Configuration

### Build-time Variables

Set build information via environment variables:

```bash
# .env
BUILD_DATE=2024-01-15T12:00:00.000Z
BUILD_NUMBER=12345
NODE_ENV=production
```

### Package.json Version

The SDK version is read from `package.json`:

```json
{
  "name": "@kudiflow/bridge-core",
  "version": "0.1.0"
}
```

---

## Troubleshooting

### Version Not Displaying

**Problem:** Version shows as `v?.?.?` or doesn't load

**Solutions:**
1. Check API is running at the configured URL
2. Verify `/version` endpoint responds: `curl http://localhost:3000/version`
3. Check browser console for errors
4. Ensure CORS is properly configured

### Incorrect Version

**Problem:** Version doesn't match package.json

**Solutions:**
1. Rebuild the package: `npm run build`
2. Clear cache: `rm -rf node_modules/.cache`
3. Restart development server
4. Check you're looking at the right package (utils vs ui vs api)

### TypeScript Errors

**Problem:** Type errors when importing version utilities

**Solutions:**
1. Ensure `@kudiflow/bridge-core` is in dependencies
2. Run `npm install` to update type definitions
3. Restart TypeScript server in VS Code
4. Check tsconfig.json paths are correct

---

## Best Practices

✅ **Do:**
- Enable version logging in development for easier debugging
- Include version in error reports and analytics
- Check minimum version before using new features
- Display version prominently in admin/debug panels
- Update version in package.json before each release

❌ **Don't:**
- Hardcode version strings (always use utilities)
- Ignore version mismatches in production
- Forget to rebuild after version changes
- Expose sensitive build information in production

---

## API Reference

### Core SDK Exports

```typescript
// From @kudiflow/bridge-core
export {
  getSDKVersion,
  getVersionString,
  satisfiesMinVersion,
  compareVersions,
  logVersionInfo,
  VERSION,
  MAJOR_VERSION,
  MINOR_VERSION,
  PATCH_VERSION,
} from './version';

export type { SDKVersion } from './version';
```

### Frontend Exports

```typescript
// From hooks/useVersion
export { useVersion, useLocalVersion };
export type { VersionData, UseVersionOptions };

// From components/VersionDisplay
export { VersionDisplay };
export type { VersionDisplayProps };
```

### API Response Type

```typescript
interface VersionInfo {
  version: string;
  build?: string;
  apiVersion: string;
  environment: string;
  timestamp: string;
}
```

---

## Changelog

### v0.1.0 (Initial Release)
- ✅ Core SDK version utilities
- ✅ API version endpoint
- ✅ React hooks (useVersion, useLocalVersion)
- ✅ VersionDisplay component
- ✅ Environment detection
- ✅ Version comparison functions
- ✅ Console logging utility

---

## Support

For issues or questions about SDK versioning:

1. Check this documentation first
2. Review examples in `/examples` directory
3. Open an issue on GitHub
4. Check API docs at `/api/docs`

---

**Last Updated:** 2024-01-15  
**Current SDK Version:** 0.1.0
