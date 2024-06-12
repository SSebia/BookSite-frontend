import { useState, useEffect } from 'react';
import { Rating, Paper, FormControl, IconButton, MenuItem, InputLabel, Select, Typography, Box, Button, TextField, Modal, List, Divider } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { Comment } from 'src/components/Comment';
import { getComments } from 'src/services/BookService';
import apiClient from 'src/utils/apiClient';
import { getToken } from 'src/services/userService';
import { getCategories } from 'src/services/BookService';

export const AddBookModal = ({ addBookModalOpen, setAddBookModalOpen, showSnackbar, books, setBooks }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isbn, setIsbn] = useState('');
    const [base64, setBase64] = useState(null);
    const [pages, setPages] = useState('');
    const [catID, setCatID] = useState('');
    const [categories, setCategories] = useState([]);
  
    const handleModalClose = () => {
        setAddBookModalOpen(false);
    };

    useEffect(() => {
      const fetchCategories = async () => {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      };
      fetchCategories();
    }, []);
  
    const handleImageChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setBase64(reader.result.toString());
        };
        reader.readAsDataURL(file);
      }
    };
  
    const handleSubmit = async (e) => {
        e.preventDefault();
        const bookData = {
            title,
            description,
            isbn,
            base64,
            pages: parseInt(pages, 10),
            catID
        };

        if (!bookData.title || !bookData.description || !bookData.isbn || !bookData.pages || !bookData.catID) {
            showSnackbar('Please fill out all fields!', { variant: 'error' });
            return;
        }
        if (!bookData.base64) {
            showSnackbar('Please upload an image!', { variant: 'error' });
            return;
        }
        if (bookData.title.length < 3 || bookData.description.length < 3 || bookData.isbn.length < 3) {
            showSnackbar('Title, description, and ISBN must be at least 3 characters long!', { variant: 'error' });
            return;
        }
        if (bookData.description.length < 10) {
            showSnackbar('Description must be at least 10 characters long!', { variant: 'error' });
            return;
        }
        if (bookData.pages < 1) {
            showSnackbar('Page count must be at least 1!', { variant: 'error' });
            return;
        }
  
        try {
            const response = await apiClient.post(`books/add`, bookData, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            if (response.status == 201) {
                showSnackbar('Book added!');
                setBooks([...books, response.data]);
                handleModalClose();
                setTitle('');
                setDescription('');
                setIsbn('');
                setBase64(null);
                setPages('');
                setCatID('');
            }
            else {
                showSnackbar('Server error', { variant: 'error' });
            }
        } catch (error) {
            showSnackbar('Failed to add book!', { variant: 'error' });
            console.log(error)
        }
    };

    return (
        <Modal
          open={addBookModalOpen}
          onClose={handleModalClose}
          aria-labelledby="add-book-modal-title"
          aria-describedby="add-book-modal-description"
        >
          <Box sx={{ height: 600, overflow: 'auto', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
            <List>
            <Typography id="add-book-modal-title" variant="h6" component="h2">
              Add a New Book
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="title"
                label="Title"
                name="title"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="description"
                label="Description"
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="isbn"
                label="ISBN"
                type="text"
                id="isbn"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="pages"
                label="Page Count"
                type="number"
                id="pages"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="category-select-label">Category</InputLabel>
                <Select
                  labelId="category-select-label"
                  id="category-select"
                  value={catID}
                  label="Category"
                  onChange={(e) => setCatID(e.target.value)}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                component="label"
                fullWidth
                sx={{ mt: 2, mb: 2 }}
              >
                {base64 ? 'Change Image' : 'Upload Image'}
                <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                />
                </Button>
                {base64 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <img src={base64} alt="Uploaded book cover" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                    </Box>
                )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Add Book
              </Button>
            </Box>
            </List>
          </Box>
        </Modal>
      );

}