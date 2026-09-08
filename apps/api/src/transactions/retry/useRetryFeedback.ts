import { useEffect, useCallback } from 'react';
import { useTransactionPersistence } from './useTransactionPersistence';

/**
 * Hook to integrate transaction retry feedback with the transaction persistence state
 * Listens to retry service events and updates UI state accordingly
 */
export function useRetryFeedback(
  transactionId: string,
  retryService: any, // TransactionRetryService instance
) {
  const { startRetry, logRetryAttempt, markRetrySuccess, updateState } = useTransactionPersistence();

  const handleRetryStateChange = useCallback((state: any) => {
    const { isRetrying, currentAttempt, maxAttempts, error, nextRetryIn } = state;

    if (isRetrying) {
      if (currentAttempt === 1) {
        // First retry attempt
        startRetry(maxAttempts);
      } else {
        // Update step to show current attempt
        updateState({
          step: `Retrying... (Attempt ${currentAttempt}/${maxAttempts})`,
        });
      }

      if (nextRetryIn && nextRetryIn > 0) {
        // Show countdown
        updateState({
          step: `Retrying in ${Math.ceil(nextRetryIn / 1000)}s... (Attempt ${currentAttempt}/${maxAttempts})`,
        });
      }
    } else if (error) {
      // Retry failed
      logRetryAttempt(error);
    } else {
      // Retry succeeded
      markRetrySuccess();
    }
  }, [startRetry, logRetryAttempt, markRetrySuccess, updateState]);

  useEffect(() => {
    if (!retryService) return;

    // Register listener with retry service
    retryService.onRetryStateChange(transactionId, handleRetryStateChange);

    return () => {
      // Cleanup listener
      retryService.offRetryStateChange(transactionId);
    };
  }, [transactionId, retryService, handleRetryStateChange]);

  return {
    handleRetryStateChange,
  };
}
