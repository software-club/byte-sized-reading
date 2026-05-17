import { Text as DefaultText, TouchableOpacity, View } from "react-native";
import { useThemeColor } from "./Themed";

export type ButtonProps = {
  variant?: "primary" | "ghost";
  onPress?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  style?: View["props"]["style"];
};

export function Button({
  variant = "primary",
  onPress,
  children,
  disabled,
  style,
}: ButtonProps) {
  const accentColor = useThemeColor({}, "accent");
  const accentForeground = useThemeColor({}, "accentForeground");

  if (variant === "ghost") {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled}>
        <DefaultText
          style={{ color: accentColor, fontSize: 15, fontWeight: "600" }}
        >
          {children}
        </DefaultText>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          backgroundColor: disabled ? "#D1D5DB" : accentColor,
          paddingVertical: 16,
          borderRadius: 12,
          alignItems: "center",
        },
        style,
      ]}
    >
      <DefaultText
        style={{ color: accentForeground, fontWeight: "700", fontSize: 16 }}
      >
        {children}
      </DefaultText>
    </TouchableOpacity>
  );
}
