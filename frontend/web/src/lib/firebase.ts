import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyA7bSR_qGLS7x1fAbyW8fpIEb35fFi5zko',
  authDomain: 'hireflow-cd1ed.firebaseapp.com',
  projectId: 'hireflow-cd1ed',
  storageBucket: 'hireflow-cd1ed.firebasestorage.app',
  messagingSenderId: '842568736602',
  appId: '1:842568736602:web:e25ba616176b6d4635dd63',
  measurementId: 'G-B41XTTTVT2'
}

// Initialize Firebase App
export const app = initializeApp(firebaseConfig)

// Safely initialize Analytics only in browser environments to avoid crashes during unit tests or SSR builds
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null
