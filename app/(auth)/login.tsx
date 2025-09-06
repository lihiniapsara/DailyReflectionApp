import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';

const { width, height } = Dimensions.get('window');
const functions = getFunctions();

interface SendOTPResponse {
  data: {
    success: boolean;
  };
}

interface VerifyOTPAndResetPasswordResponse {
  data: {
    success: boolean;
  };
}

export default function SignIn() {
  const router = useRouter();
  const { login } = useAuth();
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

  // Timer effect for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => {
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

      await login(email, password);
      router.push('/');
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
    if (!emailRegex.test(forgotPasswordEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const sendOTP = httpsCallable<SendOTPResponse>(functions, 'sendOTP');
      const result = await sendOTP({ email: forgotPasswordEmail });
      
      if (result.data.success) {
        Alert.alert('Success', 'OTP has been sent to your email');
        setShowForgotPasswordModal(false);
        setEmail(forgotPasswordEmail);
        setShowOTPModal(true);
        startResendTimer();
      } else {
        setError('Failed to send OTP');
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to send OTP');
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

      const verifyOTP = httpsCallable<VerifyOTPAndResetPasswordResponse>(functions, 'verifyOTPAndResetPassword');
      const result = await verifyOTP({ email: email, otp: otp, newPassword: newPassword });
      
      if (result.data.success) {
        Alert.alert('Success', 'Password has been updated successfully');
        setShowOTPModal(false);
        setOTP('');
        setNewPassword('');
        setResendTimer(0);
        setCanResend(true);
      } else {
        setError('OTP verification failed');
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    try {
      setIsLoading(true);
      const sendOTP = httpsCallable<SendOTPResponse>(functions, 'sendOTP');
      const result = await sendOTP({ email: email });
      if (result.data.success) {
        Alert.alert('Success', 'New OTP has been sent to your email');
        startResendTimer();
      } else {
        setError('Failed to resend OTP');
      }
    } catch (err) {
      const error = err as Error;
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#E8D5FF', '#F8E8FF', '#FFE8D5']}
        locations={[0, 0.5, 1]}
        style={styles.backgroundGradient}
      >
        <View style={[styles.floatingCircle, styles.circle1]} />
        <View style={[styles.floatingCircle, styles.circle2]} />
        <View style={[styles.floatingCircle, styles.circle3]} />

        <View style={styles.contentContainer}>
          <BlurView intensity={20} tint="light" style={styles.glassCard}>
            <View style={styles.headerSection}>
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                style={styles.iconContainer}
              >
                <Ionicons name="sunny-outline" size={32} color="white" />
              </LinearGradient>
              <Text style={styles.welcomeTitle}>Welcome Back</Text>
              <Text style={styles.subtitle}>Continue your daily reflection journey</Text>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputSection}>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.textInput}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  style={[styles.textInput, styles.passwordInput]}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSignIn}
              disabled={isLoading}
              style={[styles.signInButton, isLoading && styles.buttonDisabled]}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                style={styles.buttonGradient}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.loadingText}>Signing In...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotButton}>
              <Text style={styles.forgotText}>Forgot your password?</Text>
            </TouchableOpacity>

            {/* Forgot Password Modal */}
            <Modal
              visible={showForgotPasswordModal}
              animationType="none"
              transparent={true}
              onRequestClose={() => setShowForgotPasswordModal(false)}
            >
              <View style={styles.modalOverlay}>
                <Animated.View style={[styles.forgotPasswordModal, { transform: [{ scale: forgotModalScale }] }]}>
                  <BlurView intensity={50} tint="light" style={styles.forgotPasswordModalInner}>
                    <LinearGradient
                      colors={['#FFFFFF', '#F3E8FF']}
                      style={styles.modalGradient}
                    >
                      <View style={styles.modalHeader}>
                        <Ionicons name="mail-outline" size={32} color="#8B5CF6" />
                        <Text style={styles.modalTitle}>Forgot Password?</Text>
                      </View>
                      
                      <Text style={styles.modalSubtitle}>
                        Enter your email address and we'll send you an OTP to reset your password.
                      </Text>

                      <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                        <TextInput
                          placeholder="Enter your email"
                          placeholderTextColor="#9CA3AF"
                          value={forgotPasswordEmail}
                          onChangeText={setForgotPasswordEmail}
                          style={styles.textInput}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoComplete="email"
                        />
                      </View>

                      <TouchableOpacity
                        onPress={handleForgotPasswordSubmit}
                        disabled={isLoading}
                        style={[styles.signInButton, isLoading && styles.buttonDisabled]}
                      >
                        <LinearGradient
                          colors={['#8B5CF6', '#EC4899']}
                          style={styles.buttonGradient}
                        >
                          {isLoading ? (
                            <View style={styles.loadingContainer}>
                              <ActivityIndicator size="small" color="white" />
                              <Text style={styles.loadingText}>Sending...</Text>
                            </View>
                          ) : (
                            <Text style={styles.buttonText}>Send OTP</Text>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setShowForgotPasswordModal(false);
                          setError('');
                        }}
                        style={styles.cancelButton}
                      >
                        <Text style={styles.cancelText}>Cancel</Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  </BlurView>
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
              <View style={styles.modalOverlay}>
                <Animated.View style={[styles.otpModal, { transform: [{ scale: modalScale }] }]}>
                  <BlurView intensity={50} tint="light" style={styles.otpModalInner}>
                    <LinearGradient
                      colors={['#FFFFFF', '#F3E8FF']}
                      style={styles.modalGradient}
                    >
                      <Text style={styles.modalTitle}>Reset Password</Text>
                      <Text style={styles.modalSubtitle}>
                        Enter the 6-digit OTP sent to {email}
                      </Text>

                      <View style={styles.inputContainer}>
                        <Ionicons name="key-outline" size={24} color="#9CA3AF" style={styles.inputIcon} />
                        <TextInput
                          placeholder="Enter 6-digit OTP"
                          placeholderTextColor="#9CA3AF"
                          value={otp}
                          onChangeText={(text) => {
                            const numericText = text.replace(/[^0-9]/g, '');
                            setOTP(numericText);
                          }}
                          style={[styles.textInput, styles.otpInput]}
                          keyboardType="number-pad"
                          maxLength={6}
                          textAlign="center"
                        />
                      </View>

                      {otp.length === 6 && (
                        <View style={styles.inputContainer}>
                          <Ionicons name="lock-closed-outline" size={24} color="#9CA3AF" style={styles.inputIcon} />
                          <TextInput
                            placeholder="Enter new password (min 8 characters)"
                            placeholderTextColor="#9CA3AF"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            style={[styles.textInput, styles.otpInput]}
                            secureTextEntry={true}
                          />
                        </View>
                      )}

                      <TouchableOpacity
                        onPress={handleOTPSubmit}
                        disabled={isLoading || otp.length !== 6 || !newPassword}
                        style={[styles.signInButton, (isLoading || otp.length !== 6 || !newPassword) && styles.buttonDisabled]}
                      >
                        <LinearGradient
                          colors={['#8B5CF6', '#EC4899']}
                          style={styles.buttonGradient}
                        >
                          {isLoading ? (
                            <View style={styles.loadingContainer}>
                              <ActivityIndicator size="small" color="white" />
                              <Text style={styles.loadingText}>Verifying...</Text>
                            </View>
                          ) : (
                            <Text style={styles.buttonText}>Verify & Update</Text>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>

                      {resendTimer > 0 ? (
                        <View style={styles.timerContainer}>
                          <Ionicons name="time-outline" size={16} color="#8B5CF6" />
                          <Text style={styles.timerText}>
                            Resend OTP in {formatTimer(resendTimer)}
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={handleResendOTP}
                          disabled={isLoading}
                          style={styles.resendButton}
                        >
                          <Text style={styles.resendText}>Resend OTP</Text>
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
                        style={styles.cancelButton}
                      >
                        <Text style={styles.cancelText}>Cancel</Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  </BlurView>
                </Animated.View>
              </View>
            </Modal>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerTextContainer}>
                <Text style={styles.dividerText}>NEW TO DAILY REFLECTION?</Text>
              </View>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              onPress={handleCreateAccount}
              style={styles.createAccountButton}
              activeOpacity={0.8}
            >
              <Text style={styles.createAccountText}>Create Account</Text>
            </TouchableOpacity>
          </BlurView>

          <Text style={styles.tagline}>Take a moment. Breathe. Reflect.</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 1000,
  },
  circle1: {
    width: 200,
    height: 200,
    top: 100,
    left: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: 150,
    right: -30,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
  },
  circle3: {
    width: 100,
    height: 100,
    top: '50%',
    left: 20,
    backgroundColor: 'rgba(251, 146, 60, 0.1)',
  },
  contentContainer: {
    width: width * 0.9,
    maxWidth: 400,
    alignItems: 'center',
  },
  glassCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  inputSection: {
    width: '100%',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    minHeight: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    paddingVertical: 12,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  signInButton: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  forgotButton: {
    alignSelf: 'center',
    padding: 8,
    marginBottom: 32,
  },
  forgotText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(156, 163, 175, 0.3)',
  },
  dividerTextContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 12,
  },
  dividerText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  createAccountButton: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  createAccountText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  tagline: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPasswordModal: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  forgotPasswordModalInner: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  otpModal: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  otpModalInner: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  modalGradient: {
    padding: 32,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  timerText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
    marginLeft: 8,
  },
  otpInput: {
    fontSize: 18,
    letterSpacing: 2,
  },
  cancelButton: {
    alignSelf: 'center',
    padding: 12,
    marginTop: 20,
  },
  cancelText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    alignSelf: 'center',
    padding: 12,
    marginTop: 10,
  },
  resendText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '500',
  },
});