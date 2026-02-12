import { useState, useEffect } from 'react';
import { appointmentsAPI } from '../../services/api';
import Modal from '../shared/Modal';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import './AppointmentForm.css';

const REPEAT_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export default function AppointmentForm({ isOpen, onClose, patientId, appointment, onSaved }) {
  const isEditing = !!appointment;

  const [form, setForm] = useState({ provider: '', datetime: '', repeat: 'weekly', end_date: '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (appointment) {
      let dt = '';
      if (appointment.datetime) {
        const d = new Date(appointment.datetime);
        dt = d.toISOString().slice(0, 16);
      }
      setForm({
        provider: appointment.provider || '',
        datetime: dt,
        repeat: appointment.repeat || 'weekly',
        end_date: appointment.end_date || '',
      });
    } else {
      setForm({ provider: '', datetime: '', repeat: 'weekly', end_date: '' });
    }
    setErrors({});
  }, [appointment, isOpen]);

  const validate = () => {
    const errs = {};
    if (!form.provider.trim()) errs.provider = 'Provider name is required';
    if (!form.datetime) errs.datetime = 'Date & time is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        provider: form.provider.trim(),
        datetime: new Date(form.datetime).toISOString(),
        repeat: form.repeat,
        end_date: form.end_date || null,
      };

      if (isEditing) {
        await appointmentsAPI.update(patientId, appointment._id || appointment.id, payload);
        toast.success('Appointment updated');
      } else {
        await appointmentsAPI.create(patientId, payload);
        toast.success('Appointment created');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save appointment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Appointment' : 'New Appointment'}>
      <form onSubmit={handleSubmit} className="form-stack">
        <div className="form-field">
          <label className="label">Provider Name</label>
          <input
            type="text"
            value={form.provider}
            onChange={(e) => setForm({ ...form, provider: e.target.value })}
            className={`input ${errors.provider ? 'input-error' : ''}`}
            placeholder="Dr. Jane Smith"
          />
          {errors.provider && <p className="field-error">{errors.provider}</p>}
        </div>

        <div className="form-field">
          <label className="label">Date & Time</label>
          <input
            type="datetime-local"
            value={form.datetime}
            onChange={(e) => setForm({ ...form, datetime: e.target.value })}
            className={`input ${errors.datetime ? 'input-error' : ''}`}
          />
          {errors.datetime && <p className="field-error">{errors.datetime}</p>}
        </div>

        <div className="form-field">
          <label className="label">Repeat Schedule</label>
          <select
            value={form.repeat}
            onChange={(e) => setForm({ ...form, repeat: e.target.value })}
            className="input"
          >
            {REPEAT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="label">
            End Date <span className="label-hint">(optional — ends recurring series)</span>
          </label>
          <input
            type="date"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            className="input"
          />
          {form.end_date && (
            <button
              type="button"
              onClick={() => setForm({ ...form, end_date: '' })}
              className="clear-link"
            >
              Clear end date
            </button>
          )}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <div className="spinner spinner-sm spinner-white" /> : <><Save size={14} /> {isEditing ? 'Update' : 'Create'}</>}
          </button>
        </div>
      </form>
    </Modal>
  );
}
