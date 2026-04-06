import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className="error-message" role="alert" aria-live="polite">
      <span className="error-icon" aria-hidden="true">!</span>
      <p className="error-text">{message}</p>
      {onDismiss && (
        <button
          className="error-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          &times;
        </button>
      )}
    </div>
  );
}
