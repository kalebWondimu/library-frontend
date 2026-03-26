import React, { useState } from "react";
import { borrowingService } from "../services/borrowingService";
import { memberService } from "../services/memberService";

const ReportsPage = () => {
  const [activeReport, setActiveReport] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReport = async (reportType) => {
    setActiveReport(reportType);
    setReportData(null);
    setError("");
    setLoading(true);

    try {
      let response;
      switch (reportType) {
        case "monthly":
          response = await borrowingService.getSummary();
          setReportData(response.data);
          break;
        case "popular-books":
          response = await borrowingService.getPopularBooks();
          setReportData(response.data);
          break;
        case "member-activity":
          response = await memberService.getMemberActivity();
          setReportData(response.data);
          break;
        case "overdue":
          response = await borrowingService.getOverdueBooks();
          setReportData(response.data);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error("Error loading report", reportType, err);
      const message = err.response?.data?.message || "Report load failed";
      setError(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoading(false);
    }
  };

  const renderReportContent = () => {
    if (loading) return <p>Loading report...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!reportData) return <p>Select a report card to view details.</p>;

    switch (activeReport) {
      case "monthly":
        return (
          <div style={styles.detailsBox}>
            <h4>Monthly Statistics</h4>
            <p>Total Borrows This Month: {reportData.totalBorrowsThisMonth}</p>
            <p>
              Average Borrow Duration: {reportData.averageBorrowDuration} days
            </p>
            <p>Return Rate: {reportData.returnRate}%</p>
          </div>
        );
      case "popular-books":
        if (reportData.length === 0) return <p>No popular books data.</p>;
        return (
          <div style={styles.detailsBox}>
            <h4>Most Popular Books</h4>
            <ul style={styles.list}>
              {reportData.map((item) => (
                <li key={item.book_id}>
                  {item.book_title} - {item.borrow_count} borrows
                </li>
              ))}
            </ul>
          </div>
        );
      case "member-activity":
        if (reportData.length === 0) return <p>No member activity data.</p>;
        return (
          <div style={styles.detailsBox}>
            <h4>Member Activity</h4>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Member</th>
                  <th style={styles.tableHeader}>Total Borrows</th>
                  <th style={styles.tableHeader}>Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item) => (
                  <tr key={item.member_id}>
                    <td style={styles.tableCell}>{item.name}</td>
                    <td style={styles.tableCell}>{item.totalBorrows}</td>
                    <td style={styles.tableCell}>{item.outstandingBorrows}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "overdue":
        if (reportData.length === 0)
          return <p>No overdue books at the moment.</p>;
        return (
          <div style={styles.detailsBox}>
            <h4>Overdue Analysis</h4>
            <p>Total Overdue: {reportData.length}</p>
            <ul style={styles.list}>
              {reportData.map((record) => (
                <li key={record.id}>
                  {record.book?.title} borrowed by {record.member?.name} (Due{" "}
                  {new Date(record.due_date).toLocaleDateString()})
                </li>
              ))}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Admin Reports</h2>
        <p style={styles.subtitle}>System analytics and reporting</p>
      </div>

      <div style={styles.grid}>
        <div
          style={{
            ...styles.reportCard,
            ...(activeReport === "monthly" && styles.activeCard),
          }}
          onClick={() => loadReport("monthly")}
        >
          <h3 style={styles.reportTitle}>📈 Monthly Statistics</h3>
          <p>View monthly borrowing trends and library usage</p>
        </div>

        <div
          style={{
            ...styles.reportCard,
            ...(activeReport === "popular-books" && styles.activeCard),
          }}
          onClick={() => loadReport("popular-books")}
        >
          <h3 style={styles.reportTitle}>📚 Popular Books</h3>
          <p>Most borrowed books and genre popularity</p>
        </div>

        <div
          style={{
            ...styles.reportCard,
            ...(activeReport === "member-activity" && styles.activeCard),
          }}
          onClick={() => loadReport("member-activity")}
        >
          <h3 style={styles.reportTitle}>👥 Member Activity</h3>
          <p>Member borrowing patterns and engagement</p>
        </div>

        <div
          style={{
            ...styles.reportCard,
            ...(activeReport === "overdue" && styles.activeCard),
          }}
          onClick={() => loadReport("overdue")}
        >
          <h3 style={styles.reportTitle}>⚠️ Overdue Analysis</h3>
          <p>Overdue patterns and collection management</p>
        </div>
      </div>

      <div style={styles.reportDetails}>{renderReportContent()}</div>
    </div>
  );
};

const styles = {
  container: {
    padding: "1rem",
  },
  header: {
    marginBottom: "2rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 0.5rem 0",
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "#6b7280",
    margin: "0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  reportCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  reportTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    margin: "0 0 0.5rem 0",
  },
  activeCard: {
    border: "2px solid #4f46e5",
    boxShadow: "0 0 0 0.25rem rgba(79, 70, 229, 0.12)",
  },
  reportDetails: {
    marginTop: "1.5rem",
    backgroundColor: "white",
    padding: "1rem",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
  },
  detailsBox: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  list: {
    paddingLeft: "1rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    textAlign: "left",
    borderBottom: "1px solid #e5e7eb",
    padding: "0.5rem 0",
  },
  tableCell: {
    padding: "0.5rem 0",
    borderBottom: "1px solid #f3f4f6",
  },
};

export default ReportsPage;
