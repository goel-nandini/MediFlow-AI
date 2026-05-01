import React, { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  hint,
  leftIcon,
  className = "",
  required,
  ...props
}) => {
  const inputClasses = `
    w-full bg-bgLight/60 border rounded-xl px-4 py-3 text-primary text-sm transition
    placeholder:text-primary/30 focus:outline-none focus:ring-2
    ${leftIcon ? "pl-10" : ""}
    ${error ? "border-danger focus:ring-danger focus:border-danger" : "border-bgSoft focus:ring-accent focus:border-accent"}
  `;

  return (
    <div className={`w-full ${className}`}>
      <label className="text-sm font-semibold text-primary mb-1.5 flex items-center">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input className={inputClasses} required={required} {...props} />
      </div>
      {error && (
        <p className="text-danger text-xs mt-1.5 flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-primary/50 text-xs mt-1.5">{hint}</p>
      )}
    </div>
  );
};
