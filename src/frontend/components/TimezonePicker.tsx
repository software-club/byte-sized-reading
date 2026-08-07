import { Input } from "@/components/Input";
import { Text, useThemeColor } from "@/components/Themed";
import { formatTimezoneLabel, getTimezoneOptions } from "@/helpers/schedule";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, View } from "react-native";

interface TimezonePickerProps {
  value: string;
  deviceTimezone: string;
  onChange: (timezone: string) => void;
  disabled?: boolean;
}

export function TimezonePicker({
  value,
  deviceTimezone,
  onChange,
  disabled,
}: TimezonePickerProps) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [search, setSearch] = useState("");

  const bgColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const mutedColor = useThemeColor({}, "muted");
  const accentColor = useThemeColor({}, "accent");

  const options = useMemo(
    () => getTimezoneOptions(deviceTimezone),
    [deviceTimezone],
  );

  const results = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return options;
    }

    return options.filter((option) =>
      formatTimezoneLabel(option).toLowerCase().includes(term),
    );
  }, [options, search]);

  const close = () => {
    setPickerVisible(false);
    setSearch("");
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Time zone"
        disabled={disabled}
        onPress={() => setPickerVisible(true)}
        style={[styles.field, { backgroundColor: surfaceColor, borderColor }]}
      >
        <Text style={[styles.fieldValue, { color: textColor }]}>
          {formatTimezoneLabel(value)}
        </Text>
        <FontAwesome name="chevron-down" size={12} color={mutedColor} />
      </Pressable>

      {value === deviceTimezone && (
        <Text style={[styles.hint, { color: mutedColor }]}>
          Detected from your device
        </Text>
      )}

      <Modal
        visible={pickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={close}
      >
        <View style={[styles.picker, { backgroundColor: bgColor }]}>
          <Text style={[styles.pickerTitle, { color: textColor }]}>
            Choose a time zone
          </Text>

          <Input
            placeholder="Search time zones"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <FlatList
            data={results}
            keyExtractor={(option) => option}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: mutedColor }]}>
                No time zones match “{search}”
              </Text>
            }
            renderItem={({ item }) => {
              const selected = item === value;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    onChange(item);
                    close();
                  }}
                  style={[styles.option, { borderBottomColor: borderColor }]}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      { color: selected ? accentColor : textColor },
                    ]}
                  >
                    {formatTimezoneLabel(item)}
                  </Text>
                  {selected && (
                    <FontAwesome name="check" size={14} color={accentColor} />
                  )}
                </Pressable>
              );
            }}
          />

          <Pressable
            accessibilityRole="button"
            onPress={close}
            style={styles.cancel}
          >
            <Text style={{ color: accentColor, fontWeight: "600" }}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fieldValue: { fontSize: 16 },
  hint: { fontSize: 12, marginTop: 4 },
  picker: { flex: 1, paddingHorizontal: 24, paddingVertical: 40 },
  pickerTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  list: { marginTop: 12 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  optionLabel: { fontSize: 16 },
  empty: { paddingVertical: 24, textAlign: "center" },
  cancel: { paddingVertical: 16, alignItems: "center" },
});
