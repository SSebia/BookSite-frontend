import React, { useState, useEffect } from 'react';
import { Rating, AppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu, MenuItem, TextField, Select, MenuItem as DropdownItem, Card, CardContent, Grid, FormControl, InputLabel, Modal, Button } from '@mui/material';
import { useAuth } from "src/services/AuthContext";
import { getBooks, getCategories } from 'src/services/BookService';
import CardHeader from '@mui/material/CardHeader';
import VisibilityIcon from '@mui/icons-material/Visibility';


const Home = () => {
  const { user, logoutUser } = useAuth();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const open = Boolean(anchorEl);

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

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const addBookToFavorites = (bookId) => {
    console.log('Add to favorites:', bookId);
  };

  const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) {
      return 0;
    }
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / ratings.length;
  };

  const filteredBooks = books.filter(book => {
    return book.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
           (selectedCategory ? book.category.name === selectedCategory : true);
  });


  const BookDetailsModal = () => (
    //<Rating name="read-only" value={1} readOnly sx={{paddingBottom: '30px'}} />
    <Modal
      open={modalOpen}
      onClose={handleModalClose}
      aria-labelledby="book-details-modal"
      aria-describedby="book-details-modal-description"
    >
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 300, bgcolor: 'background.paper', boxShadow: 24, p: 2 }}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          {selectedBook?.title}
        </Typography>
        <Typography id="modal-modal-description">
          {selectedBook?.description}
        </Typography>
        {/* TODO Komentarai */}
        <Button onClick={() => addBookToFavorites(selectedBook?.id)}>Add to Favorites</Button>
      </Box>
    </Modal>
  );

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
            <MenuItem onClick={handleClose}>Favorite Books</MenuItem>
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
        <Grid container spacing={2}>
          {filteredBooks.map(book => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardHeader
                  action={
                    <IconButton aria-label="settings" onClick={() => viewBook(book)}>
                      <VisibilityIcon />
                    </IconButton>
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
                      <img src={`data:image/jpeg;base64,${book.base64}`} alt={book.title} style={{ width: '100px', height: 'auto' }} />
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
        {selectedBook && <BookDetailsModal />}
      </Box>
    </Box>
  );
};

export default Home;