import { StyleSheet } from "react-native";

import EditScreenInfo from "@/components/EditScreenInfo";
import { Text } from "@/components/Themed";
import { View } from "@/components/View";
import { useAuth } from "@/context/AuthContext";
import { getTokens } from "@/helpers/token";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabOneScreen() {
  const { signOut } = useAuth();

  const [tokens, setTokens] = useState<{
    accessToken: string | null;
    refreshToken: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      const storedTokens = await getTokens();
      setTokens(storedTokens);
    };
    fetchTokens();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.title} onPress={() => signOut()}>
          {tokens?.accessToken}
          {tokens?.refreshToken}
        </Text>
        <View
          style={styles.separator}
          lightColor="#eee"
          darkColor="rgba(255,255,255,0.1)"
        />
        <EditScreenInfo path="app/(auth)/dashboard.tsx" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
