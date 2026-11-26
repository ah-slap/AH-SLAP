import { Link } from 'react-router-dom';

export default function LoginPage() {
  // TODO (Pair C & Pair D - Task C2):
  // 1. Add controlled inputs for `email` (and `password` if enabled) + validation
  // 2. Call `loginUser(...)` on form submit, handling loading and error messages
  // 3. Save logged-in `UserDto` (e.g., in React context or `sessionStorage`) and navigate to `/dashboard`
  return (
    <main className="page-container">
      <h1>Ah-Slap! — Log In</h1>
      <p>Login interface placeholder (Task C2).</p>
      <p>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </main>
  );
}
