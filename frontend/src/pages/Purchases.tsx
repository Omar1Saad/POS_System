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
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  CheckCircle as CompleteIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  LocalShipping as ShippingIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  ShoppingBasket as BasketIcon,
  Remove as RemoveIcon,
  AddCircle as AddCircleIcon,
} from '@mui/icons-material';
import { Purchase, PurchaseItem, Supplier, Product, CreatePurchase, CreatePurchaseItem, Category } from '@/types';
import { purchaseService } from '@/services/purchases';
import { supplierService } from '@/services/suppliers';
import { productService } from '@/services/products';
import { categoryService } from '@/services/categories';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useButtonLoading } from '@/hooks/useButtonLoading';

const Purchases: React.FC = () => {
  // Role access
  const { hasAdminAccess } = useRoleAccess();
  const { isLoading, withLoading } = useButtonLoading();
  
  // State for purchases data
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // State for modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [purchaseDetails, setPurchaseDetails] = useState<(Purchase & { purchaseItems?: PurchaseItem[] }) | null>(null);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);

  // State for purchase order creation
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(0);
  const [orderItems, setOrderItems] = useState<Array<{
    productId: number;
    product?: Product;
    quantity: number;
    unitCost: number;
    total: number;
  }>>([]);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // State for edit modal
  const [categories, setCategories] = useState<Category[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [purchaseItems, setPurchaseItems] = useState<Array<{
    productId: number;
    product?: Product;
    quantity: number;
    unitCost: number;
    total: number;
  }>>([]);

  // State for summary data
  const [summary, setSummary] = useState({
    totalPurchases: 0,
    totalAmount: 0,
    averageAmount: 0,
    topSuppliers: [] as Array<{ supplier: string; orders: number; amount: number }>,
  });

  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Fetch purchases data
  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await purchaseService.getAll(page, pageSize, searchTerm, statusFilter);
      setPurchases(response.data);
      setTotalCount(response.total);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      showNotification('Failed to fetch purchases', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch summary data
  const fetchSummary = async () => {
    try {
      const response = await purchaseService.getSummary('month');
      if (response.data) {
        // Ensure all numeric values are properly handled to prevent NaN
        const safeSummary = {
          totalPurchases: Number(response.data.totalPurchases) || 0,
          totalAmount: Number(response.data.totalAmount) || 0,
          averageAmount: Number(response.data.averageAmount) || 0,
          topSuppliers: response.data.topSuppliers || []
        };
        setSummary(safeSummary);
      }
    } catch (error) {
      // Set default values on error to prevent NaN display
      setSummary({
        totalPurchases: 0,
        totalAmount: 0,
        averageAmount: 0,
        topSuppliers: []
      });
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchPurchases();
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
    const response = await purchaseService.deleteBulk(selectedRows as number[]);
    if (response.success) {
      showNotification('Purchases deleted successfully', 'success');
      await fetchPurchases();
      await fetchSummary();
    } else {
      showNotification(response.message || 'Failed to delete purchases', 'error');
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format data for export
  const formatDataForExport = (data: Purchase[]) => {
    return data.map(purchase => ({
      'Purchase ID': `#${purchase.id}`,
      'Supplier': purchase.supplier?.name || 'Unknown Supplier',
      'Total Amount': formatCurrency(purchase.total),
      'Status': (purchase.status && typeof purchase.status === 'string') ? purchase.status.toUpperCase() : 'UNKNOWN',
      'Ordered By': purchase.user?.fullName || 'Unknown User',
      'Order Date': new Date(purchase.createdAt).toLocaleDateString(),
      'Supplier Email': purchase.supplier?.email || '',
      'Supplier Phone': purchase.supplier?.phone || '',
      'Supplier Address': purchase.supplier?.address || '',
    }));
  };

  // Custom toolbar with export functionality
  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        {hasAdminAccess() && (
          <GridToolbarExport
            csvOptions={{
              fileName: `purchases-${new Date().toISOString().split('T')[0]}`,
              delimiter: ',',
              utf8WithBom: true,
            }}
            printOptions={{
              hideFooter: true,
              hideToolbar: true,
            }}
            slotProps={{
              tooltip: { title: 'Export purchases data' },
            }}
          />
        )}
      </GridToolbarContainer>
    );
  };

  // Handle view purchase details
  const handleViewPurchase = async (purchase: Purchase) => {
    try {
      setLoading(true);
      const response = await purchaseService.getById(purchase.id);
      
      if (response.success && response.data) {
        setPurchaseDetails(response.data as any);
        setSelectedPurchase(purchase);
        setIsViewModalOpen(true);
      } else {
        showNotification(response.message || 'Failed to fetch purchase details', 'error');
      }
    } catch (error: any) {
      showNotification(error.message || 'Failed to fetch purchase details', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle complete purchase
  const handleCompletePurchase = withLoading('complete', async (purchase: Purchase) => {
    try {
      const response = await purchaseService.complete(purchase.id);
      
      if (response.success) {
        await fetchPurchases();
        await fetchSummary();
        showNotification('Purchase completed successfully', 'success');
      } else {
        showNotification(response.message || 'Failed to complete purchase', 'error');
      }
    } catch (error: any) {
      showNotification(error.message || 'Failed to complete purchase', 'error');
    }
  });

  // Handle cancel purchase
  const handleCancelPurchase = withLoading('cancel', async (purchase: Purchase) => {
    try {
      const response = await purchaseService.cancel(purchase.id);
      
      if (response.success) {
        await fetchPurchases();
        await fetchSummary();
        showNotification('Purchase cancelled successfully', 'success');
      } else {
        showNotification(response.message || 'Failed to cancel purchase', 'error');
      }
    } catch (error: any) {
      showNotification(error.message || 'Failed to cancel purchase', 'error');
    }
  });

  // Handle delete purchase
  const handleDeletePurchase = withLoading('delete', async () => {
    if (!selectedPurchase) return;

    try {
      const response = await purchaseService.delete(selectedPurchase.id);
      
      if (response.success) {
        setIsDeleteModalOpen(false);
        setSelectedPurchase(null);
        await fetchPurchases();
        await fetchSummary();
        showNotification('Purchase deleted successfully', 'success');
      } else {
        showNotification(response.message || 'Failed to delete purchase', 'error');
      }
    } catch (error: any) {
      showNotification(error.message || 'Failed to delete purchase', 'error');
    }
  });

  // Open delete modal
  const openDeleteModal = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsDeleteModalOpen(true);
  };

  // Handle edit purchase
  const handleEditPurchase = async (purchase: Purchase) => {
    try {
      setLoading(true);
      setSelectedPurchase(purchase);
      
      // Fetch products and categories
      await fetchProducts();
      await fetchCategories();
      
      // Fetch complete purchase details including items
      const response = await purchaseService.getById(purchase.id);
      
      if (response.success && response.data) {
        const purchaseData = response.data;
        
        // Set form fields
        setProductSearch('');
        setBarcodeInput('');
        setSelectedCategoryId(0);
        
        // Convert existing purchase items to the format expected by the edit modal
        const existingPurchaseItems = (purchaseData as any).purchaseItems?.map((item: PurchaseItem) => ({
          productId: item.productId,
          product: item.product,
          quantity: item.quantity,
          unitCost: item.unitCost,
          total: item.total
        })) || [];
        
        setPurchaseItems(existingPurchaseItems);
        setIsEditModalOpen(true);
      } else {
        showNotification(response.message || 'Failed to fetch purchase details', 'error');
      }
    } catch (error) {
      showNotification('Failed to open edit modal', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch suppliers for purchase order creation
  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getAllForDropdown();
      setSuppliers(response.data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      showNotification('Failed to fetch suppliers', 'error');
    }
  };

  // Fetch products for purchase order creation
  const fetchProducts = async () => {
    try {
      const response = await productService.getAllForDropdown();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
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

  // Open create purchase order modal
  const openCreateModal = async () => {
    await fetchSuppliers();
    await fetchProducts();
    setSelectedSupplierId(0);
    setOrderItems([]);
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  // Add item to purchase order
  const addOrderItem = () => {
    setOrderItems([...orderItems, {
      productId: 0,
      quantity: 1,
      unitCost: 0,
      total: 0,
    }]);
  };

  // Remove item from purchase order
  const removeOrderItem = (index: number) => {
    const newItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newItems);
  };

  // Update order item
  const updateOrderItem = (index: number, field: string, value: any) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // If product is selected, update product info and calculate total
    if (field === 'productId') {
      const selectedProduct = products.find(p => p.id === value);
      newItems[index].product = selectedProduct;
      newItems[index].unitCost = selectedProduct?.price || 0;
      // Recalculate total when product is selected
      newItems[index].total = newItems[index].quantity * newItems[index].unitCost;
    }
    
    // Calculate total when quantity or unit cost changes
    if (field === 'quantity' || field === 'unitCost') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitCost;
    }
    
    setOrderItems(newItems);
  };

  // Calculate total purchase amount
  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      const itemTotal = typeof item.total === 'number' ? item.total : parseFloat(item.total) || 0;
      return sum + itemTotal;
    }, 0);
  };

  // Validate purchase order form
  const validatePurchaseOrder = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!selectedSupplierId) {
      errors.supplier = 'Please select a supplier';
    }
    
    if (orderItems.length === 0) {
      errors.items = 'Please add at least one item';
    }
    
    orderItems.forEach((item, index) => {
      if (!item.productId) {
        errors[`item_${index}_product`] = 'Please select a product';
      }
      if (item.quantity <= 0) {
        errors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (item.unitCost <= 0) {
        errors[`item_${index}_cost`] = 'Unit cost must be greater than 0';
      }
    });
    
    // Check if total purchase amount is zero
    const totalAmount = calculateTotal();
    if (totalAmount <= 0) {
      errors.total = 'Total purchase amount must be greater than $0.00';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle create purchase order
  const handleCreatePurchaseOrder = async () => {
    if (!validatePurchaseOrder()) return;
    
    try {
      setLoading(true);
      const purchaseData: CreatePurchase = {
        total: calculateTotal(),
        supplierId: selectedSupplierId,
        userId: 1, // Current user ID (in real app, get from auth context)
        status: 'pending',
      };
      
      const response = await purchaseService.create(purchaseData);
      
      if (response.success && response.data) {
        // If we have items, we need to add them via the purchase items API
        if (orderItems.length > 0) {
          const purchaseItemsData = orderItems.map(item => ({
            purchaseId: response.data!.id,
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
          }));
          
          // Update the purchase with items
          await purchaseService.update(response.data.id, {
            total: calculateTotal(),
            purchaseItems: purchaseItemsData
          });
        }
        
        setIsCreateModalOpen(false);
        await fetchPurchases();
        await fetchSummary();
        showNotification('Purchase order created successfully', 'success');
      } else {
        showNotification(response.message || 'Failed to create purchase order', 'error');
      }
    } catch (error: any) {
      showNotification(error.message || 'Failed to create purchase order', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Add product to purchase items
  const addProductToPurchase = (product: Product) => {
    const existingItemIndex = purchaseItems.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex !== -1) {
      // Increase quantity if product already in purchase items
      const newItems = [...purchaseItems];
      const newQuantity = newItems[existingItemIndex].quantity + 1;
      
      newItems[existingItemIndex].quantity = newQuantity;
      newItems[existingItemIndex].total = newItems[existingItemIndex].quantity * newItems[existingItemIndex].unitCost;
      setPurchaseItems(newItems);
    } else {
      // Add new item to purchase items
      setPurchaseItems([...purchaseItems, {
        productId: product.id,
        product: product,
        quantity: 1,
        unitCost: product.price || 0,
        total: product.price || 0,
      }]);
    }
  };

  // Remove item from purchase items
  const removeItemFromPurchase = (index: number) => {
    const newItems = purchaseItems.filter((_, i) => i !== index);
    setPurchaseItems(newItems);
  };

  // Update purchase item quantity
  const updatePurchaseItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromPurchase(index);
      return;
    }
    
    const newItems = [...purchaseItems];
    const newQuantity = Math.max(1, parseInt(quantity.toString()) || 1);
    
    newItems[index].quantity = newQuantity;
    newItems[index].total = newItems[index].quantity * newItems[index].unitCost;
    setPurchaseItems(newItems);
  };

  // Update purchase item unit cost
  const updatePurchaseItemUnitCost = (index: number, unitCost: number) => {
    const newItems = [...purchaseItems];
    newItems[index].unitCost = unitCost;
    newItems[index].total = newItems[index].quantity * unitCost;
    setPurchaseItems(newItems);
  };

  // Calculate total purchase amount
  const calculatePurchaseTotal = () => {
    return purchaseItems.reduce((sum, item) => {
      const itemTotal = typeof item.total === 'number' ? item.total : parseFloat(item.total) || 0;
      return sum + itemTotal;
    }, 0);
  };

  // Handle barcode search
  const handleBarcodeSearch = () => {
    if (!barcodeInput.trim()) return;
    
    const product = products.find(p => p.barcode === barcodeInput.trim());
    if (product) {
      addProductToPurchase(product);
      setBarcodeInput('');
    } else {
      showNotification('Product not found with this barcode', 'warning');
    }
  };

  // Save purchase changes
  const savePurchaseChanges = async () => {
    if (!selectedPurchase || purchaseItems.length === 0) {
      showNotification('Please add at least one item to the purchase', 'warning');
      return;
    }

    try {
      setLoading(true);
      const total = calculatePurchaseTotal();
      
      // Update purchase with total and items
      const purchaseItemsData = purchaseItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost
        // Remove purchaseId as it's not needed in the request
      }));

      const response = await purchaseService.update(selectedPurchase.id, { 
        total,
        purchaseItems: purchaseItemsData
      });
      
      if (response.success) {
        setIsEditModalOpen(false);
        await fetchPurchases();
        await fetchSummary();
        showNotification('Purchase updated successfully', 'success');
      } else {
        showNotification(response.message || 'Failed to update purchase', 'error');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update purchase';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load suppliers and products when component mounts
  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, []);

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Purchase ID',
      width: 120,
      sortable: true,
      valueGetter: (params) => `#${params.value}`,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'supplier',
      headerName: 'Supplier',
      flex: 1,
      minWidth: 200,
      sortable: false,
      valueGetter: (params) => params.row.supplier?.name || 'Unknown Supplier',
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <BusinessIcon color="primary" />
          <Typography variant="body2">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'total',
      headerName: 'Total Amount',
      width: 140,
      sortable: true,
      valueGetter: (params) => formatCurrency(params.value),
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <MoneyIcon color="success" />
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
        </Box>
      ),
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
            icon={<ShippingIcon />}
          />
        );
      },
    },
    {
      field: 'user',
      headerName: 'Ordered By',
      width: 150,
      sortable: false,
      valueGetter: (params) => params.row.user?.fullName || 'Unknown User',
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <PersonIcon color="action" />
          <Typography variant="body2">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Order Date',
      width: 130,
      sortable: true,
      valueGetter: (params) => new Date(params.value).toLocaleDateString(),
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <CalendarIcon color="action" />
          <Typography variant="body2">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'supplierEmail',
      headerName: 'Supplier Email',
      width: 150,
      sortable: false,
      valueGetter: (params) => params.row.supplier?.email || '',
      hideable: false,
    },
    {
      field: 'supplierPhone',
      headerName: 'Supplier Phone',
      width: 130,
      sortable: false,
      valueGetter: (params) => params.row.supplier?.phone || '',
      hideable: false,
    },
    {
      field: 'supplierAddress',
      headerName: 'Supplier Address',
      width: 200,
      sortable: false,
      valueGetter: (params) => params.row.supplier?.address || '',
      hideable: false,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 180,
      getActions: (params) => {
        const actions = [
          <GridActionsCellItem
            icon={<ViewIcon />}
            label="View Details"
            onClick={() => handleViewPurchase(params.row)}
            color="primary"
          />,
        ];

        if (params.row.status === 'pending') {
          actions.push(
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Edit"
              onClick={() => handleEditPurchase(params.row)}
              color="info"
            />,
            <GridActionsCellItem
              icon={<CompleteIcon />}
              label="Receive"
              onClick={() => handleCompletePurchase(params.row)}
              color="success"
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              onClick={() => handleCancelPurchase(params.row)}
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
          Purchase Management
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <ShippingIcon color="primary" fontSize="large" />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Orders
                  </Typography>
                  <Typography variant="h4" component="div">
                    {summary.totalPurchases}
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
                <MoneyIcon color="error" fontSize="large" />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Spent
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatCurrency(summary.totalAmount)}
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
                    Average Order
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatCurrency(summary.averageAmount)}
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
                <InventoryIcon color="warning" fontSize="large" />
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

      {/* Top Suppliers Card */}
      {summary.topSuppliers.length > 0 && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Suppliers by Volume
                </Typography>
                <List dense>
                  {summary.topSuppliers.slice(0, 5).map((supplier, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={supplier.supplier}
                        secondary={`Orders: ${supplier.orders} | Total: ${formatCurrency(supplier.amount)}`}
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
              placeholder="Search purchases..."
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
                <MenuItem value="completed">Received</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            
            {selectedRows.length > 0 && (
              <Tooltip title={`Delete ${selectedRows.length} selected purchase${selectedRows.length > 1 ? 's' : ''}`}>
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
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateModal}
              size="large"
              sx={{ ml: 'auto' }}
            >
              New Purchase Order
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Card>
        <Box height={600}>
          <DataGrid
            rows={purchases}
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

      {/* Create Purchase Order Modal */}
      <Dialog 
        open={isCreateModalOpen} 
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedSupplierId(0);
          setOrderItems([]);
          setFormErrors({});
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <AddIcon />
            Create New Purchase Order
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} pt={1}>
            {/* Supplier Selection */}
            <FormControl fullWidth error={!!formErrors.supplier}>
              <InputLabel>Select Supplier *</InputLabel>
              <Select
                value={selectedSupplierId}
                label="Select Supplier *"
                onChange={(e) => setSelectedSupplierId(e.target.value as number)}
              >
                <MenuItem value={0}>Select a supplier...</MenuItem>
                {suppliers.map((supplier) => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {supplier.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {supplier.email} | {supplier.phone}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {formErrors.supplier && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {formErrors.supplier}
                </Typography>
              )}
            </FormControl>

            {/* Order Items */}
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Order Items</Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddCircleIcon />}
                  onClick={addOrderItem}
                  size="small"
                >
                  Add Item
                </Button>
              </Box>

              {formErrors.items && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {formErrors.items}
                </Alert>
              )}

              {orderItems.map((item, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth error={!!formErrors[`item_${index}_product`]}>
                        <InputLabel>Product *</InputLabel>
                        <Select
                          value={item.productId}
                          label="Product *"
                          onChange={(e) => updateOrderItem(index, 'productId', e.target.value)}
                        >
                          <MenuItem value={0}>Select product...</MenuItem>
                          {products.map((product) => (
                            <MenuItem key={product.id} value={product.id}>
                              <Box>
                                <Typography variant="body2">{product.name}</Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {product.barcode} | ${product.price}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                        {formErrors[`item_${index}_product`] && (
                          <Typography variant="caption" color="error">
                            {formErrors[`item_${index}_product`]}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>

                    <Grid item xs={6} sm={2}>
                      <TextField
                        label="Quantity *"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        error={!!formErrors[`item_${index}_quantity`]}
                        helperText={formErrors[`item_${index}_quantity`]}
                        fullWidth
                        inputProps={{ min: 1 }}
                      />
                    </Grid>

                    <Grid item xs={6} sm={2}>
                      <TextField
                        label="Unit Cost *"
                        type="number"
                        value={item.unitCost}
                        onChange={(e) => updateOrderItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                        error={!!formErrors[`item_${index}_cost`]}
                        helperText={formErrors[`item_${index}_cost`]}
                        fullWidth
                        inputProps={{ min: 0, step: 0.01 }}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                      />
                    </Grid>

                    <Grid item xs={8} sm={3}>
                      <TextField
                        label="Total"
                        value={`$${item.total.toFixed(2)}`}
                        fullWidth
                        disabled
                        variant="outlined"
                      />
                    </Grid>

                    <Grid item xs={4} sm={1}>
                      <IconButton
                        color="error"
                        onClick={() => removeOrderItem(index)}
                        disabled={orderItems.length === 1}
                      >
                        <RemoveIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}

              {orderItems.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography color="textSecondary" gutterBottom>
                    No items added yet
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddCircleIcon />}
                    onClick={addOrderItem}
                  >
                    Add First Item
                  </Button>
                </Box>
              )}
            </Box>

            {/* Order Summary */}
            {orderItems.length > 0 && (
              <Box>
                <Divider sx={{ my: 2 }} />
                {formErrors.total && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {formErrors.total}
                  </Alert>
                )}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Total Amount:</Typography>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    ${calculateTotal().toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setIsCreateModalOpen(false);
              setSelectedSupplierId(0);
              setOrderItems([]);
              setFormErrors({});
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreatePurchaseOrder}
            disabled={loading || orderItems.length === 0}
            startIcon={<AddIcon />}
          >
            Create Purchase Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Purchase Modal */}
      <Dialog 
        open={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPurchase(null);
          setPurchaseItems([]);
          setProductSearch('');
          setBarcodeInput('');
          setSelectedCategoryId(0);
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
              Edit Purchase #{selectedPurchase?.id}
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Chip
                label={`Items: ${purchaseItems.length}`}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`Total: ${formatCurrency(calculatePurchaseTotal())}`}
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
                              cursor: 'pointer',
                              '&:hover': { 
                                boxShadow: 4,
                                transform: 'translateY(-2px)',
                                transition: 'all 0.2s ease-in-out'
                              }
                            }}
                            onClick={() => addProductToPurchase(product)}
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
                                  label={`Stock: ${product.stock}`}
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

            {/* Right Panel - Purchase Items */}
            <Grid item xs={12} md={5} sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Box display="flex" flexDirection="column" gap={3} height="100%">
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Purchase Items</Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => setPurchaseItems([])}
                    disabled={purchaseItems.length === 0}
                  >
                    Clear All
                  </Button>
                </Box>

                {/* Purchase Items */}
                <Box flex={1} overflow="auto">
                  {purchaseItems.length === 0 ? (
                    <Box textAlign="center" py={4}>
                      <BasketIcon color="disabled" sx={{ fontSize: 64, mb: 2 }} />
                      <Typography color="textSecondary">
                        No items added. Add products to get started.
                      </Typography>
                    </Box>
                  ) : (
                    <List sx={{ p: 0 }}>
                      {purchaseItems.map((item, index) => (
                        <Paper key={index} variant="outlined" sx={{ mb: 2 }}>
                          <ListItem sx={{ flexDirection: 'column', alignItems: 'stretch', p: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="body2" fontWeight="medium" flex={1}>
                                {item.product?.name}
                              </Typography>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeItemFromPurchase(index)}
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
                                    updatePurchaseItemQuantity(index, value);
                                  }}
                                  inputProps={{ min: 1 }}
                                  fullWidth
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <TextField
                                  label="Unit Cost"
                                  type="number"
                                  size="small"
                                  value={item.unitCost}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 0;
                                    updatePurchaseItemUnitCost(index, value);
                                  }}
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
                {purchaseItems.length > 0 && (
                  <Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h5">Total:</Typography>
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        {formatCurrency(calculatePurchaseTotal())}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      color="success"
                      size="large"
                      fullWidth
                      onClick={savePurchaseChanges}
                      disabled={loading || purchaseItems.length === 0}
                      startIcon={<EditIcon />}
                    >
                      Save Changes
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
              setSelectedPurchase(null);
              setPurchaseItems([]);
              setProductSearch('');
              setBarcodeInput('');
              setSelectedCategoryId(0);
            }}
            size="large"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Purchase Details Modal */}
      <Dialog 
        open={isViewModalOpen} 
        onClose={() => {
          setIsViewModalOpen(false);
          setPurchaseDetails(null);
          setSelectedPurchase(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <ShippingIcon />
            Purchase Order Details - #PO-{selectedPurchase?.id}
          </Box>
        </DialogTitle>
        <DialogContent>
          {purchaseDetails && (
            <Box>
              {/* Purchase Information */}
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Supplier
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {purchaseDetails.supplier?.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {purchaseDetails.supplier?.email}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {purchaseDetails.supplier?.phone}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Ordered By
                  </Typography>
                  <Typography variant="body1">
                    {purchaseDetails.user?.fullName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {purchaseDetails.user?.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={purchaseDetails.status.toUpperCase()}
                    color={getStatusColor(purchaseDetails.status)}
                    size="small"
                    icon={<ShippingIcon />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Order Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(purchaseDetails.createdAt).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Supplier Address
                  </Typography>
                  <Typography variant="body1">
                    {purchaseDetails.supplier?.address}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {formatCurrency(purchaseDetails.total)}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Purchase Items */}
              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                {purchaseDetails.purchaseItems && purchaseDetails.purchaseItems.length > 0 ? (
                  purchaseDetails.purchaseItems.map((item: PurchaseItem, index: number) => (
                    <Box key={index} mb={2}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" fontWeight="medium">
                            {item.product?.name || `Product ${item.productId}`}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            SKU: {item.product?.barcode}
                          </Typography>
                        </Grid>
                        <Grid item xs={4} sm={2}>
                          <Typography variant="body2" textAlign="center">
                            Qty: {item.quantity}
                          </Typography>
                        </Grid>
                        <Grid item xs={4} sm={3}>
                          <Typography variant="body2" textAlign="center">
                            {formatCurrency(item.unitCost)}
                          </Typography>
                        </Grid>
                        <Grid item xs={4} sm={3}>
                          <Typography variant="body2" textAlign="right" fontWeight="medium">
                            {formatCurrency(item.total)}
                          </Typography>
                        </Grid>
                      </Grid>
                      {index < (purchaseDetails.purchaseItems?.length || 0) - 1 && <Divider sx={{ mt: 1 }} />}
                    </Box>
                  ))
                ) : (
                  <Typography color="textSecondary" textAlign="center" py={2}>
                    No items in this purchase
                  </Typography>
                )}
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setIsViewModalOpen(false);
              setPurchaseDetails(null);
              setSelectedPurchase(null);
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
          setSelectedPurchase(null);
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete purchase order #PO-{selectedPurchase?.id}? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setIsDeleteModalOpen(false);
              setSelectedPurchase(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeletePurchase}
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

export default Purchases;