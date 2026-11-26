import { Link } from 'react-router-dom';

export default function DashboardPage() {
  // TODO (Pair C & Pair D - Post-Login Shell):
  // 1. Read the logged-in user from state / `sessionStorage` (redirect to `/login` if missing)
  // 2. Display "Welcome, <user.fullName>!" and a Logout button that clears session state
  // 3. (Optional Stretch) Render approved/available communities list
  return (
    <main className="page-container">
      <h1>Ah-Slap! — Communities Dashboard</h1>
      <p>Dashboard placeholder for authenticated users.</p>
      <p>
        <Link to="/login">Back to Log in</Link>
      </p>
    </main>
  );
}
