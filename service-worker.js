console.log('service-worker.js loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkSpam') {
    checkSpam().then(result => {
      sendResponse({ result }); 
    });
    return true;
  }
});

async function checkSpam() {
  try {
    // 1. Get the active tab:
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('Current tab:', currentTab);

    // 2. Check if it's a Gmail page:
    if (currentTab.url.toLowerCase().includes("mail.google.com")) {

      // 3. Execute script in the Gmail tab:
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        function: () => {
          return document.body.innerText;
        }
      });
      console.log('Script executed, result:', result);

      // 4. Get the email body:
      const emailBody = result.result;

      // 5. Send the email body to the server:
      const response = await fetch('http://127.0.0.1:5000/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailBody })
      });

      // 6. Check for errors:
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // 7. Parse the response:
      const data = await response.json();
      console.log('Response data:', data);

      // 8. Return the result (spam or not spam)
      return data.spam ? 'This email is likely spam.' : 'This email seems safe.';

    } else {
      return 'This extension only works on Gmail pages.';
    }

  } catch (error) {
    console.error('Error:', error);
    return 'An error occurred. Please try again.';
  }
}