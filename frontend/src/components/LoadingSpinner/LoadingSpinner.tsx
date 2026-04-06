import './LoadingSpinner.css';

export function LoadingSpinner() {
  return (
    <div className="spinner-wrapper" role="status" aria-label="Loading weather data">
      <div className="spinner" />
      <p className="spinner-label">Fetching weather...</p>
    </div>
  );
}
