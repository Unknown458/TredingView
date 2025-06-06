// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'ARCO_CREATE_ALERT') {
    // Forward the message to content script
    chrome.tabs.sendMessage(sender.tab.id, request, (response) => {
      sendResponse(response);
    });
    return true; // Keep the message channel open for async response
  }
});

// Keep the service worker alive
chrome.webNavigation.onCompleted.addListener(() => {
  console.log('Web navigation completed - service worker active');
});

// Regular ping to keep service worker alive
setInterval(() => {
  console.log('Service worker ping');
}, 10000); 