// Debug flag
const DEBUG = true;

// Log function
function log(message) {
  if (DEBUG) {
    console.log(`[ARCO Extension] ${message}`);
  }
}

log('Content script starting');

// Function to check if we're on a TradingView chart page
function isTradingViewChart() {
  return window.location.hostname.includes('tradingview.com') && 
         window.location.pathname.includes('/chart/');
}

// Create and inject the ARCOExtension interface
const injectARCOExtension = () => {
  log('Starting script injection');
  
  // Check if we're on a TradingView chart page
  if (!isTradingViewChart()) {
    log('Not on TradingView chart page, skipping injection');
    return;
  }

  // First check if it's already injected
  if (window.ARCOExtension) {
    log('ARCOExtension already exists');
    return;
  }

  try {
    const script = document.createElement('script');
    script.id = 'arco-extension-script';
    script.textContent = `
      (function() {
        console.log('[ARCO Extension] Script executing');
        
        if (window.ARCOExtension) {
          console.log('[ARCO Extension] Already exists, skipping');
          return;
        }
        
        window.ARCOExtension = {
          isInstalled: true,
          version: '1.0.0',
          extensionId: 'oeanbbjkikogpfodpmobelojiombiiaj',
          createAlert: function() {
            try {
              console.log('[ARCO Extension] Creating alert...');
              
              // Get current symbol from URL
              const urlParams = new URLSearchParams(window.location.search);
              const symbol = urlParams.get('symbol');
              
              if (!symbol) {
                console.log('[ARCO Extension] No symbol found in URL');
                return { success: false, error: 'No symbol found in URL' };
              }

              console.log('[ARCO Extension] Found symbol:', symbol);

              // Find the alert button and click it
              const alertButton = document.querySelector('[data-name="create-alert"]');
              if (!alertButton) {
                console.log('[ARCO Extension] Alert button not found');
                return { success: false, error: 'Alert button not found' };
              }
              console.log('[ARCO Extension] Clicking alert button');
              alertButton.click();

              // Wait for alert dialog to appear
              setTimeout(() => {
                console.log('[ARCO Extension] Filling alert details');
                // Fill in alert details
                const alertName = document.querySelector('[data-name="alert-name"]');
                const alertMessage = document.querySelector('[data-name="alert-message"]');
                
                if (alertName && alertMessage) {
                  alertName.value = \`Alert for \${symbol}\`;
                  alertMessage.value = \`Price alert for \${symbol}\`;
                  
                  // Click create button
                  const createButton = document.querySelector('[data-name="create-alert-submit"]');
                  if (createButton) {
                    console.log('[ARCO Extension] Clicking create button');
                    createButton.click();
                    return { success: true };
                  }
                }
                
                console.log('[ARCO Extension] Failed to fill alert details');
                return { success: false, error: 'Failed to fill alert details' };
              }, 1000);

              return { success: true };
            } catch (error) {
              console.log('[ARCO Extension] Error creating alert:', error);
              return { success: false, error: error.message };
            }
          }
        };

        console.log('[ARCO Extension] Interface created');
        
        // Notify that extension is installed
        window.postMessage({
          type: 'ARCO_EXTENSION_INSTALLED',
          version: '1.0.0',
          extensionId: 'oeanbbjkikogpfodpmobelojiombiiaj'
        }, '*');
        
        console.log('[ARCO Extension] Installation message sent');
      })();
    `;
    
    // Inject the script
    (document.head || document.documentElement).appendChild(script);
    script.remove();
    log('Script injected');
  } catch (error) {
    log('Error injecting script: ' + error.message);
  }
};

// Listen for messages from the Dashboard
window.addEventListener('message', function(event) {
  if (event.source !== window) return;
  
  log('Received message: ' + JSON.stringify(event.data));
  
  if (event.data.type === 'ARCO_CREATE_ALERT') {
    log('Creating alert from message');
    const result = window.ARCOExtension.createAlert();
    window.postMessage({
      type: 'ARCO_ALERT_RESULT',
      success: result.success,
      error: result.error
    }, '*');
  }
});

// Initial injection
if (document.readyState === 'loading') {
  log('Document still loading, waiting for DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', injectARCOExtension);
} else {
  log('Document already loaded, injecting immediately');
  injectARCOExtension();
}

// Also inject when the page is fully loaded
window.addEventListener('load', () => {
  log('Page fully loaded, checking injection');
  if (!window.ARCOExtension) {
    log('ARCOExtension not found after load, injecting');
    injectARCOExtension();
  }
});

// Try injecting every 2 seconds for the first 10 seconds
let injectionAttempts = 0;
const maxAttempts = 5;
const injectionInterval = setInterval(() => {
  if (injectionAttempts >= maxAttempts) {
    clearInterval(injectionInterval);
    return;
  }
  
  if (!window.ARCOExtension) {
    log(`Attempt ${injectionAttempts + 1} to inject script`);
    injectARCOExtension();
  } else {
    clearInterval(injectionInterval);
  }
  
  injectionAttempts++;
}, 2000);

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'PING') {
    sendResponse({ type: 'PONG', version: '1.0.0' });
    return true;
  }
  return true;
}); 