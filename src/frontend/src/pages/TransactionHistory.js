import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  CircularProgress,
  Alert,
  Pagination,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  SwapHoriz as ExchangeIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { usersService } from '../services/usersService';
import { formatSwedishDate } from '../utils/timeUtils';

const TransactionHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, pagination.limit]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await usersService.getMyTransactions(pagination.page, pagination.limit);

      if (response.success) {
        setTransactions(response.data.transactions);
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }));
      } else {
        setError('Failed to fetch transaction history');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to fetch transaction history');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (amount) => {
    if (amount > 0) {
      return <TrendingUpIcon color="success" />;
    } else {
      return <TrendingDownIcon color="error" />;
    }
  };

  const getTransactionColor = (amount) => {
    if (amount > 0) {
      return 'success';
    } else {
      return 'error';
    }
  };

  const formatAmount = (amount) => {
    const sign = amount > 0 ? '+' : '';
    return `${sign}${amount}`;
  };

  const formatDate = (dateString) => {
    return formatSwedishDate(dateString);
  };

  const getTransactionTypeLabel = (transactionType) => {
    const labels = {
      'Payment': 'Payment',
      'Award': 'Earned',
      'Refund': 'Refund',
      'Bonus': 'Bonus'
    };
    return labels[transactionType] || transactionType;
  };

  const handlePageChange = (event, value) => {
    setPagination(prev => ({ ...prev, page: value }));
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
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Points Transaction History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track all your points transactions, including earnings, payments, and refunds
        </Typography>
      </Box>

      {/* Current Balance Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <AccountBalanceIcon color="primary" sx={{ fontSize: 40 }} />
            </Grid>
            <Grid item xs>
              <Typography variant="h6" color="primary">
                Current Balance
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {user?.pointsBalance || 0} points
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Transaction Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Earned</Typography>
              </Box>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {transactions
                  .filter(t => t.amount > 0)
                  .reduce((sum, t) => sum + t.amount, 0)} points
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Spent</Typography>
              </Box>
              <Typography variant="h4" color="error.main" fontWeight="bold">
                {Math.abs(transactions
                  .filter(t => t.amount < 0)
                  .reduce((sum, t) => sum + t.amount, 0))} points
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <ExchangeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Transactions</Typography>
              </Box>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {pagination.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transaction Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Skill</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No transactions found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {getTransactionIcon(transaction.amount)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {getTransactionTypeLabel(transaction.transactionType)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${formatAmount(transaction.amount)} points`}
                        color={getTransactionColor(transaction.amount)}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {transaction.skill ? (
                        <Chip
                          label={transaction.skill}
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(transaction.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {transaction.exchangeStatus ? (
                        <Chip
                          label={transaction.exchangeStatus}
                          size="small"
                          color={
                            transaction.exchangeStatus === 'Completed' ? 'success' :
                              transaction.exchangeStatus === 'Pending' ? 'warning' :
                                transaction.exchangeStatus === 'Cancelled' ? 'error' : 'default'
                          }
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={pagination.pages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
};

export default TransactionHistory;
