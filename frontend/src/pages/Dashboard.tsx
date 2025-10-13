import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  LinearProgress,
  Button,
  ButtonGroup,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as AttachMoneyIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  ShowChart as ShowChartIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { dashboardService } from '@/services/dashboard';
import { analyticsService } from '@/services/analytics';
import { DashboardSummary, ProfitSummary, ProfitOverTime, TopProfitableProduct } from '@/types';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, trend }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
              {value}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {trend.isPositive ? (
                  <TrendingUpIcon color="success" fontSize="small" />
                ) : (
                  <TrendingDownIcon color="error" fontSize="small" />
                )}
                <Typography
                  variant="body2"
                  color={trend.isPositive ? 'success.main' : 'error.main'}
                  sx={{ ml: 0.5 }}
                >
                  {Math.abs(trend.value)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: `${color}.main`,
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [profitSummary, setProfitSummary] = useState<ProfitSummary | null>(null);
  const [profitOverTime, setProfitOverTime] = useState<ProfitOverTime[]>([]);
  const [topProducts, setTopProducts] = useState<TopProfitableProduct[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const { user, token } = useAuth();
  const { canAccessDashboard, hasAnalyticsAccess } = useRoleAccess();

  // Helper function to safely format numbers
  const formatNumber = (value: any): string => {
    const num = typeof value === 'number' ? value : parseFloat(value || 0);
    return num.toLocaleString();
  };

  // Helper function to safely format currency
  const formatCurrency = (value: any): string => {
    const num = typeof value === 'number' ? value : parseFloat(value || 0);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Only fetch data if user is authenticated and token is available
      if (!user || !token) {
        return;
      }

      try {
        setLoading(true);
        
        // Fetch basic dashboard data
        const response = await dashboardService.getSummary();
        setDashboardData(response.data);
        
        // Fetch analytics data if user has access
        if (hasAnalyticsAccess()) {
          setAnalyticsLoading(true);
          try {
            const [profitSummaryData, profitOverTimeData, topProductsData] = await Promise.all([
              analyticsService.getProfitSummary(),
              analyticsService.getProfitOverTime(selectedPeriod),
              analyticsService.getTopProfitableProducts(5)
            ]);
            
            setProfitSummary(profitSummaryData);
            setProfitOverTime(profitOverTimeData);
            setTopProducts(topProductsData);
          } catch (analyticsError) {
          } finally {
            setAnalyticsLoading(false);
          }
        }
        
      } catch (error) {
        // Fallback to empty data if API fails
        setDashboardData({
          totalSales: 0,
          totalPurchases: 0,
          totalProducts: 0,
          lowStockProducts: 0,
          totalCustomers: 0,
          totalSuppliers: 0,
          recentSales: [],
          topProducts: [],
          salesTrend: undefined,
          purchasesTrend: undefined
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, token, selectedPeriod]); // Re-run when user, token, or selectedPeriod changes

  // Role-based access control
  if (!canAccessDashboard()) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Dashboard
        </Typography>
        <Alert severity="error">
          You don't have permission to access this page. Only administrators and managers can view the dashboard.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Dashboard
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Sales"
            value={`$${formatNumber(dashboardData?.totalSales)}`}
            icon={<AttachMoneyIcon />}
            color="primary"
            trend={dashboardData?.salesTrend ? {
              value: Math.abs(dashboardData.salesTrend.percentage),
              isPositive: dashboardData.salesTrend.percentage >= 0
            } : undefined}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Purchases"
            value={`$${formatNumber(dashboardData?.totalPurchases)}`}
            icon={<TrendingUpIcon />}
            color="secondary"
            trend={dashboardData?.purchasesTrend ? {
              value: Math.abs(dashboardData.purchasesTrend.percentage),
              isPositive: dashboardData.purchasesTrend.percentage >= 0
            } : undefined}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Products"
            value={dashboardData?.totalProducts || 0}
            icon={<InventoryIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Low Stock Alert"
            value={dashboardData?.lowStockProducts || 0}
            icon={<WarningIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Additional Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Customers"
            value={dashboardData?.totalCustomers || 0}
            icon={<PeopleIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Suppliers"
            value={dashboardData?.totalSuppliers || 0}
            icon={<PeopleIcon />}
            color="secondary"
          />
        </Grid>
      </Grid>

      {/* Profit Analytics Section - Only for Admin/Manager */}
      {hasAnalyticsAccess() && (
        <>
          {/* Profit Summary Cards */}
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2, mt: 4 }}>
            Profit Analytics
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <StatsCard
                title="Today's Profit"
                value={`$${formatCurrency(profitSummary?.todayProfit || 0)}`}
                icon={<AssessmentIcon />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatsCard
                title="This Week's Profit"
                value={`$${formatCurrency(profitSummary?.thisWeekProfit || 0)}`}
                icon={<ShowChartIcon />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatsCard
                title="This Month's Profit"
                value={`$${formatCurrency(profitSummary?.thisMonthProfit || 0)}`}
                icon={<TrendingUpIcon />}
                color="success"
              />
            </Grid>
          </Grid>

          {/* Profit Over Time Chart */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Profit Over Time
                    </Typography>
                    <ButtonGroup size="small" variant="outlined">
                      <Button 
                        variant={selectedPeriod === '7d' ? 'contained' : 'outlined'}
                        onClick={() => setSelectedPeriod('7d')}
                      >
                        7 Days
                      </Button>
                      <Button 
                        variant={selectedPeriod === '30d' ? 'contained' : 'outlined'}
                        onClick={() => setSelectedPeriod('30d')}
                      >
                        30 Days
                      </Button>
                      <Button 
                        variant={selectedPeriod === '90d' ? 'contained' : 'outlined'}
                        onClick={() => setSelectedPeriod('90d')}
                      >
                        90 Days
                      </Button>
                    </ButtonGroup>
                  </Box>
                  {analyticsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={profitOverTime}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis tickFormatter={(value) => `$${value}`} />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Profit']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="profit" 
                          stroke="#2e7d32" 
                          strokeWidth={2}
                          dot={{ fill: '#2e7d32', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Top Profitable Products */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Top Profitable Products
                  </Typography>
                  {analyticsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <TableContainer component={Paper} elevation={0}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell align="right">Profit</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {topProducts?.slice(0, 5).map((product) => (
                            <TableRow key={product.productId}>
                              <TableCell>{product.productName}</TableCell>
                              <TableCell align="right">
                                <Chip
                                  label={`$${formatCurrency(product.totalProfit)}`}
                                  color="success"
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          )) || (
                            <TableRow>
                              <TableCell colSpan={2} align="center">
                                No data available
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Recent Sales and Top Products */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Recent Sales
              </Typography>
              <TableContainer component={Paper} elevation={0}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData?.recentSales?.slice(0, 5).map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>#{sale.id}</TableCell>
                        <TableCell>{sale.customer?.fullName || 'N/A'}</TableCell>
                        <TableCell>${formatCurrency(sale.total)}</TableCell>
                        <TableCell>
                          <Chip
                            label={sale.status}
                            color={
                              sale.status === 'completed'
                                ? 'success'
                                : sale.status === 'pending'
                                ? 'warning'
                                : 'error'
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    )) || (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No recent sales
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Top Products
              </Typography>
              <TableContainer component={Paper} elevation={0}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Stock</TableCell>
                      <TableCell>Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData?.topProducts?.slice(0, 5).map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={product.stock}
                            color={product.stock < 10 ? 'error' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>${formatCurrency(product.price)}</TableCell>
                      </TableRow>
                    )) || (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No products available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;