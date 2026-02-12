import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { prescriptionsAPI } from '../../services/api';
import { Pill, ArrowLeft, Calendar, Package, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, generateOccurrences, capitalize } from '../../utils/helpers';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';
import { format } from 'date-fns';
import './PatientPrescriptions.css';

export default function PatientPrescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRx, setExpandedRx] = useState(null);

  useEffect(() => {
    if (!user) return;
    prescriptionsAPI
      .getByPatient(user._id || user.id)
      .then((res) => setPrescriptions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingSpinner label="Loading prescriptions..." />;

  if (prescriptions.length === 0) {
    return (
      <div className="rx-page animate-fade-in">
        <div className="page-header">
          <Link to="/dashboard" className="btn-ghost"><ArrowLeft size={18} /></Link>
          <h1 className="page-title">Medications</h1>
        </div>
        <EmptyState
          icon={Pill}
          title="No prescriptions"
          description="You don't have any active prescriptions."
        />
      </div>
    );
  }

  return (
    <div className="rx-page animate-fade-in">
      <div className="page-header">
        <Link to="/dashboard" className="btn-ghost"><ArrowLeft size={18} /></Link>
        <div>
          <h1 className="page-title">Medications</h1>
          <p className="page-subtitle">Your prescriptions and refill schedule</p>
        </div>
      </div>

      <div className="rx-list">
        {prescriptions.map((rx, idx) => {
          const rxId = rx._id || rx.id;
          const isExpanded = expandedRx === rxId;
          const refillOccurrences = generateOccurrences(rx.refill_on, rx.refill_schedule, 3);

          return (
            <div
              key={rxId}
              className="card rx-card animate-slide-up"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="rx-card-main">
                <div className="list-item-icon list-item-icon-green" style={{ width: 48, height: 48 }}>
                  <Pill size={22} />
                </div>
                <div className="rx-card-body">
                  <div className="rx-card-top">
                    <div>
                      <h3 className="rx-name">{rx.medication}</h3>
                      <p className="rx-dosage">{rx.dosage}</p>
                    </div>
                    <span className="badge badge-green">{capitalize(rx.refill_schedule)}</span>
                  </div>

                  <div className="rx-details">
                    <div className="rx-detail">
                      <Package size={14} color="var(--slate-400)" />
                      <div>
                        <p className="rx-detail-label">Quantity</p>
                        <p className="rx-detail-value">{rx.quantity}</p>
                      </div>
                    </div>
                    <div className="rx-detail">
                      <Calendar size={14} color="var(--slate-400)" />
                      <div>
                        <p className="rx-detail-label">Next Refill</p>
                        <p className="rx-detail-value">
                          {refillOccurrences.length > 0 ? formatDate(refillOccurrences[0]) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="rx-detail">
                      <RefreshCw size={14} color="var(--slate-400)" />
                      <div>
                        <p className="rx-detail-label">Schedule</p>
                        <p className="rx-detail-value">{capitalize(rx.refill_schedule)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rx-expand-section">
                <button
                  onClick={() => setExpandedRx(isExpanded ? null : rxId)}
                  className="rx-expand-btn"
                >
                  <span>Refill Schedule ({refillOccurrences.length} upcoming)</span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {isExpanded && (
                  <div className="rx-refill-grid animate-fade-in">
                    {refillOccurrences.map((date, i) => (
                      <div key={i} className="rx-refill-item">
                        <div className={`rx-refill-dot ${i === 0 ? 'rx-refill-dot-active' : ''}`} />
                        <span>{format(date, 'MMM d, yyyy')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
