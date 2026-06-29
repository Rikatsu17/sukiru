import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

interface FieldWrapperProps {
  label: string;
  hint?: string;
  error?: string;
}

interface TextFieldProps
  extends FieldWrapperProps,
    InputHTMLAttributes<HTMLInputElement> {}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, id, className = "", ...props },
  ref
) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        ref={ref}
        id={fieldId}
        className={`w-full border border-rule rounded-md px-3.5 py-2.5 text-sm bg-white text-ink placeholder:text-stone/60 focus:border-ink transition-colors ${className}`}
        {...props}
      />
      {hint && !error && <span className="text-xs text-stone">{hint}</span>}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
});

interface TextAreaFieldProps
  extends FieldWrapperProps,
    TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  function TextAreaField({ label, hint, error, id, className = "", ...props }, ref) {
    const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={fieldId} className="text-sm font-medium text-ink">
          {label}
        </label>
        <textarea
          ref={ref}
          id={fieldId}
          className={`w-full border border-rule rounded-md px-3.5 py-2.5 text-sm bg-white text-ink placeholder:text-stone/60 focus:border-ink transition-colors resize-none ${className}`}
          {...props}
        />
        {hint && !error && <span className="text-xs text-stone">{hint}</span>}
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    );
  }
);
