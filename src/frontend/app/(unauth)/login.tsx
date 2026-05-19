import { login } from "@/api/authentication";
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

const loginSchema = Yup.object().shape({
  username: Yup.string()
    .required("Username is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginScreen() {
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
              Your daily reading habit
            </Text>
          </View>

          <Formik
            initialValues={{ username: "", password: "" }}
            validationSchema={loginSchema}
            onSubmit={async (values, { setSubmitting, setFieldError }) => {
              try {
                const response = await login(values.username, values.password);
                await signIn(response.accessToken, response.refreshToken);
              } catch {
                setFieldError("password", "Invalid username or password");
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
                    placeholder="Username"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={values.username}
                    onChangeText={handleChange("username")}
                    onBlur={handleBlur("username")}
                  />
                  {touched.username && errors.username && (
                    <ErrorText>{errors.username}</ErrorText>
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

                <Button
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                  style={styles.submitBtn}
                >
                  {isSubmitting ? "Signing in…" : "Sign In"}
                </Button>

                <View style={styles.footer}>
                  <Text style={[styles.footerText, { color: mutedColor }]}>
                    Don't have an account?{"  "}
                  </Text>
                  <Button
                    variant="ghost"
                    onPress={() => router.push("/(unauth)/register")}
                  >
                    Sign up
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
