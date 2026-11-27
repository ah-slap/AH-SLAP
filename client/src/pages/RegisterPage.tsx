import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

interface RegisterFieldErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    // TODO (after pulling C2's feature/c2-styles-validation):
    // Replace this basic check with `validateRegisterForm({ fullName, email, phone, password, confirmPassword })`
    const errors: RegisterFieldErrors = {};
    if (!fullName.trim()) errors.fullName = 'Full name is required.';
    if (!email.trim()) errors.email = 'Email is required.';
    if (!password) errors.password = 'Password is required.';
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await registerUser({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
      });
      navigate('/login');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-container">
      <div className="auth-card">
        <h1>Ah-Slap! — Create Account</h1>

        {serverError && (
          <div className="error-banner" role="alert">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isSubmitting}
              required
            />
            {fieldErrors.fullName && (
              <span className="error-text">{fieldErrors.fullName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
            {fieldErrors.email && (
              <span className="error-text">{fieldErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone (optional)</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting}
            />
            {fieldErrors.phone && (
              <span className="error-text">{fieldErrors.phone}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />
            {fieldErrors.password && (
              <span className="error-text">{fieldErrors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />
            {fieldErrors.confirmPassword && (
              <span className="error-text">{fieldErrors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="primary-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </main>
  );
}