import { Text as DefaultText } from "react-native";
import { TextProps, useThemeColor } from "./Themed";

export function ErrorText(props: TextProps) {
  const { style, ...otherProps } = props;
  const color = useThemeColor({}, "error");
  return (
    <DefaultText
      style={[{ color, fontSize: 12, marginTop: 4 }, style]}
      {...otherProps}
    />
  );
}
