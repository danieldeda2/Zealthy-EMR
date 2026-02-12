import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentsAPI } from '../../services/api';
import { CalendarDays, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  formatDate, formatTime, generateOccurrences, capitalize, getRelativeLabel,
} from '../../utils/helpers';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';
import { format } from 'date-fns';
import './PatientAppointments.css';

export default function PatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    appointmentsAPI
      .getByPatient(user._id || user.id)
      .then((res) => setAppointments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingSpinner label="Loading appointments..." />;

  const allOccurrences = appointments
    .flatMap((appt) => {
      const occurrences = generateOccurrences(appt.datetime, appt.repeat, 3, appt.end_date);
      return occurrences.map((date) => ({ ...appt, occurrenceDate: date }));
    })
    .sort((a, b) => a.occurrenceDate - b.occurrenceDate);

  const groupedByMonth = allOccurrences.reduce((acc, item) => {
    const monthKey = format(item.occurrenceDate, 'MMMM yyyy');
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(item);
    return acc;
  }, {});

  return (
    <div className="appt-page animate-fade-in">
      <div className="page-header">
        <Link to="/dashboard" className="btn-ghost"><ArrowLeft size={18} /></Link>
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">Your schedule for the next 3 months</p>
        </div>
      </div>

      {/* Source cards */}
      <div className="appt-sources">
        {appointments.map((appt) => (
          <div key={appt._id || appt.id} className="card-flat appt-source-card">
            <div className="list-item-icon list-item-icon-blue" style={{ width: 40, height: 40 }}>
              <CalendarDays size={18} />
            </div>
            <div className="appt-source-info">
              <p className="list-item-title">{appt.provider}</p>
              <p className="list-item-sub">{capitalize(appt.repeat)} · Started {formatDate(appt.datetime)}</p>
            </div>
            <span className="badge badge-blue">{capitalize(appt.repeat)}</span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      {Object.keys(groupedByMonth).length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No upcoming appointments"
          description="You don't have any appointments scheduled in the next 3 months."
        />
      ) : (
        <div className="appt-timeline">
          {Object.entries(groupedByMonth).map(([month, items]) => (
            <section key={month} className="appt-month">
              <div className="appt-month-header">
                <h3 className="appt-month-title">{month}</h3>
                <div className="appt-month-line" />
                <span className="appt-month-count">{items.length}</span>
              </div>

              <div className="section-list">
                {items.map((item, i) => (
                  <div
                    key={`${item._id || item.id}-${i}`}
                    className="appt-entry card animate-slide-up"
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                    <div className="appt-date-block">
                      <p className="appt-day-name">{format(item.occurrenceDate, 'EEE')}</p>
                      <p className="appt-day-num">{format(item.occurrenceDate, 'd')}</p>
                    </div>
                    <div className="appt-entry-divider" />
                    <div className="list-item-info">
                      <p className="list-item-title">{item.provider}</p>
                      <div className="appt-entry-time">
                        <Clock size={12} color="var(--slate-400)" />
                        <span>{formatTime(item.occurrenceDate)}</span>
                      </div>
                    </div>
                    <span className="appt-relative">{getRelativeLabel(item.occurrenceDate)}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
