import { useState, useEffect } from 'react';
import { prescriptionsAPI, referenceAPI } from '../../services/api';
import Modal from '../shared/Modal';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import './PrescriptionForm.css';

const SCHEDULE_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
];

export default function PrescriptionForm({ isOpen, onClose, patientId, prescription, onSaved }) {
  const isEditing = !!prescription;

  const [form, setForm] = useState({
    medication: '', dosage: '', quantity: 1, refill_on: '', refill_schedule: 'monthly',
  });
  const [medications, setMedications] = useState([]);
  const [dosages, setDosages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      Promise.all([referenceAPI.getMedications(), referenceAPI.getDosages()])
        .then(([medRes, dosRes]) => {
          setMedications(medRes.data);
          setDosages(dosRes.data);
        })
        .catch(() => toast.error('Failed to load medication options'));
    }
  }, [isOpen]);

  useEffect(() => {
    if (prescription) {
      setForm({
        medication: prescription.medication || '',
        dosage: prescription.dosage || '',
        quantity: prescription.quantity || 1,
        refill_on: prescription.refill_on || '',
        refill_schedule: prescription.refill_schedule || 'monthly',
      });
    } else {
      setForm({ medication: '', dosage: '', quantity: 1, refill_on: '', refill_schedule: 'monthly' });
    }
    setErrors({});
  }, [prescription, isOpen]);

  const validate = () => {
    const errs = {};
    if (!form.medication) errs.medication = 'Medication is required';
    if (!form.dosage) errs.dosage = 'Dosage is required';
    if (!form.quantity || form.quantity < 1) errs.quantity = 'Quantity must be at least 1';
    if (!form.refill_on) errs.refill_on = 'Refill date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        medication: form.medication,
        dosage: form.dosage,
        quantity: parseInt(form.quantity, 10),
        refill_on: form.refill_on,
        refill_schedule: form.refill_schedule,
      };

      if (isEditing) {
        await prescriptionsAPI.update(patientId, prescription._id || prescription.id, payload);
        toast.success('Prescription updated');
      } else {
        await prescriptionsAPI.create(patientId, payload);
        toast.success('Prescription created');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save prescription');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Prescription' : 'New Prescription'}>
      <form onSubmit={handleSubmit} className="form-stack">
        <div className="form-field">
          <label className="label">Medication</label>
          <select
            value={form.medication}
            onChange={(e) => setForm({ ...form, medication: e.target.value })}
            className={`input ${errors.medication ? 'input-error' : ''}`}
          >
            <option value="">Select medication...</option>
            {medications.map((med) => (
              <option key={med} value={med}>{med}</option>
            ))}
          </select>
          {errors.medication && <p className="field-error">{errors.medication}</p>}
        </div>

        <div className="form-field">
          <label className="label">Dosage</label>
          <select
            value={form.dosage}
            onChange={(e) => setForm({ ...form, dosage: e.target.value })}
            className={`input ${errors.dosage ? 'input-error' : ''}`}
          >
            <option value="">Select dosage...</option>
            {dosages.map((dos) => (
              <option key={dos} value={dos}>{dos}</option>
            ))}
          </select>
          {errors.dosage && <p className="field-error">{errors.dosage}</p>}
        </div>

        <div className="form-field">
          <label className="label">Quantity</label>
          <input
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className={`input ${errors.quantity ? 'input-error' : ''}`}
          />
          {errors.quantity && <p className="field-error">{errors.quantity}</p>}
        </div>

        <div className="form-field">
          <label className="label">Refill Date</label>
          <input
            type="date"
            value={form.refill_on}
            onChange={(e) => setForm({ ...form, refill_on: e.target.value })}
            className={`input ${errors.refill_on ? 'input-error' : ''}`}
          />
          {errors.refill_on && <p className="field-error">{errors.refill_on}</p>}
        </div>

        <div className="form-field">
          <label className="label">Refill Schedule</label>
          <select
            value={form.refill_schedule}
            onChange={(e) => setForm({ ...form, refill_schedule: e.target.value })}
            className="input"
          >
            {SCHEDULE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
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
