# Transaction History Export - Setup Instructions

## Overview
This document provides setup instructions for the Transaction History Export feature after implementation.

## Prerequisites
- Node.js v18+ installed
- npm or pnpm package manager
- Existing KudiFlow codebase

## Installation Steps

### 1. Install API Dependencies

Navigate to the API directory and install the new dependencies:

```bash
cd apps/api
npm install
```

Or using pnpm:
```bash
cd apps/api
pnpm install
```

**New Dependencies Added:**
- `@nestjs/swagger` - API documentation
- `@nestjs/typeorm` - Database ORM integration
- `@nestjs/event-emitter` - Event handling
- `class-validator` - DTO validation
- `typeorm` - Database operations

### 2. Install Web App Dependencies (if needed)

The web app already has the required dependencies, but you may need to update TypeScript types:

```bash
cd apps/web
npm install
```

### 3. Build the API

After installing dependencies, build the API:

```bash
cd apps/api
npm run build
```

### 4. Start the Development Server

```bash
cd apps/api
npm run start:dev
```

### 5. Verify the Export Endpoint

Once the API is running, test the export endpoint:

**Test CSV Export:**
```bash
curl -o transactions.csv "http://localhost:3000/transactions/export/csv"
```

**Test JSON Export:**
```bash
curl -o transactions.json "http://localhost:3000/transactions/export/json"
```

## Frontend Usage

### Using the Export Button Component

```tsx
import { TransactionExportButton } from './components/TransactionExportButton';

function MyComponent() {
  return (
    <TransactionExportButton 
      filters={{
        sourceChain: 'ethereum',
        destinationChain: 'polygon',
      }}
      onSuccess={() => console.log('Export successful')}
      onError={(error) => console.error('Export failed:', error)}
    />
  );
}
```

### Using the Export Hook

```tsx
import { useTransactionExport } from './hooks/useTransactionExport';

function MyComponent() {
  const { export: exportData, loading, error } = useTransactionExport();

  const handleExport = async () => {
    try {
      await exportData('csv', { account: '0x...' });
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <button onClick={handleExport} disabled={loading}>
      {loading ? 'Exporting...' : 'Export Transactions'}
    </button>
  );
}
```

## API Endpoint Documentation

### Export Transactions

**Endpoint:** `GET /transactions/export/:format`

**Parameters:**
- `format` (path): `csv` or `json`
- `account` (query): Filter by account address
- `sourceChain` (query): Filter by source chain
- `destinationChain` (query): Filter by destination chain
- `bridgeName` (query): Filter by bridge name
- `status` (query): Filter by status
- `startDate` (query): Start date (ISO 8601)
- `endDate` (query): End date (ISO 8601)

**Example:**
```bash
curl -o transactions.csv \
  "http://localhost:3000/transactions/export/csv?account=0x742d35Cc6634C0532925a3b844Bc328e8f94D5dC&startDate=2024-01-01T00:00:00.000Z"
```

## Troubleshooting

### TypeScript Module Resolution Errors

If you see errors like "Cannot find module '@nestjs/common'", run:

```bash
cd apps/api
npm install
```

Then restart your TypeScript server in VS Code:
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "TypeScript: Restart TS Server"
3. Press Enter

### PowerShell Execution Policy Error

If you encounter "running scripts is disabled on this system", use one of these solutions:

**Option 1: Run npm directly with full path**
```bash
C:\Program Files
odejs
ode.exe C:\Program Files
odejs
ode_modules
pm\bin
pm-cli.js install --prefix apps/api
```

**Option 2: Use Command Prompt instead of PowerShell**
Open `cmd.exe` and run:
```cmd
cd c:\Users\g-ekoh\Desktop\KudiFlow\apps\api
npm install
```

**Option 3: Temporarily allow script execution (admin required)**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
npm install
```

### Build Errors

If the build fails, ensure all dependencies are installed:

```bash
# Clean install
cd apps/api
rm -rf node_modules package-lock.json
npm install
npm run build
```

## File Structure

### Backend Files
```
apps/api/src/transactions/
├── dto/
│   └── export-transactions.dto.ts       # Export validation DTO
├── transactions-export.service.ts        # Export service logic
├── transactions.controller.ts            # Export endpoint
└── transactions.module.ts                # Module configuration
```

### Frontend Files
```
apps/web/
├── components/
│   └── TransactionExportButton.tsx       # Export button UI
├── hooks/
│   └── useTransactionExport.ts           # Export hook
├── services/
│   └── transaction-export.service.ts     # API client
└── utils/
    └── export-utils.ts                   # Download utilities
```

## Next Steps

1. ✅ Install dependencies (`npm install`)
2. ✅ Build the API (`npm run build`)
3. ✅ Start the development server (`npm run start:dev`)
4. ✅ Test the export endpoint
5. ✅ Integrate the export button into your UI
6. ✅ Review API documentation at `/api/docs`

## Support

For issues or questions:
- Check the API documentation at `http://localhost:3000/api/docs`
- Review `docs/API_DOCUMENTATION.md` for complete API reference
- Check `docs/TRANSACTION_EXPORT_SETUP.md` (this file) for setup help
