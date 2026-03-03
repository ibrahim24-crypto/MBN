
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User,
  GoogleAuthProvider
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useRouter } from 'next/navigation';

export type UserRole = 'student' | 'teacher' | 'council' | 'administration';

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  xp: number;
  lastLogin: any;
  isSuperAdmin: boolean;
  createdAt: any;
  updatedAt: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SUPER_ADMIN_EMAIL = 'ibrahimezzine09@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { auth, firestore } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth || !firestore) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        
        try {
          const userDoc = await getDoc(userDocRef);
          let currentProfile: UserProfile;

          if (!userDoc.exists()) {
            const initialRole: UserRole = firebaseUser.email === SUPER_ADMIN_EMAIL ? 'administration' : 'student';
            const initialXP = initialRole === 'student' ? 100 : 0;
            const now = new Date();
            
            currentProfile = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Anonymous',
              photoURL: firebaseUser.photoURL || '',
              role: initialRole,
              xp: initialXP,
              lastLogin: now,
              isSuperAdmin: firebaseUser.email === SUPER_ADMIN_EMAIL,
              createdAt: now,
              updatedAt: now,
            };
            
            await setDoc(userDocRef, currentProfile);
          } else {
            const data = userDoc.data() as UserProfile;
            currentProfile = {
              ...data,
              lastLogin: new Date(),
              updatedAt: new Date(),
            };
            await updateDoc(userDocRef, { 
              lastLogin: currentProfile.lastLogin,
              updatedAt: currentProfile.updatedAt
            });
          }
          setProfile(currentProfile);
        } catch (error: any) {
          if (error.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: userDocRef.path,
              operation: 'get'
            }));
          }
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [auth, firestore]);

  const signInWithGoogle = async () => {
    if (!auth) return;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, logout, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
