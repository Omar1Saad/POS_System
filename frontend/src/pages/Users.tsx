import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  IconButton,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { userService } from '@/services/users';
import { User, CreateUser } from '@/types';
import { useButtonLoading } from '@/hooks/useButtonLoading';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoading, withLoading } = useButtonLoading();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Form state
  const [formData, setFormData] = useState<CreateUser>({
    fullName: '',
    username: '',
    email: '',
    role: 'cashier',
    password: '',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll(page + 1, pageSize, searchTerm);
      if(!response.data || response.data.length === 0) {
        throw new Error(response.message);
      }
      setUsers(response.data);
      setTotal(response.total);
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, searchTerm]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handleOpenDialog = (mode: 'create' | 'edit' | 'view', user?: User) => {
    setDialogMode(mode);
    setSelectedUser(user || null);
    
    if (mode === 'create') {
      setFormData({
        fullName: '',
        username: '',
        email: '',
        role: 'cashier',
        password: '',
      });
    } else if (user) {
      setFormData({
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        password: '', // Don't pre-fill password for security
      });
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleFormChange = (field: keyof CreateUser) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = withLoading('submit', async () => {
    try {
      if (dialogMode === 'create') {
        const res = await userService.create(formData);
        if(!res.success) {
          throw new Error(res.message);
        }
        setSnackbar({ open: true, message: 'User created successfully', severity: 'success' });
      } else if (dialogMode === 'edit' && selectedUser) {
        const res = await userService.update(selectedUser.id, formData);
        if(!res.success) {
          throw new Error(res.message);
        }
        setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
      }
      
      handleCloseDialog();
      fetchUsers();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  });

  const handleDelete = withLoading('delete', async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const res = await userService.delete(id);
        if(!res.success) {
          throw new Error(res.message);
        }
        setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
        fetchUsers();
      } catch (error: any) {
        setSnackbar({ open: true, message: error.message, severity: 'error' });
      }
    }
  });

  const handleBulkDelete = withLoading('bulkDelete', async () => {
    if (selectedRows.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} user(s)?`)) {
      try {
        const res = await userService.bulkDelete(selectedRows as number[]);
        if(!res.success) {
          throw new Error(res.message);
        }
        setSnackbar({ open: true, message: 'Users deleted successfully', severity: 'success' });
        setSelectedRows([]);
        fetchUsers();
      } catch (error: any) {
        setSnackbar({ open: true, message: error.message, severity: 'error' });
      }
    }
  });

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'fullName', headerName: 'Full Name', width: 200 },
    { field: 'username', headerName: 'Username', width: 150 },
    { field: 'email', headerName: 'Email', width: 250 },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'admin' ? 'error' :
            params.value === 'manager' ? 'warning' : 'primary'
          }
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 150,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleOpenDialog('view', params.row)}
            color="info"
          >
            <ViewIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleOpenDialog('edit', params.row)}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row.id)}
            color="error"
            disabled={isLoading('delete')}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Users Management
      </Typography>

      <Card>
        <CardContent>
          {/* Toolbar */}
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <TextField
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              size="small"
              sx={{ width: 300 }}
            />
            <Box>
              {selectedRows.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleBulkDelete}
                  sx={{ mr: 1 }}
                  disabled={isLoading('bulkDelete')}
                >
                  {isLoading('bulkDelete') ? 'Deleting...' : `Delete Selected (${selectedRows.length})`}
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog('create')}
              >
                Add User
              </Button>
            </Box>
          </Box>

          {/* Data Grid */}
          <DataGrid
            rows={users}
            columns={columns}
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(model) => {
              setPage(model.page);
              setPageSize(model.pageSize);
            }}
            paginationMode="server"
            rowCount={total}
            loading={loading}
            checkboxSelection
            disableRowSelectionOnClick
            rowSelectionModel={selectedRows}
            onRowSelectionModelChange={setSelectedRows}
            pageSizeOptions={[5, 10, 25, 50]}
            sx={{ height: 400, width: '100%' }}
          />
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Add New User' :
           dialogMode === 'edit' ? 'Edit User' : 'User Details'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.fullName}
              onChange={handleFormChange('fullName')}
              margin="normal"
              disabled={dialogMode === 'view'}
            />
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={handleFormChange('username')}
              margin="normal"
              disabled={dialogMode === 'view'}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleFormChange('email')}
              margin="normal"
              disabled={dialogMode === 'view'}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={handleFormChange('role')}
                disabled={dialogMode === 'view'}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="cashier">Cashier</MenuItem>
              </Select>
            </FormControl>
            {dialogMode !== 'view' && (
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleFormChange('password')}
                margin="normal"
                required={dialogMode === 'create'}
                placeholder={dialogMode === 'edit' ? 'Leave blank to keep current password' : ''}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {dialogMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {dialogMode !== 'view' && (
            <Button onClick={handleSubmit} variant="contained" disabled={isLoading('submit')}>
              {isLoading('submit') 
                ? (dialogMode === 'create' ? 'Creating...' : 'Updating...') 
                : (dialogMode === 'create' ? 'Create' : 'Update')
              }
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Users;