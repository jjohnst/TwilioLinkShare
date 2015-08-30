// This callback function is called when the content script has been 
// injected and returned its results
function onPageDetailsReceived(pageDetails)  {  
    document.getElementById('url').value = pageDetails.url; 
    document.getElementById('summary').innerText = pageDetails.summary; 
}
//Get verified numbers from Twilio account and add them to dropdown
function getContacts() {
    var data = null;

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    //replace AccountSid with your AccountSid
    xhr.open("GET", "https://api.twilio.com/2010-04-01/Accounts/AccountSid/OutgoingCallerIds.json");
    //Your Twilio accountSid and authToken
    xhr.setRequestHeader("authorization", "Basic #Your Twilio accountSid and authToken");
    
    // Handle request state change events
    xhr.onreadystatechange = function() { 
        // If the request completed
        if (xhr.readyState == 4) {
            statusDisplay.innerHTML = '';
            if (xhr.status == 200) {
                // If it was a success, store the response
                data = JSON.parse(xhr.responseText);
                console.log(data);
                select = document.getElementById("to");
                for (var i = 0; i < data.outgoing_caller_ids.length; i++){
                    var option = document.createElement("option");
                    option.value = data.outgoing_caller_ids[i].phone_number;
                    option.textContent = data.outgoing_caller_ids[i].friendly_name;
                    select.appendChild(option);
                }  
            } 
            else {
                // Show what went wrong
                statusDisplay.innerHTML = 'Error numbers not received: ' + xhr.statusText;
            }
        }
    };
    xhr.send();

}
// Global reference to the status display SPAN
var statusDisplay = null;

// POST the data to Twilio using XMLHttpRequest
function sendText() {
    // Cancel the form submit
    event.preventDefault();

    var to = document.getElementById('to').value;
    //the Twilio number you are sending the messages from
    var from = "Twilio #";
    var url = document.getElementById('url').value;
    var summary = document.getElementById('summary').value;

    var data = new FormData();
    data.append("Body", summary+ " " + url);
    data.append("To", to);
    data.append("From", from);

    // Set up an asynchronous AJAX POST request
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    //replace AccountSid with your AccountSid
    xhr.open("POST", "https://api.twilio.com/2010-04-01/Accounts/AccountSid/Messages.json");
    //Your Twilio accountSid and authToken
    xhr.setRequestHeader("authorization", "Basic Basic #Your Twilio accountSid and authToken");

    xhr.send(data);
    statusDisplay.innerHTML = 'Sending...';

    // Handle request state change events
    xhr.onreadystatechange = function() { 
        // If the request completed
        if (xhr.readyState == 4) {
            statusDisplay.innerHTML = '';
            if (xhr.status == 201) {
                // If it was a success, close the popup after a short delay
                statusDisplay.innerHTML = 'Sent';
                window.setTimeout(window.close, 1500);
            } else {
                // Show what went wrong
                statusDisplay.innerHTML = 'Error message not sent: ' + xhr.statusText;
            }
        }
    };
}

// When the popup HTML has loaded
window.addEventListener('load', function(evt) {
    // Cache a reference to the status display SPAN
    statusDisplay = document.getElementById('status-display');
    //Get Verified Numbers and store them in dropdown
    getContacts();
    // Handle the link form submit event with our sendText function
    document.getElementById('sendtext').addEventListener('submit', sendText);
    // Get the event page
    chrome.runtime.getBackgroundPage(function(eventPage) {
        // Call the getPageInfo function in the event page, passing in 
        // our onPageDetailsReceived function as the callback. This injects 
        // content.js into the current tab's HTML
        eventPage.getPageDetails(onPageDetailsReceived);
    });
});