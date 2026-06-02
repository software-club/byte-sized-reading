import { StyleSheet } from "react-native";
import { useState } from "react";

import { Button } from "@/components/Button";
import { Text } from "@/components/Themed";
import { View } from "@/components/View";
import { UploadModal } from "@/components/UploadModal";
import { useAuth } from "@/context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { getDocumentAsync, DocumentPickerAsset } from "expo-document-picker";

export default function TabOneScreen() {
  const { signOut } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [pickedAsset, setPickedAsset] = useState<DocumentPickerAsset | null>(
    null
  );

  const uploadFile = async () => {
    const result = await getDocumentAsync({
      type: "application/pdf",
    });

    if (!result.canceled && result.assets) {
      const asset = result.assets[0];
      setPickedAsset(asset);
      setModalVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.title}>You are logged in :)</Text>
        <View
          style={styles.separator}
          lightColor="#eee"
          darkColor="rgba(255,255,255,0.1)"
        />
        <Button onPress={() => signOut()}>Sign out</Button>
        <Button onPress={() => uploadFile()}>Upload File</Button>
        <Text> Start uploading your files for Byte sized reading </Text>
      </View>

      <UploadModal
        visible={modalVisible}
        asset={pickedAsset}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          // TODO: refresh books list if needed
        }}
      />
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
