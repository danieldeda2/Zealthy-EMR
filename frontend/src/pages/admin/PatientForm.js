import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { patientsAPI } from '../../services/api';
import { ArrowLeft, Save, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import toast from 'react-hot-toast';
import './PatientForm.css';

export default function PatientForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      patientsAPI
        .getById(id)
        .then((res) => setForm({ name: res.data.name, email: res.data.email, password: '' }))
        .catch(() => toast.error('Failed to load patient'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!isEditing && !form.password) errs.password = 'Password is required';
    if (form.password && form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;

      if (isEditing) {
        await patientsAPI.update(id, payload);
        toast.success('Patient updated');
        navigate(`/admin/patients/${id}`);
      } else {
        const res = await patientsAPI.create(payload);
        toast.success('Patient created');
        navigate(`/admin/patients/${res.data._id || res.data.id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading patient..." />;

  return (
    <div className="pf-page animate-fade-in">
      <div className="page-header">
        <Link to={isEditing ? `/admin/patients/${id}` : '/admin'} className="btn-ghost">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="page-title">{isEditing ? 'Edit Patient' : 'New Patient'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="card pf-form">
        <div className="form-field">
          <label className="label">Full Name</label>
          <div className="pf-input-wrap">
            <User size={16} className="pf-input-icon" />
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`input input-with-icon ${errors.name ? 'input-error' : ''}`}
              placeholder="John Doe"
            />
          </div>
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div className="form-field">
          <label className="label">Email Address</label>
          <div className="pf-input-wrap">
            <Mail size={16} className="pf-input-icon" />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`input input-with-icon ${errors.email ? 'input-error' : ''}`}
              placeholder="patient@email.com"
            />
          </div>
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div className="form-field">
          <label className="label">
            Password {isEditing && <span className="label-hint">(leave blank to keep current)</span>}
          </label>
          <div className="pf-input-wrap">
            <Lock size={16} className="pf-input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`input input-with-icon pf-input-pw ${errors.password ? 'input-error' : ''}`}
              placeholder={isEditing ? '••••••••' : 'Min. 6 characters'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="pf-pw-toggle"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        <div className="form-actions">
          <Link to={isEditing ? `/admin/patients/${id}` : '/admin'} className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <div className="spinner spinner-sm spinner-white" />
            ) : (
              <><Save size={14} /> {isEditing ? 'Update Patient' : 'Create Patient'}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
