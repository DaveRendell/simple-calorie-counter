import { describe, it, expect, afterEach } from "vitest";
import { toDateStr } from "../../src/dateFormat";

describe("toDateStr", () => {
  it("should format a date as YYYY-MM-DD", () => {
    expect(toDateStr(new Date(2024, 0, 15))).toBe("2024-01-15");
    expect(toDateStr(new Date(2024, 11, 31))).toBe("2024-12-31");
    expect(toDateStr(new Date(2024, 5, 1))).toBe("2024-06-01");
  });

  it("should use local time, not UTC", () => {
    const date = new Date(2024, 0, 15);
    const result = toDateStr(date);

    const expectedYear = date.getFullYear();
    const expectedMonth = String(date.getMonth() + 1).padStart(2, "0");
    const expectedDay = String(date.getDate()).padStart(2, "0");

    expect(result).toBe(`${expectedYear}-${expectedMonth}-${expectedDay}`);
  });

  it("should zero-pad single-digit months and days", () => {
    expect(toDateStr(new Date(2024, 2, 5))).toBe("2024-03-05");
    expect(toDateStr(new Date(2024, 0, 1))).toBe("2024-01-01");
  });

  describe("across timezones", () => {
    const originalTZ = process.env.TZ;

    afterEach(() => {
      if (originalTZ === undefined) {
        delete process.env.TZ;
      } else {
        process.env.TZ = originalTZ;
      }
    });

    it("should return next day in UTC+13 when UTC date is previous day", () => {
      process.env.TZ = "Pacific/Auckland";
      // Jan 15 2024 23:00 UTC = Jan 16 2024 12:00 NZDT (UTC+13 in summer)
      const date = new Date(Date.UTC(2024, 0, 15, 23, 0, 0));
      expect(toDateStr(date)).toBe("2024-01-16");
    });

    it("should return previous day in UTC-5 when UTC date is next day", () => {
      process.env.TZ = "America/New_York";
      // Jan 15 2024 03:00 UTC = Jan 14 2024 22:00 EST (UTC-5)
      const date = new Date(Date.UTC(2024, 0, 15, 3, 0, 0));
      expect(toDateStr(date)).toBe("2024-01-14");
    });
  });
});
