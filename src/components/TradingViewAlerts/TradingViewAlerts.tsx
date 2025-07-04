import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { Refresh, TrendingUp, TrendingDown } from '@mui/icons-material';

interface TradingViewAlert {
  symbol: string;
  signalType: string;
  price: string;
  atr: string;
  rsi: string;
  longStop: string;
  shortStop: string;
  timestamp: string;
}

interface AlertsResponse {
  success: boolean;
  alerts: TradingViewAlert[];
  count: number;
}

const TradingViewAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<TradingViewAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch alerts from the webhook API
  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use local webhook server in development, production API in production
      const apiUrl = import.meta.env.DEV
        ? 'http://localhost:3001/api/webhook'  // Local webhook server
        : '/api/webhook';  // Production Vercel API

      const response = await fetch(apiUrl);
      const data: AlertsResponse = await response.json();
      
      if (data.success) {
        setAlerts(data.alerts);
        setLastUpdated(new Date());
      } else {
        setError('Failed to fetch alerts');
      }
    } catch (err) {
      setError('Error connecting to webhook API');
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh alerts every 30 seconds
  useEffect(() => {
    fetchAlerts();
    
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get signal color based on signal type
  const getSignalColor = (signalType: string) => {
    const type = signalType.toLowerCase();
    if (type.includes('buy') || type.includes('long')) {
      return 'success';
    } else if (type.includes('sell') || type.includes('short')) {
      return 'error';
    }
    return 'default';
  };

  // Get signal icon
  const getSignalIcon = (signalType: string) => {
    const type = signalType.toLowerCase();
    if (type.includes('buy') || type.includes('long')) {
      return <TrendingUp />;
    } else if (type.includes('sell') || type.includes('short')) {
      return <TrendingDown />;
    }
    return undefined;
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          TradingView Alerts
        </Typography>
        <Button
          variant="outlined"
          startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
          onClick={fetchAlerts}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Total Alerts: {alerts.length}
          {lastUpdated && ` • Last Updated: ${formatTimestamp(lastUpdated.toISOString())}`}
        </Typography>
      </Box>

      {alerts.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary">
              No alerts received yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Configure your TradingView alerts to send webhooks to:
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
              https://treding-view.vercel.app/api/webhook
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Symbol</TableCell>
                <TableCell>Signal</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">RSI</TableCell>
                <TableCell align="right">ATR</TableCell>
                <TableCell align="right">Long Stop</TableCell>
                <TableCell align="right">Short Stop</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alerts.map((alert, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Typography variant="body2">
                      {formatTimestamp(alert.timestamp)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {alert.symbol}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getSignalIcon(alert.signalType)}
                      label={alert.signalType}
                      color={getSignalColor(alert.signalType) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontFamily="monospace">
                      {alert.price}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontFamily="monospace">
                      {alert.rsi}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontFamily="monospace">
                      {alert.atr}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontFamily="monospace" color="success.main">
                      {alert.longStop}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontFamily="monospace" color="error.main">
                      {alert.shortStop}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default TradingViewAlerts;
