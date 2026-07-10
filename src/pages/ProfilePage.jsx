import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { staffService } from "../services/staffService";
import { commonStyles } from "../styles/commonStyles";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setFormData({
        username: parsed.username || "",
        email: parsed.email || "",
        phone: parsed.phone || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      if (formData.password.length > 0 && formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
    }

    const updatePayload = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
    };

    if (formData.password) {
      updatePayload.password = formData.password;
    }

    try {
      if (user?.id) {
        // Use the dedicated 'me' endpoint so admins/librarians can update their own profile
        await staffService.updateProfile(updatePayload);
        const updatedUser = { ...user, ...updatePayload };
        setUser(updatedUser);

        if (!user.is_demo) {
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }

        toast.success(
          user.is_demo
            ? "Profile changes are temporary for demo accounts and will reset after reload."
            : "Profile updated successfully",
        );
      } else {
        toast.error("Unable to update profile. Please log in again.");
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Failed to update profile. Please try again.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Profile</h2>
        <p style={styles.subtitle}>No profile loaded.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Profile</h1>
            <p style={styles.subtitle}>View and update your account.</p>
          </div>
          <button
            style={styles.editButton}
            type="button"
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </button>
        </div>

        <div style={styles.profileGrid}>
          <div style={styles.profilePanel}>
            <div style={styles.avatar}>
              {(user.username || "U").charAt(0).toUpperCase()}
            </div>
            <h2 style={styles.profileName}>{user.username}</h2>
            <p style={styles.profileRole}>{user.role}</p>
          </div>

          <div style={styles.profileDetails}>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Username</span>
              <span style={styles.detailValue}>{user.username}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Email</span>
              <span style={styles.detailValue}>{user.email}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Phone</span>
              <span style={styles.detailValue}>
                {user.phone || "Not provided"}
              </span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Role</span>
              <span style={styles.detailValue}>{user.role}</span>
            </div>
          </div>
        </div>

        {editing && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>New Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Leave blank to keep current password"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Repeat new password"
              />
            </div>
            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
              <button type="submit" style={styles.submitButton}>
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    ...commonStyles.container,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
    padding: "2rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    gap: "1rem",
  },
  title: {
    ...commonStyles.title,
  },
  subtitle: {
    ...commonStyles.subtitle,
  },
  editButton: {
    ...commonStyles.submitButton,
    backgroundColor: "#2563eb",
  },
  profileGrid: {
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  profilePanel: {
    backgroundColor: "#f8fafc",
    borderRadius: "18px",
    padding: "1.5rem",
    textAlign: "center",
  },
  avatar: {
    width: 96,
    height: 96,
    lineHeight: "96px",
    margin: "0 auto 1rem",
    borderRadius: "50%",
    backgroundColor: "#4f46e5",
    color: "#fff",
    fontSize: "2.5rem",
    fontWeight: 700,
  },
  profileName: {
    fontSize: "1.35rem",
    fontWeight: 700,
    margin: "0 0 0.25rem",
  },
  profileRole: {
    color: "#6b7280",
    margin: 0,
  },
  profileDetails: {
    display: "grid",
    gap: "0.75rem",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.95rem 1rem",
    borderRadius: "14px",
    backgroundColor: "#f8fafc",
  },
  detailLabel: {
    color: "#64748b",
    fontWeight: 600,
  },
  detailValue: {
    color: "#111827",
    fontWeight: 600,
  },
  formGroup: {
    ...commonStyles.formGroup,
  },
  label: {
    ...commonStyles.label,
  },
  input: {
    ...commonStyles.input,
  },
  modalActions: {
    ...commonStyles.modalActions,
  },
  cancelButton: {
    ...commonStyles.cancelButton,
  },
  submitButton: {
    ...commonStyles.submitButton,
  },
};

export default ProfilePage;
