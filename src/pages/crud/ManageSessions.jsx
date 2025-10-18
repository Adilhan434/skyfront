import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  ListItemIcon
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Article as NewsIcon,
  School as SchoolIcon,
  Error as ErrorIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import api from '../../api';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ManageSessions = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // States for different data
  const [news, setNews] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [dashboard, setDashboard] = useState(null);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  // Error modal state
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // Form states
  const [newsForm, setNewsForm] = useState({ title: '', summary: '', posted_as: '' });
  const [sessionForm, setSessionForm] = useState({ 
    session: '', 
    is_current_session: false, 
    next_session_begins: '' 
  });
  const [semesterForm, setSemesterForm] = useState({
    semester: '',
    is_current_semester: false,
    session: '',
    next_semester_begins: ''
  });

  // Show snackbar notification
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Show validation errors modal
  const showValidationErrors = (errors) => {
    // Convert errors object to array of error messages
    const errorMessages = [];
    
    if (typeof errors === 'object') {
      Object.keys(errors).forEach(field => {
        if (Array.isArray(errors[field])) {
          errors[field].forEach(error => {
            errorMessages.push(`${field}: ${error}`);
          });
        } else if (typeof errors[field] === 'string') {
          errorMessages.push(`${field}: ${errors[field]}`);
        } else {
          errorMessages.push(`${field}: Invalid value`);
        }
      });
    } else if (typeof errors === 'string') {
      errorMessages.push(errors);
    } else {
      errorMessages.push('Unknown validation error occurred');
    }
    
    setValidationErrors(errorMessages);
    setErrorModalOpen(true);
  };

  // Close error modal
  const handleCloseErrorModal = () => {
    setErrorModalOpen(false);
    setValidationErrors([]);
  };

  // Fetch data based on current tab
  const fetchData = async () => {
    setLoading(true);
    try {
      switch (tabValue) {
        case 0: // Dashboard
          const dashboardResponse = await api.get('/api/dashboard/');
          setDashboard(dashboardResponse.data);
          break;
        case 1: // News
          const newsResponse = await api.get('/api/news/');
          setNews(newsResponse.data.items || []);
          break;
        case 2: // Sessions
          const sessionsResponse = await api.get('/api/sessions/');
          setSessions(sessionsResponse.data.sessions || []);
          break;
        case 3: // Semesters
          const semestersResponse = await api.get('/api/semesters/');
          setSemesters(semestersResponse.data.semesters || []);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tabValue]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Dialog handlers
  const handleOpenDialog = (type, item = null) => {
    setDialogType(type);
    setEditingItem(item);
    
    if (item) {
      // Edit mode - populate form with existing data
      switch (type) {
        case 'news':
          setNewsForm({
            title: item.title,
            summary: item.summary,
            posted_as: item.posted_as
          });
          break;
        case 'session':
          setSessionForm({
            session: item.session,
            is_current_session: item.is_current_session,
            next_session_begins: item.next_session_begins?.split('T')[0] || ''
          });
          break;
        case 'semester':
          setSemesterForm({
            semester: item.semester,
            is_current_semester: item.is_current_semester,
            session: item.session?.id || item.session_info?.id || '',
            next_semester_begins: item.next_semester_begins?.split('T')[0] || ''
          });
          break;
      }
    } else {
      // Add mode - reset forms
      setNewsForm({ title: '', summary: '', posted_as: '' });
      setSessionForm({ session: '', is_current_session: false, next_session_begins: '' });
      setSemesterForm({ semester: '', is_current_semester: false, session: '', next_semester_begins: '' });
    }
    
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  // Form submission handlers with error handling
  const handleNewsSubmit = async () => {
    try {
      let response;
      if (editingItem) {
        response = await api.put(`/api/news/${editingItem.id}/`, newsForm);
        showSnackbar('News updated successfully');
      } else {
        response = await api.post('/api/news/', newsForm);
        showSnackbar('News created successfully');
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Error saving news:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        showValidationErrors(error.response.data.errors);
      } else {
        showSnackbar('Error saving news', 'error');
      }
    }
  };

  const handleSessionSubmit = async () => {
    try {
      let response;
      if (editingItem) {
        response = await api.put(`/api/sessions/${editingItem.id}/`, sessionForm);
        showSnackbar('Session updated successfully');
      } else {
        response = await api.post('/api/sessions/', sessionForm);
        showSnackbar('Session created successfully');
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Error saving session:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        showValidationErrors(error.response.data.errors);
      } else {
        showSnackbar('Error saving session', 'error');
      }
    }
  };

  const handleSemesterSubmit = async () => {
    try {
      let response;
      if (editingItem) {
        response = await api.put(`/api/semesters/${editingItem.id}/`, semesterForm);
        showSnackbar('Semester updated successfully');
      } else {
        response = await api.post('/api/semesters/', semesterForm);
        showSnackbar('Semester created successfully');
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Error saving semester:', error);
      if (error.response && error.response.data) {
        // Handle different error response formats
        if (error.response.data.errors) {
          showValidationErrors(error.response.data.errors);
        } else if (error.response.data.message && error.response.data.errors) {
          showValidationErrors(error.response.data.errors);
        } else if (error.response.data.detail) {
          showValidationErrors([error.response.data.detail]);
        } else {
          showValidationErrors(error.response.data);
        }
      } else {
        showSnackbar('Error saving semester', 'error');
      }
    }
  };

  // Delete handlers
  const handleDelete = async (type, id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await api.delete(`/api/${type}/${id}/`);
      showSnackbar(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
      fetchData();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      if (error.response && error.response.data) {
        showValidationErrors(error.response.data);
      } else {
        showSnackbar(`Error deleting ${type}`, 'error');
      }
    }
  };

  // Render Dashboard
  const renderDashboard = () => {
    if (!dashboard) return null;

    return (
      <Grid container spacing={3}>
        <a href="/"><p>back to menu</p></a>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Students
              </Typography>
              <Typography variant="h4" component="div">
                {dashboard.student_count}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Lecturers
              </Typography>
              <Typography variant="h4" component="div">
                {dashboard.lecturer_count}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Males
              </Typography>
              <Typography variant="h4" component="div">
                {dashboard.males_count}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Females
              </Typography>
              <Typography variant="h4" component="div">
                {dashboard.females_count}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {dashboard.logs?.map((log, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={log.message}
                      secondary={`At ${new Date(log.created_at).toLocaleString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Render News
  const renderNews = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">News & Events</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('news')}
        >
          Add News
        </Button>
      </Box>

      <Grid container spacing={2}>
        {news.map((item) => (
          <Grid item xs={12} md={6} key={item.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {item.title}
                </Typography>
                <Chip 
                  label={item.posted_as} 
                  size="small" 
                  color={item.posted_as === 'News' ? 'primary' : 'secondary'}
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {item.summary}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Updated: {new Date(item.updated_date).toLocaleDateString()}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton 
                  size="small" 
                  onClick={() => handleOpenDialog('news', item)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleDelete('news', item.id, item.title)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // Render Sessions
  const renderSessions = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Sessions</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('session')}
        >
          Add Session
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Session</TableCell>
              <TableCell>Current Session</TableCell>
              <TableCell>Next Session Begins</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>{session.session}</TableCell>
                <TableCell>
                  <Chip 
                    label={session.is_current_session ? 'Yes' : 'No'} 
                    color={session.is_current_session ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(session.next_session_begins).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpenDialog('session', session)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDelete('sessions', session.id, session.session)}
                    color="error"
                    disabled={session.is_current_session}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // Render Semesters
  const renderSemesters = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Semesters</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('semester')}
        >
          Add Semester
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Semester</TableCell>
              <TableCell>Current Semester</TableCell>
              <TableCell>Session</TableCell>
              <TableCell>Next Semester Begins</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {semesters.map((semester) => (
              <TableRow key={semester.id}>
                <TableCell>{semester.semester}</TableCell>
                <TableCell>
                  <Chip 
                    label={semester.is_current_semester ? 'Yes' : 'No'} 
                    color={semester.is_current_semester ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{semester.session_info?.session}</TableCell>
                <TableCell>
                  {new Date(semester.next_semester_begins).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpenDialog('semester', semester)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDelete('semesters', semester.id, semester.semester)}
                    color="error"
                    disabled={semester.is_current_semester}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // Render Dialog based on type
  const renderDialog = () => {
    const isEdit = !!editingItem;

    const commonProps = {
      fullWidth: true,
      margin: 'dense'
    };

    switch (dialogType) {
      case 'news':
        return (
          <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            <DialogTitle>
              {isEdit ? 'Edit News' : 'Add News'}
            </DialogTitle>
            <DialogContent>
              <TextField
                {...commonProps}
                label="Title"
                value={newsForm.title}
                onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
              />
              <TextField
                {...commonProps}
                label="Summary"
                multiline
                rows={4}
                value={newsForm.summary}
                onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
              />
              <FormControl {...commonProps}>
                <InputLabel>Posted As</InputLabel>
                <Select
                  value={newsForm.posted_as}
                  label="Posted As"
                  onChange={(e) => setNewsForm({ ...newsForm, posted_as: e.target.value })}
                >
                  <MenuItem value="News">News</MenuItem>
                  <MenuItem value="Event">Event</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleNewsSubmit} variant="contained">
                {isEdit ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Dialog>
        );

      case 'session':
        return (
          <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <DialogTitle>
              {isEdit ? 'Edit Session' : 'Add Session'}
            </DialogTitle>
            <DialogContent>
              <TextField
                {...commonProps}
                label="Session"
                value={sessionForm.session}
                onChange={(e) => setSessionForm({ ...sessionForm, session: e.target.value })}
              />
              <FormControl {...commonProps}>
                <InputLabel>Current Session</InputLabel>
                <Select
                  value={sessionForm.is_current_session}
                  label="Current Session"
                  onChange={(e) => setSessionForm({ ...sessionForm, is_current_session: e.target.value })}
                >
                  <MenuItem value={true}>Yes</MenuItem>
                  <MenuItem value={false}>No</MenuItem>
                </Select>
              </FormControl>
              <TextField
                {...commonProps}
                label="Next Session Begins"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={sessionForm.next_session_begins}
                onChange={(e) => setSessionForm({ ...sessionForm, next_session_begins: e.target.value })}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleSessionSubmit} variant="contained">
                {isEdit ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Dialog>
        );

      case 'semester':
        return (
          <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <DialogTitle>
              {isEdit ? 'Edit Semester' : 'Add Semester'}
            </DialogTitle>
            <DialogContent>
              <FormControl {...commonProps}>
                <InputLabel>Semester</InputLabel>
                <Select
                  value={semesterForm.semester}
                  label="Semester"
                  onChange={(e) => setSemesterForm({ ...semesterForm, semester: e.target.value })}
                >
                  <MenuItem value="First">First</MenuItem>
                  <MenuItem value="Second">Second</MenuItem>
                </Select>
              </FormControl>
              <FormControl {...commonProps}>
                <InputLabel>Current Semester</InputLabel>
                <Select
                  value={semesterForm.is_current_semester}
                  label="Current Semester"
                  onChange={(e) => setSemesterForm({ ...semesterForm, is_current_semester: e.target.value })}
                >
                  <MenuItem value={true}>Yes</MenuItem>
                  <MenuItem value={false}>No</MenuItem>
                </Select>
              </FormControl>
              <FormControl {...commonProps}>
                <InputLabel>Session</InputLabel>
                <Select
                  value={semesterForm.session}
                  label="Session"
                  onChange={(e) => setSemesterForm({ ...semesterForm, session: e.target.value })}
                >
                  {sessions.map((session) => (
                    <MenuItem key={session.id} value={session.id}>
                      {session.session}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                {...commonProps}
                label="Next Semester Begins"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={semesterForm.next_semester_begins}
                onChange={(e) => setSemesterForm({ ...semesterForm, next_semester_begins: e.target.value })}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleSemesterSubmit} variant="contained">
                {isEdit ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Dialog>
        );

      default:
        return null;
    }
  };

  // Render Validation Error Modal
  const renderErrorModal = () => (
    <Dialog 
      open={errorModalOpen} 
      onClose={handleCloseErrorModal}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
        <ErrorIcon sx={{ mr: 1 }} />
        Validation Errors
        <IconButton
          aria-label="close"
          onClick={handleCloseErrorModal}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Please correct the following errors:
        </Typography>
        <List dense>
          {validationErrors.map((error, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <ErrorIcon color="error" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={error}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseErrorModal} variant="contained" color="primary">
          OK, I'll fix them
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="default">
        <Toolbar>
          <SchoolIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Academic Management System
          </Typography>
        </Toolbar>
      </AppBar>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab icon={<DashboardIcon />} label="Dashboard" />
          <Tab icon={<NewsIcon />} label="News & Events" />
          <Tab icon={<SchoolIcon />} label="Sessions" />
          <Tab icon={<SchoolIcon />} label="Semesters" />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabPanel value={tabValue} index={0}>
              {renderDashboard()}
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              {renderNews()}
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              {renderSessions()}
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              {renderSemesters()}
            </TabPanel>
          </>
        )}
      </Paper>

      {renderDialog()}
      {renderErrorModal()}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageSessions;