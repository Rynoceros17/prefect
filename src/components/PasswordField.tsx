import { motion } from 'framer-motion'
import { useId, useState, type ChangeEvent } from 'react'

interface PasswordFieldProps {
  value: string
  onChange: (value: string) => void
  error?: boolean
  shake?: number
  autoComplete?: string
  label?: string
  autoFocus?: boolean
}

export function PasswordField({
  value,
  onChange,
  error = false,
  shake = 0,
  autoComplete = 'off',
  label = 'Password',
  autoFocus = false,
}: PasswordFieldProps) {
  const inputId = useId()
  const [visible, setVisible] = useState(false)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  return (
    <motion.div
      className={`password-field ${error ? 'password-field--error' : ''}`}
      key={shake}
      animate={error ? { x: [-12, 12, -8, 8, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      <label className="sr-only" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={handleChange}
        className="password-input"
        placeholder=""
        autoComplete={autoComplete}
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-1p-ignore
        data-lpignore="true"
        aria-invalid={error}
        autoFocus={autoFocus}
      />
      <button
        type="button"
        className="password-field__toggle"
        onClick={() => setVisible((show) => !show)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </motion.div>
  )
}
