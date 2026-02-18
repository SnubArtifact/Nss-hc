import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import nssLogo from "../assets/nss-logo.png";

export default function Login() {
  const { login, isLoggedIn, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      navigate("/");
    }
  }, [isLoggedIn, isLoading, navigate]);

  const handleLogin = () => {
    login();
  };

  return (
    <div className="login-page">
      <button className="login-theme-toggle" onClick={toggleTheme} title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}>
        {theme === "light" ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
        )}
      </button>
      <div className="login-card">
        <div className="login-icon-container">
          <img src={nssLogo} alt="NSS Logo" className="nss-logo" style={{ width: '48px', height: '48px' }} />
        </div>

        <h1>Hour Count Portal</h1>
        <p>NSS Activity Hour Management System</p>

        <button className="google-btn" onClick={handleLogin}>
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        {import.meta.env.DEV && (
          <div className="dev-section">
            <div className="dev-divider"></div>
            <h3>Dev Environment</h3>
            <div className="dev-buttons">
              <button
                className="dev-btn member"
                onClick={() => {
                  import("../api/axios").then(({ default: api }) => {
                    api.post('/auth/dev-login', { email: 'test-member@nss.org' })
                      .then(() => { window.location.href = '/' });
                  });
                }}
              >
                Guest (Member)
              </button>
              <button
                className="dev-btn hr"
                onClick={() => {
                  import("../api/axios").then(({ default: api }) => {
                    api.post('/auth/dev-login', { email: 'test-hr@nss.org' })
                      .then(() => { window.location.href = '/' });
                  });
                }}
              >
                2nd Year POR Holder
              </button>
              <button
                className="dev-btn coord"
                onClick={() => {
                  import("../api/axios").then(({ default: api }) => {
                    api.post('/auth/dev-login', { email: 'test-coordinator@nss.org' })
                      .then(() => { window.location.href = '/' });
                  });
                }}
              >
                Coordinator
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
