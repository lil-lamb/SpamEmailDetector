async function checkSpam() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const currentTab = tabs[0];

        if (currentTab.url.includes("mail.google.com")) {
        } else {
            alert("This extension only works on email pages.");
        }
    });

    chrome.scripting.executeScript({
        target: {tabId: currentTab.id},
        func: () => {
            return document.body.innerText;
        }
    }).then((result) => {
    });

    const emailBody = result[0].result;
    fetch('http://localhost:5000/', {
        method: 'POST',
        headers: {'Constant-Type': 'application/json'},
        body: JSON.stringify({email: emailBody})
    })
        .then(response => response.json())
        .then(data => {

        })
        .catch(error => console.error('Error:', error));
        const resultDiv = document.getElementById('result');
        resultDiv.textContent = data.spam ? 'This email is likely spam.' : 'This email is likely ham.';
        .catch(error => console.error("Error:", error));
} else
{
    alert('This extension only works on email pages.');
}
});

document.getElementById("myButton").addEventListener("click", checkSpam);