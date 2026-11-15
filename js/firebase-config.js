// Paste the firebaseConfig object from Firebase Console below.
// These web-app identifiers are meant to be present in browser code;
// Firestore Security Rules control who can read and write your data.
export const firebaseConfig = {

  apiKey: "AIzaSyDJoWhCh4QIfZppJ7-4pyGi4ReHzzM6MQI",

  authDomain: "japan-itinerary-491cf.firebaseapp.com",

  projectId: "japan-itinerary-491cf",

  storageBucket: "japan-itinerary-491cf.firebasestorage.app",

  messagingSenderId: "623312617196",

  appId: "1:623312617196:web:5dccc661f148ca5dd46fc9"

};

export const sharedSync = {
  enabled: true,
  collection: 'sharedItineraries',
  documentId: 'japan-trip'
};
