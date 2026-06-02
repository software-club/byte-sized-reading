import { StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";

import { Button } from "@/components/Button";
import { Text } from "@/components/Themed";
import { View } from "@/components/View";
import { Input } from "@/components/Input";
import { UploadModal } from "@/components/UploadModal";
import { useAuth } from "@/context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { getDocumentAsync, DocumentPickerAsset } from "expo-document-picker";
import { getBooks, Book, getFullDocumentUrl } from "@/api/books";
import { useThemeColor } from "@/components/Themed";

export default function DashboardScreen() {
  const { signOut } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [pickedAsset, setPickedAsset] = useState<DocumentPickerAsset | null>(
    null,
  );
  const [books, setBooks] = useState<Book[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");
  const mutedColor = useThemeColor({}, "muted");

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBooks();
      setBooks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const filteredBooks = books.filter((book) =>
    book.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Books</Text>
        <Button variant="ghost" onPress={() => signOut()}>
          Sign out
        </Button>
      </View>

      <Input
        placeholder="Search books…"
        value={query}
        onChangeText={setQuery}
        style={styles.searchInput}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
        </View>
      ) : filteredBooks.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={{ color: mutedColor }}>
            {books.length === 0
              ? "No books yet. Upload one!"
              : "No books match your search."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bookCard,
                { backgroundColor: surfaceColor, borderColor },
              ]}
            >
              <Text style={styles.bookName}>{item.name}</Text>
              {item.author && (
                <Text style={[styles.bookMeta, { color: mutedColor }]}>
                  {item.author}
                </Text>
              )}
              <View style={styles.bookMetaRow}>
                {item.doc && (
                  <Text style={[styles.bookMeta, { color: mutedColor }]}>
                    <a
                      href={getFullDocumentUrl(item.doc)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  </Text>
                )}
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          scrollEnabled
        />
      )}

      <Button onPress={() => uploadFile()} style={styles.uploadButton}>
        Upload File
      </Button>

      <UploadModal
        visible={modalVisible}
        asset={pickedAsset}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          fetchBooks();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  searchInput: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  errorText: {
    color: "#dc2626",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bookCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  bookName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  bookMeta: {
    fontSize: 12,
    marginBottom: 4,
  },
  bookMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  uploadButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
});
