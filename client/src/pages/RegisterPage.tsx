import { Link } from 'react-router-dom';

export default function RegisterPage() {
  // TODO (Pair C & Pair D - Task C1):
  // 1. Add controlled inputs for `fullName`, `email`, `phone`, (and `password` if enabled)
  // 2. Add client-side validation (required fields, email format, phone format)
  // 3. Call `registerUser(...)` on submit, display feedback, and navigate to `/login` or `/dashboard`
  return (
    <main className="page-container">
      <h1>Ah-Slap! — Create Account</h1>
      <p>Registration form placeholder (Task C1).</p>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </main>
  );
}
