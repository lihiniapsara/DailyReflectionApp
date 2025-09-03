// components/SignInScreen.tsx
import React, { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

type NavigationProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};
import { View, TextInput, Button, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';

const SignInScreen = ({ navigation }: NavigationProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
      navigation.navigate('Home');
    } catch (e) {
      setError('Failed to log in');
    }
  };

  return (
    <View>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {error && <Text>{error}</Text>}
      <Button title="Sign In" onPress={handleLogin} />
      <Button title="Sign Up" onPress={() => navigation.navigate('SignUp')} />
      <Button title="Forgot Password" onPress={() => navigation.navigate('ForgotPassword')} />
    </View>
  );
};

export default SignInScreen;
