import { StyleSheet } from "react-native";

import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View } from "@/components/Themed";
import { getTokens } from "@/helpers/token";
import { useEffect, useState } from "react";

export default function TabOneScreen() {
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
    <View style={styles.container}>
      <Text
        style={styles.title}
        // onPress={() => navigation.navigate("/auth/login")}
      >
        {tokens?.accessToken}
        {tokens?.refreshToken}
      </Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </View>
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
