import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  TextField,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Rating,
  Grid
} from '@mui/material';
import {
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  Undo as UndoIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { exchangesService } from '../services/exchangesService';
import { formatSwedishTime } from '../utils/timeUtils';

const ExchangeDetails = () => {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const { joinExchange, leaveExchange, sendMessage } = useSocket();
  
  const [exchange, setExchange] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [ratingData, setRatingData] = useState({ score: 5, reviewText: '' });
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const messagesEndRef = React.useRef(null);

  useEffect(() => {
    if (id) {
      fetchExchangeDetails();
      joinExchange(id);
    }

    return () => {
      // Leave exchange room when component unmounts
      if (id) {
        leaveExchange(id);
      }
    };
  }, [id, joinExchange, leaveExchange]);

  // Listen for real-time messages from all users (asynchronous messaging)
  useEffect(() => {
    const handleNewMessage = (event) => {
      const message = event.detail;
      console.log('🔔 Raw message received:', message);
      console.log('🔔 Current exchange ID:', id);
      console.log('🔔 Message exchange ID:', message.exchangeID);
      
      // Add messages from all users for this exchange
      if (message.exchangeID === id) {
        console.log('✅ Message matches current exchange, adding to messages');
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          const exists = prev.some(m => 
            m.id === message.id || 
            (m.content === message.content && 
             m.senderID === message.senderID && 
             Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) < 2000) // Within 2 seconds
          );
          if (exists) {
            console.log('❌ Duplicate message prevented:', message.id);
            return prev;
          }
          console.log('✅ New message added:', message.id, message.content);
          return [...prev, message];
        });
      } else {
        console.log('❌ Message exchange ID does not match current exchange');
      }
    };

    const handleMessageError = (event) => {
      const error = event.detail;
      console.error('❌ Message error:', error);
      setError('Failed to send message. Please try again.');
    };

    console.log('🔧 Setting up message listeners for exchange:', id);
    window.addEventListener('newMessage', handleNewMessage);
    window.addEventListener('messageError', handleMessageError);
    return () => {
      console.log('🔧 Cleaning up message listeners for exchange:', id);
      window.removeEventListener('newMessage', handleNewMessage);
      window.removeEventListener('messageError', handleMessageError);
    };
  }, [id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }, [messages]);

  const fetchExchangeDetails = async () => {
    try {
      const response = await exchangesService.getExchangeById(id);
      if (response.success) {
        setExchange(response.data);
        // Load messages from database (simple replacement for async messaging)
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch exchange details:', error);
      setError('Failed to load exchange details');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately to prevent double sends

    try {
      console.log('📤 Sending message via Socket.io:', {
        exchangeId: id,
        senderId: user.id,
        content: messageContent,
        messageType: 'text',
        senderName: user.name,
        senderPicture: user.profilePicture
      });
      
      // Send message via Socket.io only (asynchronous)
      sendMessage({
        exchangeId: id,
        senderId: user.id,
        content: messageContent,
        messageType: 'text',
        senderName: user.name,
        senderPicture: user.profilePicture
      });
      
      console.log('📤 Message sent successfully via Socket.io');
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      setNewMessage(messageContent); // Restore message on error
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await exchangesService.updateExchangeStatus(id, newStatus);
      setExchange(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleRateExchange = async () => {
    try {
      const otherUserId = exchange.requesterID === user.id ? exchange.providerID : exchange.requesterID;
      const response = await exchangesService.rateExchange(id, otherUserId, ratingData.score, ratingData.reviewText);
      
      if (response.success) {
        alert('Rating submitted successfully!');
        setRatingDialogOpen(false);
        setRatingData({ score: 5, reviewText: '' });
        // Refresh exchange details to show the new rating
        fetchExchangeDetails();
      }
    } catch (error) {
      console.error('Failed to rate exchange:', error);
      alert(error.response?.data?.message || 'Failed to submit rating');
    }
  };

  const handleRevokeClick = () => {
    setRevokeDialogOpen(true);
  };

  const handleRevokeConfirm = async () => {
    try {
      const response = await exchangesService.revokeExchange(id);
      if (response.success) {
        setRevokeDialogOpen(false);
        // Refresh exchange details and user data (including points balance)
        await Promise.all([
          fetchExchangeDetails(),
          refreshUser()
        ]);
      }
    } catch (error) {
      console.error('Failed to revoke exchange:', error);
      setError('Failed to revoke exchange request');
    }
  };

  const handleRevokeCancel = () => {
    setRevokeDialogOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'Accepted':
        return 'success';
      case 'In Progress':
        return 'info';
      case 'Completed':
        return 'primary';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Only the requester (student) can rate the provider (teacher)
  const canRate = exchange?.status === 'Completed' && exchange?.requesterID === user?.id;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !exchange) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          {error || 'Exchange not found'}
        </Alert>
      </Container>
    );
  }

  const otherUser = exchange.requesterID === user?.id ? 
    { name: exchange.providerName, id: exchange.providerID } : 
    { name: exchange.requesterName, id: exchange.requesterID };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Exchange Header */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {exchange.skill} Exchange
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                with {otherUser.name}
              </Typography>
              <Chip
                label={exchange.status}
                color={getStatusColor(exchange.status)}
                sx={{ mb: 2 }}
              />
            </Box>
            <Box display="flex" gap={1}>
              {exchange.status === 'Pending' && exchange.providerID === user?.id && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleStatusChange('Accepted')}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => handleStatusChange('Cancelled')}
                  >
                    Decline
                  </Button>
                </>
              )}
              {exchange.status === 'Pending' && exchange.requesterID === user?.id && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<UndoIcon />}
                  onClick={handleRevokeClick}
                >
                  Revoke Request
                </Button>
              )}
              {exchange.status === 'Accepted' && (
                <Button
                  variant="contained"
                  onClick={() => handleStatusChange('In Progress')}
                >
                  Start Session
                </Button>
              )}
              {exchange.status === 'In Progress' && (
                <Button
                  variant="contained"
                  onClick={() => handleStatusChange('Completed')}
                >
                  Complete
                </Button>
              )}
              {canRate && (
                <Button
                  variant="outlined"
                  startIcon={<StarIcon />}
                  onClick={() => setRatingDialogOpen(true)}
                >
                  Rate Exchange
                </Button>
              )}
            </Box>
          </Box>

          <Typography variant="body1" sx={{ mb: 2 }}>
            {exchange.description}
          </Typography>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip label={`Level: ${exchange.skillLevel}`} variant="outlined" />
            <Chip label={`Type: ${exchange.sessionType}`} variant="outlined" />
            {exchange.hourlyRate > 0 && (
              <Chip label={`${exchange.hourlyRate} points/hour`} variant="outlined" />
            )}
            {exchange.scheduledDate && (
              <Chip 
                label={`Scheduled: ${new Date(exchange.scheduledDate).toLocaleDateString()}`} 
                variant="outlined" 
              />
            )}
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        {/* Messages */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Messages
              </Typography>
              <Paper
                sx={{
                  height: 400,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  p: 2,
                  mb: 2,
                  backgroundColor: 'grey.50',
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#888',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: '#555',
                  },
                }}
              >
                {messages.length === 0 ? (
                  <Typography color="text.secondary" textAlign="center" py={4}>
                    No messages yet. Start the conversation!
                  </Typography>
                ) : (
                  <List>
                    {messages.map((message) => (
                      <ListItem key={message.id} alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>
                            {message.senderName?.[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle2">
                                {message.senderName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatSwedishTime(message.createdAt)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2">
                              {message.content}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                    <div ref={messagesEndRef} />
                  </List>
                )}
              </Paper>
              
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  startIcon={<SendIcon />}
                >
                  Send
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Exchange Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Exchange Details
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Status"
                    secondary={exchange.status}
                  />
                  <Chip
                    label={exchange.status}
                    color={getStatusColor(exchange.status)}
                    size="small"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Created"
                    secondary={new Date(exchange.createdAt).toLocaleDateString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Duration"
                    secondary={`${exchange.durationHours} hours`}
                  />
                </ListItem>
                {exchange.isMutualExchange && (
                  <ListItem>
                    <ListItemText
                      primary="Type"
                      secondary="Mutual Exchange"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          {/* Ratings Section */}
          {exchange.ratings && exchange.ratings.length > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Ratings
                </Typography>
                <List dense>
                  {exchange.ratings.map((rating, index) => (
                    <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start', borderBottom: '1px solid #eee' }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Rating value={rating.score} readOnly size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(rating.createdAt).toLocaleDateString('sv-SE')}
                        </Typography>
                      </Box>
                      {rating.reviewText && (
                        <Typography variant="body2" color="text.secondary">
                          {rating.reviewText}
                        </Typography>
                      )}
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onClose={() => setRatingDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rate Exchange</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="body1" gutterBottom>
              How would you rate your experience with {otherUser.name}?
            </Typography>
            <Rating
              value={ratingData.score}
              onChange={(event, newValue) => {
                setRatingData(prev => ({ ...prev, score: newValue }));
              }}
              size="large"
            />
          </Box>
          <TextField
            fullWidth
            label="Review (Optional)"
            multiline
            rows={3}
            value={ratingData.reviewText}
            onChange={(e) => setRatingData(prev => ({ ...prev, reviewText: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRateExchange} variant="contained">Submit Rating</Button>
        </DialogActions>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <Dialog
        open={revokeDialogOpen}
        onClose={handleRevokeCancel}
        aria-labelledby="revoke-dialog-title"
        aria-describedby="revoke-dialog-description"
      >
        <DialogTitle id="revoke-dialog-title">
          Revoke Exchange Request
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="revoke-dialog-description">
            Are you sure you want to revoke your exchange request for "{exchange?.skill}" with {otherUser.name}?
          </DialogContentText>
          <Typography variant="body2" sx={{ mt: 2 }}>
            This action will:
          </Typography>
          <ul>
            <li>Cancel the exchange request</li>
            <li>Refund your points ({exchange?.hourlyRate * exchange?.durationHours} points)</li>
            <li>Notify the other participant</li>
          </ul>
          <Typography variant="body2" color="error">
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRevokeCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRevokeConfirm} color="error" variant="contained">
            Revoke Request
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExchangeDetails;
