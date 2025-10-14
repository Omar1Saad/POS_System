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
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  TextField,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridToolbar,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  CheckCircle as CompleteIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingCart as CartIcon,
  Remove as RemoveIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { Sale, SaleItem, Customer, CreateSale, Product, Category } from '@/types';
import { saleService } from '@/services/sales';
import { customerService } from '@/services/customers';
import { productService } from '@/services/products';
import { categoryService } from '@/services/categories';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useButtonLoading } from '@/hooks/useButtonLoading';

const Sales: React.FC = () => {
  // Role access
  const { hasAdminAccess, hasCashierAccess } = useRoleAccess();
  const { isLoading, withLoading } = useButtonLoading();
  
  // State for sales data
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // State for modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPOSModalOpen, setIsPOSModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [saleDetails, setSaleDetails] = useState<Sale | null>(null);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);

  // State for sale creation
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(0);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // State for edit modal
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'card' | 'mixed'>('cash');
  const [saleItems, setSaleItems] = useState<Array<{
    productId: number;
    product?: Product;
    quantity: number;
    unitPrice: number;
    total: number;
  }>>([]);

  // State for summary data
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalAmount: 0,
    averageAmount: 0,
    topProducts: [] as Array<{ product: string; quantity: number; revenue: number }>,
  });

  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Fetch sales data
  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await saleService.getAll(page, pageSize, searchTerm, statusFilter);
      setSales(response.data);
      setTotalCount(response.total);
    } catch (error) {
      showNotification('Failed to fetch sales', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch summary data
  const fetchSummary = async () => {
    try {
      const response = await saleService.getSummary('month');
      if (response.data) {
        // Ensure all numeric values are properly handled to prevent NaN
        const safeSummary = {
          totalSales: Number(response.data.totalSales) || 0,
          totalAmount: Number(response.data.totalAmount) || 0,
          averageAmount: Number(response.data.averageAmount) || 0,
          topProducts: response.data.topProducts || []
        };
        setSummary(safeSummary);
      }
    } catch (error) {
      // Set default values on error to prevent NaN display
      setSummary({
        totalSales: 0,
        totalAmount: 0,
        averageAmount: 0,
        topProducts: []
      });
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchSales();
  }, [page, pageSize, searchTerm, statusFilter]);

  useEffect(() => {
    fetchSummary();
  }, []);

  // Show notification
  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ open: true, message, severity });
  };

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  // Handle status filter change
  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(1); // Reset to first page when filtering
  };

  // Clear selected rows
  const handleClearSelection = withLoading('bulkDelete', async () => {
    const response = await saleService.deleteBulk(selectedRows as number[]);
    if (response.success) {
      showNotification('Sales deleted successfully', 'success');
      await fetchSales();
      await fetchSummary();
    } else {
      showNotification(response.message || 'Failed to delete sales', 'error');
    }
    setSelectedRows([]);
  });

  // Get status chip color
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'unknown': return 'default';
      default: return 'default';
    }
  };

  // Get payment method color
  const getPaymentMethodColor = (method: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (method?.toLowerCase()) {
      case 'cash': return 'success';
      case 'card': return 'primary';
      case 'mixed': return 'warning';
      case 'unknown': return 'default';
      default: return 'default';
    }
  };

  // Utility function to safely convert any value to a number
  const safeParseNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    
    if (typeof value === 'number') {
      return isNaN(value) ? 0 : value;
    }
    
    if (typeof value === 'string') {
      // Remove commas and any other non-numeric characters except decimal point and minus sign
      const cleanString = value.replace(/[^\d.-]/g, '');
      const parsed = parseFloat(cleanString);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    return 0;
  };

  // Format currency
  const formatCurrency = (amount: number | string) => {
    const numericAmount = safeParseNumber(amount);
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numericAmount);
  };

  // Handle view sale details
  const handleViewSale = async (sale: Sale) => {
    try {
      setLoading(true);
      const response = await saleService.getById(sale.id);
      
      if (response.success && response.data) {
        setSaleDetails(response.data);
        setSelectedSale(sale);
        setIsViewModalOpen(true);
      } else {
        showNotification(response.message || 'Failed to fetch sale details', 'error');
      }
    } catch (error: any) {
      showNotification(error.message || 'Failed to fetch sale details', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle complete sale
  const handleCompleteSale = withLoading('complete', async (sale: Sale) => {
    // Pre-validate before making API call
    if (sale.total <= 0) {
      showNotification(
        'Cannot complete sale: Sale total is zero or negative. Please add items with valid prices before completing the sale.',
        'error'
      );
      return;
    }

    try {
      const response = await saleService.complete(sale.id);
      
      if (response.success) {
        await fetchSales();
        await fetchSummary();
        showNotification('Sale completed successfully', 'success');
      } else {
        showNotification(response.message || 'Failed to complete sale', 'error');
      }
    } catch (error: any) {
      // Extract error message from API response
      const errorMessage = error.response?.data?.message || error.message || 'Failed to complete sale';
      showNotification(errorMessage, 'error');
    }
  });

  // Handle cancel sale
  const handleCancelSale = withLoading('cancel', async (sale: Sale) => {
    try {
      await saleService.cancel(sale.id);
      await fetchSales();
      await fetchSummary();
      showNotification('Sale cancelled successfully', 'success');
    } catch (error: any) {
      showNotification(error.message || 'Failed to cancel sale', 'error');
    }
  });

  // Handle delete sale
  const handleDeleteSale = withLoading('delete', async () => {
    if (!selectedSale) return;

    try {
      await saleService.delete(selectedSale.id);
      setIsDeleteModalOpen(false);
      setSelectedSale(null);
      await fetchSales();
      await fetchSummary();
      showNotification('Sale deleted successfully', 'success');
    } catch (error: any) {
      showNotification(error.message || 'Failed to delete sale', 'error');
    }
  });

  // Open delete modal
  const openDeleteModal = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDeleteModalOpen(true);
  };

  // Fetch customers for POS
  const fetchCustomers = async () => {
    try {
      const response = await customerService.getAllForDropdown();
      if (response.data && Array.isArray(response.data)) {
        setCustomers(response.data);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      setCustomers([]); // Ensure customers array is set to empty array
      showNotification('Failed to fetch customers. You can still create sales for walk-in customers.', 'warning');
    }
  };


  // Open POS modal
  const openPOSModal = async () => {
    await fetchCustomers();
    setSelectedCustomerId(0);
    setFormErrors({});
    setIsPOSModalOpen(true);
  };

  // Fetch products for edit modal
  const fetchProducts = async () => {
    try {
      const response = await productService.getAll();
      if (response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      showNotification('Failed to fetch products', 'error');
    }
  };

  // Fetch categories for edit modal
  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      if (response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      showNotification('Failed to fetch categories', 'error');
    }
  };

  // Handle edit sale
  const handleEditSale = async (sale: Sale) => {
    try {
      setLoading(true);
      setSelectedSale(sale);
      
      // Fetch products and categories
      await fetchProducts();
      await fetchCategories();
      
      // Fetch complete sale details including items
      const response = await saleService.getById(sale.id);
      
      if (response.success && response.data) {
        const saleData = response.data;
        
        // Set form fields
        setProductSearch('');
        setBarcodeInput('');
        setSelectedCategoryId(0);
        setSelectedPaymentMethod(saleData.paymentMethod || 'cash');
        
        // Convert existing sale items to the format expected by the edit modal
        const existingSaleItems = saleData.salesItems?.map(item => ({
          productId: item.productId,
          product: item.product,
          quantity: item.quantity,
          unitPrice: item.product?.price || item.unitPrice, // Use original product price
          total: item.quantity * (item.product?.price || item.unitPrice) // Recalculate total with original price
        })) || [];
        
        setSaleItems(existingSaleItems);
        setIsEditModalOpen(true);
      } else {
        showNotification(response.message || 'Failed to fetch sale details', 'error');
      }
    } catch (error) {
      showNotification('Failed to open edit modal', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Add product to sale items
  const addProductToSale = (product: Product) => {
    const existingItemIndex = saleItems.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex !== -1) {
      // Increase quantity if product already in sale items
      const newItems = [...saleItems];
      const newQuantity = newItems[existingItemIndex].quantity + 1;
      
      // Check stock availability
      if (newQuantity > product.stock) {
        showNotification(
          `Cannot add more "${product.name}". Available stock: ${product.stock}, but you're trying to add: ${newQuantity}. Please reduce the quantity or choose a different product.`,
          'warning'
        );
        return;
      }
      
      newItems[existingItemIndex].quantity = newQuantity;
      // Always use the original product price
      const originalPrice = product.price;
      newItems[existingItemIndex].unitPrice = originalPrice;
      newItems[existingItemIndex].total = newItems[existingItemIndex].quantity * originalPrice;
      setSaleItems(newItems);
    } else {
      // Check if product has stock
      if (product.stock <= 0) {
        showNotification(
          `Cannot add "${product.name}" - this product is out of stock (Available: ${product.stock}). Please choose a different product or restock this item.`,
          'warning'
        );
        return;
      }
      
      // Add new item to sale items
      setSaleItems([...saleItems, {
        productId: product.id,
        product: product,
        quantity: 1,
        unitPrice: product.price,
        total: product.price,
      }]);
    }
  };

  // Remove item from sale items
  const removeItemFromSale = (index: number) => {
    const newItems = saleItems.filter((_, i) => i !== index);
    setSaleItems(newItems);
  };

  // Update sale item quantity
  const updateSaleItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromSale(index);
      return;
    }
    
    const newItems = [...saleItems];
    const product = newItems[index].product;
    const newQuantity = Math.max(1, parseInt(quantity.toString()) || 1);
    
    // Check stock availability
    if (product && newQuantity > product.stock) {
      showNotification(
        `Cannot set quantity to ${newQuantity} for "${product.name}". Available stock: ${product.stock}. Please reduce the quantity.`,
        'warning'
      );
      return;
    }
    
    newItems[index].quantity = newQuantity;
    // Always use the original product price
    const originalPrice = newItems[index].product?.price || newItems[index].unitPrice;
    newItems[index].unitPrice = originalPrice;
    newItems[index].total = newItems[index].quantity * originalPrice;
    setSaleItems(newItems);
  };


  // Calculate total sale amount
  const calculateSaleTotal = () => {
    return saleItems.reduce((sum, item) => {
      return sum + safeParseNumber(item.total);
    }, 0);
  };

  // Handle barcode search
  const handleBarcodeSearch = () => {
    if (!barcodeInput.trim()) return;
    
    const product = products.find(p => p.barcode === barcodeInput.trim());
    if (product) {
      addProductToSale(product);
      setBarcodeInput('');
    } else {
      showNotification('Product not found with this barcode', 'warning');
    }
  };

  // Save sale changes
  const saveSaleChanges = withLoading('saveChanges', async () => {
    if (!selectedSale || saleItems.length === 0) {
      showNotification('Please add at least one item to the sale', 'warning');
      return;
    }

    // Pre-validate stock availability before sending to backend
    for (const item of saleItems) {
      if (item.product && item.quantity > item.product.stock) {
        showNotification(
          `Cannot save sale: Insufficient stock for "${item.product.name}". Available stock: ${item.product.stock}, but you have: ${item.quantity}. Please reduce the quantity or remove this item.`,
          'error'
        );
        return;
      }
    }

    try {
      const total = calculateSaleTotal();
      
      // Update sale with total and payment method
      const saleItemsData = saleItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        saleId: selectedSale.id
      }));

      const response = await saleService.update(selectedSale.id, { 
        total,
        paymentMethod: selectedPaymentMethod,
        saleItems: saleItemsData
      });
      
      if (response.success) {
        setIsEditModalOpen(false);
        await fetchSales();
        await fetchSummary();
        showNotification('Sale updated successfully', 'success');
      } else {
        // Show the specific error message from the backend
        showNotification(response.message || 'Failed to update sale', 'error');
      }
    } catch (error: any) {
      // Extract error message from API response
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update sale';
      showNotification(errorMessage, 'error');
    }
  });


  // Validate POS sale
  const validatePOSSale = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    // Customer selection is required
    if (selectedCustomerId === null || selectedCustomerId === undefined || selectedCustomerId === 0) {
      errors.customer = 'Please select a customer';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Process sale
  const processSale = withLoading('processSale', async () => {
    if (!validatePOSSale()) return;
    
    try {
      // Create sale with only customerId
      const saleData: CreateSale = {
        customerId: selectedCustomerId,
      };
      
      await saleService.create(saleData);
      setIsPOSModalOpen(false);
      await fetchSales();
      await fetchSummary();
      showNotification(`Sale created successfully!`, 'success');
    } catch (error: any) {
      showNotification(error.message || 'Failed to process sale', 'error');
    }
  });


  // Update button click handler
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Update button click to use openPOSModal
  const handleNewSaleClick = () => {
    openPOSModal();
  };

  // Custom toolbar component with export functionality
  const CustomToolbar = () => (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      {hasAdminAccess() && (
        <GridToolbarExport 
          csvOptions={{
            fileName: `sales-export-${new Date().toISOString().split('T')[0]}`,
            delimiter: ',',
            utf8WithBom: true,
          }}
          printOptions={{
            hideFooter: true,
            hideToolbar: true,
          }}
        />
      )}
      <GridToolbarQuickFilter />
    </GridToolbarContainer>
  );

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Sale ID',
      width: 100,
      sortable: true,
      valueGetter: (params) => `${params.value}`,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          #{params.value}
        </Typography>
      ),
    },
    {
      field: 'customer',
      headerName: 'Customer',
      flex: 1,
      minWidth: 180,
      sortable: false,
      valueGetter: (params) => params.row.customer?.fullName || 'Unknown Customer',
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <PersonIcon color="primary" />
          <Typography variant="body2">
            {params.row.customer?.fullName || 'Unknown Customer'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'total',
      headerName: 'Total Amount',
      width: 130,
      sortable: true,
      valueGetter: (params) => formatCurrency(params.value),
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <MoneyIcon color="success" />
          <Typography variant="body2" fontWeight="medium">
            {formatCurrency(params.value)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'paymentMethod',
      headerName: 'Payment',
      width: 120,
      sortable: true,
      valueGetter: (params) => {
        const value = params.value;
        return (value && typeof value === 'string') ? value.toUpperCase() : 'UNKNOWN';
      },
      renderCell: (params) => {
        const value = params.value;
        const displayValue = (value && typeof value === 'string') ? value : 'unknown';
        return (
          <Chip
            label={displayValue.toUpperCase()}
            color={getPaymentMethodColor(displayValue)}
            size="small"
            icon={<PaymentIcon />}
          />
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      sortable: true,
      valueGetter: (params) => {
        const value = params.value;
        return (value && typeof value === 'string') ? value.toUpperCase() : 'UNKNOWN';
      },
      renderCell: (params) => {
        const value = params.value;
        const displayValue = (value && typeof value === 'string') ? value : 'unknown';
        return (
          <Chip
            label={displayValue.toUpperCase()}
            color={getStatusColor(displayValue)}
            size="small"
          />
        );
      },
    },
    {
      field: 'user',
      headerName: 'Cashier',
      width: 150,
      sortable: false,
      valueGetter: (params) => params.row.user?.fullName || 'Unknown User',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.user?.fullName || 'Unknown User'}
        </Typography>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Date',
      width: 120,
      sortable: true,
      valueGetter: (params) => new Date(params.value).toLocaleDateString(),
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <CalendarIcon color="action" />
          <Typography variant="body2">
            {new Date(params.value).toLocaleDateString()}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      filterable: false,
      disableExport: true,
      getActions: (params) => {
        const actions = [
          <GridActionsCellItem
            icon={<ViewIcon />}
            label="View Details"
            onClick={() => handleViewSale(params.row)}
            color="primary"
          />,
        ];

        if (params.row.status === 'pending') {
          actions.push(
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Edit"
              onClick={() => handleEditSale(params.row)}
              color="info"
            />,
            <GridActionsCellItem
              icon={<CompleteIcon />}
              label="Complete"
              onClick={() => handleCompleteSale(params.row)}
              color="success"
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              onClick={() => handleCancelSale(params.row)}
              color="warning"
            />
          );
        }

        actions.push(
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => openDeleteModal(params.row)}
            color="error"
          />
        );

        return actions;
      },
    },
  ];

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Sales Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewSaleClick}
          size="large"
        >
          New Sale
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <ReceiptIcon color="primary" fontSize="large" />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {hasCashierAccess() ? 'My Sales' : 'Total Sales'}
                  </Typography>
                  <Typography variant="h4" component="div">
                    {summary.totalSales || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <MoneyIcon color="success" fontSize="large" />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {hasCashierAccess() ? 'My Revenue' : 'Total Revenue'}
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatCurrency(summary.totalAmount || 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUpIcon color="info" fontSize="large" />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {hasCashierAccess() ? 'My Avg Sale' : 'Average Sale'}
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatCurrency(summary.averageAmount || 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CartIcon color="warning" fontSize="large" />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Selected
                  </Typography>
                  <Typography variant="h4" component="div">
                    {selectedRows.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Products Card */}
      {summary.topProducts.length > 0 && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {hasCashierAccess() ? 'My Top Products' : 'Top Selling Products'}
                </Typography>
                <List dense>
                  {summary.topProducts.slice(0, 5).map((product, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={product.product}
                        secondary={`Qty: ${product.quantity || 0} | Revenue: ${formatCurrency(product.revenue || 0)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              placeholder="Search sales..."
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
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            
            {selectedRows.length > 0 && (
              <Tooltip title={`Delete ${selectedRows.length} selected sale${selectedRows.length > 1 ? 's' : ''}`}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleClearSelection}
                  size="medium"
                  disabled={isLoading('bulkDelete')}
                >
                  {isLoading('bulkDelete') ? 'Deleting...' : `Delete Selected (${selectedRows.length})`}
                </Button>
              </Tooltip>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Card>
        <Box height={600}>
          <DataGrid
            rows={sales}
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
            slots={{ toolbar: CustomToolbar }}
            sx={{
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          />
        </Box>
      </Card>

      {/* POS Sale Creation Modal */}
      <Dialog 
        open={isPOSModalOpen} 
        onClose={() => {
          setIsPOSModalOpen(false);
          setSelectedCustomerId(0);
          setFormErrors({});
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <CartIcon />
            Create New Sale
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box display="flex" flexDirection="column" gap={3} maxWidth="md" mx="auto">
            {/* Customer Selection */}
            <FormControl fullWidth error={!!formErrors.customer}>
              <InputLabel>Select Customer *</InputLabel>
              <Select
                value={selectedCustomerId}
                label="Select Customer *"
                onChange={(e) => setSelectedCustomerId(e.target.value as number)}
              >
                {customers.length === 0 ? (
                  <MenuItem disabled>
                    <Typography variant="body2" color="textSecondary">
                      No customers available
                    </Typography>
                  </MenuItem>
                ) : (
                  customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {customer.fullName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {customer.email} | {customer.phone}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
              {formErrors.customer && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {formErrors.customer}
                </Typography>
              )}
            </FormControl>

            <Alert severity="info">
              <Typography variant="body2">
                This will create a new sale for the selected customer. You can add items and complete the sale later.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button 
            onClick={() => {
              setIsPOSModalOpen(false);
              setSelectedCustomerId(0);
              setFormErrors({});
            }}
            size="large"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={processSale}
            disabled={isLoading('processSale')}
            startIcon={<AddIcon />}
          >
            {isLoading('processSale') ? 'Creating...' : 'Create Sale'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Sale Modal */}
      <Dialog 
        open={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSale(null);
          setSaleItems([]);
          setProductSearch('');
          setBarcodeInput('');
          setSelectedCategoryId(0);
          setSelectedPaymentMethod('cash');
        }}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <EditIcon />
              Edit Sale #{selectedSale?.id}
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Chip
                label={`Items: ${saleItems.length}`}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`Total: ${formatCurrency(calculateSaleTotal())}`}
                color="success"
                variant="filled"
              />
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Grid container sx={{ height: '100%' }}>
            {/* Left Panel - Product Selection */}
            <Grid item xs={12} md={7} sx={{ p: 3, borderRight: 1, borderColor: 'divider' }}>
              <Box display="flex" flexDirection="column" gap={3} height="100%">
                {/* Search Bar */}
                <TextField
                  fullWidth
                  label="Search Products (Name)"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Type to search products..."
                />

                {/* Barcode Input */}
                <TextField
                  fullWidth
                  label="Barcode Scanner"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleBarcodeSearch();
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="contained"
                          onClick={handleBarcodeSearch}
                          disabled={!barcodeInput.trim()}
                        >
                          Add
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Scan or enter barcode..."
                />

                {/* Category Filter */}
                <FormControl fullWidth>
                  <InputLabel>Filter by Category</InputLabel>
                  <Select
                    value={selectedCategoryId}
                    label="Filter by Category"
                    onChange={(e) => setSelectedCategoryId(e.target.value as number)}
                  >
                    <MenuItem value={0}>
                      <Typography variant="body2" color="textSecondary">
                        All Categories
                      </Typography>
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Products Grid */}
                <Box flex={1} overflow="auto">
                  <Typography variant="h6" gutterBottom>
                    Products
                  </Typography>
                  <Grid container spacing={2}>
                    {products
                      .filter(product => {
                        const matchesSearch = productSearch === '' ||
                          product.name.toLowerCase().includes(productSearch.toLowerCase());
                        const matchesCategory = selectedCategoryId === 0 ||
                          product.categoryId === selectedCategoryId;
                        return matchesSearch && matchesCategory;
                      })
                      .slice(0, 20) // Limit to first 20 results
                      .map((product) => (
                        <Grid item xs={12} sm={6} lg={4} key={product.id}>
                          <Card 
                            sx={{ 
                              cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                              opacity: product.stock > 0 ? 1 : 0.6,
                              '&:hover': product.stock > 0 ? { 
                                boxShadow: 4,
                                transform: 'translateY(-2px)',
                                transition: 'all 0.2s ease-in-out'
                              } : {}
                            }}
                            onClick={() => addProductToSale(product)}
                          >
                            <CardContent sx={{ p: 2 }}>
                              <Typography variant="body2" fontWeight="medium" noWrap>
                                {product.name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary" display="block">
                                {product.barcode}
                              </Typography>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                                <Typography variant="h6" color="primary">
                                  {formatCurrency(product.price)}
                                </Typography>
                                <Chip
                                  label={product.stock > 0 ? `Stock: ${product.stock}` : 'Out of Stock'}
                                  size="small"
                                  color={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'}
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                  </Grid>
                </Box>
              </Box>
            </Grid>

            {/* Right Panel - Sale Items */}
            <Grid item xs={12} md={5} sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Box display="flex" flexDirection="column" gap={3} height="100%">
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Sale Items</Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => setSaleItems([])}
                    disabled={saleItems.length === 0}
                  >
                    Clear All
                  </Button>
                </Box>

                {/* Sale Items */}
                <Box flex={1} overflow="auto">
                  {saleItems.length === 0 ? (
                    <Box textAlign="center" py={4}>
                      <CartIcon color="disabled" sx={{ fontSize: 64, mb: 2 }} />
                      <Typography color="textSecondary">
                        No items added. Add products to get started.
                      </Typography>
                    </Box>
                  ) : (
                    <List sx={{ p: 0 }}>
                      {saleItems.map((item, index) => (
                        <Paper key={index} variant="outlined" sx={{ mb: 2 }}>
                          <ListItem sx={{ flexDirection: 'column', alignItems: 'stretch', p: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="body2" fontWeight="medium" flex={1}>
                                {item.product?.name}
                              </Typography>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeItemFromSale(index)}
                              >
                                <RemoveIcon />
                              </IconButton>
                            </Box>
                            
                            <Grid container spacing={1} alignItems="center">
                              <Grid item xs={4}>
                                <TextField
                                  label="Qty"
                                  type="number"
                                  size="small"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value) || 1;
                                    updateSaleItemQuantity(index, value);
                                  }}
                                  inputProps={{ min: 1 }}
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <TextField
                                  label="Price"
                                  type="number"
                                  size="small"
                                  value={item.product?.price || item.unitPrice}
                                  disabled
                                  InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                  }}
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <TextField
                                  label="Total"
                                  value={formatCurrency(item.total)}
                                  size="small"
                                  disabled
                                  fullWidth
                                />
                              </Grid>
                            </Grid>
                          </ListItem>
                        </Paper>
                      ))}
                    </List>
                  )}
                </Box>

                {/* Total and Save */}
                {saleItems.length > 0 && (
                  <Box>
                    {/* Payment Method Selection */}
                    <Box mb={2}>
                      <Typography variant="subtitle1" gutterBottom>
                        Payment Method
                      </Typography>
                      <Box display="flex" gap={1}>
                        <Button
                          variant={selectedPaymentMethod === 'cash' ? 'contained' : 'outlined'}
                          color="success"
                          size="medium"
                          onClick={() => setSelectedPaymentMethod('cash')}
                          fullWidth
                        >
                          Cash
                        </Button>
                        <Button
                          variant={selectedPaymentMethod === 'card' ? 'contained' : 'outlined'}
                          color="primary"
                          size="medium"
                          onClick={() => setSelectedPaymentMethod('card')}
                          fullWidth
                        >
                          Card
                        </Button>
                        <Button
                          variant={selectedPaymentMethod === 'mixed' ? 'contained' : 'outlined'}
                          color="warning"
                          size="medium"
                          onClick={() => setSelectedPaymentMethod('mixed')}
                          fullWidth
                        >
                          Mixed
                        </Button>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h5">Total:</Typography>
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        {formatCurrency(calculateSaleTotal())}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      color="success"
                      size="large"
                      fullWidth
                      onClick={saveSaleChanges}
                      disabled={isLoading('saveChanges') || saleItems.length === 0}
                      startIcon={<EditIcon />}
                    >
                      {isLoading('saveChanges') ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button 
            onClick={() => {
              setIsEditModalOpen(false);
              setSelectedSale(null);
              setSaleItems([]);
              setProductSearch('');
              setBarcodeInput('');
              setSelectedCategoryId(0);
              setSelectedPaymentMethod('cash');
            }}
            size="large"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sale Details Modal */}
      <Dialog 
        open={isViewModalOpen} 
        onClose={() => {
          setIsViewModalOpen(false);
          setSaleDetails(null);
          setSelectedSale(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <ReceiptIcon />
            Sale Details - #{selectedSale?.id}
          </Box>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <Typography>Loading sale details...</Typography>
            </Box>
          ) : saleDetails ? (
            <Box>
              {/* Sale Information */}
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Customer
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {saleDetails.customer?.fullName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Cashier
                  </Typography>
                  <Typography variant="body1">
                    {saleDetails.user?.fullName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Payment Method
                  </Typography>
                  <Chip
                    label={saleDetails.paymentMethod.toUpperCase()}
                    color={getPaymentMethodColor(saleDetails.paymentMethod)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={saleDetails.status.toUpperCase()}
                    color={getStatusColor(saleDetails.status)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(saleDetails.createdAt).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {formatCurrency(saleDetails.total)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Sales Items
                  </Typography>
                  <List>
                    {saleDetails.salesItems?.map((item) => (
                      <ListItem key={item.id}>
                        <ListItemText
                          primary={item.product?.name}
                          secondary={`Qty: ${item.quantity} | Price: ${formatCurrency(item.unitPrice)} | Total: ${formatCurrency(item.total)}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>

            </Box>
          ) : (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="200px" gap={2}>
              <Typography color="textSecondary">No sale details available</Typography>
              <Typography variant="caption" color="textSecondary">
                Debug: saleDetails = {JSON.stringify(saleDetails)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setIsViewModalOpen(false);
              setSaleDetails(null);
              setSelectedSale(null);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog 
        open={isDeleteModalOpen} 
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSale(null);
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete sale #{selectedSale?.id}? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setIsDeleteModalOpen(false);
              setSelectedSale(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteSale}
            disabled={isLoading('delete')}
          >
            {isLoading('delete') ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Sales;