document.addEventListener('DOMContentLoaded', function() {
  const createAlertButton = document.getElementById('createAlertButton');
  const statusDiv = document.getElementById('status');

  createAlertButton.addEventListener('click', async () => {
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('tradingview.com')) {
        throw new Error('Please navigate to TradingView first');
      }

      // Send message to content script
      chrome.tabs.sendMessage(tab.id, { type: 'ARCO_CREATE_ALERT' }, (response) => {
        if (chrome.runtime.lastError) {
          showStatus('Error: ' + chrome.runtime.lastError.message, false);
          return;
        }

        if (response && response.success) {
          showStatus('Alert created successfully!', true);
        } else {
          showStatus('Failed to create alert: ' + (response?.error || 'Unknown error'), false);
        }
      });
    } catch (error) {
      showStatus('Error: ' + error.message, false);
    }
  });

  function showStatus(message, isSuccess) {
    statusDiv.textContent = message;
    statusDiv.className = isSuccess ? 'status success' : 'status error';
    statusDiv.style.display = 'block';
    
    // Hide status after 3 seconds
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
}); 