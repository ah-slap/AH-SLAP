import { useState } from 'react'; // useState holds the current user object (empty for now until Session 3)
import { useNavigate } from 'react-router-dom'; //useNavigate lets the Log Out button redirect to /login
import type { UserDto } from '../services/api';

export default function DashboardPage() {
  const navigate = useNavigate();

  // TODO (Session 3 with Pair D): Read logged-in user from sessionStorage
  // and redirect to '/login' if no user is stored.
  const [user] = useState<UserDto | null>(null);

  const handleLogout = () => {
    // TODO (Session 3 with Pair D): Clear saved user from sessionStorage before redirecting.
    navigate('/login');
  }; // Runs when the user clicks Log Out, sending them back to /login

  return (
    <main className="auth-container">
      <div className="auth-card">
        <h1>{user ? `Welcome, ${user.fullName}!` : 'Welcome!'}</h1>
        <p>Ah-Slap! — Communities Dashboard</p>

        <section aria-labelledby="communities-heading">  {/*creates an accessible placeholder section for upcoming carpooling communities*/}
          <h2 id="communities-heading">Your Carpooling Communities</h2>
          <p>
            You haven&apos;t joined any communities yet. Community browsing and ride
            matching will appear here soon.
          </p>
        </section>

        <button
          type="button"
          className="primary-btn"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>
    </main>
  );
}