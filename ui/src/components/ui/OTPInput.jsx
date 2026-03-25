import React, { useRef, useState,  } from "react";
import { cn } from "../../utils/utils";

const OTPInput = ({ length = 6, value, onChange, className }) => {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const inputRefs = useRef([]);

  // Handle external value changes without useEffect setState
  const displayOtp = React.useMemo(() => {
    if (value && value !== otp.join('')) {
      const valueArr = value.split("");
      const newOtp = Array(length).fill("");
      for (let i = 0; i < Math.min(valueArr.length, length); i++) {
        newOtp[i] = valueArr[i];
      }
      return newOtp;
    }
    return otp;
  }, [value, otp, length]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newOtp = [...otp];
    // Allow only single digit
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);
    
    const combined = newOtp.join("");
    if (onChange) onChange(combined);

    // Move to next input if value is entered
    if (val && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text/plain").replace(/\D/g, "");
    if (!pasteData) return;

    const newOtp = [...otp];
    for (let i = 0; i < Math.min(pasteData.length, length); i++) {
      newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);
    
    if (onChange) onChange(newOtp.join(""));
    
    // Focus next empty input or the last one
    const focusIndex = Math.min(pasteData.length, length - 1);
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex].focus();
    }
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {displayOtp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{1}"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-xl font-semibold rounded-xl border border-border bg-surface text-text-primary shadow-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50"
        />
      ))}
    </div>
  );
};

export { OTPInput };
