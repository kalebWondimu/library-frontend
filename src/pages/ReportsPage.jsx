import React from 'react';

const ReportsPage = () => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Admin Reports</h2>
        <p style={styles.subtitle}>System analytics and reporting</p>
      </div>
      
      <div style={styles.grid}>
        <div style={styles.reportCard}>
          <h3 style={styles.reportTitle}>📈 Monthly Statistics</h3>
          <p>View monthly borrowing trends and library usage</p>
        </div>
        
        <div style={styles.reportCard}>
          <h3 style={styles.reportTitle}>📚 Popular Books</h3>
          <p>Most borrowed books and genre popularity</p>
        </div>
        
        <div style={styles.reportCard}>
          <h3 style={styles.reportTitle}>👥 Member Activity</h3>
          <p>Member borrowing patterns and engagement</p>
        </div>
        
        <div style={styles.reportCard}>
          <h3 style={styles.reportTitle}>⚠️ Overdue Analysis</h3>
          <p>Overdue patterns and collection management</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '1rem',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: '0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  reportTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    margin: '0 0 0.5rem 0',
  },
};

export default ReportsPage;