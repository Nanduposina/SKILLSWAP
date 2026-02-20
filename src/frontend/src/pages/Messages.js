import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import {
  Message as MessageIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { exchangesService } from '../services/exchangesService';
import { formatSwedishDateShort } from '../utils/timeUtils';

const Messages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExchanges();
  }, []);

  const fetchExchanges = async () => {
    try {
      console.log('📨 Fetching exchanges for Messages page...');
      const response = await exchangesService.getMyExchanges();
      console.log('📨 Messages page - API response:', response);
      
      if (response.success) {
        console.log('📨 Messages page - Setting exchanges:', response.data);
        setExchanges(response.data);
      } else {
        console.log('📨 Messages page - API response not successful:', response);
      }
    } catch (error) {
      console.error('❌ Failed to fetch exchanges:', error);
      setError('Failed to load exchanges');
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString) => {
    return formatSwedishDateShort(dateString);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Messages
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Your skill exchange conversations
      </Typography>

      {exchanges.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <MessageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No conversations yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Start by creating an exchange with a teacher or student
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {exchanges.map((exchange) => {
            const otherUser = exchange.requesterID === user?.id ? 
              { name: exchange.providerName, id: exchange.providerID } : 
              { name: exchange.requesterName, id: exchange.requesterID };

            return (
              <Grid item xs={12} key={exchange.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => navigate(`/exchange/${exchange.id}`)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" flex={1}>
                        <Avatar sx={{ mr: 2 }}>
                          {otherUser.name?.[0]}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h6" component="div">
                            {exchange.skill} with {otherUser.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {exchange.description}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1} mt={1}>
                            <Chip
                              label={exchange.status}
                              size="small"
                              color={getStatusColor(exchange.status)}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(exchange.updatedAt)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <MessageIcon color="action" />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default Messages;






