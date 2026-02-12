import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentsAPI, prescriptionsAPI } from '../../services/api';
import {
  CalendarDays, Pill, ChevronRight, User, Sparkles,
} from 'lucide-react';
import {
  formatDateTime, formatDate, getUpcomingWithinDays, capitalize, getRelativeLabel,
} from '../../utils/helpers';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import './PatientDashboard.css';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      appointmentsAPI.getByPatient(user._id || user.id),
      prescriptionsAPI.getByPatient(user._id || user.id),
    ])
      .then(([apptRes, rxRes]) => {
        setAppointments(apptRes.data);
        setPrescriptions(rxRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingSpinner label="Loading your dashboard..." />;

  const upcomingAppts = appointments
    .flatMap((appt) => {
      const occurrences = getUpcomingWithinDays(appt.datetime, appt.repeat, 7, appt.end_date);
      return occurrences.map((date) => ({ ...appt, nextDate: date }));
    })
    .sort((a, b) => a.nextDate - b.nextDate);

  const upcomingRefills = prescriptions
    .flatMap((rx) => {
      const occurrences = getUpcomingWithinDays(rx.refill_on, rx.refill_schedule, 7);
      return occurrences.map((date) => ({ ...rx, nextRefill: date }));
    })
    .sort((a, b) => a.nextRefill - b.nextRefill);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard animate-fade-in">
      {/* Hero */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-blob" />
        <div className="dashboard-hero-content">
          <div className="dashboard-hero-badge">
            <Sparkles size={14} />
            <span>Patient Portal</span>
          </div>
          <h1 className="dashboard-hero-title">
            {greeting()}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="dashboard-hero-sub">Here's a summary of your upcoming care</p>
        </div>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        <div className="stat-card animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <div className="stat-icon-row">
            <CalendarDays size={16} color="var(--slate-400)" />
            <span className="stat-label">Next 7 Days</span>
          </div>
          <p className="stat-number">{upcomingAppts.length}</p>
          <p className="stat-desc">Upcoming appointments</p>
        </div>
        <div className="stat-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="stat-icon-row">
            <Pill size={16} color="var(--slate-400)" />
            <span className="stat-label">Refills Due</span>
          </div>
          <p className="stat-number">{upcomingRefills.length}</p>
          <p className="stat-desc">Medications to refill</p>
        </div>
        <div className="stat-card animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="stat-icon-row">
            <User size={16} color="var(--slate-400)" />
            <span className="stat-label">Profile</span>
          </div>
          <p className="stat-email">{user?.email}</p>
          <p className="stat-desc">{user?.name}</p>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Upcoming Appointments</h2>
          <Link to="/appointments" className="section-link">
            View all <ChevronRight size={16} />
          </Link>
        </div>

        {upcomingAppts.length === 0 ? (
          <div className="card-flat section-empty">
            <CalendarDays size={24} color="var(--slate-300)" />
            <p>No appointments in the next 7 days</p>
          </div>
        ) : (
          <div className="section-list">
            {upcomingAppts.map((appt, i) => (
              <div
                key={`${appt._id || appt.id}-${i}`}
                className="list-item card animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="list-item-icon list-item-icon-blue">
                  <CalendarDays size={20} />
                </div>
                <div className="list-item-info">
                  <p className="list-item-title">{appt.provider}</p>
                  <p className="list-item-sub">{formatDateTime(appt.nextDate)}</p>
                </div>
                <div className="list-item-badges">
                  <span className="badge badge-blue">{capitalize(appt.repeat)}</span>
                  <span className="badge badge-green">{getRelativeLabel(appt.nextDate)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Refills */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Medication Refills Due</h2>
          <Link to="/prescriptions" className="section-link">
            View all <ChevronRight size={16} />
          </Link>
        </div>

        {upcomingRefills.length === 0 ? (
          <div className="card-flat section-empty">
            <Pill size={24} color="var(--slate-300)" />
            <p>No refills due in the next 7 days</p>
          </div>
        ) : (
          <div className="section-list">
            {upcomingRefills.map((rx, i) => (
              <div
                key={`${rx._id || rx.id}-${i}`}
                className="list-item card animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="list-item-icon list-item-icon-green">
                  <Pill size={20} />
                </div>
                <div className="list-item-info">
                  <p className="list-item-title">{rx.medication} — {rx.dosage}</p>
                  <p className="list-item-sub">Qty: {rx.quantity} · Refill: {formatDate(rx.nextRefill)}</p>
                </div>
                <span className="badge badge-amber">{capitalize(rx.refill_schedule)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
