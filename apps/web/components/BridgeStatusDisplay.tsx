import React from 'react';
import { BridgeDowntimeList, BridgeDowntimeInfo } from './BridgeDowntimeIndicator';
import { useOfflineBridges } from './hooks/useBridgeStatus';

export interface BridgeStatusBannerProps {
  className?: string;
  dismissible?: boolean;
}

export const BridgeStatusBanner: React.FC<BridgeStatusBannerProps> = ({
  className = '',
  dismissible = true,
}) => {
  const { unavailableBridges, loading } = useOfflineBridges();
  const [dismissed, setDismissed] = React.useState(false);

  if (loading || dismissed || unavailableBridges.length === 0) {
    return null;
  }

  return (
    <div className={`relative mb-4 ${className}`}>
      <BridgeDowntimeList bridges={unavailableBridges} showOnlyOffline={true} />
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
          aria-label="Dismiss bridge downtime notification"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export interface BridgeRouteDisabledProps {
  bridgeName: string;
  reason?: string;
}

export const BridgeRouteDisabled: React.FC<BridgeRouteDisabledProps> = ({
  bridgeName,
  reason = 'currently offline',
}) => {
  return (
    <div
      className="absolute inset-0 bg-slate-900/50 dark:bg-slate-950/50 rounded-lg flex items-center justify-center z-10"
      title={`${bridgeName} is ${reason}`}
    >
      <div className="bg-white dark:bg-slate-800 rounded px-3 py-2 text-center">
        <p className="text-xs font-semibold text-red-600 dark:text-red-400">
          ⚠️ Unavailable
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
          {bridgeName} is {reason}
        </p>
      </div>
    </div>
  );
};

export interface BridgeQuoteWithStatusProps {
  children: React.ReactNode;
  bridgeId?: string;
  isOffline?: boolean;
  isDegraded?: boolean;
  errorMessage?: string;
}

export const BridgeQuoteWithStatus: React.FC<BridgeQuoteWithStatusProps> = ({
  children,
  bridgeId,
  isOffline,
  isDegraded,
  errorMessage,
}) => {
  return (
    <div className="relative">
      {children}
      {isOffline && (
        <BridgeRouteDisabled
          bridgeName={bridgeId || 'Bridge'}
          reason="offline"
        />
      )}
      {isDegraded && errorMessage && (
        <div
          className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"
          title={`This bridge is experiencing issues: ${errorMessage}`}
        />
      )}
    </div>
  );
};
