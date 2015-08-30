// Send a message containing the page details back to the event page
chrome.runtime.sendMessage({
    'url': window.location.href,
    'summary': window.getSelection().toString()
});