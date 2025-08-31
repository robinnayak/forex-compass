import React from 'react';
import { getErrorMessage, formatErrorForDisplay, hasError } from '@/utils/errors';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, X, ChevronDown, ChevronUp } from 'lucide-react';
import { ErrorsPageProps } from '@/types/errors';

const ErrorsPage: React.FC<ErrorsPageProps> = ({
  status,
  message,
  code,
  details,
  resError,
  onRetry,
  onDismiss,
  className = ""
}) => {
  const errorMessage = message || getErrorMessage(status);
  const [expanded, setExpanded] = React.useState(false);
  const isDev = process.env.NODE_ENV === 'development';
  
  return (
    <Alert 
      variant="destructive" 
      className={`sticky top-0 z-10 py-2 px-4 rounded-none border-t-0 border-x-0 ${className} bg-white `}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Error Code */}
          {code && <span className="font-mono text-xs px-2 py-0.5 bg-destructive/10 rounded">{code}</span>}
          
          {/* Status */}
          <span className="font-semibold text-sm whitespace-nowrap">
            {status ? `Error ${status}:` : 'Error:'}
          </span>
          
          {/* Message */}
          <span className="text-sm truncate">{errorMessage}</span>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Show details toggle */}
          {(details || (isDev && hasError(resError))) && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          )}
          
          {/* Retry button */}
          {onRetry && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs px-2"
              onClick={onRetry}
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Retry
            </Button>
          )}
          
          {/* Dismiss button */}
          {onDismiss && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={onDismiss}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Expandable details section */}
      {expanded && (
        <div className="mt-2 text-sm">
          {details && <p className="text-sm opacity-80">{details}</p>}
          
          {isDev && hasError(resError) && (
            <pre className="mt-2 p-2 bg-muted/30 rounded text-xs overflow-auto max-h-[100px]">
              {formatErrorForDisplay(resError)}
            </pre>
          )}
        </div>
      )}
    </Alert>
  );
};

export default ErrorsPage;