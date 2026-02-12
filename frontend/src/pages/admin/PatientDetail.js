import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { patientsAPI, appointmentsAPI, prescriptionsAPI } from '../../services/api';
import {
  ArrowLeft, CalendarDays, Pill, Plus, Pencil, Trash2, Mail, Clock,
} from 'lucide-react';
import { formatDateTime, formatDate, capitalize, getInitials } from '../../utils/helpers';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import AppointmentForm from '../../components/admin/AppointmentForm';
import PrescriptionForm from '../../components/admin/PrescriptionForm';
import toast from 'react-hot-toast';
import './PatientDetail.css';

export default function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [apptModal, setApptModal] = useState({ open: false, data: null });
  const [rxModal, setRxModal] = useState({ open: false, data: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, type: null, id: null });
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [patientRes, apptRes, rxRes] = await Promise.all([
        patientsAPI.getById(id),
        appointmentsAPI.getByPatient(id),
        prescriptionsAPI.getByPatient(id),
      ]);
      setPatient(patientRes.data);
      setAppointments(apptRes.data);
      setPrescriptions(rxRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      if (deleteModal.type === 'appointment') {
        await appointmentsAPI.delete(id, deleteModal.id);
        toast.success('Appointment deleted');
      } else {
        await prescriptionsAPI.delete(id, deleteModal.id);
        toast.success('Prescription deleted');
      }
      setDeleteModal({ open: false, type: null, id: null });
      fetchData();
    } catch {
      toast.error(`Failed to delete ${deleteModal.type}`);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading patient..." />;
  if (!patient) return (
    <div style={{ textAlign: 'center', padding: 64 }}>
      <p style={{ color: 'var(--slate-500)' }}>Patient not found</p>
      <Link to="/admin" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Patients</Link>
    </div>
  );

  return (
    <div className="pd-page animate-fade-in">
      {/* Header */}
      <div className="pd-header">
        <div className="pd-header-left">
          <Link to="/admin" className="btn-ghost"><ArrowLeft size={18} /></Link>
          <div className="pd-header-info">
            <div className="pd-avatar">{getInitials(patient.name)}</div>
            <div>
              <h1 className="page-title">{patient.name}</h1>
              <div className="pd-email-row">
                <Mail size={13} color="var(--slate-400)" />
                <span>{patient.email}</span>
              </div>
            </div>
          </div>
        </div>
        <Link to={`/admin/patients/${id}/edit`} className="btn btn-secondary">
          <Pencil size={14} /> Edit Patient
        </Link>
      </div>

      {/* Appointments */}
      <section className="pd-section">
        <div className="pd-section-header">
          <div className="pd-section-title-row">
            <CalendarDays size={18} color="var(--brand-600)" />
            <h2 className="pd-section-title">Appointments</h2>
            <span className="badge badge-slate">{appointments.length}</span>
          </div>
          <button onClick={() => setApptModal({ open: true, data: null })} className="btn btn-primary pd-btn-sm">
            <Plus size={14} /> Add Appointment
          </button>
        </div>

        {appointments.length === 0 ? (
          <div className="card-flat pd-empty">
            <CalendarDays size={24} color="var(--slate-300)" />
            <p>No appointments scheduled</p>
          </div>
        ) : (
          <div className="pd-item-list">
            {appointments.map((appt) => {
              const aid = appt._id || appt.id;
              return (
                <div key={aid} className="card pd-item">
                  <div className="list-item-icon list-item-icon-blue" style={{ width: 40, height: 40 }}>
                    <CalendarDays size={18} />
                  </div>
                  <div className="list-item-info">
                    <p className="list-item-title">{appt.provider}</p>
                    <div className="pd-item-meta">
                      <span className="pd-item-meta-text"><Clock size={11} /> {formatDateTime(appt.datetime)}</span>
                      <span className="badge badge-blue">{capitalize(appt.repeat)}</span>
                      {appt.end_date && <span className="badge badge-amber">Ends {formatDate(appt.end_date)}</span>}
                    </div>
                  </div>
                  <div className="pd-item-actions">
                    <button onClick={() => setApptModal({ open: true, data: appt })} className="btn-ghost" title="Edit"><Pencil size={14} /></button>
                    <button onClick={() => setDeleteModal({ open: true, type: 'appointment', id: aid })} className="btn-ghost pd-delete-btn" title="Delete"><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Prescriptions */}
      <section className="pd-section">
        <div className="pd-section-header">
          <div className="pd-section-title-row">
            <Pill size={18} color="var(--accent-600)" />
            <h2 className="pd-section-title">Prescriptions</h2>
            <span className="badge badge-slate">{prescriptions.length}</span>
          </div>
          <button onClick={() => setRxModal({ open: true, data: null })} className="btn btn-primary pd-btn-sm">
            <Plus size={14} /> Add Prescription
          </button>
        </div>

        {prescriptions.length === 0 ? (
          <div className="card-flat pd-empty">
            <Pill size={24} color="var(--slate-300)" />
            <p>No prescriptions</p>
          </div>
        ) : (
          <div className="pd-item-list">
            {prescriptions.map((rx) => {
              const rid = rx._id || rx.id;
              return (
                <div key={rid} className="card pd-item">
                  <div className="list-item-icon list-item-icon-green" style={{ width: 40, height: 40 }}>
                    <Pill size={18} />
                  </div>
                  <div className="list-item-info">
                    <p className="list-item-title">{rx.medication} — {rx.dosage}</p>
                    <div className="pd-item-meta">
                      <span className="pd-item-meta-text">Qty: {rx.quantity}</span>
                      <span className="pd-item-meta-text">Refill: {formatDate(rx.refill_on)}</span>
                      <span className="badge badge-green">{capitalize(rx.refill_schedule)}</span>
                    </div>
                  </div>
                  <div className="pd-item-actions">
                    <button onClick={() => setRxModal({ open: true, data: rx })} className="btn-ghost" title="Edit"><Pencil size={14} /></button>
                    <button onClick={() => setDeleteModal({ open: true, type: 'prescription', id: rid })} className="btn-ghost pd-delete-btn" title="Delete"><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modals */}
      <AppointmentForm isOpen={apptModal.open} onClose={() => setApptModal({ open: false, data: null })} patientId={id} appointment={apptModal.data} onSaved={fetchData} />
      <PrescriptionForm isOpen={rxModal.open} onClose={() => setRxModal({ open: false, data: null })} patientId={id} prescription={rxModal.data} onSaved={fetchData} />
      <ConfirmDialog
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, type: null, id: null })}
        onConfirm={handleDelete}
        title={`Delete ${deleteModal.type === 'appointment' ? 'Appointment' : 'Prescription'}`}
        message={`Are you sure you want to delete this ${deleteModal.type}? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
