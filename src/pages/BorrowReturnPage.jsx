import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { borrowingService } from "../services/borrowingService";
import { bookService } from "../services/bookService";
import { memberService } from "../services/memberService";
import Select from "react-select";
import { commonStyles } from "../styles/commonStyles";

const BorrowReturnPage = () => {
  const location = useLocation();
  const [borrowRecords, setBorrowRecords] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  //eslint-disable-next-line
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const actionIcons = { edit: "✎", delete: "🗑", view: "👁" };

  // Form states
  const [borrowForm, setBorrowForm] = useState({
    book_id: "",
    member_id: "",
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 14 days from now
  });

  const [returnForm, setReturnForm] = useState({
    borrow_record_id: "",
    return_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const openForm = searchParams.get("openForm");
    if (openForm === "borrow") {
      handleOpenBorrowModal();
    } else if (openForm === "return") {
      handleOpenReturnModal();
    }
  }, [location.search]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all data
      const [borrowResponse, booksResponse, membersResponse] =
        await Promise.all([
          borrowingService.getAllBorrowRecords(),
          bookService.getAllBooks(),
          memberService.getAllMembers(),
        ]);

      setBorrowRecords(borrowResponse.data || []);
      setBooks(booksResponse.data || []);
      setMembers(membersResponse.data || []);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const activeBorrowings = borrowRecords.filter(
    (record) => !record.return_date,
  );

  // Returned borrowings: records with return_date
  const returnedBorrowings = borrowRecords.filter(
    (record) => record.return_date,
  );

  // Find overdue borrowings
  const overdueBorrowings = activeBorrowings.filter((record) => {
    if (!record.due_date) return false;
    const dueDate = new Date(record.due_date);
    const today = new Date();
    return dueDate < today;
  });

  // Helper functions (MUST be defined before they're used)
  const getBookById = (id) => books.find((book) => book.id === id);
  const getMemberById = (id) => members.find((member) => member.id === id);

  // Convert data to options for Select components (now defined AFTER helper functions)
  const bookOptions = books
    .filter((book) => book.available_copies > 0)
    .map((book) => ({
      value: book.id,
      label: `${book.title} by ${book.author} — ${book.available_copies} available`,
    }));

  const memberOptions = members.map((member) => ({
    value: member.id,
    label: `${member.name} (${member.email})`,
  }));

  const borrowRecordOptions = activeBorrowings.map((record) => {
    const book = getBookById(record.book_id);
    const member = getMemberById(record.member_id);

    return {
      value: record.id,
      label: `${book?.title || "Unknown Book"} - Borrowed by ${member?.name || "Unknown Member"}`,
    };
  });

  // Custom styles for Select components to match UI
  const selectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: "6px",
      borderColor: "#d1d5db",
      minHeight: "38px",
      fontSize: "0.875rem",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#9ca3af",
      },
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "0.875rem",
      backgroundColor: state.isSelected
        ? "#4f46e5"
        : state.isFocused
          ? "#f3f4f6"
          : "white",
      color: state.isSelected ? "white" : "#111827",
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "6px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9ca3af",
      fontSize: "0.875rem",
    }),
    input: (base) => ({
      ...base,
      fontSize: "0.875rem",
    }),
  };

  // Borrow modal handlers
  const handleOpenBorrowModal = () => {
    setBorrowForm({
      book_id: "",
      member_id: "",
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    });
    setShowBorrowModal(true);
  };

  const handleBorrowSubmit = async (e) => {
    e.preventDefault();

    try {
      const borrowData = {
        book_id: Number(borrowForm.book_id),
        member_id: Number(borrowForm.member_id),
        due_date: borrowForm.due_date,
      };
      await borrowingService.borrowBook(borrowData);
      toast.success("Book borrowed successfully");
      setShowBorrowModal(false);
      fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message?.[0] || "Failed to borrow book",
      );
    }
  };

  // Return modal handlers
  const handleOpenReturnModal = (recordId = "") => {
    setReturnForm({
      borrow_record_id: recordId,
      return_date: new Date().toISOString().split("T")[0],
    });
    setShowReturnModal(true);
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();

    try {
      const returnData = {
        borrow_record_id: Number(returnForm.borrow_record_id),
      };

      const response = await borrowingService.returnBook(returnData);
      console.log("Return successful:", response);
      toast.success("Book returned successfully");
      setShowReturnModal(false);
      fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message?.[0] || "Failed to return book",
      );
    }
  };

  const handleOpenRecordDetails = (record) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const handleDeleteRecord = async (recordId) => {
    if (
      !window.confirm("Are you sure you want to delete this borrow record?")
    ) {
      return;
    }

    const recordToRemove = borrowRecords.find(
      (record) => record.id === recordId,
    );
    setBorrowRecords((prev) => prev.filter((record) => record.id !== recordId));

    toast.success(
      recordToRemove?.return_date
        ? "The return history has been removed from the current view and preserved in the library records."
        : "The borrow record has been removed from the current view and preserved in the library records.",
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Borrow & Return</h1>
          <p style={styles.subtitle}>
            Manage book borrowing and return operations
          </p>
        </div>
        <div style={styles.headerButtons}>
          <button style={styles.borrowButton} onClick={handleOpenBorrowModal}>
            Borrow Book
          </button>
          <button
            style={styles.returnButton}
            onClick={() => handleOpenReturnModal()}
          >
            Return Book
          </button>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: "#3b82f620" }}>
            <span style={{ fontSize: "1.5rem" }}>📖</span>
          </div>
          <div style={styles.statInfo}>
            <div style={styles.statValue}>{activeBorrowings.length}</div>
            <div style={styles.statLabel}>Active</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: "#10b98120" }}>
            <span style={{ fontSize: "1.5rem" }}>✅</span>
          </div>
          <div style={styles.statInfo}>
            <div style={styles.statValue}>{returnedBorrowings.length}</div>
            <div style={styles.statLabel}>Returned</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: "#ef444420" }}>
            <span style={{ fontSize: "1.5rem" }}>⚠️</span>
          </div>
          <div style={styles.statInfo}>
            <div style={styles.statValue}>{overdueBorrowings.length}</div>
            <div style={styles.statLabel}>Overdue</div>
          </div>
        </div>
      </div>

      {/* Active Borrowings */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Active Borrowings</h2>
        {activeBorrowings.length === 0 ? (
          <p style={styles.noData}>No active borrowings</p>
        ) : (
          <div style={styles.recordsList}>
            {activeBorrowings.map((record) => {
              const book = getBookById(record.book_id);
              const member = getMemberById(record.member_id);

              return (
                <div key={record.id} style={styles.recordCard}>
                  <div style={styles.recordHeader}>
                    <h3 style={styles.bookTitle}>
                      {book?.title || "Unknown Book"}
                    </h3>
                    <button
                      style={styles.returnRecordButton}
                      onClick={() => handleOpenReturnModal(record.id)}
                    >
                      Return
                    </button>
                  </div>
                  <p style={styles.memberName}>
                    <strong>{member?.name || "Unknown Member"}</strong>
                  </p>
                  <div style={styles.recordDetails}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Borrowed:</span>
                      <span style={styles.detailValue}>
                        {formatDate(record.borrow_date)}
                      </span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Due:</span>
                      <span style={styles.detailValue}>
                        {formatDate(record.due_date)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Returned Borrowings */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Returned Books</h2>
        {returnedBorrowings.length === 0 ? (
          <p style={styles.noData}>No returned books</p>
        ) : (
          <div style={styles.recordsList}>
            {returnedBorrowings.slice(0, 5).map((record) => {
              const book = getBookById(record.book_id);
              const member = getMemberById(record.member_id);

              return (
                <div key={record.id} style={styles.recordCard}>
                  <div style={styles.recordHeader}>
                    <div>
                      <h3 style={styles.bookTitle}>
                        {book?.title || "Unknown Book"}
                      </h3>
                      <p style={styles.memberName}>
                        <strong>{member?.name || "Unknown Member"}</strong>
                      </p>
                    </div>
                    <div style={styles.recordActions}>
                      <button
                        style={styles.iconButton}
                        title="View details"
                        onClick={() => handleOpenRecordDetails(record)}
                      >
                        {actionIcons.view}
                      </button>
                      <button
                        style={styles.iconButtonDanger}
                        title="Delete record"
                        onClick={() => handleDeleteRecord(record.id)}
                      >
                        {actionIcons.delete}
                      </button>
                    </div>
                  </div>
                  <div style={styles.recordDetails}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Borrowed:</span>
                      <span style={styles.detailValue}>
                        {formatDate(record.borrow_date)}
                      </span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Returned:</span>
                      <span style={styles.detailValue}>
                        {formatDate(record.return_date)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Borrow Modal */}
      {showBorrowModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Borrow Book</h2>
              <p style={styles.modalSubtitle}>
                Select a book and member to create a new borrow record.
              </p>
            </div>

            <form onSubmit={handleBorrowSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Select Book *</label>
                <Select
                  options={bookOptions}
                  value={bookOptions.find(
                    (option) => option.value === Number(borrowForm.book_id),
                  )}
                  onChange={(selected) =>
                    setBorrowForm({
                      ...borrowForm,
                      book_id: selected?.value || "",
                    })
                  }
                  placeholder="Search and select book..."
                  isSearchable
                  styles={selectStyles}
                  menuPlacement="auto"
                  maxMenuHeight={220}
                  components={{ IndicatorSeparator: () => null }}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Select Member *</label>
                <Select
                  options={memberOptions}
                  value={memberOptions.find(
                    (option) => option.value === Number(borrowForm.member_id),
                  )}
                  onChange={(selected) =>
                    setBorrowForm({
                      ...borrowForm,
                      member_id: selected?.value || "",
                    })
                  }
                  placeholder="Search and select member..."
                  isSearchable
                  styles={selectStyles}
                  menuPlacement="auto"
                  maxMenuHeight={220}
                  components={{ IndicatorSeparator: () => null }}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Due Date *</label>
                <input
                  type="date"
                  value={borrowForm.due_date}
                  onChange={(e) =>
                    setBorrowForm({ ...borrowForm, due_date: e.target.value })
                  }
                  style={styles.input}
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
                <small style={styles.helperText}>
                  Books are typically borrowed for 14 days
                </small>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => setShowBorrowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton}>
                  Borrow Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Return Book</h2>
              <p style={styles.modalSubtitle}>
                Select a borrowed book to mark as returned.
              </p>
            </div>

            <form onSubmit={handleReturnSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Select Book to Return *</label>
                <Select
                  options={borrowRecordOptions}
                  value={borrowRecordOptions.find(
                    (option) =>
                      option.value === Number(returnForm.borrow_record_id),
                  )}
                  onChange={(selected) =>
                    setReturnForm({
                      ...returnForm,
                      borrow_record_id: selected?.value || "",
                    })
                  }
                  placeholder="Search borrow record..."
                  isSearchable
                  styles={selectStyles}
                  menuPlacement="auto"
                  maxMenuHeight={220}
                  components={{ IndicatorSeparator: () => null }}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Return Date *</label>
                <input
                  type="date"
                  value={returnForm.return_date}
                  onChange={(e) =>
                    setReturnForm({
                      ...returnForm,
                      return_date: e.target.value,
                    })
                  }
                  style={styles.input}
                  required
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => setShowReturnModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton}>
                  Return Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedRecord && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Borrow Record Details</h2>
              <p style={styles.modalSubtitle}>Full record information</p>
            </div>
            <div style={styles.form}>
              <div style={styles.detailSection}>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Book</span>
                  <span style={styles.detailValue}>
                    {getBookById(selectedRecord.book_id)?.title || "Unknown"}
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Member</span>
                  <span style={styles.detailValue}>
                    {getMemberById(selectedRecord.member_id)?.name || "Unknown"}
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Borrowed</span>
                  <span style={styles.detailValue}>
                    {formatDate(selectedRecord.borrow_date)}
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Due</span>
                  <span style={styles.detailValue}>
                    {formatDate(selectedRecord.due_date)}
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Returned</span>
                  <span style={styles.detailValue}>
                    {selectedRecord.return_date
                      ? formatDate(selectedRecord.return_date)
                      : "Pending"}
                  </span>
                </div>
              </div>
              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => setShowDetailsModal(false)}
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
    ...commonStyles.container,
  },
  header: {
    ...commonStyles.header,
  },
  headerLeft: {
    ...commonStyles.headerLeft,
  },
  title: {
    ...commonStyles.title,
  },
  subtitle: {
    ...commonStyles.subtitle,
  },
  headerButtons: {
    display: "flex",
    gap: "1rem",
  },
  borrowButton: {
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    padding: "0.625rem 1.25rem",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
  },
  returnButton: {
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    padding: "0.625rem 1.25rem",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  statCard: {
    ...commonStyles.card,
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: "1.875rem",
    fontWeight: "700",
    color: "#111827",
    lineHeight: "1",
  },
  statLabel: {
    fontSize: "0.875rem",
    color: "#6b7280",
    marginTop: "0.25rem",
  },
  section: {
    ...commonStyles.sectionCard,
  },
  sectionTitle: {
    ...commonStyles.sectionTitle,
  },
  noData: {
    ...commonStyles.emptyStateCompact,
  },
  recordsList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  recordCard: {
    ...commonStyles.cardSoft,
  },
  recordHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "0.75rem",
    gap: "0.75rem",
  },
  bookTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#111827",
    margin: "0",
  },
  returnRecordButton: {
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    padding: "0.375rem 0.85rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  recordActions: {
    display: "flex",
    gap: "0.4rem",
  },
  iconButton: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#2563eb",
    borderRadius: "8px",
    width: 34,
    height: 34,
    cursor: "pointer",
  },
  iconButtonDanger: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    borderRadius: "8px",
    width: 34,
    height: 34,
    cursor: "pointer",
  },
  memberName: {
    fontSize: "0.875rem",
    color: "#6b7280",
    margin: "0 0 1rem 0",
  },
  recordDetails: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.75rem",
  },
  detailRow: {
    ...commonStyles.detailColumnRow,
  },
  detailLabel: {
    ...commonStyles.detailLabel,
    marginBottom: "0.25rem",
  },
  detailValue: {
    ...commonStyles.detailValue,
  },
  // Modal styles (similar to other pages)
  modalOverlay: {
    ...commonStyles.modalOverlay,
  },
  modal: {
    ...commonStyles.modal,
    maxHeight: "90vh",
  },
  modalHeader: {
    ...commonStyles.modalHeader,
  },
  modalTitle: {
    ...commonStyles.modalTitle,
  },
  modalSubtitle: {
    ...commonStyles.modalSubtitle,
  },
  form: {
    ...commonStyles.form,
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
  helperText: {
    ...commonStyles.helperText,
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
};

export default BorrowReturnPage;
