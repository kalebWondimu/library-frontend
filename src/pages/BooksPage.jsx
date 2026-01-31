import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { bookService } from '../services/bookService';
import { genreService } from '../services/genreService';




const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    published_year: new Date().getFullYear(),
    available_copies: 1,
    genre_id: '',
  });

  const [userRole, setUserRole] = useState(null);

useEffect(() => {
  const user = JSON.parse(localStorage.getItem('user'));
  setUserRole(user?.role);
}, []);


  // Fetch books from backend
  useEffect(() => {
    fetchBooks();
    fetchGenres();
  }, []);

  // Filter books based on search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(book => {
        const title = book.title?.toLowerCase() || '';
        const author = book.author?.toLowerCase() || '';
        const genre = book.genre?.name?.toLowerCase() || '';
        
        return title.includes(searchQuery.toLowerCase()) ||
               author.includes(searchQuery.toLowerCase()) ||
               genre.includes(searchQuery.toLowerCase());
      });
      setFilteredBooks(filtered);
    }
  }, [searchQuery, books]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getAllBooks();
      
      
      let booksData = [];
      
      if (response.data && Array.isArray(response.data)) {
        booksData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        booksData = response.data.data;
      } else if (Array.isArray(response)) {
        booksData = response;
      } else {
        console.error('Unexpected response structure:', response);
      }
      setBooks(booksData);
      setFilteredBooks(booksData);
      
    } catch (error) {
     
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  // fetchGenres function, 
const fetchGenres = async () => {
  try {

    const genresData = await genreService.getAllGenres();
    
    if (genresData.length > 0) {
      setGenres(genresData);
    } else {
      setGenres([]);
    }
  } catch (error) {
    setGenres([]);
  }
};

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleOpenModal = (book = null) => {
    if (book) {
      setCurrentBook(book);
      
      // Extract data from book
      let genreId = '';
      if (book.genre && typeof book.genre === 'object') {
        genreId = book.genre.id;
      }
      
      setFormData({
        title: book.title || '',
        author: book.author || '',
        published_year: book.published_year || new Date().getFullYear(),
        available_copies: book.available_copies || 1,
        genre_id: genreId,
      });
    } else {
      setCurrentBook(null);
      setFormData({
        title: '',
        author: '',
        published_year: new Date().getFullYear(),
        available_copies: 1,
        genre_id: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentBook(null);
    setFormData({
      title: '',
      author: '',
      published_year: new Date().getFullYear(),
      available_copies: 1,
      genre_id: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'available_copies' || name === 'published_year' 
        ? parseInt(value) || 0 
        : value
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
   
const bookData = {
  title: formData.title,
  author: formData.author,
  published_year: Number(formData.published_year),
  available_copies: Number(formData.available_copies),
  genre_id: Number(formData.genre_id)
};

    
    if (currentBook) {
      await bookService.updateBook(currentBook.id, bookData);
      toast.success('Book updated successfully');
    } else {
      await bookService.createBook(bookData);
      toast.success('Book created successfully');
    }
    
    handleCloseModal();
    setSearchQuery('');
    await fetchBooks();
    
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to save book');
  }
};
  const handleDeleteBook = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await bookService.deleteBook(id);
        toast.success('Book deleted successfully');
        fetchBooks(); // Refresh the list
      } catch (error) {
           const msg = error.response?.data?.message ||'This book cannot be deleted because it has borrow history.';
            toast.error(msg);
          }

    }
  };

  const getStatus = (book) => {
    const copies = book.available_copies || 0;
    return copies > 0 ? 'Available' : 'Out of Stock';
  };

  const getStatusColor = (book) => {
    const copies = book.available_copies || 0;
    return copies > 0 ? '#10b981' : '#ef4444';
  };



  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Books</h1>
          <p style={styles.subtitle}>Manage your library's book collection</p>
        </div>
        <button 
          style={styles.addButton}
          onClick={() => handleOpenModal()}
        >
          + Add Book
        </button>
      </div>

      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search books by title, author, or genre..."
          value={searchQuery}
          onChange={handleSearch}
          style={styles.searchInput}
        />
        <span style={styles.searchIcon}>🔍</span>
      </div>

      {/* Books Grid */}
      <div style={styles.booksGrid}>
        {loading ? (
          <div style={styles.loading}>Loading books...</div>
        ) : filteredBooks.length === 0 ? (
          <div style={styles.noResults}>
            📚 No books found. {searchQuery && 'Try a different search.'}
          </div>
        ) : (
          filteredBooks.map((book) => (
            <div key={book.id} style={styles.bookCard}>
              <div style={styles.bookHeader}>
                <h3 style={styles.bookTitle}>{book.title}</h3>
                <div style={styles.bookActions}>
                  <button 
                    style={styles.editButton}
                    onClick={() => handleOpenModal(book)}
                  >
                    ✏️
                  </button>
                   {userRole === 'admin' && (
                <button 
                  style={styles.deleteButton}
                  onClick={() => handleDeleteBook(book.id)}
                >
                  🗑️
                </button>
              )}

                </div>
              </div>
              
              <p style={styles.bookAuthor}>by {book.author}</p>
              
              <div style={styles.bookStatus}>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: getStatusColor(book) + '20',
                  color: getStatusColor(book)
                }}>
                  {getStatus(book)}
                </span>
              </div>

              <div style={styles.bookDetails}>
                {book.genre && (
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Genre:</span>
                    <span style={styles.detailValue}>
                      {typeof book.genre === 'object' ? book.genre.name : book.genre}
                    </span>
                  </div>
                )}
                {book.published_year && (
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Published:</span>
                    <span style={styles.detailValue}>{book.published_year}</span>
                  </div>
                )}
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Available Copies:</span>
                  <span style={styles.detailValue}>{book.available_copies || 0}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add or Edit Book Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {currentBook ? 'Edit Book' : 'Add New Book'}
              </h2>
              <p style={styles.modalSubtitle}>
                Enter the details for the {currentBook ? 'book' : 'new book'}.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                  placeholder="Enter book title"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Author *</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                  placeholder="Enter author name"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Published Year</label>
                <input
                  type="number"
                  name="published_year"
                  value={formData.published_year}
                  onChange={handleInputChange}
                  style={styles.input}
                  min="1000"
                  max={new Date().getFullYear()}
                  placeholder="YYYY"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Available Copies *</label>
                <input
                  type="number"
                  name="available_copies"
                  value={formData.available_copies}
                  onChange={handleInputChange}
                  style={styles.input}
                  min="0"
                  required
                  placeholder="Number of available copies"
                />
              </div>

          
<div style={styles.formGroup}>
  <label style={styles.label}>Genre *</label>
  {genres.length > 0 ? (
    <select
      name="genre_id"
      value={formData.genre_id}
      onChange={handleInputChange}
      style={styles.input}
      required
    >
      <option value="">Select a genre</option>
      {genres.map((genre) => (
        <option key={genre.id} value={genre.id}>
          {genre.name}
        </option>
      ))}
    </select>
  ) : (
    <div style={styles.genreNote}>
      Loading genres... Please wait or select Fiction (ID: 1) as default
    </div>
  )}
</div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.submitButton}
                >
                  {currentBook ? 'Update Book' : 'Create Book'}
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
  addButton: {
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    padding: '0.625rem 1.25rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: '2rem',
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 3rem',
    fontSize: '0.875rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
  },
  booksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  bookCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  bookHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
  },
  bookTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    margin: '0',
    flex: 1,
    marginRight: '1rem',
  },
  bookActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  editButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '4px',
    color: '#6b7280',
    transition: 'color 0.2s',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '4px',
    color: '#ef4444',
    transition: 'color 0.2s',
  },
  bookAuthor: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: '0 0 1rem 0',
    fontStyle: 'italic',
  },
  bookStatus: {
    marginBottom: '1rem',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  bookDetails: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '1rem',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  detailLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: '0.875rem',
    color: '#111827',
    fontWeight: '500',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    color: '#6b7280',
    gridColumn: '1 / -1',
  },
  noResults: {
    textAlign: 'center',
    padding: '3rem',
    color: '#6b7280',
    gridColumn: '1 / -1',
    fontSize: '1rem',
  },
  // Modal Styles
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
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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
    transition: 'border-color 0.2s',
  },
  genreNote: {
    fontSize: '0.75rem',
    color: '#6b7280',
    fontStyle: 'italic',
    padding: '0.5rem',
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
    transition: 'background-color 0.2s',
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
    transition: 'background-color 0.2s',
  },
};

export default BooksPage;