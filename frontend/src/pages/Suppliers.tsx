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
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Stack,
  Grid,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridToolbar,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  DeleteSweep as BulkDeleteIcon,
} from '@mui/icons-material';
import { Supplier, CreateSupplier } from '@/types';
import { supplierService } from '@/services/suppliers';

const Suppliers: React.FC = () => {
  // State for suppliers data
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);

  // State for form
  const [formData, setFormData] = useState<CreateSupplier>({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<CreateSupplier>>({});

  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Fetch suppliers data
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await supplierService.getAll(page, pageSize, searchTerm);
      setSuppliers(response.data);
      setTotalCount(response.total);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      showNotification('Failed to fetch suppliers', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchSuppliers();
  }, [page, pageSize, searchTerm]);

  // Show notification
  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ open: true, message, severity });
  };

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
    });
    setFormErrors({});
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Partial<CreateSupplier> = {};

    if (!formData.name.trim()) errors.name = 'Supplier name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      errors.phone = 'Phone number is invalid';
    }
    if (!formData.address.trim()) errors.address = 'Address is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle create supplier
  const handleCreateSupplier = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const res = await supplierService.create(formData);
      if (!res.success) {
        throw new Error(res.message);
      }
      setIsCreateModalOpen(false);
      resetForm();
      await fetchSuppliers();
      showNotification('Supplier created successfully', 'success');
    } catch (error: any) {
      console.error('Error creating supplier:', error);
      showNotification(error.message || 'Failed to create supplier', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit supplier
  const handleEditSupplier = async () => {
    if (!selectedSupplier || !validateForm()) return;

    try {
      setLoading(true);
      const res = await supplierService.update(selectedSupplier.id, formData);
      if (!res.success) {
        throw new Error(res.message);
      }
      setIsEditModalOpen(false);
      setSelectedSupplier(null);
      resetForm();
      await fetchSuppliers();
      showNotification('Supplier updated successfully', 'success');
    } catch (error: any) {
      console.error('Error updating supplier:', error);
      showNotification(error.message || 'Failed to update supplier', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete supplier
  const handleDeleteSupplier = async () => {
    if (!selectedSupplier) return;

    try {
      setLoading(true);
      const res = await supplierService.delete(selectedSupplier.id);
      if (!res.success) {
        throw new Error(res.message);
      }
      setIsDeleteModalOpen(false);
      setSelectedSupplier(null);
      await fetchSuppliers();
      showNotification('Supplier deleted successfully', 'success');
    } catch (error: any) {
      console.error('Error deleting supplier:', error);
      showNotification(error.message || 'Failed to delete supplier', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;

    try {
      setLoading(true);
      const res = await supplierService.bulkDelete(selectedRows as number[]);
      if (!res.success) {
        throw new Error(res.message);
      }
      setSelectedRows([]);
      await fetchSuppliers();
      showNotification(`${selectedRows.length} suppliers deleted successfully`, 'success');
    } catch (error: any) {
      console.error('Error bulk deleting suppliers:', error);
      // Ensure we always show supplier-specific error message
      const errorMessage = error.message || 'Failed to delete suppliers';
      showNotification(errorMessage.includes('suppliers') ? errorMessage : 'Failed to delete suppliers', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteModalOpen(true);
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      sortable: true,
    },
    {
      field: 'name',
      headerName: 'Supplier Name',
      flex: 1,
      minWidth: 200,
      sortable: true,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <BusinessIcon color="primary" />
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
      sortable: true,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <EmailIcon color="action" />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 150,
      sortable: true,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <PhoneIcon color="action" />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'address',
      headerName: 'Address',
      flex: 1,
      minWidth: 200,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <LocationIcon color="action" />
          <Tooltip title={params.value}>
            <Typography 
              variant="body2" 
              sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 180,
              }}
            >
              {params.value}
            </Typography>
          </Tooltip>
        </Box>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      sortable: true,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => openEditModal(params.row)}
          color="primary"
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => openDeleteModal(params.row)}
          color="error"
        />,
      ],
    },
  ];

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Suppliers Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateModal}
          size="large"
        >
          Add Supplier
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Suppliers
              </Typography>
              <Typography variant="h4" component="div">
                {totalCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Selected
              </Typography>
              <Typography variant="h4" component="div">
                {selectedRows.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Bulk Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
            
            {selectedRows.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<BulkDeleteIcon />}
                onClick={handleBulkDelete}
              >
                Delete Selected ({selectedRows.length})
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Card>
        <Box height={600}>
          <DataGrid
            rows={suppliers}
            columns={columns}
            loading={loading}
            checkboxSelection
            disableRowSelectionOnClick
            rowSelectionModel={selectedRows}
            onRowSelectionModelChange={setSelectedRows}
            paginationMode="server"
            rowCount={totalCount}
            paginationModel={{ page: page - 1, pageSize }}
            onPaginationModelChange={(model) => {
              setPage(model.page + 1);
              setPageSize(model.pageSize);
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            sx={{
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          />
        </Box>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog 
        open={isCreateModalOpen || isEditModalOpen} 
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedSupplier(null);
          resetForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isCreateModalOpen ? 'Add New Supplier' : 'Edit Supplier'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Supplier Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!formErrors.name}
              helperText={formErrors.name}
              fullWidth
              required
            />
            
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={!!formErrors.email}
              helperText={formErrors.email}
              fullWidth
              required
            />
            
            <TextField
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={!!formErrors.phone}
              helperText={formErrors.phone}
              fullWidth
              required
            />
            
            <TextField
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              error={!!formErrors.address}
              helperText={formErrors.address}
              fullWidth
              multiline
              rows={3}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setIsCreateModalOpen(false);
              setIsEditModalOpen(false);
              setSelectedSupplier(null);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={isCreateModalOpen ? handleCreateSupplier : handleEditSupplier}
            disabled={loading}
          >
            {isCreateModalOpen ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog 
        open={isDeleteModalOpen} 
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSupplier(null);
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete supplier "{selectedSupplier?.name}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setIsDeleteModalOpen(false);
              setSelectedSupplier(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteSupplier}
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar - Fixed positioning */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            position: 'fixed',
            bottom: 20,
            left: 20,
            zIndex: 9999,
          }
        }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ 
            width: '100%',
            minWidth: 300,
            maxWidth: 500
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Suppliers;