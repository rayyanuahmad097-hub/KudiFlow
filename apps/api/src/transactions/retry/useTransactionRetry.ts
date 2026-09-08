import { useCallback, useEffect, useState } from 'react';
import { TransactionRetryService } from './transaction-retry.service';
import { Transaction } from '../entities/transaction.entity';

export interface RetryFeedback {
  isRetrying: boolean;
  currentAttempt: number;
  maxAttempts: number;
  lastError?: string;
  nextRetryIn?: number; // milliseconds
}

export function useTransactionRetry(
  transaction: Transaction,
  retryService: TransactionRetryService,
) {
  const [retrying, setRetrying] = useState(false);
  const [retryResult, setRetryResult] = useState<Transaction | null>(null);
  const [logs, setLogs] = useState([]);
  const [feedback, setFeedback] = useState<RetryFeedback>({
    isRetrying: false,
    currentAttempt: transaction?.retryCount || 0,
    maxAttempts: transaction?.maxRetries || 3,
    lastError: transaction?.error,
  });

  const retry = useCallback(async () => {
    setRetrying(true);
    setFeedback(prev => ({
      ...prev,
      isRetrying: true,
      currentAttempt: prev.currentAttempt + 1,
    }));

    try {
      const result = await retryService.retryTransaction(transaction);
      setRetryResult(result);
      
      if (result) {
        setFeedback(prev => ({
          ...prev,
          isRetrying: false,
          lastError: undefined,
        }));
      } else {
        setFeedback(prev => ({
          ...prev,
          isRetrying: false,
          lastError: 'Max retries exceeded',
        }));
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setFeedback(prev => ({
        ...prev,
        isRetrying: false,
        lastError: errorMsg,
      }));
    }

    setRetrying(false);
    setLogs(retryService.getRetryLogs(transaction.id));
  }, [transaction, retryService]);

  useEffect(() => {
    setLogs(retryService.getRetryLogs(transaction.id));
    setFeedback(prev => ({
      ...prev,
      currentAttempt: transaction?.retryCount || prev.currentAttempt,
      maxAttempts: transaction?.maxRetries || prev.maxAttempts,
      lastError: transaction?.error || prev.lastError,
    }));
  }, [transaction, retryService]);

  return {
    retrying,
    retryResult,
    logs,
    retry,
    feedback,
  };
}
