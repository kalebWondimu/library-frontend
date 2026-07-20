import React, { useState } from "react";
import { borrowingService } from "../services/borrowingService";
import { memberService } from "../services/memberService";
import { toast } from "react-hot-toast";
import { commonStyles } from "../styles/commonStyles";

const ReportsPage = () => {
  const [activeReport, setActiveReport] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadReport = async (reportType) => {
    setActiveReport(reportType);
    setReportData(null);
    setError("");
    setLoading(true);
    setCurrentPage(1);

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
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const filterByDate = (data) => {
    if (!Array.isArray(data) || dateFilter === "all") return data;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return data.filter((item) => {
      // Try to get a valid date from any available field
      const dateStr =
        item.borrow_date ||
        item.created_at ||
        item.date ||
        item.return_date ||
        item.join_date;

      if (!dateStr) return false;

      let itemDate;
      try {
        itemDate = new Date(dateStr);
        if (isNaN(itemDate.getTime())) return false;
      } catch (e) {
        return false;
      }

      // Normalize itemDate to start of day for comparison
      const itemDateNormalized = new Date(
        itemDate.getFullYear(),
        itemDate.getMonth(),
        itemDate.getDate(),
      );

      switch (dateFilter) {
        case "today":
          return itemDateNormalized.getTime() === today.getTime();
        case "week":
          return itemDateNormalized >= lastWeek && itemDateNormalized <= today;
        case "month":
          return itemDateNormalized >= lastMonth && itemDateNormalized <= today;
        default:
          return true;
      }
    });
  };

  const getPaginatedData = (data) => {
    if (!Array.isArray(data)) return data;
    const filtered = filterByDate(data);
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIdx, startIdx + itemsPerPage);
  };

  const getTotalPages = (data) => {
    if (!Array.isArray(data)) return 1;
    return Math.ceil(filterByDate(data).length / itemsPerPage);
  };

  const exportToExcel = () => {
    if (!reportData) {
      toast.error("No data to export");
      return;
    }

    const rows = [];
    const addRow = (cells) =>
      rows.push(
        cells.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      );

    if (activeReport === "popular-books") {
      addRow(["Rank", "Book", "Borrows"]);
      reportData.forEach((item, idx) => {
        addRow([
          idx + 1,
          item.book_title || item.title || "Unknown",
          item.borrow_count || item.count || 0,
        ]);
      });
    } else if (activeReport === "member-activity") {
      addRow(["Member", "Total Borrows", "Outstanding Borrows"]);
      reportData.forEach((item) => {
        addRow([
          item.name || "Unknown",
          item.totalBorrows || 0,
          item.outstandingBorrows || 0,
        ]);
      });
    } else if (activeReport === "overdue") {
      addRow(["Book", "Member", "Due Date"]);
      reportData.forEach((item) => {
        addRow([
          item.book?.title || item.title || "Unknown",
          item.member?.name || item.memberName || "Unknown",
          new Date(item.due_date).toLocaleDateString(),
        ]);
      });
    } else if (activeReport === "monthly") {
      addRow(["Metric", "Value"]);
      addRow([
        "Total Borrows This Month",
        reportData.totalBorrowsThisMonth || 0,
      ]);
      addRow([
        "Average Borrow Duration",
        `${reportData.averageBorrowDuration || 0} days`,
      ]);
      addRow(["Return Rate", `${reportData.returnRate || 0}%`]);
    } else {
      addRow(["Data"]);
      addRow([JSON.stringify(reportData)]);
    }

    const csvContent = `Report: ${activeReport}\nGenerated: ${new Date().toLocaleString()}\nDate Filter: ${dateFilter}\n\n${rows.join("\n")}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const element = document.createElement("a");
    element.setAttribute("href", url);
    element.setAttribute(
      "download",
      `report-${activeReport}-${new Date().getTime()}.csv`,
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
    toast.success("Report exported as CSV");
  };

  const renderReportContent = () => {
    if (loading) return <p>Loading report...</p>;
    if (error) return <p style={{ color: "red" }}>❌ {error}</p>;
    if (!reportData)
      return <p>Select a report card to review library insights and trends.</p>;

    const paginatedData = getPaginatedData(reportData);
    const totalPages = getTotalPages(reportData);

    switch (activeReport) {
      case "monthly":
        return (
          <div style={styles.detailsBox}>
            <h4>📊 Monthly Statistics</h4>
            <div style={styles.statsGrid}>
              <div style={styles.statBox}>
                <span>Total Borrows This Month</span>
                <h3>{reportData.totalBorrowsThisMonth || 0}</h3>
              </div>
              <div style={styles.statBox}>
                <span>Average Borrow Duration</span>
                <h3>{reportData.averageBorrowDuration || 0} days</h3>
              </div>
              <div style={styles.statBox}>
                <span>Return Rate</span>
                <h3>{reportData.returnRate || 0}%</h3>
              </div>
            </div>
          </div>
        );
      case "popular-books":
        if (!paginatedData || paginatedData.length === 0)
          return <p>📚 No popular books data available.</p>;
        return (
          <div style={styles.detailsBox}>
            <h4>📚 Most Popular Books</h4>
            <ul style={styles.list}>
              {paginatedData.map((item, idx) => (
                <li key={item.book_id || idx}>
                  <strong>{item.book_title || item.title || "Unknown"}</strong>{" "}
                  - {item.borrow_count || item.count || 0} borrows
                </li>
              ))}
            </ul>
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={styles.paginationBtn}
                >
                  ← Prev
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  style={styles.paginationBtn}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        );
      case "member-activity":
        return (
          <div style={styles.detailsBox}>
            <h4>👥 Member Activity</h4>
            <div style={styles.filterGroup}>
              <label>Filter by date:</label>
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={styles.filterSelect}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  setDateFilter("all");
                  setCurrentPage(1);
                }}
                style={styles.clearFilterButton}
              >
                Reset Filter
              </button>
            </div>
            {!paginatedData || paginatedData.length === 0 ? (
              <p>👥 No member activity data.</p>
            ) : (
              <>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>Member</th>
                      <th style={styles.tableHeader}>Total Borrows</th>
                      <th style={styles.tableHeader}>Outstanding</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item) => (
                      <tr key={item.member_id || item.id}>
                        <td style={styles.tableCell}>{item.name}</td>
                        <td style={styles.tableCell}>
                          {item.totalBorrows || 0}
                        </td>
                        <td style={styles.tableCell}>
                          {item.outstandingBorrows || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {totalPages > 1 && (
                  <div style={styles.pagination}>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      style={styles.paginationBtn}
                    >
                      ← Prev
                    </button>
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      style={styles.paginationBtn}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      case "overdue":
        if (!paginatedData || paginatedData.length === 0)
          return <p>✅ No overdue books at the moment.</p>;
        return (
          <div style={styles.detailsBox}>
            <h4>⚠️ Overdue Analysis</h4>
            <p>
              <strong>Total Overdue:</strong> {filterByDate(reportData).length}
            </p>
            <ul style={styles.list}>
              {paginatedData.map((record) => (
                <li key={record.id}>
                  <strong>
                    {record.book?.title || record.title || "Unknown"}
                  </strong>{" "}
                  borrowed by{" "}
                  <strong>
                    {record.member?.name || record.memberName || "Unknown"}
                  </strong>
                  <br />
                  📅 Due: {new Date(record.due_date).toLocaleDateString()}
                </li>
              ))}
            </ul>
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={styles.paginationBtn}
                >
                  ← Prev
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  style={styles.paginationBtn}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📊 Admin Reports</h2>
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

      {activeReport && (
        <button onClick={exportToExcel} style={styles.exportButton}>
          📥 Export to Excel
        </button>
      )}

      <div style={styles.reportDetails}>{renderReportContent()}</div>
    </div>
  );
};

const styles = {
  container: {
    ...commonStyles.container,
  },
  header: {
    ...commonStyles.header,
    marginBottom: "2rem",
  },
  title: {
    ...commonStyles.title,
    fontSize: "1.5rem",
  },
  subtitle: {
    ...commonStyles.subtitle,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1.5rem",
    marginBottom: "1.5rem",
  },
  reportCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
    transition: "all 0.3s",
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
    backgroundColor: "white",
    padding: "1rem",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
    minHeight: "300px",
  },
  detailsBox: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "1rem",
    marginTop: "1rem",
  },
  statBox: {
    padding: "1rem",
    backgroundColor: "#f3f4f6",
    borderRadius: "6px",
    textAlign: "center",
  },
  list: {
    paddingLeft: "1rem",
    marginTop: "1rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "1rem",
  },

  tableHeader: {
    textAlign: "left",
    borderBottom: "2px solid #d1d5db",
    padding: "0.75rem",
    backgroundColor: "#f9fafb",
    fontWeight: "600",
  },
  tableCell: {
    padding: "0.75rem",
    borderBottom: "1px solid #f3f4f6",
  },
  filterGroup: {
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  filterSelect: {
    padding: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #d1d5db",
    backgroundColor: "#fff",
    cursor: "pointer",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "1rem",
    marginTop: "1.5rem",
    padding: "1rem",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  paginationText: {
    fontSize: "0.9rem",
    color: "#475569",
    fontWeight: 600,
  },
  paginationBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "#fff",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: 600,
  },
  paginationBtnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  exportButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "600",
    marginBottom: "1rem",
  },
};

export default ReportsPage;
