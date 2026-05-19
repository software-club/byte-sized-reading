import { View as DefaultView } from "react-native";
import { ViewProps, useThemeColor } from "./Themed";

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );
  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
