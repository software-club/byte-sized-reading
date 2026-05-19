import { StyleSheet } from "react-native";

import { Button } from "@/components/Button";
import { Text } from "@/components/Themed";
import { View } from "@/components/View";
import { useAuth } from "@/context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabOneScreen() {
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.title} >
          You are logged in :) 
        </Text>
        <View
          style={styles.separator}
          lightColor="#eee"
          darkColor="rgba(255,255,255,0.1)"
        />
        <Button onPress={() => signOut()}>Sign out</Button>
       <Text> Start uploading your files for Byte sized reading </Text>
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
