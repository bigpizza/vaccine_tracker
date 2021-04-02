//function send_notification() {
var options = {
    type: "basic",
    title: "Notification from opengenus foundation",
    message: "https://iq.opengenus.org",
    iconUrl: "icon.png"
};


function callback() {
    console.log('Popup done!')
}

chrome.notifications.create(options, callback);
//}