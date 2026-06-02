import { uploadFile } from "@/api/file";
import { Button } from "@/components/Button";
import { ErrorText } from "@/components/ErrorText";
import { Input } from "@/components/Input";
import { Text, useThemeColor } from "@/components/Themed";
import { DocumentPickerAsset } from "expo-document-picker";
import { Formik } from "formik";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import * as Yup from "yup";

const uploadSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  author: Yup.string().required("Author is required"),
  description: Yup.string().required("Description is required"),
});

interface UploadModalProps {
  visible: boolean;
  asset: DocumentPickerAsset | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UploadModal({
  visible,
  asset,
  onClose,
  onSuccess,
}: UploadModalProps) {
  const bgColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "muted");

  if (!asset) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.container, { backgroundColor: bgColor }]}>
            <Text style={[styles.title, { color: textColor }]}>
              Upload Book
            </Text>
            <Text style={[styles.subtitle, { color: mutedColor }]}>
              Enter book details
            </Text>

            <Formik
              initialValues={{ title: "", author: "", description: "" }}
              validationSchema={uploadSchema}
              onSubmit={async (values, { setSubmitting, setFieldError }) => {
                try {
                  await uploadFile(values.title, values.author, values.description, asset);
                  onSuccess?.();
                  onClose();
                } catch (error) {
                  setFieldError(
                    "title",
                    error instanceof Error
                      ? error.message
                      : "Upload failed. Please try again."
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                isSubmitting,
              }) => (
                <View style={styles.form}>
                  <View style={styles.field}>
                    <Input
                      placeholder="Title"
                      value={values.title}
                      onChangeText={handleChange("title")}
                      onBlur={handleBlur("title")}
                      editable={!isSubmitting}
                    />
                    {touched.title && errors.title && (
                      <ErrorText>{errors.title}</ErrorText>
                    )}
                  </View>

                  <View style={styles.field}>
                    <Input
                      placeholder="Author"
                      value={values.author}
                      onChangeText={handleChange("author")}
                      onBlur={handleBlur("author")}
                      editable={!isSubmitting}
                    />
                    {touched.author && errors.author && (
                      <ErrorText>{errors.author}</ErrorText>
                    )}
                  </View>

                  <View style={styles.field}>
                    <Input
                      placeholder="Description"
                      value={values.description}
                      onChangeText={handleChange("description")}
                      onBlur={handleBlur("description")}
                      editable={!isSubmitting}
                      multiline
                      numberOfLines={4}
                    />
                    {touched.description && errors.description && (
                      <ErrorText>{errors.description}</ErrorText>
                    )}
                  </View>

                  <Button
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting}
                    style={styles.submitBtn}
                  >
                    {isSubmitting ? "Uploading…" : "Upload"}
                  </Button>

                  <Button
                    variant="ghost"
                    onPress={onClose}
                    disabled={isSubmitting}
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </Button>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  form: { gap: 12 },
  field: { gap: 4 },
  submitBtn: { marginTop: 8 },
  cancelBtn: { marginTop: 4 },
});
