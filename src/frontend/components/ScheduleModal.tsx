import { Book, getBookSchedule, handleScheduleBook } from "@/api/books";
import { Button } from "@/components/Button";
import { ErrorText } from "@/components/ErrorText";
import { Input } from "@/components/Input";
import { Text, useThemeColor } from "@/components/Themed";
import { Formik } from "formik";
import { useEffect, useState } from "react";
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
  time: Yup.string().required("Time is required"),
  timezone: Yup.string().required("Timezone is required"),
  frequency: Yup.string().required("Frequency is required"),
});

interface ScheduleModalProps {
  visible: boolean;
  item: Book;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ScheduleModal({
  visible,
  item,
  onClose,
  onSuccess,
}: ScheduleModalProps) {
  if (!item) return <></>;

  const [initialData, setInitialData] = useState<any | null>(null);
  const bgColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "muted");

  useEffect(() => {
    getBookSchedule({ book_id: item.id })
      .then((currentSchedule: any) =>
        setInitialData({
          time: currentSchedule?.time ?? "",
          timezone: currentSchedule?.timezone ?? "Asia/Famagusta",
          frequency: currentSchedule?.frequency ?? "",
        }),
      )
      .catch((err) => {
        setInitialData({
          time: "",
          timezone: "Asia/Famagusta",
          frequency: "",
        });
      });
  }, [item]);

  return (
    initialData && (
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
                Schedule time to read Book:
              </Text>
              <Text style={[styles.subtitle, { color: mutedColor }]}>
                {item.name} ({item.author})
              </Text>

              <Formik
                initialValues={initialData}
                validationSchema={uploadSchema}
                onSubmit={async (values, { setSubmitting, setFieldError }) => {
                  try {
                    handleScheduleBook({
                      ...values,
                      book_id: item.id,
                    });
                    onSuccess?.();
                    onClose();
                  } catch (error) {
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
                        placeholder="Time of Day"
                        value={values.time}
                        onChangeText={handleChange("time")}
                        onBlur={handleBlur("time")}
                        editable={!isSubmitting}
                      />
                      {touched.time && errors.time && (
                        <ErrorText>{errors.time}</ErrorText>
                      )}
                    </View>

                    <View style={styles.field}>
                      <Input
                        placeholder="Time zone"
                        value={values.timezone}
                        onChangeText={handleChange("timezone")}
                        onBlur={handleBlur("timezone")}
                        editable={!isSubmitting}
                      />
                      {touched.timezone && errors.timezone && (
                        <ErrorText>{errors.timezone}</ErrorText>
                      )}
                    </View>

                    <View style={styles.field}>
                      <Input
                        placeholder="Frequency"
                        value={values.frequency}
                        onChangeText={handleChange("frequency")}
                        onBlur={handleBlur("frequency")}
                        editable={!isSubmitting}
                      />
                      {touched.frequency && errors.frequency && (
                        <ErrorText>{errors.frequency}</ErrorText>
                      )}
                    </View>

                    <Button
                      onPress={() => handleSubmit()}
                      disabled={isSubmitting}
                      style={styles.submitBtn}
                    >
                      {isSubmitting ? "Scheduling…" : "Schedule"}
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
    )
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
