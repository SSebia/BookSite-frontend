import { useState, useEffect } from 'react';
import { FormControl, MenuItem, InputLabel, Select, Typography, Box, Button, TextField, Modal, List } from '@mui/material';
import apiClient from 'src/utils/apiClient';
import { getToken } from 'src/services/userService';
import { getCategories } from 'src/services/BookService';

export const EditBookModal = ({ selectedBookEdit, editBookModalOpen, setEditBookModalOpen, showSnackbar, books, setBooks }) => {
    const [bookStates, setBookStates] = useState({});
    const [categories, setCategories] = useState([]);

    const currentBookState = bookStates[selectedBookEdit.id] || {
        title: selectedBookEdit.title,
        description: selectedBookEdit.description,
        isbn: selectedBookEdit.isbn,
        base64: selectedBookEdit.base64,
        pages: selectedBookEdit.pages,
        catID: selectedBookEdit.category.id,
    };

    useEffect(() => {
        const fetchCategories = async () => {
            const fetchedCategories = await getCategories();
            setCategories(fetchedCategories);
        };
        fetchCategories();
    }, []);

    const handleModalClose = () => {
        setEditBookModalOpen(false);
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBookStates((prev) => ({
                    ...prev,
                    [selectedBookEdit.id]: { ...currentBookState, base64: reader.result.toString() }
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e, field) => {
        const { value } = e.target;
        setBookStates((prev) => ({
            ...prev,
            [selectedBookEdit.id]: { ...currentBookState, [field]: value }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const bookData = {
            ...currentBookState,
            pages: parseInt(currentBookState.pages, 10),
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
            const response = await apiClient.post(`books/edit/${selectedBookEdit.id}`, bookData, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            if (response.status === 200) {
                showSnackbar('Book edited!');
                const updatedBooks = books.map(book =>
                    book.id === selectedBookEdit.id ? { ...book, ...bookData, category: { id: bookData.catID, name: categories.find(cat => cat.id === bookData.catID).name } } : book
                );
                setBooks(updatedBooks);
                handleModalClose();
            } else {
                showSnackbar('Server error', { variant: 'error' });
            }
        } catch (error) {
            showSnackbar('Failed to edit book!', { variant: 'error' });
            console.log(error);
        }
    };

    return (
        <Modal
            open={editBookModalOpen}
            onClose={handleModalClose}
            aria-labelledby="edit-book-modal-title"
            aria-describedby="edit-book-modal-description"
        >
            <Box sx={{ height: 600, overflow: 'auto', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
                <List>
                    <Typography id="edit-book-modal-title" variant="h6" component="h2">
                        Edit Book
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
                            value={currentBookState.title}
                            onChange={(e) => handleChange(e, 'title')}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="description"
                            label="Description"
                            type="text"
                            id="description"
                            value={currentBookState.description}
                            onChange={(e) => handleChange(e, 'description')}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="isbn"
                            label="ISBN"
                            type="text"
                            id="isbn"
                            value={currentBookState.isbn}
                            onChange={(e) => handleChange(e, 'isbn')}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="pages"
                            label="Page Count"
                            type="number"
                            id="pages"
                            value={currentBookState.pages}
                            onChange={(e) => handleChange(e, 'pages')}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="category-select-label">Category</InputLabel>
                            <Select
                                labelId="category-select-label"
                                id="category-select"
                                value={currentBookState.catID || ''}
                                label="Category"
                                onChange={(e) => handleChange(e, 'catID')}
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
                            {currentBookState.base64 ? 'Change Image' : 'Upload Image'}
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </Button>
                        {currentBookState.base64 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                <img src={currentBookState.base64} alt="Uploaded book cover" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                            </Box>
                        )}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Edit Book
                        </Button>
                    </Box>
                </List>
            </Box>
        </Modal>
    );
};
