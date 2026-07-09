import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login", { replace: true });
      return;
    }
    try {
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser.role) throw new Error("Invalid user");
      setUser(parsedUser);
    } catch {
      localStorage.clear();
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  if (!user) return null;

  const base =
    user.role === "admin" || user.role === "super-admin"
      ? "/admin"
      : "/librarian";

  const formatRole = (role = "") =>
    role
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const menuItems =
    user.role === "super-admin"
      ? [
          { icon: "📊", label: "Dashboard", path: `${base}/dashboard` },
          { icon: "📚", label: "Books", path: `${base}/books` },
          { icon: "🔄", label: "Borrow/Return", path: `${base}/borrow-return` },
          { icon: "👥", label: "Members", path: `${base}/members` },
          { icon: "👨‍💼", label: "Staff", path: `${base}/staff` },
          { icon: "📈", label: "Reports", path: `${base}/reports` },
          { icon: "👤", label: "Profile", path: `${base}/profile` },
          { icon: "🏷️", label: "Genres", path: `${base}/genres` },
        ]
      : user.role === "admin"
        ? [
            { icon: "📊", label: "Dashboard", path: `${base}/dashboard` },
            { icon: "📚", label: "Books", path: `${base}/books` },
            {
              icon: "🔄",
              label: "Borrow/Return",
              path: `${base}/borrow-return`,
            },
            { icon: "👥", label: "Members", path: `${base}/members` },
            { icon: "👨‍💼", label: "Staff", path: `${base}/staff` },
            { icon: "📈", label: "Reports", path: `${base}/reports` },
            { icon: "👤", label: "Profile", path: `${base}/profile` },
            { icon: "🏷️", label: "Genres", path: `${base}/genres` },
          ]
        : [
            { icon: "📊", label: "Dashboard", path: `${base}/dashboard` },
            { icon: "📚", label: "Books", path: `${base}/books` },
            {
              icon: "🔄",
              label: "Borrow/Return",
              path: `${base}/borrow-return`,
            },
            { icon: "👥", label: "Members", path: `${base}/members` },
            { icon: "👤", label: "Profile", path: `${base}/profile` },
          ];

  const handleLogout = () => {
    setProfileMenuOpen(false);
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const handleOpenProfilePanel = () => {
    setProfileMenuOpen(false);
    navigate(`${base}/profile`);
  };

  const activePage =
    menuItems.find((item) => location.pathname.startsWith(item.path))?.label ||
    "Dashboard";

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
                  ...(location.pathname.startsWith(item.path)
                    ? styles.navLinkActive
                    : {}),
                }}
              >
                <span style={styles.icon}>{item.icon}</span> {item.label}
              </Link>
            ))}
          </nav>
        </aside>
      )}

      <div style={{ ...styles.main, marginLeft: sidebarOpen ? 302 : 0 }}>
        <div style={styles.topBar}>
          <div style={styles.topBarLeft}>
            <button
              style={styles.toggleButton}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? "◀" : "▶"}
            </button>
            <h1 style={styles.pageTitle}>{activePage}</h1>
          </div>

          <div style={styles.profileWrapper}>
            <button
              style={styles.profileCard}
              onClick={() => setProfileMenuOpen((prev) => !prev)}
            >
              <div style={styles.profileAvatar}>
                {(user.username || "U").charAt(0).toUpperCase()}
              </div>
              <div style={styles.profileText}>
                <div style={styles.profileName}>
                  Welcome, {user.username || "User"}
                </div>
                <div style={styles.profileRole}>
                  {formatRole(user.role || "")}
                </div>
              </div>
            </button>

            {profileMenuOpen && (
              <div style={styles.profileDropdown}>
                <button
                  style={styles.dropdownItem}
                  onClick={handleOpenProfilePanel}
                >
                  <span style={styles.dropdownIcon}>👤</span>
                  Profile
                </button>
                <button style={styles.dropdownItem} onClick={handleLogout}>
                  <span style={styles.dropdownIcon}>↪</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#f3f4f6",
    overflowX: "hidden",
  },
  sidebar: {
    width: 280,
    background: "#1f2937",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    padding: "1rem",
    position: "fixed",
    top: 0,
    bottom: 0,
    left: 0,
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "700",
    marginBottom: "2rem",
  },
  nav: { flex: 1 },
  navLink: {
    display: "block",
    padding: "0.75rem 1rem",
    borderRadius: 6,
    color: "#d1d5db",
    textDecoration: "none",
    marginBottom: 8,
    transition: "0.2s",
  },
  navLinkActive: { background: "#374151", color: "#fff", fontWeight: 600 },
  icon: { marginRight: 8 },
  main: {
    flex: 1,
    transition: "margin-left 0.3s",
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  topBar: {
    background: "#fff",
    padding: "1rem 1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    borderBottom: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    position: "sticky",
    top: 0,
    zIndex: 20,
  },
  topBarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  toggleButton: {
    padding: "0.5rem",
    borderRadius: 6,
    border: "1px solid #d1d5db",
    background: "#f9fafb",
    cursor: "pointer",
  },
  pageTitle: { fontSize: "1.25rem", fontWeight: 600, margin: 0 },
  profileWrapper: {
    position: "relative",
  },
  profileCard: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 999,
    padding: "0.5rem 0.9rem",
    cursor: "pointer",
  },
  profileAvatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4f46e5, #2563eb)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
  },
  profileText: { display: "flex", flexDirection: "column", textAlign: "left" },
  profileName: { fontSize: "0.95rem", fontWeight: 600, color: "#111827" },
  profileRole: {
    fontSize: "0.8rem",
    color: "#64748b",
    textTransform: "capitalize",
  },
  profileDropdown: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 0.5rem)",
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.12)",
    minWidth: 160,
    zIndex: 30,
    overflow: "hidden",
  },
  dropdownItem: {
    width: "100%",
    border: "none",
    background: "#fff",
    padding: "0.75rem 0.9rem",
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    cursor: "pointer",
    color: "#111827",
    fontWeight: 500,
  },
  dropdownIcon: { fontSize: "0.95rem" },
  content: { flex: 1, padding: "1.5rem", background: "#f3f4f6" },
  profilePanelOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.45)",
    zIndex: 40,
    display: "flex",
    justifyContent: "flex-end",
  },
  profilePanel: {
    width: "min(420px, 100%)",
    height: "100%",
    background: "#fff",
    boxShadow: "-10px 0 35px rgba(15, 23, 42, 0.2)",
    display: "flex",
    flexDirection: "column",
  },
  profilePanelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid #e5e7eb",
  },
  profilePanelTitle: { margin: 0, fontSize: "1.15rem" },
  profilePanelSubtitle: {
    margin: "0.2rem 0 0",
    color: "#64748b",
    fontSize: "0.9rem",
  },
  closePanelButton: {
    border: "none",
    background: "#f3f4f6",
    borderRadius: "50%",
    width: 36,
    height: 36,
    cursor: "pointer",
    fontSize: "1rem",
  },
  profilePanelBody: {
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  profilePanelAvatar: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4f46e5, #2563eb)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.8rem",
    fontWeight: 700,
    marginBottom: "0.5rem",
  },
  profilePanelRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "0.75rem",
  },
  profilePanelLabel: { color: "#64748b", fontWeight: 600 },
  profilePanelValue: { color: "#111827", fontWeight: 600, textAlign: "right" },
};

export default MainLayout;
