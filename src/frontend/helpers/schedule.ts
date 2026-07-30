import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export const TIME_FORMAT = "HH:mm";
export const FALLBACK_TIMEZONE = "UTC";

/**
 * Days as the backend stores them, matching Python's `datetime.weekday()`:
 * 0 = Monday ... 6 = Sunday.
 */
export const WEEKDAYS = [
  { value: 0, label: "Mon" },
  { value: 1, label: "Tue" },
  { value: 2, label: "Wed" },
  { value: 3, label: "Thu" },
  { value: 4, label: "Fri" },
  { value: 5, label: "Sat" },
  { value: 6, label: "Sun" },
] as const;

/** A shortlist of IANA zones covering the regions we support. */
export const TIMEZONES = [
  "Pacific/Honolulu",
  "America/Anchorage",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/Mexico_City",
  "America/New_York",
  "America/Toronto",
  "America/Bogota",
  "America/Lima",
  "America/Santiago",
  "America/Sao_Paulo",
  "America/Argentina/Buenos_Aires",
  "Atlantic/Reykjavik",
  "UTC",
  "Europe/London",
  "Europe/Dublin",
  "Europe/Lisbon",
  "Europe/Madrid",
  "Europe/Paris",
  "Europe/Brussels",
  "Europe/Amsterdam",
  "Europe/Berlin",
  "Europe/Zurich",
  "Europe/Rome",
  "Europe/Stockholm",
  "Europe/Warsaw",
  "Europe/Athens",
  "Europe/Helsinki",
  "Europe/Kyiv",
  "Europe/Istanbul",
  "Europe/Moscow",
  "Africa/Casablanca",
  "Africa/Lagos",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Africa/Nairobi",
  "Asia/Jerusalem",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Jakarta",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Singapore",
  "Asia/Manila",
  "Asia/Seoul",
  "Asia/Tokyo",
  "Australia/Perth",
  "Australia/Adelaide",
  "Australia/Brisbane",
  "Australia/Sydney",
  "Pacific/Auckland",
];

export const isValidTimezone = (value: string | null | undefined): boolean => {
  if (!value) {
    return false;
  }

  try {
    return dayjs().tz(value).isValid();
  } catch {
    return false;
  }
};

/** The device's own IANA timezone, falling back to UTC if it can't be read. */
export const getDeviceTimezone = (): string => {
  try {
    const guess = dayjs.tz.guess();
    return isValidTimezone(guess) ? guess : FALLBACK_TIMEZONE;
  } catch {
    return FALLBACK_TIMEZONE;
  }
};

/** e.g. "GMT+01:00" for the zone's offset right now. */
export const formatTimezoneOffset = (value: string): string => {
  if (!isValidTimezone(value)) {
    return "";
  }

  return `GMT${dayjs().tz(value).format("Z")}`;
};

/** e.g. "Europe/London (GMT+01:00)". */
export const formatTimezoneLabel = (value: string): string => {
  const offset = formatTimezoneOffset(value);
  const name = value.replace(/_/g, " ");

  return offset ? `${name} (${offset})` : name;
};

/** The predefined list, with the device's zone added if it isn't already there. */
export const getTimezoneOptions = (deviceTimezone: string): string[] =>
  TIMEZONES.includes(deviceTimezone)
    ? TIMEZONES
    : [deviceTimezone, ...TIMEZONES];

export const isValidTime = (value: string | null | undefined): boolean =>
  !!value && dayjs(value, TIME_FORMAT, true).isValid();

/** Turn the stored "0,2" into [0, 2], dropping anything that isn't a weekday. */
export const parseFrequency = (value: string | null | undefined): number[] => {
  if (!value) {
    return [];
  }

  const days = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map(Number)
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6);

  return [...new Set(days)].sort((a, b) => a - b);
};

/** Sort and de-duplicate days, ready to send to the API. */
export const normaliseFrequency = (days: number[]): number[] =>
  [...new Set(days.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6))].sort(
    (a, b) => a - b,
  );

export const formatFrequency = (days: number[]): string =>
  normaliseFrequency(days).join(",");

export const toggleDay = (days: number[], day: number): number[] =>
  days.includes(day)
    ? days.filter((existing) => existing !== day)
    : normaliseFrequency([...days, day]);

/** e.g. "Mon, Wed" — or a friendlier phrase for the common patterns. */
export const describeFrequency = (days: number[]): string => {
  const selected = normaliseFrequency(days);

  if (selected.length === 0) {
    return "No days selected";
  }
  if (selected.length === WEEKDAYS.length) {
    return "Every day";
  }
  if (selected.join(",") === "0,1,2,3,4") {
    return "Weekdays";
  }
  if (selected.join(",") === "5,6") {
    return "Weekends";
  }

  return selected.map((day) => WEEKDAYS[day].label).join(", ");
};
