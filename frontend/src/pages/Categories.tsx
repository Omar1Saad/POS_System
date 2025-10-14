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
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type {GridRowSelectionModel, GridColDef} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { categoryService } from '@/services/categories';
import { Category, CreateCategory } from '@/types';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useButtonLoading } from '@/hooks/useButtonLoading';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasManagerAccess } = useRoleAccess();
  const { isLoading, withLoading } = useButtonLoading();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Form state
  const [formData, setFormData] = useState<CreateCategory>({
    name: '',
    description: '',
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAll(page + 1, pageSize, searchTerm);
      setCategories(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setSnackbar({ open: true, message: 'Error fetching categories', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, pageSize, searchTerm]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleOpenDialog = (mode: 'create' | 'edit' | 'view', category?: Category) => {
    setDialogMode(mode);
    setSelectedCategory(category || null);
    
    if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
      });
    } else if (category) {
      setFormData({
        name: category.name,
        description: category.description,
      });
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCategory(null);
  };

  const handleFormChange = (field: keyof CreateCategory) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = withLoading('submit', async () => {
    try {
      if (dialogMode === 'create') {
        const res = await categoryService.create(formData);
        if(!res.success){
          throw new Error(res.message || 'Failed to create category');
        }
        setSnackbar({ open: true, message: 'Category created successfully', severity: 'success' });
        handleCloseDialog();
        fetchCategories();
      } else if (dialogMode === 'edit' && selectedCategory) {
        const res = await categoryService.update(selectedCategory.id, formData);
        if(!res.success){
          throw new Error(res.message || 'Failed to update category');
        }
        setSnackbar({ open: true, message: 'Category updated successfully', severity: 'success' });
        handleCloseDialog();
        fetchCategories();
      }
    } catch (error: any) {
      console.error('Error saving category:', error);
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  });

  const handleDelete = withLoading('delete', async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const res = await categoryService.delete(id);
        if(!res.success){
          throw new Error(res.message || 'Failed to delete category');
        }
        setSnackbar({ open: true, message: 'Category deleted successfully', severity: 'success' });
        fetchCategories();
      } catch (error:any) {
        setSnackbar({ open: true, message: error.message, severity: 'error' });
      }
    }
  });

  const handleBulkDelete = withLoading('bulkDelete', async () => {
    if (selectedRows.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} category(ies)?`)) {
      try {
        const res = await categoryService.bulkDelete(selectedRows as number[]);
        if(!res.success){
          throw new Error(res.message || 'Failed to delete categories');
        }
        setSnackbar({ open: true, message: 'Categories deleted successfully', severity: 'success' });
        setSelectedRows([]);
        fetchCategories();
      } catch (error:any) {
        setSnackbar({ open: true, message: error.message, severity: 'error' });
      }
    }
  });

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'description', headerName: 'Description', width: 400, flex: 1 },
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
          {hasManagerAccess() && (
            <>
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
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Categories Management
      </Typography>

      <Card>
        <CardContent>
          {/* Toolbar */}
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <TextField
              placeholder="Search categories..."
              value={searchTerm}
              onChange={handleSearch}
              size="small"
              sx={{ width: 300 }}
            />
            <Box>
              {hasManagerAccess() && selectedRows.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleBulkDelete}
                disabled={isLoading('bulkDelete')}
                sx={{ mr: 1 }}
              >
                {isLoading('bulkDelete') ? 'Deleting...' : `Delete Selected (${selectedRows.length})`}
                </Button>
              )}
              {hasManagerAccess() && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('create')}
                >
                  Add Category
                </Button>
              )}
            </Box>
          </Box>

          {/* Data Grid */}
          <DataGrid
            rows={categories}
            columns={columns}
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(model) => {
              setPage(model.page);
              setPageSize(model.pageSize);
            }}
            paginationMode="server"
            rowCount={total}
            loading={loading}
            checkboxSelection={hasManagerAccess()}
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
          {dialogMode === 'create' ? 'Add New Category' :
           dialogMode === 'edit' ? 'Edit Category' : 'Category Details'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={handleFormChange('name')}
              margin="normal"
              disabled={dialogMode === 'view'}
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={handleFormChange('description')}
              margin="normal"
              disabled={dialogMode === 'view'}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {dialogMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {dialogMode !== 'view' && (
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              disabled={isLoading('submit')}
            >
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

export default Categories;