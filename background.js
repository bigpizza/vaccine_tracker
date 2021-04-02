// TODO: read these from options
let myLat = 37.3382;
let myLng = -121.8863;
let radiusInMeter = 80_000;

const INTERVAL_IN_MIN = 5; // time in ms
let intervalHandler = null;

function distance(lat, lng) {

  const R = 6371e3; // metres
  const φ1 = myLat * Math.PI / 180; // φ, λ in radians
  const φ2 = lat * Math.PI / 180;
  const Δφ = (lat - myLat) * Math.PI / 180;
  const Δλ = (lng - myLng) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres
  return d;
}

// id ==> muted_timestamp, mute for 1 day
// TODO: change this to a local storage.
let muteMap = {

};

function checkSafeway() {
  console.log('checking safeway...');
  const SAFEWAY_URL = 'https://s3-us-west-2.amazonaws.com/mhc.cdn.content/vaccineAvailability.json?v=1617224752876';
  fetch(SAFEWAY_URL).then(r => r.json()).then(result => {
    let availableResults = [];
    for (const entry of result) {
      if (entry['availability'] == 'no') continue;

      let lat = parseFloat(entry['lat']);
      let lng = parseFloat(entry['long']);
      if (distance(lat, lng) > radiusInMeter) {
        continue;
      }
      if (entry['id'] in muteMap) {
        let mutedTimestamp = muteMap[entry['id']];
        if (new Date().getTime() - mutedTimestamp >= 1000 * 60 * 60 * 24) {
          delete muteMap[entry['id']];
          console.log('an outdated entry is found, reset it', entry);
        } else {
          continue;
        }
      }
      let distanceString = (distance(lat, lng) / 1000).toFixed(2) + ' KM away';

      let options = {
        body: distanceString,
        data: {
          entry: entry
        },
        actions: [
          { action: 'mute', title: 'Mute 1 day' },
          { action: 'Go!', title: 'Go!' }
        ]
      };
      console.log('valid entry: ', entry);
      registration.showNotification(entry['address'], options);
    }
  })

}

function checkAll() {
  checkSafeway();
}

chrome.alarms.create({ periodInMinutes: INTERVAL_IN_MIN });

chrome.alarms.onAlarm.addListener(() => {
  console.log('Waking Up!');
  checkAll();
  console.log('Back to sleep...')
});


self.addEventListener('notificationclick', function (e) {
  var notification = e.notification;
  var entry = notification.data.entry;
  var action = e.action;

  if (action === 'close') {
    notification.close();
  } else if (action === 'mute') {
    console.log(`Muted notification for ${entry['address']} for 1 day`);
    muteMap[entry['id']] = new Date().getTime();
  } else {
    console.log(`Clicked on notification for ${entry['address']}, also mute it for 30 min, at least`);
    muteMap[entry['id']] = new Date().getTime() - 1000 * (60 * 60 * 24 - 30 * 60);
    notification.close();
    // chrome.tabs.create({ url: 'https://www.mhealthappointments.com/covidappt?id='+entry['id'] }, () => {
    //   chrome.tabs.executeScript({file: 'inject.js'});
    // });
    chrome.tabs.create({ url: entry['coach_url'] })
  }
});