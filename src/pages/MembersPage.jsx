import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { memberService } from "../services/memberService";

const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [editingMember, setEditingMember] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await memberService.getAllMembers();
      setMembers(response.data || []);
    } catch (error) {
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name || "",
        email: member.email || "",
        phone: member.phone || "",
      });
    } else {
      setEditingMember(null);
      setFormData({ name: "", email: "", phone: "" });
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
    setFormData({ name: "", email: "", phone: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingMember) {
        await memberService.updateMember(editingMember.id, formData);
        toast.success("Member updated successfully");
      } else {
        const today = new Date();
        const joinDate = today.toISOString().split("T")[0];

        const memberData = {
          ...formData,
          join_date: joinDate,
        };

        await memberService.createMember(memberData);
        toast.success("Member created successfully");
      }

      handleCloseModal();
      fetchMembers();
    } catch (error) {
      toast.error("Failed to save member");
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        await memberService.deleteMember(id);
        toast.success("Member deleted successfully");
        fetchMembers();
      } catch (error) {
        toast.error("Failed to delete member");
      }
    }
  };

  const filteredMembers = members.filter((member) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      member.name?.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query) ||
      member.phone?.toLowerCase().includes(query)
    );
  });

  const openHistory = async (member) => {
    try {
      const res = await memberService.getMemberBorrowingHistory(member.id);
      setBorrowHistory(res.data);
      setHistoryModal(true);
    } catch (error) {
      toast.error("Failed to load history");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Members</h1>
          <p style={styles.subtitle}>Manage library members</p>
        </div>
        <button style={styles.addButton} onClick={handleOpenModal}>
          + Add Member
        </button>
      </div>

      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search members by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <span style={styles.searchIcon}>🔍</span>
      </div>

      <div style={styles.membersList}>
        {loading ? (
          <div style={styles.loading}>Loading members...</div>
        ) : filteredMembers.length === 0 ? (
          <div style={styles.noResults}>
            👥 No members found. {searchQuery && "Try a different search."}
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div key={member.id} style={styles.memberCard}>
              <div style={styles.memberHeader}>
                <h3 style={styles.memberName}>
                  {member.name || "Unnamed Member"}
                </h3>
                <div style={styles.memberActions}>
                  <button onClick={() => handleOpenModal(member)}>✏️</button>
                  <button onClick={() => openHistory(member)}>📚</button>
                  <button
                    style={styles.deleteButton}
                    onClick={() => handleDeleteMember(member.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <p style={styles.memberEmail}>{member.email || "No email"}</p>

              {member.phone && (
                <p style={styles.memberPhone}>Phone: {member.phone}</p>
              )}

              <div style={styles.memberDetails}>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Joined:</span>
                  <span style={styles.detailValue}>
                    {member.createdAt || member.join_date
                      ? new Date(
                          member.createdAt || member.join_date,
                        ).toLocaleDateString("en-US", {
                          month: "numeric",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Unknown"}
                  </span>
                </div>

                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Active Borrows:</span>
                  <span style={styles.detailValue}>
                    {member.activeBorrows ?? 0}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Member Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingMember ? "Edit Member" : "Add New Member"}
              </h2>
              <p style={styles.modalSubtitle}>
                Enter the details for the new member.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                  placeholder="Enter full name"
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

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton}>
                  {editingMember ? "Update Member" : "Create Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {historyModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Borrowing History</h2>
              <p style={styles.modalSubtitle}>
                Member borrow & return activity
              </p>
            </div>

            <div style={{ padding: "1.5rem" }}>
              {borrowHistory.length === 0 ? (
                <p style={{ textAlign: "center", color: "#6b7280" }}>
                  No borrowing history
                </p>
              ) : (
                borrowHistory.map((record) => (
                  <div key={record.id} style={styles.historyCard}>
                    <h4 style={styles.historyBook}>📖 {record.book?.title}</h4>

                    <div style={styles.historyRow}>
                      <span>Borrowed:</span>
                      <span>
                        {new Date(record.borrow_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={styles.historyRow}>
                      <span>Due:</span>
                      <span>
                        {new Date(record.due_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={styles.historyRow}>
                      <span>Status:</span>
                      <span
                        style={{
                          ...styles.historyBadge,
                          backgroundColor: record.return_date
                            ? "#10b981"
                            : "#ef4444",
                        }}
                      >
                        {record.return_date ? "Returned" : "Borrowed"}
                      </span>
                    </div>
                  </div>
                ))
              )}

              <div style={{ textAlign: "right", marginTop: "1rem" }}>
                <button
                  style={styles.cancelButton}
                  onClick={() => setHistoryModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
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
  },
  searchContainer: {
    position: "relative",
    marginBottom: "2rem",
  },
  searchInput: {
    width: "100%",
    padding: "0.75rem 1rem 0.75rem 3rem",
    fontSize: "0.875rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
  },
  searchIcon: {
    position: "absolute",
    left: "1rem",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
  },
  membersList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  memberCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e5e7eb",
  },
  memberHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "0.5rem",
  },
  memberName: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#111827",
    margin: "0",
  },
  memberActions: {
    display: "flex",
    gap: "0.5rem",
  },
  deleteButton: {
    background: "none",
    border: "none",
    fontSize: "1.25rem",
    cursor: "pointer",
    padding: "0.25rem",
    borderRadius: "4px",
    color: "#ef4444",
  },
  memberEmail: {
    fontSize: "0.875rem",
    color: "#6b7280",
    margin: "0 0 0.5rem 0",
  },
  memberPhone: {
    fontSize: "0.875rem",
    color: "#6b7280",
    margin: "0 0 1rem 0",
  },
  memberDetails: {
    borderTop: "1px solid #e5e7eb",
    paddingTop: "1rem",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
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
  loading: {
    textAlign: "center",
    padding: "3rem",
    color: "#6b7280",
  },
  noResults: {
    textAlign: "center",
    padding: "3rem",
    color: "#6b7280",
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
    color: " #6b7280",
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
  },
  historyCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "1rem",
    marginBottom: "1rem",
    backgroundColor: "#f9fafb",
  },

  historyBook: {
    marginBottom: "0.75rem",
    color: "#111827",
  },

  historyRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.4rem",
    fontSize: "0.875rem",
  },

  historyBadge: {
    color: "white",
    padding: "2px 8px",
    borderRadius: "6px",
    fontSize: "0.75rem",
  },
};

export default MembersPage;
