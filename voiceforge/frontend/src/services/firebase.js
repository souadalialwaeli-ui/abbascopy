import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';

// Firebase config — the user will fill these in from their Firebase console
const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  databaseURL: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: ''
};

let app = null;
let db = null;

export function initFirebase(config) {
  const finalConfig = { ...firebaseConfig, ...config };
  if (!finalConfig.databaseURL) {
    console.warn('Firebase databaseURL not configured');
    return null;
  }
  try {
    app = initializeApp(finalConfig);
    db = getDatabase(app);
    return db;
  } catch (err) {
    console.error('Firebase init error:', err);
    return null;
  }
}

export function listenToServerUrl(callback) {
  if (!db) return () => {};
  const urlRef = ref(db, 'voiceforge/serverUrl');
  return onValue(urlRef, (snapshot) => {
    const url = snapshot.val();
    if (url) callback(url);
  });
}

export function updateServerUrl(url) {
  if (!db) return Promise.resolve();
  const urlRef = ref(db, 'voiceforge/serverUrl');
  return set(urlRef, url);
}

export function listenToServerStatus(callback) {
  if (!db) return () => {};
  const statusRef = ref(db, 'voiceforge/status');
  return onValue(statusRef, (snapshot) => {
    callback(snapshot.val() || {});
  });
}
