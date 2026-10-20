export function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  maxLength,
  min,
  hint,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-[12px] font-semibold text-[var(--tk-ink)] sm:text-[14px]"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        min={min}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[var(--tk-border-strong)] px-3 py-2.5 text-[13px] text-[var(--tk-ink)] outline-none transition placeholder:text-[var(--tk-ink-muted)] focus:border-[var(--tk-brand)] focus:ring-2 focus:ring-[var(--tk-brand)]/10 sm:text-[14px]"
      />

      {hint && (
        <p className="mt-1 text-[10px] text-[var(--tk-ink-muted)] sm:text-[11px]">
          {hint}
        </p>
      )}
    </div>
  );
}

export function InputWithIcon({
  label,
  name,
  value,
  onChange,
  icon,
  placeholder,
  type = "text",
  inputMode,
  maxLength,
  hint,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-[12px] font-semibold text-[var(--tk-ink)] sm:text-[14px]"
      >
        {label}
      </label>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tk-brand)]">
          {icon}
        </span>

        <input
          id={name}
          name={name}
          type={type}
          inputMode={inputMode}
          maxLength={maxLength}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-lg border border-[var(--tk-border-strong)] py-2.5 pl-9 pr-3 text-[13px] text-[var(--tk-ink)] outline-none transition placeholder:text-[var(--tk-ink-muted)] focus:border-[var(--tk-brand)] focus:ring-2 focus:ring-[var(--tk-brand)]/10 sm:text-[14px]"
        />
      </div>

      {hint && (
        <p className="mt-1 text-[10px] text-[var(--tk-ink-muted)] sm:text-[11px]">
          {hint}
        </p>
      )}
    </div>
  );
}
