'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    // We only try the argument-less initializeApp() if we are in a production-like environment
    // that supports automatic configuration. This avoids a noisy "Need to provide options"
    // error and stack trace in the browser console during local development.
    const isLikelyAppHosting = typeof window !== 'undefined' && 
                               (window.location.hostname.endsWith('.web.app') || 
                                window.location.hostname.endsWith('.firebaseapp.com'));

    if (isLikelyAppHosting || process.env.NODE_ENV === "production") {
      try {
        firebaseApp = initializeApp();
      } catch (e) {
        // Fallback to local config if automatic discovery fails
        firebaseApp = initializeApp(firebaseConfig);
      }
    } else {
      // Direct initialization for local development to avoid noise
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
