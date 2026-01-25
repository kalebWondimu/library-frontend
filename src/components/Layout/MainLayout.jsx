import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login', { replace: true });
      return;
    }
    try {
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser.role) throw new Error('Invalid user');
      setUser(parsedUser);
    } catch {
      localStorage.clear();
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  if (!user) return null;

  const base = user.role === 'admin' ? '/admin' : '/librarian';
  const menuItems =
    user.role === 'admin'
      ? [
          { icon: '📊', label: 'Dashboard', path: `${base}/dashboard` },
          { icon: '📚', label: 'Books', path: `${base}/books` },
          { icon: '🔄', label: 'Borrow/Return', path: `${base}/borrow-return` },
          { icon: '👥', label: 'Members', path: `${base}/members` },
          { icon: '👨‍💼', label: 'Staff', path: `${base}/staff` },
          { icon: '📈', label: 'Reports', path: `${base}/reports` },
          { icon: '🏷️', label: 'Genres', path: `${base}/genres` },
        ]
      : [
          { icon: '📊', label: 'Dashboard', path: `${base}/dashboard` },
          { icon: '📚', label: 'Books', path: `${base}/books` },
          { icon: '🔄', label: 'Borrow/Return', path: `${base}/borrow-return` },
        ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  return (
    <div style={styles.container}>
     
      {sidebarOpen && (
        <aside style={styles.sidebar}>
          <div style={styles.logo}>Library Manager</div>
          <nav style={styles.nav}>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...styles.navLink,
                  ...(location.pathname.startsWith(item.path) ? styles.navLinkActive : {}),
                }}
              >
                <span style={styles.icon}>{item.icon}</span> {item.label}
              </Link>
            ))}
          </nav>
          <div style={styles.userInfo}>
            <p>{user.username}</p>
            <p>{user.role.toUpperCase()}</p>
            <button style={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div style={{ ...styles.main, marginLeft: sidebarOpen ? 302 : 0 }}>
        {/* Top Bar */}
        <div style={styles.topBar}>
          <button style={styles.toggleButton} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <h1 style={styles.pageTitle}>
            {menuItems.find((item) => location.pathname.startsWith(item.path))?.label ||
              'Dashboard'}
          </h1>
        </div>

     
        <div style={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#f3f4f6' },
  sidebar: {
    width: 280,
    background: '#1f2937',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '2rem',
  },
  nav: { flex: 1 },
  navLink: {
    display: 'block',
    padding: '0.75rem 1rem',
    borderRadius: 6,
    color: '#d1d5db',
    textDecoration: 'none',
    marginBottom: 8,
    transition: '0.2s',
  },
  navLinkActive: { background: '#374151', color: '#fff', fontWeight: 600 },
  icon: { marginRight: 8 },
  userInfo: { marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #374151' },
  logoutButton: {
    marginTop: 8,
    padding: '0.5rem 1rem',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
  main: {
    flex: 1,
    transition: 'margin-left 0.3s',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  topBar: {
    background: '#fff',
    padding: '1rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  toggleButton: {
    padding: '0.5rem',
    borderRadius: 6,
    border: '1px solid #d1d5db',
    background: '#f9fafb',
    cursor: 'pointer',
  },
  pageTitle: { fontSize: '1.25rem', fontWeight: 600, margin: 0 },
  content: { flex: 1, padding: '1.5rem', background: '#f3f4f6' },
};

export default MainLayout;
