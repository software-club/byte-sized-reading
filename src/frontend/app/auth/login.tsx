import { login } from "@/api/authentication";
import { Text, View } from "@/components/Themed";
import { storeTokens } from "@/helpers/token";
import { useRouter } from "expo-router";
import { useState } from "react";
import { TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LoginScreen = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  const onSubmitLoginForm = async () => {
    try {
      const response = await login(email, password);

      storeTokens(response.accessToken, response.refreshToken);

      router.push("/(tabs)");
    } catch (error) {
      setError("Login failed. Please check your credentials and try again.");
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View>
        <View>
          <TextInput
            placeholder="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View>
          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
        {error && <Text>{error}</Text>}
        <Text onPress={() => onSubmitLoginForm()}>Login</Text>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
