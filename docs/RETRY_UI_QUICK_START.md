# Retry UI Feedback - Quick Start Guide

## Visual Preview

The Retry UI Feedback system displays:

### 1. Retry Status Badge
- Shows "Attempt X of Y" during retries
- Color-coded (amber/orange for active retries)

### 2. Error Message
- Displays last error from failed attempt
- Helps users understand what went wrong

### 3. Progress Bar
- Visual representation of retry progress
- Fills as attempts increase

### 4. Countdown Timer
- Shows "Next retry in: Xs" 
- Automatically decrements
- Keeps users informed of wait time

### 5. Retry Button
- Manual retry trigger when applicable
- Only shows if retries remain available

### 6. Visual Indicators
- Animated spinner during active retry
- Pulsing animation for waiting states
- State colors: Blue (pending) → Amber (retrying) → Red (failed) → Green (success)

## Quick Integration - 3 Steps

### Step 1: Import Required Components
```tsx
import { TransactionHeartbeat } from './components/TransactionHeartbeat';
import { useTransactionPersistence } from './components/ui-lib/hooks/useTransactionPersistence';
```

### Step 2: Use in Your Component
```tsx
function MyComponent() {
  const { 
    state, 
    startTransaction, 
    updateState, 
    startRetry,
    logRetryAttempt,
    markRetrySuccess 
  } = useTransactionPersistence();

  const handleTransaction = async () => {
    const txId = 'unique-tx-id';
    startTransaction(txId, 'amount');
    
    try {
      // Your transaction logic
      updateState({ progress: 50, step: 'Processing bridge...' });
      // ... more steps ...
      updateState({ progress: 100, status: 'success' });
    } catch (error) {
      // Handle error with retry
      updateState({ status: 'failed', step: error.message });
      startRetry(3); // Max 3 retries
    }
  };

  return (
    <>
      <button onClick={handleTransaction}>Execute Transaction</button>
      <TransactionHeartbeat />
    </>
  );
}
```

### Step 3: That's It!
The `TransactionHeartbeat` component automatically handles:
- Displaying retry feedback
- Managing retry state
- Showing countdown timers
- Handling manual retries

## State Management Flow

```
User starts transaction
    ↓
[pending] - Transaction processing
    ↓
Error occurs
    ↓
[failed + retryInfo] - Show retry feedback
    ↓
[pending + isRetrying] - Waiting before retry
    ↓
Countdown + Attempt
    ↓
Success? 
  YES → [success]
  NO  → More retries?
         YES → Back to countdown
         NO  → [failed] (max retries exceeded)
```

## Key State Properties

```typescript
{
  // Basic transaction state
  id: string;
  status: 'idle' | 'pending' | 'success' | 'failed' | 'partial';
  progress: number;  // 0-100
  step: string;      // Current step description
  
  // Retry information
  retryInfo?: {
    isRetrying: boolean;       // Currently retrying?
    retryCount: number;        // Current attempt number
    maxRetries: number;        // Maximum allowed
    attempts: Array<{
      attempt: number;
      timestamp: number;
      error?: string;
    }>;
  }
}
```

## Styling Reference

The RetryFeedback component uses these color schemes:

| State | Color | Class |
|-------|-------|-------|
| Active Retry | Amber | `bg-amber-500` |
| Progress | Amber/Orange | Gradient |
| Waiting | Amber (pulsing) | `animate-pulse` |
| Failed | Red | `bg-red-500` |
| Success | Green | `bg-green-500` |

## Common Patterns

### Pattern 1: Simple Transaction with Auto-Retry
```tsx
async function executeTransaction() {
  startTransaction('tx-1');
  try {
    const result = await bridge.transfer(fromToken, toToken);
    updateState({ progress: 100, status: 'success' });
  } catch (error) {
    startRetry(3);  // Auto-setup 3 retries
  }
}
```

### Pattern 2: Manual Retry Control
```tsx
const { state } = useTransactionPersistence();

if (state.retryInfo?.attempts.length === 0) {
  // Show initial error
} else {
  // Show retry history
  state.retryInfo.attempts.forEach((attempt, i) => {
    console.log(`Attempt ${i + 1}: ${attempt.error}`);
  });
}
```

### Pattern 3: Custom Retry Policy
```tsx
// In your service/hook setup
retryService.setPolicy({
  maxRetries: 5,
  backoffMs: 2000,
  backoffStrategy: 'exponential'
});
```

### Pattern 4: Abort Retry on User Action
```tsx
const {
  state,
  clearState,
  updateState
} = useTransactionPersistence();

const handleCancel = () => {
  if (state.retryInfo?.isRetrying) {
    updateState({ status: 'failed', step: 'Cancelled by user' });
    clearState();
  }
};
```

## Visual Examples

### Example 1: Initial Attempt Failure
```
┌─────────────────────────────────────┐
│ ⚠️  Retry Failed                    │
│ Attempt 1 of 3                      │
├─────────────────────────────────────┤
│ Connection timeout                  │
│ ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ 2 retries remaining                 │
│                                      │
│ [      Retry Now      ]             │
└─────────────────────────────────────┘
```

### Example 2: During Retry Countdown
```
┌─────────────────────────────────────┐
│ 🔄 Retrying Transaction             │
│ Attempt 2 of 3                      │
├─────────────────────────────────────┤
│ ●●● Processing retry...             │
│ ████████░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ Next retry in: 2s                   │
│ 1 retry remaining                   │
└─────────────────────────────────────┘
```

### Example 3: Retry Success
```
┌─────────────────────────────────────┐
│ ✓ Transaction Complete              │
│ Attempt 2 of 3 - SUCCEEDED          │
├─────────────────────────────────────┤
│ ███████████████████████████████████ │
│ 100%                                │
│ Transaction completed successfully   │
└─────────────────────────────────────┘
```

## Acceptance Criteria Checklist

- [x] **Retry feedback visible** - RetryFeedback component displays prominently in TransactionHeartbeat
- [x] **Show retry state** - Current attempt, max attempts, error, and countdown displayed
- [x] **Provide feedback when retrying** - Real-time updates during retry process
- [x] **Users aware of retry attempts** - Clear status badge, progress bar, and countdown timer
- [x] **UI updated** - All components integrated and working

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Retry UI not showing | Verify TransactionHeartbeat is rendered |
| State not persisting | Check ssrLocalStorage availability |
| Countdown not working | Ensure nextRetryIn is set and updating |
| Manual retry not triggering | Verify onRetry callback is connected |

## Next Steps

1. Integration with your transaction service
2. Set up retry policy based on your requirements
3. Add analytics tracking for retry metrics
4. Deploy and monitor retry success rates
