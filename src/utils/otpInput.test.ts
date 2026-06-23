import { describe, it, expect } from "vitest";
import {
  OTP_LENGTH,
  createInitialOtpState,
  otpReducer,
  otpValue,
  type OtpState,
} from "./otpInput";

const stateFrom = (digits: string[], focus: number): OtpState => ({
  digits: [...digits],
  focus,
});

describe("otpInput", () => {
  it("OTP_LENGTH is 6", () => {
    expect(OTP_LENGTH).toBe(6);
  });

  describe("createInitialOtpState", () => {
    it("starts with six empty slots and focus at 0", () => {
      expect(createInitialOtpState()).toEqual({
        digits: ["", "", "", "", "", ""],
        focus: 0,
      });
    });

    it("returns a fresh object each call (no shared array reference)", () => {
      const a = createInitialOtpState();
      const b = createInitialOtpState();
      expect(a).not.toBe(b);
      expect(a.digits).not.toBe(b.digits);
    });
  });

  describe("otpValue", () => {
    it("joins the digits into a single string", () => {
      expect(otpValue(stateFrom(["1", "2", "3", "4", "5", "6"], 5))).toBe("123456");
    });

    it("collapses empty slots when only partially filled", () => {
      expect(otpValue(stateFrom(["1", "2", "", "", "", ""], 2))).toBe("12");
    });
  });

  describe("type action", () => {
    it("sets a digit in an empty slot and advances focus", () => {
      const next = otpReducer(createInitialOtpState(), { type: "type", index: 0, value: "4" });
      expect(next.digits).toEqual(["4", "", "", "", "", ""]);
      expect(next.focus).toBe(1);
    });

    it("does not advance focus past the last slot", () => {
      const next = otpReducer(stateFrom(["1", "2", "3", "4", "5", ""], 5), {
        type: "type",
        index: 5,
        value: "6",
      });
      expect(next.digits).toEqual(["1", "2", "3", "4", "5", "6"]);
      expect(next.focus).toBe(5);
    });

    it("overwrites an existing digit at the index", () => {
      const next = otpReducer(stateFrom(["1", "", "", "", "", ""], 1), {
        type: "type",
        index: 0,
        value: "9",
      });
      expect(next.digits[0]).toBe("9");
      expect(next.focus).toBe(1);
    });

    it("strips non-digit characters", () => {
      const next = otpReducer(createInitialOtpState(), { type: "type", index: 1, value: "a9b" });
      expect(next.digits).toEqual(["", "9", "", "", "", ""]);
      expect(next.focus).toBe(2);
    });

    it("clears the slot and keeps focus when the value is empty (deletion)", () => {
      const next = otpReducer(stateFrom(["1", "2", "3", "", "", ""], 2), {
        type: "type",
        index: 2,
        value: "",
      });
      expect(next.digits).toEqual(["1", "2", "", "", "", ""]);
      expect(next.focus).toBe(2);
    });

    it("treats a multi-digit value (autofill landing in one field) as a fill from the index", () => {
      const next = otpReducer(createInitialOtpState(), { type: "type", index: 0, value: "456" });
      expect(next.digits).toEqual(["4", "5", "6", "", "", ""]);
      expect(next.focus).toBe(3);
    });
  });

  describe("backspace action", () => {
    it("clears a filled slot and keeps focus on it", () => {
      const next = otpReducer(stateFrom(["1", "2", "3", "9", "", ""], 3), {
        type: "backspace",
        index: 3,
      });
      expect(next.digits).toEqual(["1", "2", "3", "", "", ""]);
      expect(next.focus).toBe(3);
    });

    it("on an empty slot, clears the previous slot and moves focus back", () => {
      const next = otpReducer(stateFrom(["1", "2", "5", "", "", ""], 3), {
        type: "backspace",
        index: 3,
      });
      expect(next.digits).toEqual(["1", "2", "", "", "", ""]);
      expect(next.focus).toBe(2);
    });

    it("does nothing at index 0 when already empty", () => {
      const start = stateFrom(["", "", "", "", "", ""], 0);
      const next = otpReducer(start, { type: "backspace", index: 0 });
      expect(next.digits).toEqual(["", "", "", "", "", ""]);
      expect(next.focus).toBe(0);
    });
  });

  describe("paste action", () => {
    it("fills all slots from a 6-digit paste and focuses the last", () => {
      const next = otpReducer(createInitialOtpState(), { type: "paste", index: 0, text: "123456" });
      expect(next.digits).toEqual(["1", "2", "3", "4", "5", "6"]);
      expect(next.focus).toBe(5);
    });

    it("strips non-digits from the pasted text", () => {
      const next = otpReducer(createInitialOtpState(), { type: "paste", index: 0, text: "12-34 56" });
      expect(next.digits).toEqual(["1", "2", "3", "4", "5", "6"]);
      expect(next.focus).toBe(5);
    });

    it("fills from the paste index when offset", () => {
      const next = otpReducer(createInitialOtpState(), { type: "paste", index: 2, text: "789" });
      expect(next.digits).toEqual(["", "", "7", "8", "9", ""]);
      expect(next.focus).toBe(5);
    });

    it("truncates a paste longer than the remaining slots", () => {
      const next = otpReducer(createInitialOtpState(), { type: "paste", index: 0, text: "9999999999" });
      expect(next.digits).toEqual(["9", "9", "9", "9", "9", "9"]);
      expect(next.focus).toBe(5);
    });

    it("does nothing when the pasted text has no digits", () => {
      const start = stateFrom(["1", "", "", "", "", ""], 1);
      const next = otpReducer(start, { type: "paste", index: 1, text: "abc!" });
      expect(next.digits).toEqual(["1", "", "", "", "", ""]);
      expect(next.focus).toBe(1);
    });
  });

  describe("reset action", () => {
    it("returns to the initial empty state", () => {
      const next = otpReducer(stateFrom(["1", "2", "3", "4", "5", "6"], 5), { type: "reset" });
      expect(next).toEqual(createInitialOtpState());
    });
  });

  describe("unknown action", () => {
    it("returns the state unchanged", () => {
      const start = stateFrom(["1", "2", "", "", "", ""], 2);
      // @ts-expect-error exercising the default branch with an invalid action
      const next = otpReducer(start, { type: "noop" });
      expect(next).toEqual(start);
    });
  });
});