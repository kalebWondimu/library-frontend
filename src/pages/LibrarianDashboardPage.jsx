import { bookService } from '../services/bookService';
import { memberService } from '../services/memberService';
import { borrowingService } from '../services/borrowingService';
import { toast } from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LibrarianDashboardPage = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    activeBorrows: 0,
    overdueBooks: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
  fetchDashboardData();
}, []);

const fetchDashboardData = async () => {
  try {
    setLoading(true);

    const [booksData, membersData, borrowRecordsData] = await Promise.all([
      bookService.getAllBooks(),
      memberService.getAllMembers(),
      borrowingService.getAllBorrowRecords(),
    ]);

    const books = Array.isArray(booksData) ? booksData : booksData?.data || [];
    const members = Array.isArray(membersData) ? membersData : membersData?.data || [];
    const borrowRecords = Array.isArray(borrowRecordsData)
      ? borrowRecordsData
      : borrowRecordsData?.data || [];

    const activeBorrowings = borrowRecords.filter(
      (record) => !record.return_date
    );

    const overdueBooks = activeBorrowings.filter((record) => {
      if (!record.due_date) return false;
      return new Date(record.due_date) < new Date();
    });

    setStats({
      totalBooks: books.length,
      totalMembers: members.length,
      activeBorrows: activeBorrowings.length,
      overdueBooks: overdueBooks.length,
    });

  } catch (error) {
    toast.error('Failed to load librarian dashboard data');

    setStats({
      totalBooks: 0,
      totalMembers: 0,
      activeBorrows: 0,
      overdueBooks: 0,
    });
  } finally {
    setLoading(false);
  }
};

  const quickActions = [
    { label: 'Borrow Book', icon: '📥', path: '/borrow-return', color: '#3b82f6', description: 'Process book borrowing' },
    { label: 'Return Book', icon: '📤', path: '/borrow-return', color: '#10b981', description: 'Process book returns' },
    { label: 'Add Book', icon: '📚', path: '/books', color: '#f59e0b', description: 'Add new books to catalog' },
  ];

  const role = localStorage.getItem('role');

const base = role === 'admin' ? '/admin' : '/librarian';

const handleQuickAction = (path) => {
  navigate(`${base}${path}`);
};


  return (
    <div style={styles.container}>
      {/* Welcome Section - LIBRARIAN DASHBOARD */}
      <div style={styles.welcomeSection}>
        <div style={styles.welcomeHeader}>
          <h2 style={styles.welcomeTitle}>Librarian Dashboard</h2>
          <div style={styles.librarianBadge}>
            <span>📚 LIBRARIAN</span>
          </div>
        </div>
        <p style={styles.welcomeSubtitle}>Standard library operations - Books,  borrowing</p>
        
        <div style={styles.librarianAccessNote}>
          <p>You can manage books and handle borrowing operations, and view reports. Contact admin for advanced operations.</p>
        </div>
      </div>

      {/* Statistics Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <div style={styles.statIcon}>📚</div>
            <div>
              <div style={styles.statValue}>
                {loading ? '...' : stats.totalBooks.toLocaleString()}
              </div>
              <div style={styles.statLabel}>Books</div>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <div style={styles.statIcon}>👥</div>
            <div>
              <div style={styles.statValue}>
                {loading ? '...' : stats.totalMembers.toLocaleString()}
              </div>
              <div style={styles.statLabel}>Members</div>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <div style={styles.statIcon}>📖</div>
            <div>
              <div style={styles.statValue}>
                {loading ? '...' : stats.activeBorrows.toLocaleString()}
              </div>
              <div style={styles.statLabel}>Active Borrows</div>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <div style={styles.statIcon}>⚠️</div>
            <div>
              <div style={styles.statValue}>
                {loading ? '...' : stats.overdueBooks.toLocaleString()}
              </div>
              <div style={styles.statLabel}>Overdue Books</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div style={styles.quickActionsSection}>
        <h3 style={styles.sectionTitle}>Quick Actions</h3>
        <p style={styles.sectionSubtitle}>Common library operations</p>
        
        <div style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <button
              key={index}
              style={styles.quickActionButton}
              onClick={() => handleQuickAction(action.path)}
            >
              <div style={styles.quickActionIcon}>{action.icon}</div>
              <div style={styles.quickActionLabel}>{action.label}</div>
              <div style={styles.quickActionDescription}>{action.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Additional Info for Librarian */}
      <div style={styles.additionalInfo}>
        <div style={styles.infoCard}>
          <h4 style={styles.infoTitle}>Your Permissions</h4>
          <ul style={styles.permissionsList}>
            <li>✅ Manage books (add, edit, delete)</li>
            <li>✅ Process book borrowing and returns</li>
          </ul>
        </div>
        
        <div style={styles.infoCard}>
          <h4 style={styles.infoTitle}>Need Admin Access?</h4>
          <p style={styles.infoText}>
            For the following operations, please contact your system administrator:
          </p>
          <ul style={styles.adminList}>
            <li>• Managing book genre categories</li>
            <li>• System configuration changes</li>
            <li>• Database maintenance</li>
          </ul>
          <p style={styles.contactInfo}>
            📧 Contact: <strong>admin@library.com</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

//styles
const styles = {
  container: {
    padding: '1rem',
  },
  welcomeSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  welcomeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.5rem',
  },
  welcomeTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    margin: '0',
  },
  librarianBadge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  welcomeSubtitle: {
    color: '#6b7280',
    margin: '0 0 1rem 0',
  },
  librarianAccessNote: {
    backgroundColor: '#f0f9ff',
    borderLeft: '4px solid #0ea5e9',
    padding: '1rem',
    borderRadius: '6px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  statIcon: {
    fontSize: '2rem',
  },
  statValue: {
    fontSize: '1.875rem',
    fontWeight: '700',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  quickActionsSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    margin: '0 0 0.5rem 0',
  },
  sectionSubtitle: {
    color: '#6b7280',
    margin: '0 0 1.5rem 0',
  },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
  },
  quickActionButton: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
  },
  quickActionIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  quickActionLabel: {
    fontWeight: '500',
    marginBottom: '0.25rem',
  },
  quickActionDescription: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  additionalInfo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  infoTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    margin: '0 0 1rem 0',
  },
  permissionsList: {
    listStyle: 'none',
    padding: '0',
    margin: '0',
  },
  permissionsListLi: {
    fontSize: '0.875rem',
    padding: '0.25rem 0',
    color: '#374151',
  },
  adminList: {
    fontSize: '0.875rem',
    color: '#6b7280',
    paddingLeft: '1.25rem',
    margin: '0.5rem 0',
  },
  infoText: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: '0 0 0.75rem 0',
  },
  contactInfo: {
    fontSize: '0.875rem',
    color: '#1e40af',
    margin: '1rem 0 0 0',
    paddingTop: '0.75rem',
    borderTop: '1px solid #e5e7eb',
  },
};

export default LibrarianDashboardPage;