import { TextInput as DefaultTextInput } from "react-native";
import { ThemeProps, useThemeColor } from "./Themed";

export type InputProps = ThemeProps & DefaultTextInput["props"];

export function Input(props: InputProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "surface",
  );
  const color = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const placeholderTextColor = useThemeColor({}, "muted");

  return (
    <DefaultTextInput
      style={[
        {
          backgroundColor,
          color,
          borderColor,
          borderWidth: 1,
          borderRadius: 10,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 16,
        },
        style,
      ]}
      placeholderTextColor={placeholderTextColor}
      {...otherProps}
    />
  );
}
