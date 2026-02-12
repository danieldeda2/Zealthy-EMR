import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { patientsAPI } from '../../services/api';
import { Search, Plus, ChevronRight, CalendarDays, Pill, Users } from 'lucide-react';
import { getInitials } from '../../utils/helpers';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';
import './PatientList.css';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    patientsAPI
      .getAll()
      .then((res) => setPatients(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner label="Loading patients..." />;

  return (
    <div className="pl-page animate-fade-in">
      <div className="pl-header">
        <div>
          <h1 className="page-title" style={{ fontSize: '1.5rem' }}>Patients</h1>
          <p className="page-subtitle">{patients.length} patient{patients.length !== 1 ? 's' : ''} in the system</p>
        </div>
        <Link to="/admin/patients/new" className="btn btn-primary">
          <Plus size={16} /> New Patient
        </Link>
      </div>

      <div className="pl-search-wrap">
        <Search size={16} className="pl-search-icon" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-with-icon"
          placeholder="Search patients by name or email..."
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? 'No patients found' : 'No patients yet'}
          description={search ? 'Try adjusting your search term' : 'Create your first patient to get started'}
          action={!search && (
            <Link to="/admin/patients/new" className="btn btn-primary">
              <Plus size={16} /> Add Patient
            </Link>
          )}
        />
      ) : (
        <div className="pl-grid">
          {filtered.map((patient, idx) => {
            const pid = patient._id || patient.id;
            return (
              <div
                key={pid}
                className="pl-card animate-slide-up"
                style={{ animationDelay: `${idx * 0.04}s` }}
                onClick={() => navigate(`/admin/patients/${pid}`)}
              >
                <div className="pl-card-top">
                  <div className="pl-avatar">{getInitials(patient.name)}</div>
                  <ChevronRight size={18} className="pl-chevron" />
                </div>
                <h3 className="pl-card-name">{patient.name}</h3>
                <p className="pl-card-email">{patient.email}</p>
                <div className="pl-card-stats">
                  <span className="badge badge-blue pl-badge-icon">
                    <CalendarDays size={12} /> {patient.appointments?.length || 0} appts
                  </span>
                  <span className="badge badge-green pl-badge-icon">
                    <Pill size={12} /> {patient.prescriptions?.length || 0} meds
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
