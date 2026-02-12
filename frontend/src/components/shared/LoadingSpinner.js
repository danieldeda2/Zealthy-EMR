import './LoadingSpinner.css';

export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="loading-container">
      <div className="spinner spinner-md" />
      {label && <p className="loading-label">{label}</p>}
    </div>
  );
}
