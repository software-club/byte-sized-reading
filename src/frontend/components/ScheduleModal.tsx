import { Book, getBookSchedule, handleScheduleBook } from "@/api/books";
import { Button } from "@/components/Button";
import { ErrorText } from "@/components/ErrorText";
import { Input } from "@/components/Input";
import { Text, useThemeColor } from "@/components/Themed";
import { TimezonePicker } from "@/components/TimezonePicker";
import {
  WEEKDAYS,
  describeFrequency,
  getDeviceTimezone,
  isValidTime,
  isValidTimezone,
  parseFrequency,
  toggleDay,
} from "@/helpers/schedule";
import { Formik } from "formik";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import * as Yup from "yup";

type ScheduleFormValues = {
  time: string;
  timezone: string;
  frequency: number[];
};

const scheduleSchema = Yup.object().shape({
  time: Yup.string()
    .required("Time is required")
    .test("is-time", "Use a 24 hour time, e.g. 08:30", (value) =>
      isValidTime(value),
    ),
  timezone: Yup.string()
    .required("Time zone is required")
    .test("is-timezone", "Choose a valid time zone", (value) =>
      isValidTimezone(value),
    ),
  frequency: Yup.array()
    .of(Yup.number())
    .min(1, "Pick at least one day")
    .required("Pick at least one day"),
});

interface ScheduleModalProps {
  visible: boolean;
  item: Book | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ScheduleModal({
  visible,
  item,
  onClose,
  onSuccess,
}: ScheduleModalProps) {
  const [initialValues, setInitialValues] = useState<ScheduleFormValues | null>(
    null,
  );

  const bgColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "muted");
  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");
  const accentColor = useThemeColor({}, "accent");
  const accentForeground = useThemeColor({}, "accentForeground");

  const deviceTimezone = useMemo(() => getDeviceTimezone(), []);

  useEffect(() => {
    if (!visible || !item) {
      setInitialValues(null);
      return;
    }

    let cancelled = false;

    const defaults: ScheduleFormValues = {
      time: "",
      timezone: deviceTimezone,
      frequency: [],
    };

    getBookSchedule({ book_id: item.id })
      .then((schedule) => {
        if (cancelled) return;

        setInitialValues(
          schedule
            ? {
                time: schedule.time,
                // Fall back to the device zone if the stored one is no longer valid.
                timezone: isValidTimezone(schedule.timezone)
                  ? schedule.timezone
                  : deviceTimezone,
                frequency: parseFrequency(schedule.frequency),
              }
            : defaults,
        );
      })
      .catch(() => {
        if (cancelled) return;
        setInitialValues(defaults);
      });

    return () => {
      cancelled = true;
    };
  }, [visible, item, deviceTimezone]);

  if (!item) {
    return null;
  }

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
              Schedule time to read
            </Text>
            <Text style={[styles.subtitle, { color: mutedColor }]}>
              {item.name}
              {item.author ? ` (${item.author})` : ""}
            </Text>

            {!initialValues ? (
              <ActivityIndicator size="large" color={accentColor} />
            ) : (
              <Formik<ScheduleFormValues>
                initialValues={initialValues}
                enableReinitialize
                validationSchema={scheduleSchema}
                onSubmit={async (values, { setSubmitting, setFieldError }) => {
                  try {
                    await handleScheduleBook({ ...values, book_id: item.id });
                    onSuccess?.();
                    onClose();
                  } catch (error) {
                    setFieldError(
                      "time",
                      error instanceof Error
                        ? error.message
                        : "Could not save the schedule. Please try again.",
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
                  setFieldValue,
                  setFieldTouched,
                  values,
                  errors,
                  touched,
                  isSubmitting,
                }) => (
                  <View style={styles.form}>
                    <View style={styles.field}>
                      <Text style={[styles.label, { color: mutedColor }]}>
                        Time of day
                      </Text>
                      <Input
                        placeholder="08:30"
                        value={values.time}
                        onChangeText={handleChange("time")}
                        onBlur={handleBlur("time")}
                        editable={!isSubmitting}
                        keyboardType="numbers-and-punctuation"
                        autoCorrect={false}
                      />
                      {touched.time && errors.time && (
                        <ErrorText>{errors.time}</ErrorText>
                      )}
                    </View>

                    <View style={styles.field}>
                      <Text style={[styles.label, { color: mutedColor }]}>
                        Time zone
                      </Text>
                      <TimezonePicker
                        value={values.timezone}
                        deviceTimezone={deviceTimezone}
                        disabled={isSubmitting}
                        onChange={(timezone) => {
                          setFieldValue("timezone", timezone);
                          setFieldTouched("timezone", true, false);
                        }}
                      />
                      {touched.timezone && errors.timezone && (
                        <ErrorText>{errors.timezone}</ErrorText>
                      )}
                    </View>

                    <View style={styles.field}>
                      <Text style={[styles.label, { color: mutedColor }]}>
                        Repeat on
                      </Text>
                      <View style={styles.days}>
                        {WEEKDAYS.map((day) => {
                          const selected = values.frequency.includes(day.value);

                          return (
                            <Pressable
                              key={day.value}
                              accessibilityRole="button"
                              accessibilityLabel={day.label}
                              accessibilityState={{ selected }}
                              disabled={isSubmitting}
                              onPress={() => {
                                setFieldValue(
                                  "frequency",
                                  toggleDay(values.frequency, day.value),
                                );
                                setFieldTouched("frequency", true, false);
                              }}
                              style={[
                                styles.day,
                                {
                                  backgroundColor: selected
                                    ? accentColor
                                    : surfaceColor,
                                  borderColor: selected
                                    ? accentColor
                                    : borderColor,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.dayLabel,
                                  {
                                    color: selected
                                      ? accentForeground
                                      : textColor,
                                  },
                                ]}
                              >
                                {day.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                      <Text style={[styles.hint, { color: mutedColor }]}>
                        {describeFrequency(values.frequency)}
                      </Text>
                      {touched.frequency && errors.frequency && (
                        <ErrorText>{String(errors.frequency)}</ErrorText>
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
            )}
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
  form: { gap: 16 },
  field: { gap: 4 },
  label: { fontSize: 13, fontWeight: "600" },
  days: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  day: {
    minWidth: 46,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  dayLabel: { fontSize: 14, fontWeight: "600" },
  hint: { fontSize: 12, marginTop: 4 },
  submitBtn: { marginTop: 8 },
  cancelBtn: { marginTop: 4 },
});
