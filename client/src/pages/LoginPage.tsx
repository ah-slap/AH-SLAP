import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import {
  validateLoginForm,
  type LoginFormValues,
  type FormErrors,
} from '../utils/validation';

export default function LoginPage() {
  //Used to redirect the user to the dashboard after successful login
  const navigate = useNavigate();

  //Variables for form fields, errors, and submission status
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FormErrors<LoginFormValues>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    //Prevent default browser page reload on form submission and clear any previous server error
    e.preventDefault();
    setServerError(null);
    //Run client side validation before sending any network request
    const errors = validateLoginForm({ email, password });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO (Pair D - Integration):
      // 1. Implement `loginUser` in `client/src/services/api.ts` (POST /api/users/login)
      //    and verify whether `password` should stay optional (`password || undefined`) or required.
      // 2. Capture the returned `UserDto` and save it to `sessionStorage` (using the same key
      //    that C1's `DashboardPage.tsx` reads and clears on Logout), e.g.:
      //      const user = await loginUser({ email: email.trim(), password: password || undefined });
      //      sessionStorage.setItem('currentUser', JSON.stringify(user));
      await loginUser({
        email: email.trim(),
        password: password || undefined,
      });

      navigate('/dashboard');
    } catch (err) {
      // TODO (Pair D - Integration):
      // When `loginUser` throws `new Error(serverMessage)` on 401/404/500 responses,
      // `err.message` will automatically display in the `.error-banner` below.
      setServerError(
        err instanceof Error ? err.message : 'Login failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page-container">
      {/* Keep "Log In" in this <h1> so client/src/App.test.tsx continues to pass */}
      <h1>Ah-Slap! — Log In</h1>

      {serverError && (
        <div className="error-banner" role="alert">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldErrors.email ? 'input-error' : ''}
            autoComplete="email"
          />
          {fieldErrors.email && (
            <p className="error-text">{fieldErrors.email}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldErrors.password ? 'input-error' : ''}
            autoComplete="current-password"
          />
          {fieldErrors.password && (
            <p className="error-text">{fieldErrors.password}</p>
          )}
        </div>

        <button
          type="submit"
          className="primary-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p className="auth-footer">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </main>
  );
}