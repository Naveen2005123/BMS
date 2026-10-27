export const firebaseConfig = {
  apiKey: "AIzaSyDjmnYPT4EMoH2G4tAy-gDNkNY9Pgf_38A",
  authDomain: "battery-monitoring-syste-2f9c1.firebaseapp.com",
  databaseURL: "https://battery-monitoring-syste-2f9c1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "battery-monitoring-syste-2f9c1",
  storageBucket: "battery-monitoring-syste-2f9c1.firebasestorage.app",
  messagingSenderId: "911105827641",
  appId: "1:911105827641:web:bcc2fb11f3642af35bbee8",
  measurementId: "G-W4ZZ2DFTN3"
};
// Tune these to your real pack.
export const SETTINGS = {
  offlineAfterMs: 10000,
  packAh: 100,             // your pack capacity
  nominalV: 72,            // your pack voltage
  kWhPerKm: 0.06,          // see note below, set this for your vehicle
  vMin: 60, vMax: 90,      // voltage gauge range
  iMax: 100,               // current gauge range (+/-)
  vLow: 60, vHigh: 88,     // voltage alert limits
  tWarn: 45, tHot: 60,
  socLow: 20, socCrit: 10,
  iWarn: 80,               // heavy-current warning
  positiveIsCharging: false,
  historyKey: "bms/history", liveKey: "bms/live"
};
