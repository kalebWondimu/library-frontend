import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookService } from '../services/bookService';
import { memberService } from '../services/memberService';
import { borrowingService } from '../services/borrowingService';
import { toast } from 'react-hot-toast';



const DashboardPage = () => {
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
      
      // Fetch all data 
      const [booksData, membersData, borrowRecordsData] = await Promise.all([
        bookService.getAllBooks(),
        memberService.getAllMembers(),
        borrowingService.getAllBorrowRecords()
      ]);

      const books = Array.isArray(booksData) ? booksData : 
                   booksData?.data || [];
  
      const members = Array.isArray(membersData) ? membersData :
                     membersData?.data || [];

      const borrowRecords = Array.isArray(borrowRecordsData) ? borrowRecordsData :
                           borrowRecordsData?.data || [];

      const activeBorrowings = borrowRecords.filter(record => !record.return_date);
      
      const overdueBooks = activeBorrowings.filter(record => {
        if (!record.due_date) return false;
        const dueDate = new Date(record.due_date);
        const today = new Date();
        return dueDate < today;
      });

      setStats({
        totalBooks: books.length,
        totalMembers: members.length,
        activeBorrows: activeBorrowings.length,
        overdueBooks: overdueBooks.length
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      // Keep fallback data
      setStats({
        totalBooks: 0,
        totalMembers: 0,
        activeBorrows: 0,
        overdueBooks: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Borrow Book', icon: '📥', path: '/borrow-return', color: '#3b82f6', description: 'Process book borrowing' },
    { label: 'Return Book', icon: '📤', path: '/borrow-return', color: '#10b981', description: 'Process book returns' },
    { label: 'Add Member', icon: '👥', path: '/members', color: '#8b5cf6', description: 'Register new members' },
    { label: 'Add Book', icon: '📚', path: '/books', color: '#f59e0b', description: 'Add new books to catalog' },
    { label: 'Manage Genres', icon: '🏷️', path: '/genres', color: '#ef4444', description: 'Manage book categories' },
    { label: 'Admin Reports', icon: '📊', path: '/reports', color: '#06b6d4', description: 'View system analytics' },
  ];

  
const role = localStorage.getItem('role'); // 'admin' | 'librarian'

const base = role === 'admin' ? '/admin' : '/librarian';

const handleQuickAction = (path) => {
  navigate(`${base}${path}`);
};



  return (
    <div style={styles.container}>
      {/* Welcome Section - ADMIN DASHBOARD */}
      <div style={styles.welcomeSection}>
        <div style={styles.welcomeHeader}>
          <div style={styles.welcomeText}>
            <h2 style={styles.welcomeTitle}>Admin Dashboard</h2>
            <div style={styles.adminBadge}>
              <span style={styles.adminBadgeIcon}>🛡️</span>
              <span style={styles.adminBadgeText}>ADMINISTRATOR</span>
            </div>
          </div>
          <p style={styles.welcomeSubtitle}>Full system access - Manage all library operations</p>
        </div>

        {/* Administrator Access Note */}
        <div style={styles.adminAccessNote}>
          <p style={styles.adminAccessText}>
            You have full system privileges including delete operations, genre management, and staff administration.
          </p>
        </div>
      </div>

      {/* Statistics Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <div style={{...styles.statIcon, backgroundColor: '#3b82f620'}}>
              <span style={{ fontSize: '1.5rem' }}>📚</span>
            </div>
            <div style={styles.statInfo}>
              <div style={styles.statValue}>
                {loading ? '...' : stats.totalBooks.toLocaleString()}
              </div>
              <div style={styles.statLabel}>Books</div>
            </div>
          </div>
          <div style={styles.statDescription}>All books in system</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <div style={{...styles.statIcon, backgroundColor: '#10b98120'}}>
              <span style={{ fontSize: '1.5rem' }}>👥</span>
            </div>
            <div style={styles.statInfo}>
              <div style={styles.statValue}>
                {loading ? '...' : stats.totalMembers.toLocaleString()}
              </div>
              <div style={styles.statLabel}>Members</div>
            </div>
          </div>
          <div style={styles.statDescription}>Active library members</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <div style={{...styles.statIcon, backgroundColor: '#f59e0b20'}}>
              <span style={{ fontSize: '1.5rem' }}>📖</span>
            </div>
            <div style={styles.statInfo}>
              <div style={styles.statValue}>
                {loading ? '...' : stats.activeBorrows.toLocaleString()}
              </div>
              <div style={styles.statLabel}>Active Borrows</div>
            </div>
          </div>
          <div style={styles.statDescription}>Currently borrowed books</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <div style={{...styles.statIcon, backgroundColor: '#ef444420'}}>
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            </div>
            <div style={styles.statInfo}>
              <div style={styles.statValue}>
                {loading ? '...' : stats.overdueBooks.toLocaleString()}
              </div>
              <div style={styles.statLabel}>Overdue Books</div>
            </div>
          </div>
          <div style={styles.statDescription}>Books past due date</div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div style={styles.quickActionsSection}>
        <h3 style={styles.sectionTitle}>Quick Actions</h3>
        <p style={styles.sectionSubtitle}>Administrative and library operations</p>
        
        <div style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <button
              key={index}
              style={{
                ...styles.quickActionButton,
                borderColor: action.color,
              }}
              onClick={() => handleQuickAction(action.path)}
            >
              <div style={styles.quickActionIcon}>
                <span style={{ fontSize: '1.5rem' }}>{action.icon}</span>
              </div>
              <div style={styles.quickActionLabel}>{action.label}</div>
              <div style={styles.quickActionDescription}>{action.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
//styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  
  // Welcome Section Styles
  welcomeSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  welcomeHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  welcomeText: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  welcomeTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#111827',
    margin: '0',
  },
  adminBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    padding: '0.375rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  adminBadgeIcon: {
    fontSize: '0.875rem',
  },
  adminBadgeText: {
    fontWeight: '700',
  },
  welcomeSubtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: '0',
  },
  adminAccessNote: {
    backgroundColor: '#eff6ff',
    borderLeft: '4px solid #3b82f6',
    padding: '1rem',
    borderRadius: '6px',
    marginTop: '0.5rem',
  },
  adminAccessText: {
    fontSize: '0.875rem',
    color: '#1e40af',
    margin: '0',
    lineHeight: '1.5',
  },
  
  // Statistics Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
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
    marginBottom: '1rem',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '1rem',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: '#111827',
    lineHeight: '1',
    minHeight: '40px',
    display: 'flex',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginTop: '0.25rem',
  },
  statDescription: {
    fontSize: '0.75rem',
    color: '#9ca3af',
  },
  
  // Quick Actions Section
  quickActionsSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 0.5rem 0',
  },
  sectionSubtitle: {
    fontSize: '0.875rem',
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
    border: '2px solid',
    borderRadius: '10px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
  },
  quickActionIcon: {
    marginBottom: '0.75rem',
  },
  quickActionLabel: {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.25rem',
  },
  quickActionDescription: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
};

export default DashboardPage;