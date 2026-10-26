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
  offlineAfterMs: 10000,   // no update for this long = device offline (ESP sends every 2 s)
  packAh: 20,              // pack capacity in amp-hours
  nominalV: 48,            // nominal pack voltage
  kWhPerKm: 0.12,          // vehicle consumption for range estimate
  vMin: 30, vMax: 58,      // gauge range for voltage
  iMax: 50,                // gauge range for current (+/-)
  vLow: 40, vHigh: 56,     // voltage alert limits
  tWarn: 45, tHot: 60,     // temperature alert limits (C)
  socLow: 20, socCrit: 10, // charge alert limits (%)
  iWarn: 40,               // current alert limit (A)
  positiveIsCharging: false, // set true if your BMS reports charging current as positive
  historyKey: "bms/history", liveKey: "bms/live"
};
