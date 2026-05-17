import { register } from "@/api/authentication";
import { Button } from "@/components/Button";
import { ErrorText } from "@/components/ErrorText";
import { Input } from "@/components/Input";
import { Text, useThemeColor } from "@/components/Themed";
import { useAuth } from "@/context/AuthContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Yup from "yup";

const registerSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
});

export default function RegisterScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const bgColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "muted");
  const accentColor = useThemeColor({}, "accent");

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <FontAwesome name="book" size={52} color={accentColor} />
            <Text style={[styles.appName, { color: textColor }]}>
              Byte-Sized Reading
            </Text>
            <Text style={[styles.tagline, { color: mutedColor }]}>
              Create your account
            </Text>
          </View>

          <Formik
            initialValues={{ email: "", password: "", confirmPassword: "" }}
            validationSchema={registerSchema}
            onSubmit={async (values, { setSubmitting, setFieldError }) => {
              try {
                const response = await register(values.email, values.password);
                await signIn(response.accessToken, response.refreshToken);
              } catch {
                setFieldError(
                  "email",
                  "Registration failed. Please try again.",
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
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={values.email}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                  />
                  {touched.email && errors.email && (
                    <ErrorText>{errors.email}</ErrorText>
                  )}
                </View>

                <View style={styles.field}>
                  <Input
                    placeholder="Password"
                    secureTextEntry
                    value={values.password}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                  />
                  {touched.password && errors.password && (
                    <ErrorText>{errors.password}</ErrorText>
                  )}
                </View>

                <View style={styles.field}>
                  <Input
                    placeholder="Confirm Password"
                    secureTextEntry
                    value={values.confirmPassword}
                    onChangeText={handleChange("confirmPassword")}
                    onBlur={handleBlur("confirmPassword")}
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <ErrorText>{errors.confirmPassword}</ErrorText>
                  )}
                </View>

                <Button
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                  style={styles.submitBtn}
                >
                  {isSubmitting ? "Creating account…" : "Create Account"}
                </Button>

                <View style={styles.footer}>
                  <Text style={[styles.footerText, { color: mutedColor }]}>
                    Already have an account?{"  "}
                  </Text>
                  <Button variant="ghost" onPress={() => router.back()}>
                    Sign in
                  </Button>
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
    gap: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 8,
  },
  tagline: {
    fontSize: 15,
  },
  form: { gap: 12 },
  field: { gap: 4 },
  submitBtn: { marginTop: 8 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },
  footerText: { fontSize: 14 },
});
