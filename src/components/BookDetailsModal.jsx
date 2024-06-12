import { useState, useEffect } from 'react';
import { Rating, Paper, IconButton, Typography, Box, Button, TextField, Modal, List, Divider } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { Comment } from 'src/components/Comment';
import { getComments } from 'src/services/BookService';
import apiClient from 'src/utils/apiClient';
import { getToken } from 'src/services/userService';

export const BookDetailsModal = ({ selectedBook, getRatingById, updateBookRating, modalOpen, setModalOpen, user, showSnackbar }) => {
    const [commentsByBookId, setCommentsByBookId] = useState({});
    const [commentData, setCommentData] = useState({
        comment: '',
    });

    useEffect(() => {
        const fetchComments = async () => {
            if (!commentsByBookId[selectedBook.id]) {
                const fetchedComments = await getComments(selectedBook.id);
                setCommentsByBookId(prev => ({ ...prev, [selectedBook.id]: fetchedComments }));
            }
        };
        if (selectedBook.id) {
            fetchComments();
        }
    }, [selectedBook.id, commentsByBookId]);

    const handleModalClose = () => {
        setModalOpen(false);
    };

    const handleCommentChange = (e) => {
        setCommentData({ ...commentData, comment: e.target.value });
    };

    const handleCommentSubmit = async (e, book) => {
        e.preventDefault();
        if (commentData.comment.length < 3) {
            showSnackbar('Comment must be at least 3 characters long!', { variant: 'error' });
            return;
        }
        try {
            const response = await apiClient.post(`books/comments/${book.id}`, { comment: commentData.comment }, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            if (response.status == 201) {
                showSnackbar('Comment posted!');
                const newComment = { id: user.id, comment: commentData.comment, username: user.name };
                setCommentsByBookId(prev => ({ ...prev, [book.id]: [...prev[book.id], newComment] }));
            }
            else {
                showSnackbar('Server error', { variant: 'error' });
            }
        } catch (error) {
            showSnackbar('Failed to post comment!', { variant: 'error' });
            console.log(error)
        }        
        setCommentData({ comment: '' });
    };

    return (
        <Modal
            open={modalOpen}
            onClose={handleModalClose}
            aria-labelledby="book-details-modal"
            aria-describedby="book-details-modal-description"
        >
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24}}>
                <Paper sx={{padding: 2}}>
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                        {selectedBook?.title}
                    </Typography>
                    <Typography id="modal-modal-title">
                        {selectedBook?.category.name}
                    </Typography>
                    <Typography id="modal-modal-title" variant="body2">
                        {selectedBook?.description}
                    </Typography>
                    <Box sx={{ paddingTop: '15px', paddingBottom: '5px', display: 'flex', flexDirection: 'row' }}>
                        <Rating name="rate-book" value={getRatingById(selectedBook)} onChange={(e, value) => updateBookRating(e, value, selectedBook)} />
                        <Typography sx={{ paddingLeft: '5px'}}>
                        (Rate the book)
                        </Typography>
                    </Box>
                </Paper>
                <Paper component="form" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }} onSubmit={(e) => handleCommentSubmit(e, selectedBook)}>
                    <TextField
                        label="Leave a Comment"
                        id="outlined-size-small"
                        value={commentData.comment}
                        onChange={handleCommentChange}
                        size="small"
                        fullWidth={true}
                    />
                        <IconButton type="submit" sx={{ p: '10px' }} aria-label="sendMessage">
                        <SendIcon />
                    </IconButton>
                </Paper>
                <Paper style={{maxHeight: 200, overflow: 'auto'}}>
                    <List>
                        {([...(commentsByBookId[selectedBook.id] || [])]).reverse().map((comment, index) => (
                            <div key={index}>
                                <Comment name={comment.username} text={comment.comment} />
                                <Divider variant="middle" component="li" />
                            </div>
                        ))}
                    </List>
                </Paper>
            </Box>
        </Modal>
    );
};