import { auth } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../firebase";
const functions = getFunctions(app);

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

// Send OTP
export const sendOTP = async (email: string): Promise<void> => {
  const sendOTPFunction = httpsCallable(functions, "sendOTP");
  const result: any = await sendOTPFunction({ email: email.toLowerCase().trim() });
  if (!result.data.success) {
    throw new Error("Failed to send OTP");
  }
  console.log("OTP sent successfully ✅");
};

// Verify OTP + Reset Password
export const verifyOTPAndResetPassword = async (email: string, otp: string, newPassword: string): Promise<void> => {
  const verifyOTPFunction = httpsCallable(functions, "verifyOTPAndResetPassword");
  const result: any = await verifyOTPFunction({ email: email.toLowerCase().trim(), otp, newPassword });
  if (!result.data.success) {
    throw new Error("OTP verification failed");
  }
  console.log("Password reset successfully ✅");
};

// Sign Out
export const logOut = async (): Promise<void> => {
  await signOut(auth);
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};