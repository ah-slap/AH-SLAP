import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import {
  validateRegisterForm,
  type FormErrors,
  type RegisterFormValues,
} from '../utils/validation';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fieldErrors, setFieldErrors] = useState<FormErrors<RegisterFormValues>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // stops the browser's default behavior of refreshing the page when a form is submitted.
    setServerError(null); // clears any old server error banner from a previous attempt.

    const trimmedEmail = email.trim();
    const errors = validateRegisterForm({
      fullName,
      email: trimmedEmail,
      phone: phone.trim() || undefined,
      password,
      confirmPassword,
    });

    if (Object.keys(errors).length > 0) { // checks if any errors were added
      setFieldErrors(errors); // saves them to state so React displays them
      return; // stops the function before calling the API.
    }

    setFieldErrors({}); // clears old field errors
    setIsSubmitting(true); // disables the form while waiting

    try {
      await registerUser({ // sends the payload
        fullName: fullName.trim(),
        email: trimmedEmail,
        phone: phone.trim() || undefined,
        password,
      });
      navigate('/login'); // redirects the user
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setServerError(message);
    } finally {
      setIsSubmitting(false); // runs whether try succeeded or failed, setting setIsSubmitting(false) to re-enable the form.
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