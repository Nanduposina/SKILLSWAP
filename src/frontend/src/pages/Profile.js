import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Button,
  Chip,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  School as SchoolIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  Toll as MoneyIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usersService } from '../services/usersService';
import { skillsService } from '../services/skillsService';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [addSkillDialogOpen, setAddSkillDialogOpen] = useState(false);
  const [addSkillData, setAddSkillData] = useState({});
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [customSubcategory, setCustomSubcategory] = useState('');

  const isOwnProfile = !id || id === currentUser?.id;

  useEffect(() => {
    if (id) {
      fetchUserProfile(id);
    } else if (currentUser) {
      setProfileUser(currentUser);
      setLoading(false);
    }
    fetchAvailableSkills();
  }, [id, currentUser]);

  const fetchUserProfile = async (userId) => {
    try {
      const response = await usersService.getUserById(userId);
      if (response.success) {
        setProfileUser(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSkills = async () => {
    try {
      const response = await skillsService.getAllSkills();
      if (response.success) {
        setAvailableSkills(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch available skills:', error);
    }
  };

  // Helper function to get unique main categories
  const getMainCategories = () => {
    const categories = new Set();
    availableSkills.forEach(skill => {
      const mainCategory = skill.category.split(' > ')[0];
      categories.add(mainCategory);
    });
    const sortedCategories = Array.from(categories).sort();
    // Add "Others" option at the end only if it doesn't already exist
    if (!categories.has('Others')) {
      sortedCategories.push('Others');
    }
    return sortedCategories;
  };

  // Helper function to get subcategories for a selected main category
  const getSubcategories = (mainCategory) => {
    if (!mainCategory) return [];
    if (mainCategory === 'Others') return []; // No predefined subcategories for Others

    const subcategories = new Set();
    availableSkills.forEach(skill => {
      if (skill.category.startsWith(mainCategory + ' > ')) {
        const subcategory = skill.category.split(' > ')[1];
        subcategories.add(subcategory);
      }
    });
    return Array.from(subcategories).sort();
  };

  // Helper function to get skills for a selected subcategory
  const getSkillsForSubcategory = (mainCategory, subcategory) => {
    if (!mainCategory || !subcategory) return [];

    // For "Others" category, return empty array since we'll use custom input
    if (mainCategory === 'Others') return [];

    const fullCategory = `${mainCategory} > ${subcategory}`;
    return availableSkills.filter(skill => skill.category === fullCategory);
  };

  const handleEditClick = () => {
    setEditData({
      name: profileUser.name,
      location: profileUser.location || '',
      bio: profileUser.bio || ''
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    try {
      const response = await usersService.updateUser(profileUser.id, editData);
      if (response.success) {
        setProfileUser(response.data);
        setEditDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddSkillClick = () => {
    setAddSkillData({
      skillID: '',
      skillLevel: 'Beginner',
      hourlyRate: 0,
      description: ''
    });
    setSelectedCategory('');
    setSelectedSubcategory('');
    setCustomSubcategory('');
    setAddSkillDialogOpen(true);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory('');
    setCustomSubcategory('');
    setAddSkillData(prev => ({ ...prev, skillID: '' }));
  };

  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setCustomSubcategory('');
    setAddSkillData(prev => ({ ...prev, skillID: '' }));
  };

  const handleAddSkillSave = async () => {
    try {
      let skillID = addSkillData.skillID;

      // If "Others" category is selected, create a new skill first
      if (selectedCategory === 'Others' && customSubcategory.trim()) {
        const newSkillResponse = await skillsService.createSkill({
          name: customSubcategory.trim(),
          category: `Others > ${customSubcategory.trim()}`,
          skillLevel: addSkillData.skillLevel,
          hourlyRate: addSkillData.hourlyRate || 0
        });

        if (newSkillResponse.success) {
          skillID = newSkillResponse.data.id;
          // Refresh available skills to include the new one
          fetchAvailableSkills();
        } else {
          throw new Error('Failed to create new skill');
        }
      }

      if (!skillID && selectedCategory !== 'Others') {
        setError('Please select a skill');
        return;
      }

      if (selectedCategory === 'Others' && !customSubcategory.trim()) {
        setError('Please enter a custom skill name');
        return;
      }

      const payload = {
        skillID: skillID,
        skillLevel: addSkillData.skillLevel,
        hourlyRate: addSkillData.hourlyRate,
        description: addSkillData.description
      };

      const response = await usersService.addSkillOffered(profileUser.id, payload);
      if (response.success) {
        // Refresh user profile to show new skill
        if (id) {
          fetchUserProfile(id);
        } else {
          // Update current user data
          const updatedUser = { ...profileUser };
          updatedUser.skillsOffered = [...(updatedUser.skillsOffered || []), response.data.data];
          setProfileUser(updatedUser);
        }
        setAddSkillDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to add skill:', error);
      setError('Failed to add skill');
    }
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

  if (error || !profileUser) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          {error || 'Profile not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Profile Header */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                src={profileUser.profilePicture}
                sx={{ width: 120, height: 120 }}
              >
                {profileUser.name?.[0]}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h4" component="h1" gutterBottom>
                    {profileUser.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    @{profileUser.userID}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Box display="flex" alignItems="center">
                      <LocationIcon sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {profileUser.location || 'Location not specified'}
                      </Typography>
                    </Box>
                    {profileUser.skillsOffered && profileUser.skillsOffered.length > 0 && (
                      <Box display="flex" alignItems="center">
                        <StarIcon sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Rating value={profileUser.averageRating || 0} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                          ({profileUser.averageRating?.toFixed(1) || '0.0'})
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {profileUser.bio || 'No bio available'}
                  </Typography>

                  <Box display="flex" gap={1} flexWrap="wrap">
                    {isOwnProfile && (
                      <Chip
                        icon={<MoneyIcon />}
                        label={`${profileUser.pointsBalance} points`}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    <Chip
                      label={`Member since ${new Date(profileUser.createdAt).getFullYear()}`}
                      variant="outlined"
                    />
                  </Box>
                </Box>

                {isOwnProfile && (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleEditClick}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Skills Offered" />
          <Tab label="Reviews" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Skills Offered</Typography>
              {isOwnProfile && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={handleAddSkillClick}
                >
                  Add Skill
                </Button>
              )}
            </Box>
            {profileUser.skillsOffered?.length > 0 ? (
              <List>
                {profileUser.skillsOffered.filter(skill => skill).map((skill, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <SchoolIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={skill.skillName || skill.name || 'Unknown Skill'}
                      secondary={
                        <Box>
                          <Box component="span" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.875rem' }}>
                            {skill.skillCategory || skill.category || 'Unknown Category'} • {skill.skillLevel || skill.level || 'Unknown Level'}
                          </Box>
                          <Box component="span" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.875rem' }}>
                            {skill.hourlyRate || 0} points/hour
                          </Box>
                          {skill.description && (
                            <Box component="span" sx={{ display: 'block', fontSize: '0.875rem' }}>
                              {skill.description}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" textAlign="center" py={4}>
                {isOwnProfile ? 'No skills offered yet. Add some skills to get started!' : 'No skills offered.'}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Reviews</Typography>
            {profileUser.ratings?.length > 0 ? (
              <List>
                {profileUser.ratings.map((rating, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Rating value={rating.score} readOnly size="small" />
                          <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                            by {rating.raterName}
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box component="span" sx={{ fontSize: '0.875rem' }}>
                          {rating.reviewText || 'No review text provided'}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" textAlign="center" py={4}>
                No reviews yet.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={editData.name || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Location"
            value={editData.location || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Bio"
            multiline
            rows={3}
            value={editData.bio || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Add Skill Dialog */}
      <Dialog open={addSkillDialogOpen} onClose={() => setAddSkillDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add Skill Offered
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select a category to narrow down your skill options
          </Typography>

          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              label="Category"
            >
              {getMainCategories().map((category) => (
                <MenuItem key={category} value={category}>
                  {category === 'Others' ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {category}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        (Custom skills)
                      </Typography>
                    </Box>
                  ) : (
                    category
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedCategory === 'Others' ? (
            <TextField
              fullWidth
              margin="normal"
              label="Custom Skill Name"
              value={customSubcategory}
              onChange={(e) => setCustomSubcategory(e.target.value)}
              placeholder="Enter the name of your custom skill"
              helperText="This will create a new skill category for you"
            />
          ) : (
            <FormControl fullWidth margin="normal" disabled={!selectedCategory}>
              <InputLabel>Subcategory</InputLabel>
              <Select
                value={selectedSubcategory}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                label="Subcategory"
              >
                {getSubcategories(selectedCategory).map((subcategory) => (
                  <MenuItem key={subcategory} value={subcategory}>
                    {subcategory}
                  </MenuItem>
                ))}
              </Select>
              {!selectedCategory && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Select a category first
                </Typography>
              )}
            </FormControl>
          )}

          {selectedCategory !== 'Others' && (
            <FormControl fullWidth margin="normal" disabled={!selectedSubcategory}>
              <InputLabel>Skill</InputLabel>
              <Select
                value={addSkillData.skillID || ''}
                onChange={(e) => setAddSkillData(prev => ({ ...prev, skillID: e.target.value }))}
                label="Skill"
              >
                {getSkillsForSubcategory(selectedCategory, selectedSubcategory).map((skill) => (
                  <MenuItem key={skill.id} value={skill.id}>
                    {skill.name}
                  </MenuItem>
                ))}
              </Select>
              {!selectedSubcategory && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Select a subcategory first
                </Typography>
              )}
            </FormControl>
          )}

          <FormControl fullWidth margin="normal">
            <InputLabel>Skill Level</InputLabel>
            <Select
              value={addSkillData.skillLevel || 'Beginner'}
              onChange={(e) => setAddSkillData(prev => ({ ...prev, skillLevel: e.target.value }))}
              label="Skill Level"
            >
              <MenuItem value="Beginner">Beginner</MenuItem>
              <MenuItem value="Intermediate">Intermediate</MenuItem>
              <MenuItem value="Advanced">Advanced</MenuItem>
              <MenuItem value="Expert">Expert</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Hourly Rate (Points)"
            type="number"
            value={addSkillData.hourlyRate || 0}
            onChange={(e) => setAddSkillData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
            margin="normal"
            inputProps={{ min: 0, step: 1 }}
          />

          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={addSkillData.description || ''}
            onChange={(e) => setAddSkillData(prev => ({ ...prev, description: e.target.value }))}
            margin="normal"
            placeholder="Describe your experience or what you're looking for..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddSkillDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSkillSave} variant="contained">Add Skill</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;






