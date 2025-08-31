export interface ErrorState {
  status?: number;
  message: string;
  code?: string;
  details?: string;
  resError?: unknown;

}

export interface ErrorsPageProps {
  status?: number;
  message?: string;
  code?: string;
  details?: string;
  resError?: unknown; // For displaying detailed error info
  onRetry?: () => void;
  onDismiss?: () => void; // New prop to allow dismissing the error
  className?: string;
}