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
import { productService } from '@/services/products';
import { categoryService } from '@/services/categories';
import { Product, CreateProduct, Category } from '@/types';
import { useRoleAccess } from '@/hooks/useRoleAccess';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasManagerAccess, hasAdminAccess } = useRoleAccess();
  
  // Helper function to check if user can see cost information
  const canViewCost = () => hasManagerAccess() || hasAdminAccess();
  
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Form state
  const [formData, setFormData] = useState<CreateProduct>({
    name: '',
    barcode: '',
    categoryId: 0,
    price: 0,
    stock: 0,
    averageCost: 0,
    profitPercentage: 25,
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll(page + 1, pageSize, searchTerm);
      if(!response.data || response.data.length === 0) {
        console.log(response.data)
        throw new Error(response.message||'sds');
      }
      setProducts(response.data);
      setTotal(response.total);
    } catch (error:any) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllForDropdown();
      if(response.data){
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, pageSize, searchTerm]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleOpenDialog = (mode: 'create' | 'edit' | 'view', product?: Product) => {
    setDialogMode(mode);
    setSelectedProduct(product || null);
    
    if (mode === 'create') {
      setFormData({
        name: '',
        barcode: '',
        categoryId: 0,
        price: 0,
        stock: 0,
        averageCost: 0,
        profitPercentage: 25,
      });
    } else if (product) {
      const initialData = {
        name: product.name || '',
        barcode: product.barcode || '',
        categoryId: Number(product.categoryId) || 0,
        price: Number(product.price) || 0,
        stock: Number(product.stock) || 0,
        averageCost: Number(product.averageCost) || 0,
        profitPercentage: Number(product.profitPercentage) || 25,
      };

      // If editing and average cost exists, recalculate price based on current profit percentage
      if (mode === 'edit' && initialData.averageCost && initialData.averageCost > 0) {
        const cost = Number(initialData.averageCost) || 0;
        const percentage = Number(initialData.profitPercentage) || 25;
        const calculatedPrice = Math.round((cost + (cost * percentage / 100)) * 100) / 100;
        initialData.price = calculatedPrice;
        console.log('Initial calculated price for edit:', calculatedPrice);
      }

      setFormData(initialData);
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
  };

  const handleFormChange = (field: keyof CreateProduct) => (event: any) => {
    const value = field === 'price' || field === 'stock' || field === 'categoryId' || field === 'averageCost' || field === 'profitPercentage'
      ? Number(event.target.value) || 0
      : event.target.value || '';

    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Ensure numeric fields are always numbers
      if (field === 'price' || field === 'stock' || field === 'categoryId' || field === 'averageCost' || field === 'profitPercentage') {
        newData[field] = Number(value) || 0;
      }

      // Auto-calculate price when average cost or profit percentage changes
      if ((field === 'averageCost' || field === 'profitPercentage') && newData.averageCost && newData.averageCost > 0) {
        const cost = Number(newData.averageCost) || 0;
        const percentage = Number(newData.profitPercentage) || 25;
        const calculatedPrice = Math.round((cost + (cost * percentage / 100)) * 100) / 100;
        newData.price = calculatedPrice;
        console.log('Auto-calculated price:', calculatedPrice, 'from cost:', cost, 'profit%:', percentage);
      }

      return newData;
    });
  };

  const handleSubmit = async () => {
    try {
      // Prepare form data for submission
      const submitData = { ...formData };
      
      console.log('Frontend: Original form data:', formData);
      
      // If average cost is provided, don't send manual price - let backend calculate it
      if (submitData.averageCost > 0) {
        delete submitData.price;
      }
      
      console.log('Frontend: Sending data:', submitData);
      
      if (dialogMode === 'create') {
        const res = await productService.create(submitData);
        if(!res.success){
          throw new Error(res.message);
        }
        setSnackbar({ open: true, message: 'Product created successfully', severity: 'success' });
      } else if (dialogMode === 'edit' && selectedProduct) {
        const res = await productService.update(selectedProduct.id, submitData);
        if(!res.success){
          throw new Error(res.message);
        }
        setSnackbar({ open: true, message: 'Product updated successfully', severity: 'success' });
      }
      
      handleCloseDialog();
      fetchProducts();
    } catch (error:any) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const res = await productService.delete(id);
        if(!res.success){
          throw new Error(res.message);
        }
        setSnackbar({ open: true, message: 'Product deleted successfully', severity: 'success' });
        fetchProducts();
      } catch (error:any) {
        setSnackbar({ open: true, message: error.message, severity: 'error' });
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} products?`)) {
      try {
        const res = await productService.bulkDelete(selectedRows as number[]);
        if(!res.success){
          throw new Error(res.message);
        }
        setSnackbar({ open: true, message: `${selectedRows.length} products deleted successfully`, severity: 'success' });
        setSelectedRows([]);
        fetchProducts();
      } catch (error:any) {
        setSnackbar({ open: true, message: error.message, severity: 'error' });
      }
    }
  };

  const handleQuickEditProfit = async (product: Product) => {
    const newProfitPercentage = prompt(
      `Enter new profit percentage for "${product.name}":`,
      product.profitPercentage?.toString() || '25'
    );
    
    if (newProfitPercentage && !isNaN(Number(newProfitPercentage))) {
      try {
        const res = await productService.update(product.id, {
          profitPercentage: Number(newProfitPercentage)
        });
        if(!res.success){
          throw new Error(res.message);
        }
        setSnackbar({ open: true, message: 'Profit percentage updated successfully', severity: 'success' });
        fetchProducts();
      } catch (error:any) {
        setSnackbar({ open: true, message: error.message, severity: 'error' });
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'barcode', headerName: 'Barcode', width: 150 },
    { 
      field: 'category', 
      headerName: 'Category', 
      width: 150,
      valueGetter: (params) => params.row.category?.name || 'N/A',
    },
    { 
      field: 'price', 
      headerName: 'Price', 
      width: 100,
      valueFormatter: (params: any) => {
        const value = params.value;
        if (value === null || value === undefined || isNaN(value)) {
          return '$0.00';
        }
        return `$${Number(value).toFixed(2)}`;
      },
    },
    ...(canViewCost() ? [{
      field: 'averageCost',
      headerName: 'Cost',
      width: 100,
      valueFormatter: (params: any) => {
        const value = params.value;
        if (value === null || value === undefined || isNaN(value)) {
          return '$0.00';
        }
        return `$${Number(value).toFixed(2)}`;
      },
    }] : []),
    ...(canViewCost() ? [{
      field: 'profitPercentage',
      headerName: 'Profit %',
      width: 100,
      valueFormatter: (params: any) => {
        const value = params.value;
        if (value === null || value === undefined || isNaN(value)) {
          return '25.00%';
        }
        return `${Number(value).toFixed(2)}%`;
      },
      renderCell: (params: any) => (
        <Chip
          label={`${Number(params.value || 25).toFixed(2)}%`}
          color={params.value > 30 ? 'success' : params.value > 20 ? 'primary' : 'default'}
          size="small"
        />
      ),
    }] : []),
    {
      field: 'stock',
      headerName: 'Stock',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value < 10 ? 'error' : params.value < 25 ? 'warning' : 'success'}
          size="small"
        />
      ),
    },
    {
      field: 'createAt',
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
              >
                <DeleteIcon />
              </IconButton>
            </>
          )}
          {canViewCost() && (
            <IconButton
              size="small"
              onClick={() => handleQuickEditProfit(params.row)}
              color="secondary"
              title="Quick Edit Profit %"
            >
              <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 'bold' }}>
                %
              </Typography>
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Products Management
      </Typography>

      <Card>
        <CardContent>
          {/* Toolbar */}
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <TextField
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
              size="small"
              sx={{ width: 300 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              {hasManagerAccess() && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('create')}
                >
                  Add Product
                </Button>
              )}
              {hasManagerAccess() && selectedRows.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleBulkDelete()}
                >
                  Delete Selected ({selectedRows.length})
                </Button>
              )}
            </Box>
          </Box>

          {/* Data Grid */}
          <DataGrid
            rows={products}
            columns={columns}
            paginationMode="server"
            rowCount={total}
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(model) => {
              setPage(model.page);
              setPageSize(model.pageSize);
            }}
            loading={loading}
            pageSizeOptions={[5, 10, 25, 50]}
            sx={{ height: 400, width: '100%' }}
            checkboxSelection={hasManagerAccess()}
            onRowSelectionModelChange={setSelectedRows}
            rowSelectionModel={selectedRows}
            disableRowSelectionOnClick={true}
          />
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Add New Product' :
           dialogMode === 'edit' ? 'Edit Product' : 'Product Details'}
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
              label="Barcode"
              value={formData.barcode}
              onChange={handleFormChange('barcode')}
              margin="normal"
              disabled={dialogMode === 'view'}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.categoryId}
                label="Category"
                onChange={handleFormChange('categoryId')}
                disabled={dialogMode === 'view'}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Price"
              type="number"
              value={formData.price && typeof formData.price === 'number' ? formData.price.toFixed(2) : '0.00'}
              onChange={handleFormChange('price')}
              margin="normal"
              disabled={dialogMode === 'view' || (formData.averageCost > 0 && canViewCost())}
              required
              inputProps={{ min: 0, step: 0.01 }}
              helperText={
                formData.averageCost > 0 && canViewCost()
                  ? "Price is automatically calculated based on average cost + profit percentage"
                  : "Enter price manually or set average cost for automatic calculation"
              }
            />
            {canViewCost() && (
              <TextField
                fullWidth
                label="Average Cost"
                type="number"
                value={formData.averageCost && typeof formData.averageCost === 'number' ? formData.averageCost.toFixed(2) : '0.00'}
                onChange={handleFormChange('averageCost')}
                margin="normal"
                disabled={dialogMode === 'view'}
                inputProps={{ min: 0, step: 0.01 }}
                helperText="Cost per unit (visible to managers and admins only)"
              />
            )}
            {canViewCost() && (
              <TextField
                fullWidth
                label="Profit Percentage"
                type="number"
                value={formData.profitPercentage && typeof formData.profitPercentage === 'number' ? formData.profitPercentage.toFixed(2) : '25.00'}
                onChange={handleFormChange('profitPercentage')}
                margin="normal"
                disabled={dialogMode === 'view'}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                helperText="Profit percentage applied to average cost (managers and admins only)"
              />
            )}
            <TextField
              fullWidth
              label="Stock"
              type="number"
              value={formData.stock}
              onChange={handleFormChange('stock')}
              margin="normal"
              disabled={dialogMode === 'view'}
              required
              inputProps={{ min: 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {dialogMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {dialogMode !== 'view' && (
            <Button onClick={handleSubmit} variant="contained">
              {dialogMode === 'create' ? 'Create' : 'Update'}
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

export default Products;