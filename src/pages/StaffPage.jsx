import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { staffService } from "../services/staffService";

const StaffPage = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    role: "librarian",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserRole(parsedUser.role || "");
        if (parsedUser.role === "super-admin" || parsedUser.role === "admin") {
          fetchStaff();
        } else {
          setLoading(false);
        }
      } catch {
        setUserRole("");
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);

      const response = await staffService.getAllStaff();

      let staffData = [];

      if (Array.isArray(response.data)) {
        staffData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        staffData = response.data.data;
      } else if (response.status === 200 && Array.isArray(response.data)) {
        staffData = response.data;
      }

      setStaffMembers(staffData);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to load staff members");
      setStaffMembers([]);
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredStaff = staffMembers.filter((staff) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      staff.username?.toLowerCase().includes(query) ||
      staff.email?.toLowerCase().includes(query) ||
      staff.role?.toLowerCase().includes(query) ||
      staff.phone?.toLowerCase().includes(query)
    );
  });

  const handleOpenModal = (staff = null) => {
    if (staff) {
      setCurrentStaff(staff);
      setFormData({
        username: staff.username || "",
        email: staff.email || "",
        phone: staff.phone || "",
        role: staff.role || "librarian",
        password: "",
        confirmPassword: "",
      });
    } else {
      setCurrentStaff(null);
      setFormData({
        username: "",
        email: "",
        phone: "",
        role: "librarian",
        password: "",
        confirmPassword: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentStaff(null);
    setFormData({
      username: "",
      email: "",
      phone: "",
      role: "librarian",
      password: "",
      confirmPassword: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isUpdatingWithPassword =
      currentStaff && userRole === "super-admin" && formData.password;

    if (
      (!currentStaff || isUpdatingWithPassword) &&
      formData.password !== formData.confirmPassword
    ) {
      toast.error("Passwords do not match");
      return;
    }

    if (
      (!currentStaff || isUpdatingWithPassword) &&
      formData.password.length < 6
    ) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const staffData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
      };

      if (!currentStaff || isUpdatingWithPassword) {
        staffData.password = formData.password;
      }

      console.log("Saving staff:", staffData);

      if (currentStaff) {
        await staffService.updateStaff(currentStaff.id, staffData);
        toast.success("Staff updated successfully");
      } else {
        await staffService.createStaff(staffData);
        toast.success("Staff created successfully");
      }

      handleCloseModal();
      fetchStaff();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to save staff member";
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    }
  };

  const handleDeleteStaff = async (id, username) => {
    if (
      window.confirm(
        `Are you sure you want to delete staff member "${username}"? This action cannot be undone.`,
      )
    ) {
      try {
        await staffService.deleteStaff(id);
        toast.success("Staff deleted successfully");
        fetchStaff();
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to delete staff";
        toast.error(
          Array.isArray(errorMessage) ? errorMessage[0] : errorMessage,
        );
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    return status === "active" ? "#10b981" : "#ef4444";
  };

  const getRoleColor = (role) => {
    return role === "admin" ? "#8b5cf6" : "#3b82f6";
  };

  return (
    <div style={styles.container}>
      <div style={styles.adminNote}>
        <div style={styles.adminNoteIcon}>🛡️</div>
        <div style={styles.adminNoteContent}>
          <strong>Admin & Super Admin</strong> - Manage library staff and
          administrators
        </div>
      </div>

      {/* Header section */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Staff</h1>
          <p style={styles.subtitle}>
            Manage library staff and administrators (Admin & Super Admin)
          </p>
        </div>
        {(userRole === "super-admin" || userRole === "admin") && (
          <button style={styles.addButton} onClick={() => handleOpenModal()}>
            + Add Staff
          </button>
        )}
      </div>

      {/* Search bar*/}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search staff by username, email, or role..."
          value={searchQuery}
          onChange={handleSearch}
          style={styles.searchInput}
        />
        <span style={styles.searchIcon}>🔍</span>
      </div>

      <div style={styles.staffGrid}>
        {userRole && userRole !== "super-admin" && userRole !== "admin" ? (
          <div style={styles.unauthorized}>
            <h2>Access denied</h2>
            <p>
              Your account does not have permission to manage staff. Only admin
              and super-admin can view and update staff records.
            </p>
          </div>
        ) : loading ? (
          <div style={styles.loading}>Loading staff members...</div>
        ) : filteredStaff.length === 0 ? (
          <div style={styles.noResults}>
            👥 No staff members found.{" "}
            {searchQuery && "Try a different search."}
          </div>
        ) : (
          filteredStaff.map((staff) => (
            <div key={staff.id} style={styles.staffCard}>
              <div style={styles.staffHeader}>
                <div style={styles.staffInfo}>
                  <h3 style={styles.staffName}>{staff.username}</h3>
                  <p style={styles.staffEmail}>{staff.email}</p>
                </div>
                <div style={styles.staffStatus}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor:
                        getStatusColor(staff.status || "active") + "20",
                      color: getStatusColor(staff.status || "active"),
                    }}
                  >
                    {(staff.status || "active").toUpperCase()}
                  </span>
                </div>
              </div>

              <div style={styles.staffDetails}>
                {staff.phone && (
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Phone:</span>
                    <span style={styles.detailValue}>{staff.phone}</span>
                  </div>
                )}

                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Created:</span>
                  <span style={styles.detailValue}>
                    {formatDate(staff.created_at || staff.createdAt)}
                  </span>
                </div>

                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Role:</span>
                  <span
                    style={{
                      ...styles.roleBadge,
                      backgroundColor: getRoleColor(staff.role) + "20",
                      color: getRoleColor(staff.role),
                    }}
                  >
                    {staff.role === "admin" ? "Admin" : "Librarian"}
                  </span>
                </div>
              </div>

              <div style={styles.staffActions}>
                <button
                  style={styles.editButton}
                  onClick={() => handleOpenModal(staff)}
                >
                  ✏️ Edit
                </button>

                {staff.username !== "admin" && (
                  <button
                    style={styles.deleteButton}
                    onClick={() => handleDeleteStaff(staff.id, staff.username)}
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {currentStaff ? "Edit Staff Member" : "Add New Staff Member"}
              </h2>
              <p style={styles.modalSubtitle}>
                Enter the details for the{" "}
                {currentStaff ? "staff member" : "new staff member"}.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                  placeholder="Enter username"
                  disabled={currentStaff?.username === "admin"} // Don't allow editing admin username
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                  placeholder="Enter email address"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Enter phone number"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                  disabled={currentStaff?.username === "admin"}
                >
                  <option value="librarian">Librarian</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {(!currentStaff || userRole === "super-admin") && (
                <>
                  {currentStaff && userRole === "super-admin" && (
                    <div style={styles.passwordSection}>
                      <h3 style={styles.passwordSectionTitle}>
                        Change Password
                      </h3>
                      <p style={styles.passwordSectionText}>
                        Enter a new password to update the user's login
                        credentials. Leave both fields blank to keep the current
                        password.
                      </p>
                    </div>
                  )}

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      {currentStaff ? "New Password (optional)" : "Password *"}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder={
                        currentStaff
                          ? "Enter new password (min. 6 characters)"
                          : "Enter password (min. 6 characters)"
                      }
                      minLength="6"
                      required={!currentStaff}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      {currentStaff
                        ? "Confirm New Password"
                        : "Confirm Password *"}
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder={
                        currentStaff
                          ? "Confirm new password"
                          : "Confirm password"
                      }
                      minLength="6"
                      required={!currentStaff}
                    />
                  </div>
                </>
              )}

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton}>
                  {currentStaff ? "Update Staff" : "Create Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
//styles
const styles = {
  container: {
    padding: "1rem",
  },
  adminNote: {
    backgroundColor: "#fef3c7",
    border: "1px solid #fbbf24",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  adminNoteIcon: {
    fontSize: "1.25rem",
  },
  adminNoteContent: {
    fontSize: "0.875rem",
    color: "#92400e",
  },
  passwordSection: {
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "1rem",
    backgroundColor: "#f8fafc",
    marginBottom: "1rem",
  },
  passwordSectionTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    margin: "0 0 0.25rem 0",
  },
  passwordSectionText: {
    margin: 0,
    color: "#6b7280",
    fontSize: "0.9rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "2rem",
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: "1.875rem",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 0.5rem 0",
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "#6b7280",
    margin: "0",
  },
  addButton: {
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    padding: "0.625rem 1.25rem",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
    whiteSpace: "nowrap",
  },
  searchContainer: {
    position: "relative",
    marginBottom: "2rem",
  },
  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "0.75rem 1rem 0.75rem 3rem",
    fontSize: "0.875rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  searchIcon: {
    position: "absolute",
    left: "1rem",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
  },
  staffGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "1.5rem",
  },
  staffCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
  },
  staffHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1rem",
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 0.25rem 0",
  },
  staffEmail: {
    fontSize: "0.875rem",
    color: "#6b7280",
    margin: "0",
  },
  staffStatus: {
    flexShrink: 0,
  },
  statusBadge: {
    display: "inline-block",
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: "500",
  },
  staffDetails: {
    borderTop: "1px solid #e5e7eb",
    paddingTop: "1rem",
    marginBottom: "1rem",
    flex: 1,
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  detailLabel: {
    fontSize: "0.75rem",
    color: "#6b7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: "0.875rem",
    color: "#111827",
    fontWeight: "500",
  },
  roleBadge: {
    display: "inline-block",
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: "500",
  },
  staffActions: {
    display: "flex",
    gap: "0.75rem",
    justifyContent: "flex-end",
    marginTop: "auto",
  },
  editButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  loading: {
    textAlign: "center",
    padding: "3rem",
    color: "#6b7280",
    gridColumn: "1 / -1",
  },
  noResults: {
    textAlign: "center",
    padding: "3rem",
    color: "#6b7280",
    gridColumn: "1 / -1",
    fontSize: "1rem",
  },
  // Modal Styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  modalHeader: {
    padding: "1.5rem 1.5rem 1rem",
    borderBottom: "1px solid #e5e7eb",
  },
  modalTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 0.5rem 0",
  },
  modalSubtitle: {
    fontSize: "0.875rem",
    color: "#6b7280",
    margin: "0",
  },
  form: {
    padding: "1.5rem",
  },
  formGroup: {
    marginBottom: "1.25rem",
  },
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "0.5rem",
  },
  input: {
    width: "100%",
    padding: "0.625rem 0.875rem",
    fontSize: "0.875rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    marginTop: "2rem",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "none",
    padding: "0.625rem 1.25rem",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  submitButton: {
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    padding: "0.625rem 1.25rem",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
};

export default StaffPage;
