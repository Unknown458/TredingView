import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  Grid,
  Card,
  CardContent,
  useTheme,
  IconButton,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,

} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import TimerIcon from '@mui/icons-material/Timer';
import LinkIcon from '@mui/icons-material/Link';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import NotificationsIcon from '@mui/icons-material/Notifications';
import * as XLSX from 'xlsx';
import './Dashboard.scss';
import { generatePineScript,  AlertFrequency } from '../../../utils/pineScriptGenerator';

// Interface for TradingView alerts
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

function Dashboard() {
  const [tradingPairs, setTradingPairs] = useState<string[]>([]);
  const [currentPairIndex, setCurrentPairIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [chartWindow, setChartWindow] = useState<Window | null>(null);
  const [chartId, setChartId] = useState<string>(() => {
    const savedChartId = localStorage.getItem('tradingview_chart_id');
    return savedChartId || '4FqTLhAp';
  });
  const [userInput, setUserInput] = useState<string>(() => {
    const savedUserInput = localStorage.getItem('tradingview_user_input');
    return savedUserInput || '';
  });
  const [isTabClosed, setIsTabClosed] = useState<boolean>(false);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [rotationInterval, setRotationInterval] = useState<number>(20);
  const [intervalInput, setIntervalInput] = useState<string>('20');
  const [intervalError, setIntervalError] = useState<string>('');
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  // const [consecutiveErrors, setConsecutiveErrors] = useState<number>(0);
  
  // const MAX_CONSECUTIVE_ERRORS = 3;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<number>();

  // Add new state for signal type and alert frequency
  const [selectedSignalTypes, setSelectedSignalTypes] = useState<string[]>(['buy']);
  const [selectedAlertFrequency, setAlertFrequency] = useState<AlertFrequency>('once_per_bar');

  // TradingView alerts state
  const [alerts, setAlerts] = useState<TradingViewAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState<boolean>(false);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [chartHistory, setChartHistory] = useState<string[]>(() => {
    const savedHistory = localStorage.getItem('tradingview_chart_history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  const baseUrl = 'https://in.tradingview.com/chart/';
  const theme = useTheme();

  // Fetch alerts from webhook API
  const fetchAlerts = async () => {
    setAlertsLoading(true);
    setAlertsError(null);

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
        setAlertsError('Failed to fetch alerts');
      }
    } catch (err) {
      setAlertsError('Error connecting to webhook API');
      console.error('Error fetching alerts:', err);
    } finally {
      setAlertsLoading(false);
    }
  };

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
      return <TrendingUpIcon />;
    } else if (type.includes('sell') || type.includes('short')) {
      return <TrendingDownIcon />;
    }
    return undefined;
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const extractChartId = (input: string): string => {
    if (input.includes('tradingview.com/chart/')) {
      const match = input.match(/\/chart\/([^/?]+)/);
      return match ? match[1] : '4FqTLhAp';
    }
    return input || '4FqTLhAp';
  };

  const updateChartUrl = async (pair: string): Promise<boolean> => {
    console.log('Updating chart URL for pair:', pair);
    const fullUrl = `${baseUrl}${chartId}/?symbol=BINANCE%3A${pair}`;
    
    if (chartWindow && !chartWindow.closed) {
      try {
        // Instead of trying to access the window directly, just update the URL
        chartWindow.location.replace(fullUrl);
        
        // Simple delay to allow the page to start loading
        await new Promise(resolve => setTimeout(resolve, 1500));
        return true;
      } catch (error) {
        // If we get an error, try to open a new window
        console.log('Error updating existing window, opening new one');
        const newWindow = window.open(fullUrl, 'TradingViewChart');
        if (newWindow) {
          setChartWindow(newWindow);
          return true;
        }
        return false;
      }
    } else {
      // If window is closed or null, try to open a new one
      const newWindow = window.open(fullUrl, 'TradingViewChart');
      if (newWindow) {
        setChartWindow(newWindow);
        return true;
      }
      return false;
    }
  };

  const addToHistory = (input: string) => {
    if (!input) return;
    
    const newHistory = [input, ...chartHistory.filter(item => item !== input)].slice(0, 10);
    setChartHistory(newHistory);
    localStorage.setItem('tradingview_chart_history', JSON.stringify(newHistory));
  };

  const handleChartIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    setUserInput(input);
    const newChartId = extractChartId(input);
    setChartId(newChartId);
    localStorage.setItem('tradingview_user_input', input);
    localStorage.setItem('tradingview_chart_id', newChartId);
    addToHistory(input);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Starting file upload process...');
    setLoading(true);
    setError('');
    setIsTabClosed(false);
    setIsAutoRotating(true);
    setChartWindow(null);

    const file = event.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            console.log('Processing Excel file...');
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const pairs: string[] = [];
            
            const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
            for (let row = range.s.r; row <= range.e.r; row++) {
              const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
              const cell = worksheet[cellAddress];
              if (cell && cell.v) {
                pairs.push(String(cell.v));
              }
            }

            if (pairs.length === 0) {
              setError('No trading pairs found in the Excel file');
              setLoading(false);
              return;
            }

            setTradingPairs(pairs);
            setCurrentPairIndex(0);
            setLoading(false);

            // Generate Pine Script with selected options
            try {
              const script = generatePineScript(pairs, selectedSignalTypes, selectedAlertFrequency);
              setGeneratedScript(script);
            } catch (err) {
              console.error('Error generating Pine Script:', err);
              setError('Error generating Pine Script');
            }
          } catch (err) {
            console.error('Error processing Excel:', err);
            setError('Error processing Excel file');
            setLoading(false);
            setIsAutoRotating(false);
          }
        };

        reader.readAsBinaryString(file);
      } catch (err) {
        console.error('Error handling file:', err);
        setError('Error handling file');
        setLoading(false);
        setIsAutoRotating(false);
      }
    }
  };

  const handleOpenTradingView = () => {
    if (tradingPairs.length === 0) {
      setError('Please upload an Excel file with trading pairs first');
      return;
    }

    // Reset any existing state
    resetToDefault();

    const firstPair = tradingPairs[0];
    const fullUrl = `${baseUrl}${chartId}/?symbol=BINANCE%3A${firstPair}`;
    
    try {
      const newWindow = window.open(fullUrl, 'TradingViewChart');
      if (newWindow) {
        setChartWindow(newWindow);
        setIsTabClosed(false);
        setIsAutoRotating(true);
        setCurrentPairIndex(0);
        setError('');
      } else {
        setError('Failed to open chart window. Please allow popups in your browser settings.');
      }
    } catch (error) {
      console.error('Error opening TradingView:', error);
      setError('Failed to open TradingView. Please check your internet connection and try again.');
    }
  };

  const handleCopyScript = () => {
    if (generatedScript) {
      navigator.clipboard.writeText(generatedScript)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(() => {
          setError('Failed to copy to clipboard');
        });
    }
  };

  useEffect(() => {
    if (tradingPairs.length > 0 && isAutoRotating && !isTabClosed) {
      console.log('Setting up interval for auto-rotation with interval:', rotationInterval, 'seconds');
      
      let isRotating = false;
      
      const rotateChart = async () => {
        if (isRotating) return;
        isRotating = true;
        
        try {
          const nextIndex = currentPairIndex + 1 >= tradingPairs.length ? 0 : currentPairIndex + 1;
          console.log('Switching to pair index:', nextIndex, 'pair:', tradingPairs[nextIndex]);
          
          const success = await updateChartUrl(tradingPairs[nextIndex]);
          
          if (success) {
            setCurrentPairIndex(nextIndex);
            setError(''); // Clear any existing errors
          }
        } catch (error) {
          console.error('Error in rotation:', error);
        } finally {
          isRotating = false;
        }
      };

      // Start the rotation
      const interval = setInterval(rotateChart, rotationInterval * 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [tradingPairs, chartId, isAutoRotating, isTabClosed, rotationInterval, currentPairIndex]);

  // Remove the focus event handler as it's causing unnecessary resets
  useEffect(() => {
    const checkWindow = setInterval(() => {
      if (chartWindow && chartWindow.closed) {
        console.log('Chart window was closed by user');
        // Reset all states when user closes the window
        setChartWindow(null);
        setIsTabClosed(true);
        setIsAutoRotating(false);
        setCurrentPairIndex(0);
        setError('Chart window was closed. Click "Open TradingView" to start again.');
        
        // Clear the interval since we're no longer rotating
        clearInterval(checkWindow);
      }
    }, 2000);

    return () => clearInterval(checkWindow);
  }, [chartWindow]);

  const resetToDefault = () => {
    // Reset all states to default
    if (chartWindow && !chartWindow.closed) {
      try {
        chartWindow.close();
      } catch (error) {
        console.log('Error closing window:', error);
      }
    }
    setChartWindow(null);
    setIsTabClosed(true);
    setIsAutoRotating(false);
    setCurrentPairIndex(0);
    setError('');
  };

  const handleIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setIntervalInput(value); // Always update the input value
    
    // Validation
    if (value === '') {
      setIntervalError('Please enter a number');
      return;
    }

    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      setIntervalError('Please enter a valid number');
      return;
    }

    if (numValue <= 0) {
      setIntervalError('Interval must be greater than 0');
      return;
    }

    setIntervalError('');
    setRotationInterval(numValue);
    console.log('Rotation interval changed to:', numValue, 'seconds');
  };

  // const handleGeneratePineScript = () => {
  //   if (tradingPairs.length === 0) {
  //     setError('Please upload an Excel file with trading pairs first');
  //     return;
  //   }

  //   try {
  //     const pineScript = generatePineScript(tradingPairs);
      
  //     // Create blob and download
  //     const blob = new Blob([pineScript], { type: 'text/plain' });
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = 'trading_script.pine';
  //     document.body.appendChild(a);
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //     document.body.removeChild(a);
  //   } catch (err) {
  //     console.error('Error generating Pine Script:', err);
  //     setError('Error generating Pine Script');
  //   }
  // };

  const handleSignalTypeChange = (event: any) => {
    const value = event.target.value as string[];
    setSelectedSignalTypes(value);
    if (tradingPairs.length > 0) {
      // Regenerate script with new settings
      try {
        const script = generatePineScript(tradingPairs, value, selectedAlertFrequency);
        setGeneratedScript(script);
      } catch (err) {
        console.error('Error generating Pine Script:', err);
        setError('Error generating Pine Script');
      }
    }
  };

  const handleAlertFrequencyChange = (event: any) => {
    setAlertFrequency(event.target.value as AlertFrequency);
    if (tradingPairs.length > 0) {
      // Regenerate script with new settings
      try {
        const script = generatePineScript(tradingPairs, selectedSignalTypes, event.target.value);
        setGeneratedScript(script);
      } catch (err) {
        console.error('Error generating Pine Script:', err);
        setError('Error generating Pine Script');
      }
    }
  };

  // const handleRotationError = () => {
  //   setConsecutiveErrors(prev => {
  //     const newCount = prev + 1;
  //     if (newCount >= MAX_CONSECUTIVE_ERRORS) {
  //       setIsAutoRotating(false);
  //       setError('Rotation stopped due to multiple errors. Please click Reset Rotation to try again.');
  //       return 0;
  //     }
  //     return newCount;
  //   });
  // };

  // const handleRotationSuccess = () => {
  //   if (consecutiveErrors > 0) {
  //     setConsecutiveErrors(0);
  //   }
  // };

  const resetRotation = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setCurrentPairIndex(0);
    setIsAutoRotating(true);
    setError('');
  
  };

  // Add a new effect to monitor connection errors
  useEffect(() => {
    if (error && error.includes('Failed to load resource')) {
      setError('Unable to connect to TradingView. Please check your internet connection.');
      setIsAutoRotating(false);
    }
  }, [error]);

  // Auto-fetch alerts on component mount and every 30 seconds
  useEffect(() => {
    fetchAlerts();

    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Container maxWidth="lg" className="app-container">
      <Paper 
        elevation={3} 
        sx={{
          p: 4,
          mt: 4,
          borderRadius: 2,
          background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{
            fontWeight: 600,
            color: theme.palette.primary.main,
            mb: 4,
            textAlign: 'center',
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 60,
              height: 4,
              backgroundColor: theme.palette.primary.main,
              borderRadius: 2
            }
          }}
        >
          Trading View Chart Rotator
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LinkIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    Chart Configuration
                  </Typography>
                </Box>
                <TextField
                  label="TradingView Chart ID or URL"
                  variant="outlined"
                  value={userInput}
                  onChange={handleChartIdChange}
                  helperText="Enter your TradingView chart ID (e.g., 4FqTLhAp) or full URL. Previous entries will appear as suggestions."
                  fullWidth
                  sx={{ mb: 2 }}
                  name="tradingview-chart-id"
                  autoComplete="on"
                  inputProps={{
                    autoComplete: 'on',
                    form: {
                      autoComplete: 'on'
                    }
                  }}
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 3 }}>
                  <TimerIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    Rotation Settings
                  </Typography>
                </Box>
                <TextField
                  label="Rotation Interval (seconds)"
                  type="number"
                  variant="outlined"
                  value={intervalInput}
                  onChange={handleIntervalChange}
                  error={!!intervalError}
                  helperText={intervalError || "Set how often you want to change pairs (in seconds)"}
                  fullWidth
                  inputProps={{ 
                    min: 1,
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                  }}
                  sx={{
                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                      WebkitAppearance: 'none',
                      margin: 0
                    },
                    '& input[type=number]': {
                      MozAppearance: 'textfield'
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LinkIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    Alert Configuration
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Signal Types</InputLabel>
                      <Select
                        multiple
                        value={selectedSignalTypes}
                        onChange={handleSignalTypeChange}
                        input={<OutlinedInput label="Signal Types" />}
                        renderValue={(selected) => (selected as string[]).join(', ')}
                      >
                        <MenuItem value="buy">
                          <Checkbox checked={selectedSignalTypes.indexOf('buy') > -1} />
                          <ListItemText primary="Buy Signals" />
                        </MenuItem>
                        <MenuItem value="sell">
                          <Checkbox checked={selectedSignalTypes.indexOf('sell') > -1} />
                          <ListItemText primary="Sell Signals" />
                        </MenuItem>
                        <MenuItem value="long">
                          <Checkbox checked={selectedSignalTypes.indexOf('long') > -1} />
                          <ListItemText primary="Long Signals" />
                        </MenuItem>
                        <MenuItem value="short">
                          <Checkbox checked={selectedSignalTypes.indexOf('short') > -1} />
                          <ListItemText primary="Short Signals" />
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Alert Frequency</InputLabel>
                      <Select
                        value={selectedAlertFrequency}
                        label="Alert Frequency"
                        onChange={handleAlertFrequencyChange}
                      >
                        <MenuItem value="once_per_bar">Once Per Bar</MenuItem>
                        <MenuItem value="once_per_bar_close">Once Per Bar Close</MenuItem>
                        <MenuItem value="once_per_minute">Once Per Minute</MenuItem>
                        <MenuItem value="once">Only Once</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                mb: 3
              }}
            >
              <Button
                variant="contained"
                component="label"
                size="large"
                disabled={loading}
                startIcon={<UploadFileIcon />}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                  }
                }}
              >
                Upload Excel File
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                />
              </Button>
            </Box>
          </Grid>

          {loading && (
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={32} />
            </Grid>
          )}

          {error && (
            <Grid item xs={12}>
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                {error}
              </Alert>
            </Grid>
          )}

          {tradingPairs.length > 0 && (
            <>
              <Grid item xs={12}>
                <Card 
                  sx={{ 
                    mt: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    borderRadius: 2,
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <SwapHorizIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        Trading Status
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                          Current Pair
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          {tradingPairs[currentPairIndex]}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                          Total Pairs
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          {tradingPairs.length}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                          Rotation Interval
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          {rotationInterval} seconds
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<OpenInNewIcon />}
                            onClick={handleOpenTradingView}
                            sx={{
                              py: 1.5,
                              px: 4,
                              borderRadius: 2,
                              textTransform: 'none',
                              fontSize: '1.1rem',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              '&:hover': {
                                boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                              }
                            }}
                          >
                            Open TradingView
                          </Button>

                          <Button
                            variant="outlined"
                            onClick={resetRotation}
                            disabled={!tradingPairs.length || !chartWindow || chartWindow.closed}
                            startIcon={<RefreshIcon />}
                            sx={{
                              py: 1.5,
                              px: 4,
                              borderRadius: 2,
                              textTransform: 'none',
                              fontSize: '1.1rem'
                            }}
                          >
                            Reset Rotation
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {generatedScript && (
                <Grid item xs={12}>
                  <Card 
                    sx={{ 
                      mt: 3,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(0,0,0,0.05)'
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          Generated Pine Script
                        </Typography>
                        <IconButton 
                          onClick={handleCopyScript}
                          color="primary"
                          sx={{ 
                            p: 1,
                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.12)'
                            }
                          }}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Box>
                      <Paper 
                        sx={{ 
                          p: 2,
                          backgroundColor: '#1e1e1e',
                          borderRadius: 1,
                          maxHeight: '500px',
                          overflow: 'auto'
                        }}
                      >
                        <pre style={{ margin: 0, color: '#fff', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                          {generatedScript}
                        </pre>
                      </Paper>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* TradingView Alerts Section */}
              <Grid item xs={12}>
                <Card
                  sx={{
                    mt: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    borderRadius: 2,
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <NotificationsIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          TradingView Alerts
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={alertsLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
                        onClick={fetchAlerts}
                        disabled={alertsLoading}
                        sx={{ textTransform: 'none' }}
                      >
                        Refresh
                      </Button>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Alerts: {alerts.length}
                        {lastUpdated && ` • Last Updated: ${formatTimestamp(lastUpdated.toISOString())}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Webhook URL: {import.meta.env.DEV ? 'http://localhost:3001/api/webhook' : 'https://treding-view.vercel.app/api/webhook'}
                      </Typography>
                    </Box>

                    {alertsError && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {alertsError}
                      </Alert>
                    )}

                    {alerts.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary">
                          No alerts received yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Configure your TradingView alerts to send webhooks to the URL above
                        </Typography>
                      </Box>
                    ) : (
                      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                        <Table stickyHeader size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Time</TableCell>
                              <TableCell>Symbol</TableCell>
                              <TableCell>Signal</TableCell>
                              <TableCell align="right">Price</TableCell>
                              <TableCell align="right">RSI</TableCell>
                              <TableCell align="right">ATR</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {alerts.slice(0, 10).map((alert, index) => (
                              <TableRow key={index} hover>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
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
                                    sx={{ fontSize: '0.7rem' }}
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
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}

                    {alerts.length > 10 && (
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Showing latest 10 alerts out of {alerts.length} total
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>

        <Snackbar
          open={copySuccess}
          autoHideDuration={2000}
          message="Copied to clipboard!"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Paper>
    </Container>
  );
}

export default Dashboard;