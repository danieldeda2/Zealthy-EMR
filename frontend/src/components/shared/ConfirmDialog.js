import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';
import './ConfirmDialog.css';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'Confirm Action'} size="sm">
      <div className="confirm-body">
        <div className="confirm-icon-wrap">
          <AlertTriangle size={24} color="var(--red-500)" />
        </div>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button onClick={onClose} className="btn btn-secondary" disabled={loading}>Cancel</button>
          <button onClick={onConfirm} className="btn btn-danger" disabled={loading}>
            {loading ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
