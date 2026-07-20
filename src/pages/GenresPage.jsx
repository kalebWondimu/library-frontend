import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { genreService } from "../services/genreService";
import { commonStyles } from "../styles/commonStyles";

const GenresPage = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGenre, setCurrentGenre] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
  });

  // Fetch genres from backend
  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchGenres = async () => {
    try {
      setLoading(true);

      const genresData = await genreService.getAllGenres();
      const safeGenres = Array.isArray(genresData) ? genresData : [];
      setGenres(safeGenres);
    } catch (error) {
      toast.error("Failed to load genres.");
      setGenres([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredGenres = genres.filter((genre) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return genre.name?.toLowerCase().includes(query);
  });

  const totalPages = Math.ceil(filteredGenres.length / itemsPerPage);
  const paginatedGenres = filteredGenres.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, totalPages]);

  const handleOpenModal = (genre = null) => {
    if (genre) {
      setCurrentGenre(genre);
      setFormData({
        name: genre.name || "",
      });
    } else {
      setCurrentGenre(null);
      setFormData({
        name: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentGenre(null);
    setFormData({
      name: "",
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

    try {
      const genreData = {
        name: formData.name.trim(),
      };

      if (currentGenre) {
        await genreService.updateGenre(currentGenre.id, genreData);
        toast.success("Genre updated successfully");
      } else {
        await genreService.createGenre(genreData);
        toast.success("Genre created successfully");
      }

      handleCloseModal();
      fetchGenres();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to save genre";
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    }
  };

  const handleDeleteGenre = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this genre? This action cannot be undone.",
      )
    ) {
      try {
        await genreService.deleteGenre(id);
        toast.success("Genre deleted successfully");
        fetchGenres();
      } catch (error) {
        let msg = "Unable to delete this genre";

        if (error.response?.data?.message) {
          msg = error.response.data.message;
          // Format related record error message
          if (
            msg.toLowerCase().includes("book") ||
            msg.toLowerCase().includes("associated")
          ) {
            msg =
              "This genre has associated books and cannot be deleted. Please reassign or delete books in this genre first.";
          }
        } else if (error.response?.status === 400) {
          msg =
            "This genre has associated books and cannot be deleted. Please remove or reassign books first.";
        }

        toast.error(Array.isArray(msg) ? msg[0] : msg);
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Section  */}
      <div style={styles.adminNote}>
        <div style={styles.adminNoteIcon}>🛡️</div>
        <div style={styles.adminNoteContent}>
          <strong>Admin Only</strong> - Manage book genres
        </div>
      </div>

      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Genres</h1>
          <p style={styles.subtitle}>
            Manage book genres (Admin Only) - {genres.length} genres found
            {loading && " (Loading...)"}
          </p>
        </div>
        <div style={styles.headerRight}>
          <button
            style={styles.refreshButton}
            onClick={fetchGenres}
            title="Refresh genres"
          >
            🔄 Refresh
          </button>
          <button style={styles.addButton} onClick={() => handleOpenModal()}>
            + Add New Genre
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search genres..."
          value={searchQuery}
          onChange={handleSearch}
          style={styles.searchInput}
        />
        <span style={styles.searchIcon}>🔍</span>
      </div>

      {/* Genre List */}
      <div style={styles.genresList}>
        {loading ? (
          <div style={styles.loading}>Loading genres...</div>
        ) : filteredGenres.length === 0 ? (
          <div style={styles.noResults}>
            📚 No genres found. {searchQuery && "Try a different search."}
            {!searchQuery &&
              genres.length === 0 &&
              " The database might be empty."}
          </div>
        ) : (
          <div style={styles.genresGrid}>
            {paginatedGenres.map((genre) => (
              <div key={genre.id} style={styles.genreCard}>
                <div style={styles.genreContent}>
                  <div style={styles.genreMain}>
                    <h3 style={styles.genreName}>{genre.name}</h3>
                  </div>
                  <div style={styles.genreActions}>
                    <button
                      style={styles.editButton}
                      onClick={() => handleOpenModal(genre)}
                      title="Edit Genre"
                    >
                      ✎
                    </button>
                    <button
                      style={styles.deleteButton}
                      onClick={() => handleDeleteGenre(genre.id)}
                      title="Delete Genre"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredGenres.length > itemsPerPage && (
              <div style={styles.paginationBar}>
                <button
                  style={{
                    ...styles.paginationButton,
                    ...(currentPage === 1
                      ? styles.paginationButtonDisabled
                      : {}),
                  }}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                <span style={styles.paginationText}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  style={{
                    ...styles.paginationButton,
                    ...(currentPage === totalPages
                      ? styles.paginationButtonDisabled
                      : {}),
                  }}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Genre Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {currentGenre ? "Edit Genre" : "Add New Genre"}
              </h2>
              <p style={styles.modalSubtitle}>
                {currentGenre
                  ? "Update the genre name."
                  : "Enter the name for the new genre."}
              </p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Genre Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                  placeholder="Enter genre name"
                  maxLength="100"
                  autoFocus
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
                  {currentGenre ? "Update Genre" : "Create Genre"}
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
    ...commonStyles.container,
  },
  adminNote: {
    backgroundColor: "#fef3c7",
    border: "1px solid #fbbf24",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.75rem",
  },
  adminNoteContent: {
    fontSize: "0.875rem",
    color: "#92400e",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flex: 1,
  },

  header: {
    ...commonStyles.header,
    justifyContent: "space-between",
  },
  headerLeft: {
    ...commonStyles.headerLeft,
  },
  headerRight: {
    display: "flex",
    gap: "0.75rem",
  },
  title: {
    ...commonStyles.title,
  },
  subtitle: {
    ...commonStyles.subtitle,
  },
  refreshButton: {
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    padding: "0.625rem 1.25rem",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
    whiteSpace: "nowrap",
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
  paginationBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    marginTop: "1rem",
    padding: "0.9rem 1rem",
    backgroundColor: "#f8fafc",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    gridColumn: "1 / -1",
  },
  paginationText: {
    fontSize: "0.9rem",
    color: "#475569",
    fontWeight: 600,
  },
  paginationButton: {
    border: "1px solid #d1d5db",
    backgroundColor: "white",
    color: "#374151",
    padding: "0.55rem 0.95rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
  },
  paginationButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  genresList: {
    minHeight: "400px",
  },
  genresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "1rem",
  },
  genreCard: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "1.25rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e5e7eb",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  genreContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
  },
  genreMain: {
    flex: 1,
  },
  genreName: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 0.25rem 0",
  },

  genreActions: {
    display: "flex",
    gap: "0.5rem",
    flexShrink: 0,
  },
  editButton: {
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    padding: "0.375rem 0.75rem",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  },
  deleteButton: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    padding: "0.375rem 0.75rem",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
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
    overflow: "auto",
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
    marginBottom: "1.5rem",
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
    marginTop: "1rem",
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

export default GenresPage;
