import './NumberPad.css'

interface NumberPadProps {
  onDigit: (digit: string) => void
  onBackspace: () => void
  onEnter: () => void
  /** Disables every key (e.g. when the round is over). */
  disabled?: boolean
}

/**
 * An on-screen numeric keypad. The game uses this instead of a native text input
 * so the device's software keyboard never opens — that keyboard would otherwise
 * slide up and cover the problem on phones. Because we own these keys, the layout
 * stays fully under our control on every screen size.
 *
 * Physical-keyboard input is still handled separately by the game (so desktop
 * players can just type); this component only drives touch / click input.
 */
export default function NumberPad({
  onDigit,
  onBackspace,
  onEnter,
  disabled = false,
}: NumberPadProps) {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

  return (
    <div className="number-pad" role="group" aria-label="Number pad">
      {digits.map((d) => (
        <button
          key={d}
          type="button"
          className="pad-key"
          onClick={() => onDigit(d)}
          disabled={disabled}
          aria-label={d}
        >
          {d}
        </button>
      ))}

      <button
        type="button"
        className="pad-key pad-key--action"
        onClick={onBackspace}
        disabled={disabled}
        aria-label="Delete"
      >
        ⌫
      </button>

      <button
        type="button"
        className="pad-key"
        onClick={() => onDigit('0')}
        disabled={disabled}
        aria-label="0"
      >
        0
      </button>

      <button
        type="button"
        className="pad-key pad-key--enter"
        onClick={onEnter}
        disabled={disabled}
        aria-label="Enter"
      >
        Go
      </button>
    </div>
  )
}
