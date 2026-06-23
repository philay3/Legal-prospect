export const OTP_LENGTH = 6;

export type OtpState = {
  digits: string[];
  focus: number;
};

export type OtpAction =
  | { type: "type"; index: number; value: string }
  | { type: "backspace"; index: number }
  | { type: "paste"; index: number; text: string }
  | { type: "reset" };

export function createInitialOtpState(): OtpState {
  return {
    digits: Array(OTP_LENGTH).fill(""),
    focus: 0,
  };
}

export function otpValue(state: OtpState): string {
  return state.digits.join("");
}

export function otpReducer(state: OtpState, action: OtpAction): OtpState {
  switch (action.type) {
    case "type": {
      const { index, value } = action;
      const digitsOnly = value.replace(/\D/g, "");
      const nextDigits = [...state.digits];

      if (digitsOnly === "") {
        nextDigits[index] = "";
        return {
          digits: nextDigits,
          focus: index,
        };
      }

      let placedCount = 0;
      for (let i = 0; i < digitsOnly.length; i++) {
        const targetIndex = index + i;
        if (targetIndex < OTP_LENGTH) {
          nextDigits[targetIndex] = digitsOnly[i];
          placedCount++;
        }
      }

      const nextFocus = Math.min(index + placedCount, OTP_LENGTH - 1);
      return {
        digits: nextDigits,
        focus: nextFocus,
      };
    }

    case "backspace": {
      const { index } = action;
      const nextDigits = [...state.digits];

      if (nextDigits[index] !== "") {
        nextDigits[index] = "";
        return {
          digits: nextDigits,
          focus: index,
        };
      } else if (index > 0) {
        nextDigits[index - 1] = "";
        return {
          digits: nextDigits,
          focus: index - 1,
        };
      }

      return state;
    }

    case "paste": {
      const { index, text } = action;
      const digitsOnly = text.replace(/\D/g, "");

      if (!digitsOnly) {
        return state;
      }

      const nextDigits = [...state.digits];
      let placedCount = 0;
      for (let i = 0; i < digitsOnly.length; i++) {
        const targetIndex = index + i;
        if (targetIndex < OTP_LENGTH) {
          nextDigits[targetIndex] = digitsOnly[i];
          placedCount++;
        }
      }

      const nextFocus = Math.min(index + placedCount, OTP_LENGTH - 1);
      return {
        digits: nextDigits,
        focus: nextFocus,
      };
    }

    case "reset": {
      return createInitialOtpState();
    }

    default: {
      return state;
    }
  }
}
