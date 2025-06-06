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
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import TimerIcon from '@mui/icons-material/Timer';
import LinkIcon from '@mui/icons-material/Link';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import * as XLSX from 'xlsx';
import './Dashboard.scss';
import { generatePineScript, SignalType, AlertFrequency } from '../../../utils/pineScriptGenerator';



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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add new state for signal type and alert frequency
  const [selectedSignalType, setSelectedSignalType] = useState<SignalType>('buy_only');
  const [selectedAlertFrequency, setAlertFrequency] = useState<AlertFrequency>('once_per_bar');

  const [chartHistory, setChartHistory] = useState<string[]>(() => {
    const savedHistory = localStorage.getItem('tradingview_chart_history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  const baseUrl = 'https://in.tradingview.com/chart/';
  const theme = useTheme();

  const extractChartId = (input: string): string => {
    if (input.includes('tradingview.com/chart/')) {
      const match = input.match(/\/chart\/([^/?]+)/);
      return match ? match[1] : '4FqTLhAp';
    }
    return input || '4FqTLhAp';
  };

  const updateChartUrl = (pair: string) => {
    console.log('Updating chart URL for pair:', pair);
    const fullUrl = `${baseUrl}${chartId}/?symbol=BINANCE%3A${pair}`;
    if (chartWindow && !chartWindow.closed) {
      console.log('Updating visible chart window URL');
      chartWindow.location.href = fullUrl;
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
              const script = generatePineScript(pairs, selectedSignalType, selectedAlertFrequency);
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

    const firstPair = tradingPairs[0];
    const fullUrl = `${baseUrl}${chartId}/?symbol=BINANCE%3A${firstPair}`;
    
    const newWindow = window.open(fullUrl, 'TradingViewChart');
    if (newWindow) {
      setChartWindow(newWindow);
      setIsTabClosed(false);
      setIsAutoRotating(true);
    } else {
      setError('Failed to open chart window. Please allow popups.');
      setIsAutoRotating(false);
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
    if (tradingPairs.length > 0 && isAutoRotating && !isTabClosed && chartWindow && !chartWindow.closed) {
      console.log('Setting up interval for auto-rotation with interval:', rotationInterval, 'seconds');
      const interval = setInterval(() => {
        setCurrentPairIndex((prevIndex) => {
          const newIndex = prevIndex + 1 >= tradingPairs.length ? 0 : prevIndex + 1;
          console.log('Switching to pair index:', newIndex, 'pair:', tradingPairs[newIndex]);
          
          updateChartUrl(tradingPairs[newIndex]);
          
          return newIndex;
        });
      }, rotationInterval * 1000); // Convert seconds to milliseconds

      return () => {
        console.log('Clearing auto-rotation interval');
        clearInterval(interval);
      };
    }
  }, [tradingPairs, chartId, isAutoRotating, isTabClosed, chartWindow, rotationInterval]);

  // Check if window is closed
  useEffect(() => {
    const checkWindow = setInterval(() => {
      if (chartWindow && chartWindow.closed) {
        console.log('Tab was closed, resetting all states...');
        setChartWindow(null);
        setIsTabClosed(true);
        setIsAutoRotating(false);
        // Reset all states when tab is closed
        setTradingPairs([]);
        setCurrentPairIndex(0);
        setError('');
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
          console.log('File input cleared');
        }
        console.log('All states have been reset to default');
      }
    }, 1000);

    return () => clearInterval(checkWindow);
  }, [chartWindow]);

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
    setSelectedSignalType(event.target.value as SignalType);
    if (tradingPairs.length > 0) {
      // Regenerate script with new settings
      try {
        const script = generatePineScript(tradingPairs, event.target.value, selectedAlertFrequency);
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
        const script = generatePineScript(tradingPairs, selectedSignalType, event.target.value);
        setGeneratedScript(script);
      } catch (err) {
        console.error('Error generating Pine Script:', err);
        setError('Error generating Pine Script');
      }
    }
  };

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
                      '-webkit-appearance': 'none',
                      margin: 0
                    },
                    '& input[type=number]': {
                      '-moz-appearance': 'textfield'
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
                      <InputLabel>Signal Type</InputLabel>
                      <Select
                        value={selectedSignalType}
                        label="Signal Type"
                        onChange={handleSignalTypeChange}
                      >
                        <MenuItem value="buy_only">Buy Signal Alert</MenuItem>
                        <MenuItem value="sell_only">Sell Signal Alert</MenuItem>
                        <MenuItem value="long_only">Long Signal Alert</MenuItem>
                        <MenuItem value="short_only">Short Signal Alert</MenuItem>
                        <MenuItem value="buy_and_sell">Buy & Sell Signal Alert</MenuItem>
                        <MenuItem value="long_and_short">Long & Short Signal Alert</MenuItem>
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
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<OpenInNewIcon />}
                          onClick={handleOpenTradingView}
                          sx={{
                            mt: 2,
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