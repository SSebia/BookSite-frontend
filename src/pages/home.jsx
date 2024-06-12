import React, { useState, useEffect } from 'react';
import { Rating, AppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu, MenuItem, TextField, Select, MenuItem as DropdownItem, Card, CardContent, Grid, FormControl, InputLabel } from '@mui/material';
import { useAuth } from "src/services/AuthContext";
import { getBooks, getCategories } from 'src/services/BookService';
import CardHeader from '@mui/material/CardHeader';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useSnackbar } from 'notistack';
import { BookDetailsModal } from 'src/components/BookDetailsModal';
import apiClient from 'src/utils/apiClient';
import { getToken } from 'src/services/userService';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import { AddBookModal } from 'src/components/AddBookModal';
import { EditCategoriesModal } from 'src/components/EditCategoriesModal';
import DeleteIcon from '@mui/icons-material/Delete';
import { EditBookModal } from 'src/components/EditBookModal';

const Home = () => {
  const { user, logoutUser } = useAuth();
  if (!user) return null;
  const { enqueueSnackbar } = useSnackbar();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [addBookModalOpen, setAddBookModalOpen] = useState(false);
  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
  const [editBookModalOpen, setEditBookModalOpen] = useState(false);
  const [selectedBookEdit, setSelectedBookEdit] = useState(null);
  const open = Boolean(anchorEl);
  const isAdmin = (user != null ? user.rol.includes("Admin") : false);

  const showSnackbar = (message, options = {}) => {
      enqueueSnackbar(message, {
          variant: 'success',
          anchorOrigin: { horizontal: 'center', vertical: 'top' },
          ...options,
      });
  };

  useEffect(() => {
    const fetchBooks = async () => {
      const books = await getBooks();
      setBooks(books);
    };
    const fetchCategories = async () => {
      const categories = await getCategories();
      setCategories(categories);
    };
    fetchBooks();
    fetchCategories();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    setAnchorEl(null);
    logoutUser();
  };

  const viewBook = (book) => {
    setSelectedBook(book);
    setModalOpen(true);
  };

  const editBook = (book) => {
    setSelectedBookEdit(book);
    setEditBookModalOpen(true);
  };

  const deleteBook = async (book) => {
    try {
      const response = await apiClient.delete(`books/delete/${book.id}`, {
          headers: {
              'Authorization': `Bearer ${getToken()}`
          }
      });
      if (response.status == 204) {
          showSnackbar('Book deleted!');
          const updatedBooks = books.filter(b => b.id !== book.id);
          setBooks(updatedBooks);
      }
      else {
          showSnackbar('Server error', { variant: 'error' });
      }
    } catch (error) {
        showSnackbar('Failed to delete book!', { variant: 'error' });
        console.log(error)
    }
  };

  const addBook = () => {
    setAddBookModalOpen(true);
  };

  const editCategory = () => {
    setEditCategoryModalOpen(true);
  };


  const addBookToFavorites = async (bookId) => {
    const hasFavorited = hasUserFavorited(books.find(book => book.id === bookId));

    if (!hasFavorited) {
      try {
        const response = await apiClient.post(`books/favorite/${bookId}`, {}, {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });
        if (response.status == 200) {
          showSnackbar(`Added to Favorites`);
        }
        else {
          showSnackbar('Server error', { variant: 'error' });
          return;
        }
      } catch (error) {
        showSnackbar('Failed to add book to favorites!', { variant: 'error' });
        console.log(error)
        return;
      }
    }
    else {
      try {
        const response = await apiClient.delete(`books/favorite/${bookId}`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });
        if (response.status == 200) {
          showSnackbar(`Removed from Favorites`, { variant: 'error' });
        }
        else {
          showSnackbar('Server error', { variant: 'error' });
          return;
        }
      } catch (error) {
        showSnackbar('Failed to remove book from favorites!', { variant: 'error' });
        console.log(error)
        return;
      }
    }

    const updatedBooks = books.map(book => {
      if (book.id === bookId) {
        const updatedFavoritedByUsers = book.favoritedByUsers.find(fav => fav.userid === user.id)
          ? book.favoritedByUsers.filter(fav => fav.userid !== user.id)
          : [...book.favoritedByUsers, { userid: user.id }];
        return { ...book, favoritedByUsers: updatedFavoritedByUsers };
      }
      return book;
    });

    setBooks(updatedBooks);

    if (selectedBook && selectedBook.id === bookId) {
      setSelectedBook(updatedBooks.find(book => book.id === bookId));
    }
  };

  const hasUserFavorited = (book) => {
    return book.favoritedByUsers.some(fav => fav.userid === user.id);
  };


  const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) {
      return 0;
    }
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / ratings.length;
  }

  const getRatingById = (book) => {
    const rating = book.bookRatings.find((rating) => rating.userid === user.id);
    return rating ? rating.rating : 0;
  }

  const updateBookRating = async (e, value, book) => {

    try {
      const response = await apiClient.post(`books/rate/${book.id}?rating=${value == null ? 0 : value}`, {}, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      if (response.status == 200) {
        if (value == null) {
          showSnackbar(`Removed rating for "${book.title}"`, { variant: 'error' });
        }
        else {
          showSnackbar(`Rated "${book.title}" ${value} stars!`);
        }
      }
      else {
        showSnackbar('Server error', { variant: 'error' });
        return;
      }
    } catch (error) {
      showSnackbar('Failed to rate the book!', { variant: 'error' });
      console.log(error)
      return;
    }

    const updatedBook = { ...book };
    const existingRating = updatedBook.bookRatings.find(rating => rating.userid === user.id);

    if (existingRating) {
      if (value === null) {
        updatedBook.bookRatings = updatedBook.bookRatings.filter(rating => rating.userid !== user.id);
      }
      else {
        existingRating.rating = value;
      }
    } else {
      updatedBook.bookRatings.push({ userid: user.id, rating: value });
    }

    setBooks(prevBooks => prevBooks.map(b => b.id === book.id ? updatedBook : b));
    setSelectedBook(updatedBook);
  }

  const filteredBooks = books.filter(book => {
    return book.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
           (selectedCategory ? book.category.name === selectedCategory : true);
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            BookSite
          </Typography>
          <Avatar
            alt="User Name"
            src="https://cdn-icons-png.freepik.com/512/147/147144.png"
            onClick={handleMenu}
            sx={{ cursor: 'pointer' }}
          />
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            keepMounted
            open={open}
            onClose={handleClose}
          >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box sx={{ padding: '20px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <TextField
            label="Search by Title"
            variant="outlined"
            sx={{ width: '70%' }}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <FormControl sx={{ width: '25%' }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={handleCategoryChange}
            >
              <DropdownItem value="">All</DropdownItem>
              {categories.map(category => (
                <DropdownItem key={category.id} value={category.name}>{category.name}</DropdownItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {isAdmin && (
          <Box sx={{ marginBottom: '20px', display: 'flex', flexDirection: 'row' }}>
            <IconButton color="inherit" aria-label="add new book" onClick={addBook}>
              <AddCircleOutlineIcon />
            </IconButton>
            <Typography sx={{ paddingLeft: '5px'}}>
              (Add a new book)
            </Typography>

            <IconButton color="inherit" aria-label="edit categories" onClick={editCategory} sx={{marginLeft: '30px'}}>
              <EditIcon />
            </IconButton>
            <Typography sx={{ paddingLeft: '5px'}}>
              (Edit categories)
            </Typography>
          </Box>
        )}
        <Grid container spacing={2}>
          {filteredBooks.map(book => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardHeader
                  action={
                    <>
                      <IconButton aria-label="add-favorites" onClick={() => addBookToFavorites(book.id)}>
                        <FavoriteIcon style={{ color: hasUserFavorited(book) ? 'red' : 'gray' }} />
                      </IconButton>
                      <IconButton aria-label="view-book" onClick={() => viewBook(book)}>
                        <VisibilityIcon />
                      </IconButton>
                      {isAdmin && (
                        <>
                          <IconButton aria-label="EDIT-book" onClick={() => editBook(book)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton aria-label="delete-book" onClick={() => deleteBook(book)}>
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </>
                  }
                  title={book.title}
                  subheader={book.category.name}
                />
                <Box sx={{ paddingLeft: '15px', paddingBottom: '5px', display: 'flex', flexDirection: 'row' }}>
                  <Rating name="read-only" value={calculateAverageRating(book.bookRatings)} readOnly />
                  <Typography sx={{ paddingLeft: '5px'}}>
                    ({book.bookRatings.length} ratings)
                  </Typography>
                </Box>
                <CardContent sx={{ display: 'flex', flexDirection: 'row' }}>
                  <Box sx={{ paddingRight: '20px' }}>
                    {!book.base64 ? (
                      <img src="https://www.pngkey.com/png/full/26-261029_book-png-jpg-royalty-free-library-thick-book.png" alt={book.title} style={{ width: '100px', height: 'auto' }} />
                    ) : (
                      <img src={`data:image/${book.base64}`} alt={book.title} style={{ width: '100px', height: 'auto', maxHeight: '250px' }} />
                    )}
                  </Box>
                  <Box>
                    <Typography variant="body2">
                      {book.description}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {selectedBook && <BookDetailsModal selectedBook={selectedBook} getRatingById={getRatingById} updateBookRating={updateBookRating} modalOpen={modalOpen} setModalOpen={setModalOpen} user={user} showSnackbar={showSnackbar} />}
        {addBookModalOpen && <AddBookModal addBookModalOpen={addBookModalOpen} setAddBookModalOpen={setAddBookModalOpen} showSnackbar={showSnackbar} books={books} setBooks={setBooks} />}
        {editCategoryModalOpen && <EditCategoriesModal editCategoryModalOpen={editCategoryModalOpen} setEditCategoryModalOpen={setEditCategoryModalOpen} showSnackbar={showSnackbar} categories={categories} setCategories={setCategories} books={books} setBooks={setBooks} />}
        {selectedBookEdit && <EditBookModal selectedBookEdit={selectedBookEdit} editBookModalOpen={editBookModalOpen} setEditBookModalOpen={setEditBookModalOpen} showSnackbar={showSnackbar} categories={categories} setCategories={setCategories} books={books} setBooks={setBooks} />}
      </Box>
    </Box>
  );
};

export default Home;