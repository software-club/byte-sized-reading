import dayjs from "dayjs";

import {
  FALLBACK_TIMEZONE,
  TIMEZONES,
  describeFrequency,
  formatFrequency,
  formatTimezoneLabel,
  formatTimezoneOffset,
  getDeviceTimezone,
  getTimezoneOptions,
  isValidTime,
  isValidTimezone,
  normaliseFrequency,
  parseFrequency,
  toggleDay,
} from "../schedule";

describe("isValidTime", () => {
  it("accepts 24 hour times", () => {
    expect(isValidTime("00:00")).toBe(true);
    expect(isValidTime("09:05")).toBe(true);
    expect(isValidTime("23:59")).toBe(true);
  });

  it("rejects times outside the clock", () => {
    expect(isValidTime("24:00")).toBe(false);
    expect(isValidTime("23:60")).toBe(false);
  });

  it("rejects malformed times", () => {
    expect(isValidTime("9:05")).toBe(false);
    expect(isValidTime("0905")).toBe(false);
    expect(isValidTime("8am")).toBe(false);
    expect(isValidTime("")).toBe(false);
    expect(isValidTime(null)).toBe(false);
    expect(isValidTime(undefined)).toBe(false);
  });
});

describe("isValidTimezone", () => {
  it("accepts IANA names", () => {
    expect(isValidTimezone("Europe/London")).toBe(true);
    expect(isValidTimezone("UTC")).toBe(true);
  });

  it("rejects unknown names", () => {
    expect(isValidTimezone("Not/AZone")).toBe(false);
    expect(isValidTimezone("")).toBe(false);
    expect(isValidTimezone(null)).toBe(false);
  });

  it("accepts every zone we offer", () => {
    TIMEZONES.forEach((zone) => {
      expect(isValidTimezone(zone)).toBe(true);
    });
  });
});

describe("getDeviceTimezone", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns the zone the device reports", () => {
    jest.spyOn(dayjs.tz, "guess").mockReturnValue("Asia/Tokyo");

    expect(getDeviceTimezone()).toBe("Asia/Tokyo");
  });

  it("falls back to UTC when the device reports an unusable zone", () => {
    jest.spyOn(dayjs.tz, "guess").mockReturnValue("Not/AZone");

    expect(getDeviceTimezone()).toBe(FALLBACK_TIMEZONE);
  });

  it("falls back to UTC when the device cannot report a zone", () => {
    jest.spyOn(dayjs.tz, "guess").mockImplementation(() => {
      throw new Error("Intl unavailable");
    });

    expect(getDeviceTimezone()).toBe(FALLBACK_TIMEZONE);
  });
});

describe("formatTimezoneOffset", () => {
  it("describes the zone's current offset", () => {
    expect(formatTimezoneOffset("UTC")).toBe("GMT+00:00");
    expect(formatTimezoneOffset("Asia/Kolkata")).toBe("GMT+05:30");
  });

  it("returns an empty string for an unknown zone", () => {
    expect(formatTimezoneOffset("Not/AZone")).toBe("");
  });
});

describe("formatTimezoneLabel", () => {
  it("pairs the zone name with its offset", () => {
    expect(formatTimezoneLabel("Asia/Kolkata")).toBe(
      "Asia/Kolkata (GMT+05:30)",
    );
  });

  it("makes underscored names readable", () => {
    expect(formatTimezoneLabel("America/New_York")).toContain("America/New York");
  });

  it("falls back to the bare name for an unknown zone", () => {
    expect(formatTimezoneLabel("Not/AZone")).toBe("Not/AZone");
  });
});

describe("getTimezoneOptions", () => {
  it("leaves the list alone when the device zone is already listed", () => {
    expect(getTimezoneOptions("Europe/London")).toEqual(TIMEZONES);
  });

  it("puts an unlisted device zone first", () => {
    const options = getTimezoneOptions("Asia/Famagusta");

    expect(options[0]).toBe("Asia/Famagusta");
    expect(options).toHaveLength(TIMEZONES.length + 1);
  });
});

describe("parseFrequency", () => {
  it("parses the stored comma separated days", () => {
    expect(parseFrequency("0,2,4")).toEqual([0, 2, 4]);
  });

  it("sorts and de-duplicates", () => {
    expect(parseFrequency("4,0,4,2")).toEqual([0, 2, 4]);
  });

  it("returns nothing for an empty value", () => {
    expect(parseFrequency("")).toEqual([]);
    expect(parseFrequency(null)).toEqual([]);
    expect(parseFrequency(undefined)).toEqual([]);
  });

  it("drops anything that isn't a weekday", () => {
    expect(parseFrequency("0,7,-1,monday,2")).toEqual([0, 2]);
  });
});

describe("normaliseFrequency and formatFrequency", () => {
  it("sorts, de-duplicates and drops out of range days", () => {
    expect(normaliseFrequency([4, 0, 4, 7, -1])).toEqual([0, 4]);
    expect(formatFrequency([4, 0, 4])).toBe("0,4");
  });

  it("formats an empty selection as an empty string", () => {
    expect(formatFrequency([])).toBe("");
  });
});

describe("toggleDay", () => {
  it("adds a day that isn't selected, keeping the list sorted", () => {
    expect(toggleDay([4], 0)).toEqual([0, 4]);
  });

  it("removes a day that is selected", () => {
    expect(toggleDay([0, 4], 4)).toEqual([0]);
  });
});

describe("describeFrequency", () => {
  it("names the days", () => {
    expect(describeFrequency([0, 2])).toBe("Mon, Wed");
  });

  it("recognises the common patterns", () => {
    expect(describeFrequency([0, 1, 2, 3, 4, 5, 6])).toBe("Every day");
    expect(describeFrequency([0, 1, 2, 3, 4])).toBe("Weekdays");
    expect(describeFrequency([5, 6])).toBe("Weekends");
  });

  it("says so when nothing is selected", () => {
    expect(describeFrequency([])).toBe("No days selected");
  });
});
