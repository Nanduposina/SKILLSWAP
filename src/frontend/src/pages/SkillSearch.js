import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  TextField,
  Button,
  Chip,
  Avatar,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Paper,
  CircularProgress,
  Alert,
  Pagination,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Toll as MoneyIcon,
  FilterList as FilterIcon,
  School as SchoolIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { skillsService } from '../services/skillsService';
import { exchangesService } from '../services/exchangesService';

const SkillSearch = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [teachers, setTeachers] = useState([]);
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [searchParams, setSearchParams] = useState({
    skill: '',
    category: '',
    location: '',
    skillLevel: '',
    minRating: 0,
    maxHourlyRate: 100
  });

  useEffect(() => {
    fetchFilters();
    fetchTeachers();
  }, [page]);

  const fetchFilters = async () => {
    try {
      const response = await skillsService.getSearchFilters();
      if (response.success) {
        setFilters(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch filters:', error);
    }
  };

  const fetchTeachers = async (params = {}) => {
    setLoading(true);
    setError('');

    try {
      const queryParams = {
        ...searchParams,
        ...params,
        limit: 12,
        offset: (page - 1) * 12
      };

      const response = await skillsService.searchTeachers(queryParams);

      if (response.success) {
        setTeachers(response.data);
        setTotalPages(Math.ceil(response.pagination.total / 12));
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      setError('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const updatedParams = {
      ...searchParams,
      skill: searchTerm
    };
    setPage(1);
    setSearchParams(updatedParams);
    fetchTeachers(updatedParams);
  };

  const handleFilterChange = (field, value) => {
    const updatedParams = {
      ...searchParams,
      [field]: value
    };
    setSearchParams(updatedParams);
    setPage(1);
    fetchTeachers(updatedParams);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSearchParams({
      category: '',
      location: '',
      skillLevel: '',
      minRating: 0,
      maxHourlyRate: 100
    });
    setPage(1);
    fetchTeachers();
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    fetchTeachers();
  };

  const handleTeacherClick = (teacherId) => {
    navigate(`/profile/${teacherId}`);
  };

  const handleCreateExchange = async (teacher) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const exchangeData = {
        providerID: teacher.id,
        skillID: teacher.skillId || String(teacher.skillId),
        skill: teacher.skillName,
        skillLevel: teacher.skillLevel || 'Beginner',
        description: `Request to learn ${teacher.skillName} from ${teacher.name}`,
        sessionType: 'Exchange',
        hourlyRate: teacher.hourlyRate || 0,
        durationHours: 1.0,
        isMutualExchange: false
      };

      const response = await exchangesService.createExchange(exchangeData);

      if (response.success) {
        alert('Exchange request sent successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to create exchange:', error);
      alert(error.response?.data?.message || 'Failed to send exchange request');
    }
  };

  const formatPrice = (price) => {
    return price === 0 ? 'Free' : `${price} points/hour`;
  };

  const getSkillLevelColor = (level) => {
    switch (level) {
      case 'Beginner':
        return 'success';
      case 'Intermediate':
        return 'warning';
      case 'Advanced':
        return 'error';
      case 'Expert':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Find Your Perfect Teacher
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover skilled individuals who can help you learn new skills
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search for skills or teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              startIcon={<SearchIcon />}
            >
              Search
            </Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setShowFilters(!showFilters)}
              startIcon={<FilterIcon />}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </Grid>
        </Grid>

        {/* Advanced Filters */}
        {showFilters && (
          <Box mt={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={searchParams.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {filters.categories?.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Skill Level</InputLabel>
                  <Select
                    value={searchParams.skillLevel}
                    onChange={(e) => handleFilterChange('skillLevel', e.target.value)}
                    label="Skill Level"
                  >
                    <MenuItem value="">All Levels</MenuItem>
                    {filters.skillLevels?.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={searchParams.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    label="Location"
                  >
                    <MenuItem value="">All Locations</MenuItem>
                    <MenuItem value="Stockholm">Stockholm</MenuItem>
                    <MenuItem value="Gothenburg">Gothenburg</MenuItem>
                    <MenuItem value="Malmö">Malmö</MenuItem>
                    <MenuItem value="Uppsala">Uppsala</MenuItem>
                    <MenuItem value="Linköping">Linköping</MenuItem>
                    <MenuItem value="Örebro">Örebro</MenuItem>
                    <MenuItem value="Västerås">Västerås</MenuItem>
                    <MenuItem value="Norrköping">Norrköping</MenuItem>
                    <MenuItem value="Helsingborg">Helsingborg</MenuItem>
                    <MenuItem value="Jönköping">Jönköping</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography gutterBottom>
                    Max Hourly Rate: {searchParams.maxHourlyRate} points
                  </Typography>
                  <Slider
                    value={searchParams.maxHourlyRate}
                    onChange={(e, value) => handleFilterChange('maxHourlyRate', value)}
                    min={0}
                    max={100}
                    step={10}
                    valueLabelDisplay="auto"
                  />
                </Box>
              </Grid>
            </Grid>
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                startIcon={<ClearIcon />}
              >
                Clear Filters
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Results */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : teachers.length === 0 ? (
        <Box textAlign="center" py={8}>
          <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No teachers found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Try adjusting your search criteria or browse all available skills
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setSearchParams({
                skill: '',
                category: '',
                location: '',
                skillLevel: '',
                minRating: 0,
                maxHourlyRate: 100
              });
              setSearchTerm('');
              fetchTeachers();
            }}
          >
            Clear Filters
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {teachers.map((teacher, index) => (
              <Grid item xs={12} sm={6} md={4} key={`${teacher.id}-${index}`}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar
                        src={teacher.profilePicture}
                        sx={{ width: 56, height: 56, mr: 2 }}
                      >
                        {teacher.name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="div">
                          {teacher.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {teacher.location}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="h6" color="primary" gutterBottom>
                      {teacher.skillName}
                    </Typography>

                    {teacher.averageRating > 0 && (
                      <Box display="flex" alignItems="center" mb={1}>
                        <Rating
                          value={teacher.averageRating || 0}
                          readOnly
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          ({teacher.averageRating?.toFixed(1) || '0.0'})
                        </Typography>
                      </Box>
                    )}

                    <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                      <Chip
                        label={teacher.skillLevel}
                        size="small"
                        color={getSkillLevelColor(teacher.skillLevel)}
                      />
                      <Chip
                        label={teacher.skillCategory}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {teacher.skillDescription || 'No description available'}
                    </Typography>

                    <Box display="flex" alignItems="center">
                      <MoneyIcon sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatPrice(teacher.hourlyRate)}
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      onClick={() => handleTeacherClick(teacher.id)}
                    >
                      View Profile
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleCreateExchange(teacher)}
                    >
                      Request Exchange
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default SkillSearch;






