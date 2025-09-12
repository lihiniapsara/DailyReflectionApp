import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User,
} from "firebase/auth";
import { auth } from "../firebase";
import { View, Text } from "react-native"; // React Native components

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getCurrentUser: () => User | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signup: async () => {
    throw new Error("Signup not implemented");
  },
  login: async () => {
    throw new Error("Signin not implemented");
  },
  logout: async () => {
    throw new Error("Logout not implemented");
  },
  resetPassword: async () => {
    throw new Error("Reset password not implemented");
  },
  getCurrentUser: () => null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user ?? null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string): Promise<User> => {
    console.log("Signup උත්සාහය:", { email, password });
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Signup සාර්ථකයි:", userCredential.user);
    return userCredential.user;
  };

  const login = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  const resetPassword = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent ✅");
  };

  const getCurrentUser = (): User | null => {
    return auth.currentUser;
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, resetPassword, getCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};