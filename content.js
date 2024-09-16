console.log('content.js loaded');

document.getElementById('myButton').addEventListener('click', () => {
  console.log('Button clicked');
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    console.log('Current tab:', currentTab);
    if (currentTab.url.toLowerCase().includes("mail.google.com")) {
      chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        function: () => {
          return document.body.innerText;
        }
      })
      .then((result) => {
        console.log('Script executed, result:', result);
        const emailBody = result[0].result;
        fetch('http://127.0.0.1:5000/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailBody })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Response data:', data);
          const resultDiv = document.getElementById('result');
          resultDiv.innerHTML = data.spam
                                  ? 'This email is likely spam.'
                                  : 'This email seems safe.';
        })
        .catch(error => {
          console.error('Error:', error);
          const resultDiv = document.getElementById('result');
          resultDiv.innerHTML = 'An error occurred. Please try again.';
        });
      });
    } else {
      alert('This extension only works on Gmail pages.');
    }
  });
});