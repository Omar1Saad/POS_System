import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { customerService } from '@/services/customers';
import { Customer, CreateCustomer } from '@/types';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useButtonLoading } from '@/hooks/useButtonLoading';

const Customers: React.FC = () => {
  // State management
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasManagerAccess, hasAdminAccess, hasCashierAccess } = useRoleAccess();
  const { isLoading, withLoading } = useButtonLoading();
  
  // Helper function to check if user can create/edit customers
  const canManageCustomers = () => hasManagerAccess() || hasCashierAccess();
  
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateCustomer>({
    fullName: '',
    phone: '',
    email: '',
  });

  // Form validation
  const [formErrors, setFormErrors] = useState<Partial<CreateCustomer>>({});

  // Load customers data
  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await customerService.getAll(page + 1, pageSize, search);
      setCustomers(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load customers:', error);
      setError('Failed to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    loadCustomers();
  }, [page, pageSize, search]);

  // Search handler
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  // Form handlers
  const handleInputChange = (field: keyof CreateCustomer) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: Partial<CreateCustomer> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      email: '',
    });
    setFormErrors({});
    setSelectedCustomer(null);
  };

  // Dialog handlers
  const handleOpenDialog = (mode: 'create' | 'edit' | 'view', customer?: Customer) => {
    setDialogMode(mode);
    if (customer) {
      setSelectedCustomer(customer);
      setFormData({
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email,
      });
    } else {
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  // CRUD operations
  const handleCreateCustomer = withLoading('create', async () => {
    if (!validateForm()) return;

    try {
      const res = await customerService.create(formData);
      if(!res.success){
        throw new Error(res.message);
      }
      setSuccess('Customer created successfully!');
      handleCloseDialog();
      loadCustomers();
    } catch (error: any) {
      setError(error.message || 'Failed to create customer');
    }
  });

  const handleUpdateCustomer = withLoading('update', async () => {
    if (!selectedCustomer || !validateForm()) return;

    try {
      const res = await customerService.update(selectedCustomer.id, formData);
      if(!res.success){
        throw new Error(res.message);
      }
      setSuccess('Customer updated successfully!');
      handleCloseDialog();
      loadCustomers();
    } catch (error: any) {
      setError(error.message || 'Failed to update customer');
    }
  });

  const handleDeleteCustomer = withLoading('delete', async (customerId: number) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;

    try {
      const res = await customerService.delete(customerId);
      if(!res.success){
        throw new Error(res.message);
      }
      setSuccess('Customer deleted successfully!');
      loadCustomers();
    } catch (error: any) {
      setError(error.message || 'Failed to delete customer');
    }
  });

  const handleBulkDelete = withLoading('bulkDelete', async () => {
    if (selectedRows.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedRows.length} customers?`)) return;

    try {
      const res = await customerService.bulkDelete(selectedRows as number[]);
      if(!res.success){
        throw new Error(res.message);
      }
      setSuccess(`${selectedRows.length} customers deleted successfully!`);
      setSelectedRows([]);
      loadCustomers();
    } catch (error: any) {
      // Ensure we always show customer-specific error message
      const errorMessage = error.message || 'Failed to delete customers';
      setError(errorMessage.includes('customers') ? errorMessage : 'Failed to delete customers');
    }
  });

  // Export customers to CSV
  const handleExportCustomers = withLoading('export', async () => {
    try {
      setLoading(true);
      setError('');
      
      let customersToExport: Customer[] = [];
      let exportType = 'all';
      
      // Check if we should export selected customers or all customers
      if (selectedRows.length > 0) {
        // Export only selected customers
        customersToExport = customers.filter(customer => 
          selectedRows.includes(customer.id)
        );
        exportType = 'selected';
      } else {
        // Export all customers
        const response = await customerService.getAllForDropdown();
        if(!response.success){
          throw new Error(response.message);
        }
        if(response.data){
          customersToExport = response.data;
        }
      }
      
      if (customersToExport.length === 0) {
        setError('No customers found to export');
        return;
      }
      
      // Use the service export method
      const customerIds = selectedRows.length > 0 ? selectedRows as number[] : undefined;
      const blob = await customerService.exportToCSV(customerIds);
      
      // Create and download the file
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      const fileName = `customers_${exportType}_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', fileName);
      
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      URL.revokeObjectURL(url);
      
      const exportMessage = selectedRows.length > 0 
        ? `Successfully exported ${customersToExport.length} selected customers to CSV file!`
        : `Successfully exported ${customersToExport.length} customers to CSV file!`;
      
      setSuccess(exportMessage);
    } catch (err: any) {
      setError(err.message || 'Failed to export customers');
    } finally {
      setLoading(false);
    }
  });

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      sortable: true,
    },
    {
      field: 'fullName',
      headerName: 'Full Name',
      flex: 1,
      minWidth: 200,
      sortable: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 250,
      sortable: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon sx={{ color: 'info.main', fontSize: 18 }} />
          <Typography variant="body2" color="text.secondary">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 150,
      sortable: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhoneIcon sx={{ color: 'success.main', fontSize: 18 }} />
          <Typography variant="body2" color="text.secondary">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      sortable: true,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View Customer">
            <IconButton 
              size="small" 
              onClick={() => handleOpenDialog('view', params.row)}
              sx={{ color: 'info.main' }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {canManageCustomers() && (
            <Tooltip title="Edit Customer">
              <IconButton 
                size="small" 
                onClick={() => handleOpenDialog('edit', params.row)}
                sx={{ color: 'warning.main' }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {hasManagerAccess() && (
            <Tooltip title="Delete Customer">
              <IconButton 
                size="small" 
                onClick={() => handleDeleteCustomer(params.row.id)}
                sx={{ color: 'error.main' }}
                disabled={isLoading('delete')}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Customer Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your customer database and relationships
        </Typography>
      </Box>

      {/* Alerts - Fixed positioning */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2, 
            position: 'fixed',
            bottom: 20,
            left: 20,
            zIndex: 9999,
            minWidth: 300,
            maxWidth: 500
          }} 
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 2, 
            position: 'fixed',
            bottom: 20,
            left: 20,
            zIndex: 9999,
            minWidth: 300,
            maxWidth: 500
          }} 
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}

      {/* Toolbar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <FormControl variant="outlined" sx={{ minWidth: 300 }}>
            <InputLabel>Search customers...</InputLabel>
            <OutlinedInput
              value={search}
              onChange={handleSearchChange}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              }
              label="Search customers..."
              placeholder="Name, email, or phone"
            />
          </FormControl>

          <Box sx={{ flexGrow: 1 }} />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {hasManagerAccess() && selectedRows.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleBulkDelete}
                disabled={isLoading('bulkDelete')}
              >
                {isLoading('bulkDelete') ? 'Deleting...' : `Delete Selected (${selectedRows.length})`}
              </Button>
            )}
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadCustomers}
              disabled={loading}
            >
              Refresh
            </Button>

            {hasAdminAccess() && (
              <Tooltip title={selectedRows.length > 0 ? `Export ${selectedRows.length} selected customers to CSV` : "Export all customers to CSV file"}>
                <Button
                  variant="outlined"
                  startIcon={isLoading('export') ? <CircularProgress size={16} /> : <ExportIcon />}
                  onClick={handleExportCustomers}
                  disabled={isLoading('export')}
                >
                  {isLoading('export') ? 'Exporting...' : `Export ${selectedRows.length > 0 ? `(${selectedRows.length})` : ''}`}
                </Button>
              </Tooltip>
            )}

            {canManageCustomers() && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog('create')}
              >
                Add Customer
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* DataGrid */}
      <Paper sx={{ flexGrow: 1, minHeight: 400 }}>
        <DataGrid
          rows={customers}
          columns={columns}
          loading={loading}
          paginationMode="server"
          rowCount={total}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          checkboxSelection={hasManagerAccess()}
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={setSelectedRows}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        />
      </Paper>

      {/* Customer Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' && 'Add New Customer'}
          {dialogMode === 'edit' && 'Edit Customer'}
          {dialogMode === 'view' && 'Customer Details'}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Full Name"
              value={formData.fullName}
              onChange={handleInputChange('fullName')}
              error={!!formErrors.fullName}
              helperText={formErrors.fullName}
              disabled={dialogMode === 'view' || isLoading('create') || isLoading('update')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
              fullWidth
              required
            />

            <TextField
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={dialogMode === 'view' || isLoading('create') || isLoading('update')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
              fullWidth
              required
            />

            <TextField
              label="Phone Number"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              error={!!formErrors.phone}
              helperText={formErrors.phone}
              disabled={dialogMode === 'view' || isLoading('create') || isLoading('update')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="+1-555-0123"
              fullWidth
              required
            />

            {dialogMode === 'view' && selectedCustomer && (
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Customer ID:</strong> {selectedCustomer.id}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Created:</strong> {new Date(selectedCustomer.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Last Updated:</strong> {new Date(selectedCustomer.updatedAt).toLocaleString()}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={handleCloseDialog} disabled={isLoading('create') || isLoading('update')}>
            {dialogMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          
          {dialogMode === 'create' && (
            <Button
              onClick={handleCreateCustomer}
              variant="contained"
              disabled={isLoading('create')}
              startIcon={isLoading('create') ? <CircularProgress size={20} /> : <AddIcon />}
            >
              {isLoading('create') ? 'Creating...' : 'Create Customer'}
            </Button>
          )}
          
          {dialogMode === 'edit' && (
            <Button
              onClick={handleUpdateCustomer}
              variant="contained"
              disabled={isLoading('update')}
              startIcon={isLoading('update') ? <CircularProgress size={20} /> : <EditIcon />}
            >
              {isLoading('update') ? 'Updating...' : 'Update Customer'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Customers;