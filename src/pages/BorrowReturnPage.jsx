import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { borrowingService } from '../services/borrowingService';
import { bookService } from '../services/bookService';
import { memberService } from '../services/memberService';
import Select from "react-select";

const BorrowReturnPage = () => {
  const [borrowRecords, setBorrowRecords] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  //eslint-disable-next-line
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  
  // Form states
  const [borrowForm, setBorrowForm] = useState({
    book_id: '',
    member_id: '',
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 14 days from now
  });
  
  const [returnForm, setReturnForm] = useState({
    borrow_record_id: '',
    return_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  try {
    setLoading(true);
    
    // Fetch all data 
    const [borrowResponse, booksResponse, membersResponse] = await Promise.all([
      borrowingService.getAllBorrowRecords(),
      bookService.getAllBooks(),
      memberService.getAllMembers()
    ]);
    
    setBorrowRecords(borrowResponse.data || []);
    setBooks(booksResponse.data || []);
    setMembers(membersResponse.data || []);
    
  } catch (error) {
    toast.error('Failed to load data');
  } finally {
    setLoading(false);
  }
};

const activeBorrowings = borrowRecords.filter(record => !record.return_date);

// Returned borrowings: records with return_date  
const returnedBorrowings = borrowRecords.filter(record => record.return_date);
  
  // Find overdue borrowings 
  const overdueBorrowings = activeBorrowings.filter(record => {
    if (!record.due_date) return false;
    const dueDate = new Date(record.due_date);
    const today = new Date();
    return dueDate < today;
  });

  // Helper functions (MUST be defined before they're used)
  const getBookById = (id) => books.find(book => book.id === id);
  const getMemberById = (id) => members.find(member => member.id === id);

  // Convert data to options for Select components (now defined AFTER helper functions)
  const bookOptions = books
    .filter(book => book.available_copies > 0)
    .map(book => ({
      value: book.id,
      label: `${book.title} by ${book.author} (${book.available_copies} available)`
    }));

  const memberOptions = members.map(member => ({
    value: member.id,
    label: `${member.name} (${member.email})`
  }));

  const borrowRecordOptions = activeBorrowings.map(record => {
    const book = getBookById(record.book_id);
    const member = getMemberById(record.member_id);

    return {
      value: record.id,
      label: `${book?.title || "Unknown Book"} - Borrowed by ${member?.name || "Unknown Member"}`
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
      '&:hover': {
        borderColor: "#9ca3af"
      }
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "0.875rem",
      backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#f3f4f6' : 'white',
      color: state.isSelected ? 'white' : '#111827',
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
    })
  };

  // Borrow modal handlers
  const handleOpenBorrowModal = () => {
    setBorrowForm({
      book_id: '',
      member_id: '',
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setShowBorrowModal(true);
  };

  const handleBorrowSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const borrowData = {
      book_id: Number(borrowForm.book_id),
      member_id: Number(borrowForm.member_id),
      due_date: borrowForm.due_date
    };
    await borrowingService.borrowBook(borrowData);
    toast.success('Book borrowed successfully');
    setShowBorrowModal(false);
    fetchData();
  } catch (error) {
    toast.error(error.response?.data?.message?.[0] || 'Failed to borrow book');
  }
};

  // Return modal handlers
  const handleOpenReturnModal = (recordId = '') => {
    setReturnForm({
      borrow_record_id: recordId,
      return_date: new Date().toISOString().split('T')[0]
    });
    setShowReturnModal(true);
  };

  const handleReturnSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const returnData = {
      borrow_record_id: Number(returnForm.borrow_record_id)
    };
    
    const response = await borrowingService.returnBook(returnData);
    console.log('Return successful:', response);
    toast.success('Book returned successfully');
    setShowReturnModal(false);
    fetchData();
  } catch (error) {
    toast.error(error.response?.data?.message?.[0] || 'Failed to return book');
  }
};

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Borrow & Return</h1>
          <p style={styles.subtitle}>Manage book borrowing and return operations</p>
        </div>
        <div style={styles.headerButtons}>
          <button style={styles.borrowButton} onClick={handleOpenBorrowModal}>
            Borrow Book
          </button>
          <button style={styles.returnButton} onClick={() => handleOpenReturnModal()}>
            Return Book
          </button>
        </div>
      </div>

     <div style={styles.statsGrid}>
  <div style={styles.statCard}>
    <div style={{ ...styles.statIcon, backgroundColor: '#3b82f620' }}>
      <span style={{ fontSize: '1.5rem' }}>📖</span>
    </div>
    <div style={styles.statInfo}>
      <div style={styles.statValue}>{activeBorrowings.length}</div>
      <div style={styles.statLabel}>Active</div>
    </div>
  </div>
  
  <div style={styles.statCard}>
    <div style={{ ...styles.statIcon, backgroundColor: '#10b98120' }}>
      <span style={{ fontSize: '1.5rem' }}>✅</span>
    </div>
    <div style={styles.statInfo}>
      <div style={styles.statValue}>{returnedBorrowings.length}</div>
      <div style={styles.statLabel}>Returned</div>
    </div>
  </div>
  
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#ef444420' }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
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
                    <h3 style={styles.bookTitle}>{book?.title || 'Unknown Book'}</h3>
                    <button 
                      style={styles.returnRecordButton}
                      onClick={() => handleOpenReturnModal(record.id)}
                    >
                      Mark as Returned
                    </button>
                  </div>
                  <p style={styles.memberName}><strong>{member?.name || 'Unknown Member'}</strong></p>
                  <div style={styles.recordDetails}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Borrowed:</span>
                      <span style={styles.detailValue}>{formatDate(record.borrow_date)}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Due:</span>
                      <span style={styles.detailValue}>{formatDate(record.due_date)}</span>
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
                  <h3 style={styles.bookTitle}>{book?.title || 'Unknown Book'}</h3>
                  <p style={styles.memberName}><strong>{member?.name || 'Unknown Member'}</strong></p>
                  <div style={styles.recordDetails}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Borrowed:</span>
                      <span style={styles.detailValue}>{formatDate(record.borrow_date)}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Returned:</span>
                      <span style={styles.detailValue}>{formatDate(record.return_date)}</span>
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
              <p style={styles.modalSubtitle}>Select a book and member to create a new borrow record.</p>
            </div>
            
            <form onSubmit={handleBorrowSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Select Book *</label>
                <Select
                  options={bookOptions}
                  value={bookOptions.find(option => option.value === Number(borrowForm.book_id))}
                  onChange={(selected) =>
                    setBorrowForm({ ...borrowForm, book_id: selected?.value || "" })
                  }
                  placeholder="Search and select book..."
                  isSearchable
                  styles={selectStyles}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Select Member *</label>
                <Select
                  options={memberOptions}
                  value={memberOptions.find(option => option.value === Number(borrowForm.member_id))}
                  onChange={(selected) =>
                    setBorrowForm({ ...borrowForm, member_id: selected?.value || "" })
                  }
                  placeholder="Search and select member..."
                  isSearchable
                  styles={selectStyles}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Due Date *</label>
                <input
                  type="date"
                  value={borrowForm.due_date}
                  onChange={(e) => setBorrowForm({...borrowForm, due_date: e.target.value})}
                  style={styles.input}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
                <small style={styles.helperText}>Books are typically borrowed for 14 days</small>
              </div>
              
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelButton} onClick={() => setShowBorrowModal(false)}>
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
              <p style={styles.modalSubtitle}>Select a borrowed book to mark as returned.</p>
            </div>
            
            <form onSubmit={handleReturnSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Select Book to Return *</label>
                <Select
                  options={borrowRecordOptions}
                  value={borrowRecordOptions.find(option => option.value === Number(returnForm.borrow_record_id))}
                  onChange={(selected) =>
                    setReturnForm({ ...returnForm, borrow_record_id: selected?.value || "" })
                  }
                  placeholder="Search borrow record..."
                  isSearchable
                  styles={selectStyles}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Return Date *</label>
                <input
                  type="date"
                  value={returnForm.return_date}
                  onChange={(e) => setReturnForm({...returnForm, return_date: e.target.value})}
                  style={styles.input}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelButton} onClick={() => setShowReturnModal(false)}>
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
    </div>
  );
};

