export default function AlertStack({ alerts, onDismiss }) {
  if (!alerts.length) return null;

  return (
    <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1100 }}>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`alert alert-${alert.type} alert-dismissible fade show mb-2`}
          role="alert"
        >
          {alert.message}
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => onDismiss(alert.id)}
          />
        </div>
      ))}
    </div>
  );
}
