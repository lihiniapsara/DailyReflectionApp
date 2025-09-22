import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { signIn } from '@/services/authService';

const { width } = Dimensions.get('window');
const functions = getFunctions();

interface SendOTPResponse {
  data: { success: boolean };
}

interface VerifyOTPAndResetPasswordResponse {
  data: { success: boolean };
}

export default function SignIn() {
  const router = useRouter();
  //const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [modalScale] = useState(new Animated.Value(0.7));
  const [forgotModalScale] = useState(new Animated.Value(0.7));
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  useEffect(() => {
    if (showOTPModal) {
      Animated.spring(modalScale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }).start();
    }
  }, [showOTPModal]);

  useEffect(() => {
    if (showForgotPasswordModal) {
      Animated.spring(forgotModalScale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }).start();
    } else {
      forgotModalScale.setValue(0.7);
    }
  }, [showForgotPasswordModal]);

  useEffect(() => {
    let interval: number;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const startResendTimer = () => {
    setCanResend(false);
    setResendTimer(60);
  };

  const handleSignIn = async () => {
    try {
      setError('');
      setIsLoading(true);

      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }

      await signIn(email, password);
      router.push('/home');
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setForgotPasswordEmail(email);
    setShowForgotPasswordModal(true);
    setError('');
  };

  const handleForgotPasswordSubmit = async () => {
    if (!forgotPasswordEmail.trim()) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail.toLowerCase())) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const sendOTP = httpsCallable(functions, 'sendOTP');
      const result = await sendOTP({ email: forgotPasswordEmail.toLowerCase() });

      if (result.data.success) {
        Alert.alert('Success', 'OTP has been sent to your email');
        setShowForgotPasswordModal(false);
        setEmail(forgotPasswordEmail.toLowerCase());
        setShowOTPModal(true);
        startResendTimer();
      } else {
        setError('Failed to send OTP');
      }
    } catch (err) {
      const error = err as any;
      switch (error.code) {
        case 'functions/invalid-argument':
          setError('Invalid email address');
          break;
        case 'functions/not-found':
          setError('User not found');
          break;
        default:
          setError(error.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');

      if (otp.length !== 6) {
        setError('Please enter a valid 6-digit OTP');
        return;
      }

      if (!newPassword) {
        setError('Please enter a new password');
        return;
      }

      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }

      const verifyOTP = httpsCallable(functions, 'verifyOTPAndResetPassword');
      const result = await verifyOTP({ email, otp, newPassword });

      if (result.data.success) {
        Alert.alert('Success', 'Password updated successfully. Please sign in.');
        setShowOTPModal(false);
        setOTP('');
        setNewPassword('');
        setResendTimer(0);
        setCanResend(true);
      } else {
        setError('OTP verification failed');
      }
    } catch (err) {
      const error = err as any;
      switch (error.code) {
        case 'functions/invalid-argument':
          setError('Invalid OTP or password');
          break;
        case 'functions/deadline-exceeded':
          setError('OTP has expired');
          break;
        case 'functions/not-found':
          setError('OTP not found');
          break;
        default:
          setError(error.message || 'OTP verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }; // Fixed: Added missing closing brace

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      setIsLoading(true);
      setError('');
      const sendOTP = httpsCallable<SendOTPResponse>(functions, 'sendOTP');
      const result = await sendOTP({ email });
      if (result.data.success) {
        Alert.alert('Success', 'New OTP has been sent to your email');
        startResendTimer();
      } else {
        setError('Failed to resend OTP');
      }
    } catch (err) {
      const error = err as any;
      setError(error.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    router.push('/register');
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" translucent />
      <View className="flex-1 justify-center items-center bg-white">
        <View className="w-[90%] max-w-[400px] items-center">
          <View className="w-full bg-white rounded-3xl p-8 border border-gray-300 shadow-lg">
            <View className="items-center mb-8">
              <View className="w-16 h-16 rounded-2xl bg-gray-700 justify-center items-center shadow-md">
                <Ionicons
                  name="sunny-outline"
                  size={32}
                  color="#FFFFFF"
                  accessibilityLabel="App logo"
                />
              </View>
              <Text className="text-2xl font-bold text-gray-800 mt-4 text-center">
                Welcome Back
              </Text>
              <Text className="text-sm text-gray-500 text-center">
                Continue your daily reflection journey
              </Text>
            </View>

            {error ? (
              <View className="flex-row items-center border border-red-500 rounded-xl p-3 mb-5">
                <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
                <Text className="text-red-500 text-sm ml-2 flex-1">{error}</Text>
              </View>
            ) : null}

            <View className="w-full mb-6">
              <View className="flex-row items-center bg-white rounded-xl border border-gray-300 px-4 py-1 h-14 mb-2">
                <Ionicons name="mail-outline" size={20} color="#6B7280" className="mr-3" />
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#6B7280"
                  value={email}
                  onChangeText={setEmail}
                  className="flex-1 text-base text-gray-800 py-3"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  accessibilityLabel="Email input"
                />
              </View>

              <View className="flex-row items-center bg-white rounded-xl border border-gray-300 px-4 py-1 h-14 mb-2">
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" className="mr-3" />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#6B7280"
                  value={password}
                  onChangeText={setPassword}
                  className="flex-1 text-base text-gray-800 py-3"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  accessibilityLabel="Password input"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 p-1"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSignIn}
              disabled={isLoading}
              className={`w-full rounded-xl bg-gray-700 shadow-md ${isLoading ? 'opacity-70' : ''}`}
              accessibilityLabel="Sign in button"
            >
              <View className="bg-gray-700 py-4 items-center rounded-xl">
                {isLoading ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text className="text-white text-base font-medium ml-2">
                      Signing In...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white text-lg font-semibold">Sign In</Text>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleForgotPassword}
              className="self-center p-2 mb-8"
              accessibilityLabel="Forgot password"
            >
              <Text className="text-gray-700 text-sm font-medium">
                Forgot your password?
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-gray-300" />
              <View className="bg-white px-4 py-1.5 rounded-2xl mx-3">
                <Text className="text-xs text-gray-500 font-medium tracking-wider">
                  NEW TO DAILY REFLECTION?
                </Text>
              </View>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            <TouchableOpacity
              onPress={handleCreateAccount}
              className="w-full bg-white border border-gray-300 rounded-xl py-3.5 items-center"
              accessibilityLabel="Create account button"
            >
              <Text className="text-gray-700 text-base font-medium">Create Account</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-sm text-gray-500 italic text-center mt-8">
            Take a moment. Breathe. Reflect.
          </Text>
        </View>

        {/* Forgot Password Modal */}
        <Modal
          visible={showForgotPasswordModal}
          animationType="none"
          transparent={true}
          onRequestClose={() => setShowForgotPasswordModal(false)}
        >
          <View className="flex-1 bg-black/60 justify-center items-center">
            <Animated.View className="w-[85%] max-w-[400px] bg-white rounded-3xl border border-gray-300 shadow-lg">
              <View className="p-8 bg-white rounded-3xl">
                <View className="items-center mb-5">
                  <Ionicons name="mail-outline" size={32} color="#374151" />
                  <Text className="text-2xl font-bold text-gray-800 mt-3 text-center">
                    Forgot Password?
                  </Text>
                </View>

                <Text className="text-base text-gray-500 mb-6 text-center leading-6">
                  Enter your email address and we'll send you an OTP to reset your
                  password.
                </Text>

                <View className="flex-row items-center bg-white rounded-xl border border-gray-300 px-4 py-1 h-14 mb-2">
                  <Ionicons name="mail-outline" size={20} color="#6B7280" className="mr-3" />
                  <TextInput
                    placeholder="Enter your email"
                    placeholderTextColor="#6B7280"
                    value={forgotPasswordEmail}
                    onChangeText={setForgotPasswordEmail}
                    className="flex-1 text-base text-gray-800 py-3"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    accessibilityLabel="Forgot password email input"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleForgotPasswordSubmit}
                  disabled={isLoading}
                  className={`w-full rounded-xl bg-gray-700 shadow-md ${isLoading ? 'opacity-70' : ''}`}
                  accessibilityLabel="Send OTP button"
                >
                  <View className="bg-gray-700 py-4 items-center rounded-xl">
                    {isLoading ? (
                      <View className="flex-row items-center">
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text className="text-white text-base font-medium ml-2">
                          Sending...
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-white text-lg font-semibold">Send OTP</Text>
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setShowForgotPasswordModal(false);
                    setError('');
                  }}
                  className="self-center p-3 mt-5"
                  accessibilityLabel="Cancel forgot password"
                >
                  <Text className="text-red-500 text-base font-semibold">Cancel</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* OTP Modal */}
        <Modal
          visible={showOTPModal}
          animationType="none"
          transparent={true}
          onRequestClose={() => {
            setShowOTPModal(false);
            setResendTimer(0);
            setCanResend(true);
          }}
        >
          <View className="flex-1 bg-black/60 justify-center items-center">
            <Animated.View className="w-[85%] max-w-[400px] bg-white rounded-3xl border border-gray-300 shadow-lg">
              <View className="p-8 bg-white rounded-3xl">
                <Text className="text-2xl font-bold text-gray-800 mb-4 text-center">
                  Reset Password
                </Text>
                <Text className="text-base text-gray-500 mb-6 text-center leading-6">
                  Enter the 6-digit OTP sent to {email}
                </Text>

                <View className="flex-row items-center bg-white rounded-xl border border-gray-300 px-4 py-1 h-14 mb-2">
                  <Ionicons name="key-outline" size={24} color="#6B7280" className="mr-3" />
                  <TextInput
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor="#6B7280"
                    value={otp}
                    onChangeText={(text) => {
                      const numericText = text.replace(/[^0-9]/g, '');
                      setOTP(numericText);
                    }}
                    className="flex-1 text-lg text-gray-800 py-3 text-center tracking-widest"
                    keyboardType="number-pad"
                    maxLength={6}
                    accessibilityLabel="OTP input"
                  />
                </View>

                {otp.length === 6 && (
                  <View className="flex-row items-center bg-white rounded-xl border border-gray-300 px-4 py-1 h-14 mb-2">
                    <Ionicons
                      name="lock-closed-outline"
                      size={24}
                      color="#6B7280"
                      className="mr-3"
                    />
                    <TextInput
                      placeholder="Enter new password (min 8 characters)"
                      placeholderTextColor="#6B7280"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      className="flex-1 text-lg text-gray-800 py-3"
                      secureTextEntry={true}
                      accessibilityLabel="New password input"
                    />
                  </View>
                )}

                <TouchableOpacity
                  onPress={handleOTPSubmit}
                  disabled={isLoading || otp.length !== 6 || !newPassword}
                  className={`w-full rounded-xl bg-gray-700 shadow-md ${
                    isLoading || otp.length !== 6 || !newPassword ? 'opacity-70' : ''
                  }`}
                  accessibilityLabel="Verify OTP and update password"
                >
                  <View className="bg-gray-700 py-4 items-center rounded-xl">
                    {isLoading ? (
                      <View className="flex-row items-center">
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text className="text-white text-base font-medium ml-2">
                          Verifying...
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-white text-lg font-semibold">
                        Verify & Update
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                {resendTimer > 0 ? (
                  <View className="flex-row items-center justify-center bg-transparent rounded-xl p-3 mb-5">
                    <Ionicons name="time-outline" size={16} color="#374151" />
                    <Text className="text-gray-800 text-sm font-medium ml-2">
                      Resend OTP in {formatTimer(resendTimer)}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={handleResendOTP}
                    disabled={isLoading}
                    className="self-center p-3 mt-2"
                    accessibilityLabel="Resend OTP"
                  >
                    <Text className="text-gray-700 text-sm font-medium">Resend OTP</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => {
                    setShowOTPModal(false);
                    setResendTimer(0);
                    setCanResend(true);
                    setOTP('');
                    setNewPassword('');
                  }}
                  className="self-center p-3 mt-5"
                  accessibilityLabel="Cancel OTP verification"
                >
                  <Text className="text-red-500 text-base font-semibold">Cancel</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}