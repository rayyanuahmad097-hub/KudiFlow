# SSR Compatibility Guide

KudiFlow components and hooks are designed to work seamlessly in Server-Side Rendering (SSR) environments, including Next.js applications.

## Overview

KudiFlow provides full SSR compatibility without:

- ❌ Hydration mismatches
- ❌ Window reference errors  
- ❌ Runtime crashes during server rendering
- ❌ localStorage access errors

## ✅ What Works Out of the Box

All KudiFlow components and hooks include built-in SSR guards:

- `<BridgeCompare />` - SSR-safe with hydration protection
- `useBridgeQuotes()` - Server-safe quote fetching
- `useTransactionPersistence()` - Safe localStorage operations
- `TransactionContext` - SSR-safe state management

## 🚀 Quick Start with Next.js

### App Router (Recommended)

```tsx
// app/bridge/page.tsx
import { BridgeCompare } from '@kudiflow/react';

export default function BridgePage() {
  const params = {
    amount: '100',
    sourceChain: 'ethereum',
    destinationChain: 'polygon',
    sourceToken: 'USDC',
    destinationToken: 'USDC'
  };

  return (
    <div>
      <h1>Bridge Assets</h1>
      <BridgeCompare
        initialParams={params}
        onQuoteSelect={(quoteId) => console.log(quoteId)}
      />
    </div>
  );
}
```

### Pages Router

```tsx
// pages/bridge.tsx
import { BridgeCompare } from '@kudiflow/react';

export default function BridgePage() {
  const params = {
    amount: '100',
    sourceChain: 'ethereum', 
    destinationChain: 'polygon',
    sourceToken: 'USDC',
    destinationToken: 'USDC'
  };

  return (
    <div>
      <h1>Bridge Assets</h1>
      <BridgeCompare
        initialParams={params}
        onQuoteSelect={(quoteId) => console.log(quoteId)}
      />
    </div>
  );
}
```

## 🛡️ Dynamic Import Pattern (Optional)

For maximum SSR safety, you can disable SSR for specific components:

```tsx
import dynamic from 'next/dynamic';

const BridgeCompare = dynamic(
  () => import('@kudiflow/react').then(mod => mod.BridgeCompare),
  { 
    ssr: false,
    loading: () => <div>Loading Bridge...</div>
  }
);

export default function Page() {
  return <BridgeCompare initialParams={params} />;
}
```

## 🔧 SSR Safety Features

### 1. Browser API Guards

All browser-specific APIs are protected:

```typescript
// ✅ Safe - Built into KudiFlow
import { ssrLocalStorage } from '@kudiflow/react/utils';

// ❌ Unsafe - Don't do this
if (typeof window !== 'undefined') {
  localStorage.getItem('key');
}
```

### 2. Hydration Protection

Components use `useIsMounted()` hook to prevent hydration mismatches:

```typescript
// ✅ Built into KudiFlow components
const isMounted = useIsMounted();

if (isMounted) {
  // Client-side only logic
}
```

### 3. Client-Side Execution

Wallet connections and bridge execution are automatically delayed until after hydration:

```typescript
// ✅ Automatic - No manual intervention needed
const { quotes, refresh } = useBridgeQuotes({
  initialParams,
  // Quote fetching starts client-side only
});
```

## 📋 SSR Compatibility Checklist

When integrating KudiFlow in SSR environments:

- [x] **No direct window access** - All browser APIs are guarded
- [x] **No localStorage errors** - Uses SSR-safe storage utilities  
- [x] **Consistent rendering** - Server and client output match
- [x] **Proper hydration** - No hydration mismatch warnings
- [x] **Client-side logic** - Wallet/bridge logic delayed appropriately

## 🧪 Testing SSR Compatibility

### 1. Development Testing

```bash
npm run dev
```

Check browser console for:
- ❌ Hydration mismatch warnings
- ❌ "window is not defined" errors  
- ❌ "localStorage is not defined" errors

### 2. Production Build Testing

```bash
npm run build
npm run start
```

Verify:
- ✅ Pages render without errors
- ✅ Components hydrate correctly
- ✅ Interactive functionality works

### 3. Static Export Testing

```bash
npm run build
npm run export
```

Test static HTML output for proper SSR behavior.

## 🔍 Common Issues & Solutions

### Issue: Hydration Mismatch
**Problem**: Server and client render different content
**Solution**: KudiFlow components already handle this with `useIsMounted()`

### Issue: localStorage Error  
**Problem**: `localStorage is not defined` during SSR
**Solution**: Use built-in `ssrLocalStorage` utilities (included)

### Issue: Window Reference Error
**Problem**: `window is not defined` during SSR  
**Solution**: All KudiFlow components guard window access

## 📚 Advanced Usage

### Custom SSR-Safe Components

```typescript
import { useIsMounted, ssrLocalStorage } from '@kudiflow/react/utils';

function MyComponent() {
  const isMounted = useIsMounted();
  
  useEffect(() => {
    if (isMounted) {
      // Client-side only operations
      ssrLocalStorage.setItem('key', 'value');
    }
  }, [isMounted]);
  
  return <div>{isMounted ? 'Client' : 'Server'}</div>;
}
```

### Server-Side Data Fetching

```typescript
// KudiFlow hooks work with SSR data fetching
export async function getServerSideProps() {
  // Fetch initial data server-side
  const initialParams = await fetchBridgeParams();
  
  return {
    props: { initialParams }
  };
}
```

## 🎯 Best Practices

1. **Use Built-in Components**: Prefer `<BridgeCompare />` over custom implementations
2. **Trust SSR Guards**: Don't add manual `typeof window` checks
3. **Test Both Environments**: Verify dev and production behavior
4. **Monitor Console**: Check for hydration warnings
5. **Use Dynamic Imports**: Optional for maximum SSR safety

## 📄 Migration Guide

### From Non-SSR Setup

If you're migrating from a client-side only setup:

```typescript
// ❌ Before - Manual SSR guards
function MyComponent() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  
  if (!mounted) return null;
  // Component logic...
}

// ✅ After - Built-in SSR safety  
import { useIsMounted } from '@kudiflow/react/utils';

function MyComponent() {
  const isMounted = useIsMounted();
  
  // Component logic automatically handles SSR
}
```

## 🆘 Troubleshooting

### Getting Help

- **Check Console**: Look for hydration warnings
- **Verify Imports**: Use `@kudiflow/react` package
- **Test Environment**: Try both dev and production
- **Review Code**: Ensure no manual browser API access

### Known Limitations

- Some third-party wallet integrations may require dynamic imports
- Complex animations might need additional hydration guards
- Custom components should use provided SSR utilities

---

**KudiFlow SSR compatibility ensures your dApp works seamlessly in modern Next.js applications while maintaining optimal performance and user experience.**
