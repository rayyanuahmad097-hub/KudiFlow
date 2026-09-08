import { Injectable } from '@nestjs/common';
import { TransactionsService } from '../transactions.service';
import { Transaction, TransactionStatus } from '../entities/transaction.entity';

export interface RetryPolicy {
  maxRetries: number;
  backoffMs: number;
  backoffStrategy: 'exponential' | 'fixed';
}

export interface RetryAttemptLog {
  transactionId: string;
  attempt: number;
  error: string;
  timestamp: Date;
}

export interface RetryStateUpdate {
  transactionId: string;
  isRetrying: boolean;
  currentAttempt: number;
  maxAttempts: number;
  error?: string;
  nextRetryIn?: number;
}

@Injectable()
export class TransactionRetryService {
  private retryLogs: RetryAttemptLog[] = [];
  private retryPolicy: RetryPolicy = {
    maxRetries: 3,
    backoffMs: 1000,
    backoffStrategy: 'exponential',
  };
  private retryStateListeners: Map<string, (state: RetryStateUpdate) => void> = new Map();

  constructor(private readonly transactionService: TransactionsService) {}

  setPolicy(policy: Partial<RetryPolicy>) {
    this.retryPolicy = { ...this.retryPolicy, ...policy };
  }

  onRetryStateChange(transactionId: string, callback: (state: RetryStateUpdate) => void) {
    this.retryStateListeners.set(transactionId, callback);
  }

  offRetryStateChange(transactionId: string) {
    this.retryStateListeners.delete(transactionId);
  }

  private notifyRetryStateChange(state: RetryStateUpdate) {
    const callback = this.retryStateListeners.get(state.transactionId);
    if (callback) {
      callback(state);
    }
  }

  async retryTransaction(
    transaction: Transaction,
  ): Promise<Transaction | null> {
    if (!this.isSafeToRetry(transaction)) return null;

    // Get current retry count or initialize to 0
    const currentRetryCount = transaction.retryCount || 0;
    const maxRetries = this.retryPolicy.maxRetries;

    let attempt = currentRetryCount;
    let lastError = '';

    // Notify UI of retry start
    this.notifyRetryStateChange({
      transactionId: transaction.id,
      isRetrying: true,
      currentAttempt: attempt + 1,
      maxAttempts: maxRetries,
    });

    while (attempt < maxRetries) {
      try {
        // Calculate backoff time
        let backoffTime = 0;
        if (attempt > 0) {
          backoffTime = this.calculateBackoff(attempt);
          
          // Notify UI of countdown
          this.notifyRetryStateChange({
            transactionId: transaction.id,
            isRetrying: true,
            currentAttempt: attempt + 1,
            maxAttempts: maxRetries,
            nextRetryIn: backoffTime,
          });

          await this.sleep(backoffTime);
        }

        // Update transaction status to IN_PROGRESS
        const updated = await this.transactionService.update(transaction.id, {
          status: TransactionStatus.IN_PROGRESS,
          retryCount: attempt + 1,
          maxRetries: maxRetries,
        });

        // Notify UI of retry attempt
        this.notifyRetryStateChange({
          transactionId: transaction.id,
          isRetrying: true,
          currentAttempt: attempt + 1,
          maxAttempts: maxRetries,
        });

        // Simulate execution (replace with actual execution logic)
        // If successful:
        this.notifyRetryStateChange({
          transactionId: transaction.id,
          isRetrying: false,
          currentAttempt: attempt + 1,
          maxAttempts: maxRetries,
        });

        return updated;
      } catch (err) {
        lastError = err.message || String(err);
        this.logRetryAttempt(transaction.id, attempt + 1, lastError);

        attempt++;

        if (attempt < maxRetries) {
          // Notify UI of failed attempt
          this.notifyRetryStateChange({
            transactionId: transaction.id,
            isRetrying: true,
            currentAttempt: attempt,
            maxAttempts: maxRetries,
            error: lastError,
          });
        }
      }
    }

    // Mark as failed after max retries
    await this.transactionService.markFailed(transaction.id, lastError);

    // Notify UI of final failure
    this.notifyRetryStateChange({
      transactionId: transaction.id,
      isRetrying: false,
      currentAttempt: attempt,
      maxAttempts: maxRetries,
      error: `Max retries (${maxRetries}) exceeded: ${lastError}`,
    });

    this.offRetryStateChange(transaction.id);
    return null;
  }

  private isSafeToRetry(transaction: Transaction): boolean {
    // Only retry if status is FAILED and not completed
    return (
      transaction.status === TransactionStatus.FAILED &&
      !transaction.completedAt
    );
  }

  private calculateBackoff(attempt: number): number {
    let ms = this.retryPolicy.backoffMs;
    if (this.retryPolicy.backoffStrategy === 'exponential') {
      ms = ms * Math.pow(2, attempt - 1);
    }
    // Cap backoff at 30 seconds
    return Math.min(ms, 30000);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private logRetryAttempt(
    transactionId: string,
    attempt: number,
    error: string,
  ) {
    this.retryLogs.push({
      transactionId,
      attempt,
      error,
      timestamp: new Date(),
    });
    // TODO: Integrate with analytics collector
  }

  getRetryLogs(transactionId?: string): RetryAttemptLog[] {
    if (!transactionId) return this.retryLogs;
    return this.retryLogs.filter((log) => log.transactionId === transactionId);
  }

  getRetryState(transaction: Transaction) {
    return {
      retryCount: transaction.retryCount || 0,
      maxRetries: transaction.maxRetries || this.retryPolicy.maxRetries,
      attempts: transaction.retryAttempts || [],
      error: transaction.error,
    };
  }
}
