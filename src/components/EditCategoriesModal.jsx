import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, ListItemText, DialogContent, ListItem, IconButton, Box, Button, TextField, List } from '@mui/material';
import apiClient from 'src/utils/apiClient';
import { getToken } from 'src/services/userService';
import { getCategories } from 'src/services/BookService';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export const EditCategoriesModal = ({ editCategoryModalOpen, setEditCategoryModalOpen, showSnackbar, categories, setCategories, books, setBooks }) => {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
  
    useEffect(() => {
        fetchCategories();
    }, []);
    
    const fetchCategories = async () => {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
    };
  
    const handleAddCategory = async () => {
        if (newCategoryName.length < 1) {
            showSnackbar('Please enter a category name!', { variant: 'error' });
            return;
        }
        const categoryExists = categories.some(category => category.name.toLowerCase() === newCategoryName.toLowerCase());
        if (categoryExists) {
            showSnackbar('Category with this name already exists!', { variant: 'error' });
            return;
        }
        try {
            const response = await apiClient.post(`category/add`, { "name" : newCategoryName }, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            if (response.status == 201) {
                showSnackbar('Category added!');
                setCategories([...categories, response.data]);
                setNewCategoryName('');
            }
            else {
                showSnackbar('Server error', { variant: 'error' });
            }
        } catch (error) {
            showSnackbar('Failed to add category!', { variant: 'error' });
            console.log(error)
        }
    };
  
    const handleEditCategory = async (id, newName) => {
        if (newName.length < 1) {
            showSnackbar('Please enter a new category name!', { variant: 'error' });
            return;
        }
        try {
            const response = await apiClient.post(`category/edit/${id}`, { "name" : newName }, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            if (response.status == 200) {
                showSnackbar('Category renamed!');

                const updatedCategories = categories.map(category => 
                    category.id === id ? { ...category, name: newName } : category
                );
                setCategories(updatedCategories);

                const updatedBooks = books.map(book => 
                    book.category.id === id ? { ...book, category: { ...book.category, name: newName } } : book
                );
                setBooks(updatedBooks);

                setEditMode(false);
                setCurrentCategory(null);
            }
            else {
                showSnackbar('Server error', { variant: 'error' });
            }
        } catch (error) {
            showSnackbar('Failed to rename category!', { variant: 'error' });
            console.log(error)
        }
    };
  
    const handleDeleteCategory = async (id) => {
        try {
            const response = await apiClient.delete(`category/delete/${id}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            if (response.status == 200) {
                showSnackbar('Category deleted!');
                const updatedCategories = categories.filter(category => category.id !== id);
                setCategories(updatedCategories);
                const updatedBooks = books.filter(book => book.category.id !== id);
                setBooks(updatedBooks);
            }
            else {
                showSnackbar('Server error', { variant: 'error' });
            }
        } catch (error) {
            showSnackbar('Failed to delete category!', { variant: 'error' });
            console.log(error)
        }
    };

    const handleModalClose = () => {
        setEditCategoryModalOpen(false);
    };
  
    return (
      <Dialog open={editCategoryModalOpen} onClose={handleModalClose}>
        <DialogTitle>Edit Categories</DialogTitle>
        <DialogContent>
            <Box sx={{ marginBottom: '20px', display: 'flex', flexDirection: 'row' }}>
                <TextField
                    label="New category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    fullWidth
                />
                <Button onClick={handleAddCategory} color="primary">
                    Add
                </Button>
            </Box>
          <List>
            {categories.map((category) => (
              <ListItem key={category.id} secondaryAction={
                <>
                  <IconButton edge="end" aria-label="edit" onClick={() => { setEditMode(true); setCurrentCategory(category); }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteCategory(category.id)}>
                    <DeleteIcon />
                  </IconButton>
                </>
              }>
                <ListItemText
                  primary={editMode && currentCategory.id === category.id ? (
                    <TextField
                      defaultValue={category.name}
                      onBlur={(e) => handleEditCategory(category.id, e.target.value)}
                    />
                  ) : category.name}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    );
}