//styles
const styles = {
  container: {
    padding: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: '0',
  },
  headerButtons: {
    display: 'flex',
    gap: '1rem',
  },
  borrowButton: {
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    padding: '0.625rem 1.25rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  returnButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '0.625rem 1.25rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: '#111827',
    lineHeight: '1',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginTop: '0.25rem',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 1rem 0',
  },
  noData: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '2rem',
  },
  recordsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  recordCard: {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '1.25rem',
    border: '1px solid #e5e7eb',
  },
  recordHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
  },
  bookTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#111827',
    margin: '0',
  },
  returnRecordButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '0.375rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  memberName: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: '0 0 1rem 0',
  },
  recordDetails: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'column',
  },
  detailLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: '0.25rem',
  },
  detailValue: {
    fontSize: '0.875rem',
    color: '#111827',
    fontWeight: '500',
  },
  // Modal styles (similar to other pages)
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  modalHeader: {
    padding: '1.5rem 1.5rem 1rem',
    borderBottom: '1px solid #e5e7eb',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 0.5rem 0',
  },
  modalSubtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: '0',
  },
  form: {
    padding: '1.5rem',
  },
  formGroup: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem',
  },
  input: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    fontSize: '0.875rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
  },
  helperText: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '0.25rem',
    display: 'block',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '2rem',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    padding: '0.625rem 1.25rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  submitButton: {
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    padding: '0.625rem 1.25rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
};

export default BorrowReturnPage;