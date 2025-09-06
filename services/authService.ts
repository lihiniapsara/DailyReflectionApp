import { auth } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, sendPasswordResetEmail } from "firebase/auth";

// Sign In
export const signIn = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Sign Up
export const signUp = async (email: string, password: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent ✅");
  } catch (error) {
    console.error("Error: ", error);
  }
};

// Sign Out
export const logOut = async (): Promise<void> => {
  await signOut(auth);
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
