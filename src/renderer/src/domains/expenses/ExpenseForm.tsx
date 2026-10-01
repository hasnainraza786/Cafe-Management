import { FormEvent, useState } from 'react'
import { Button } from '@renderer/shared/ui'

type Props = {
  todayKey: string
  onAdd: (input: { date: string; amount: number; note: string }) => Promise<void>
  onAdded: (date: string) => void
}

export function ExpenseForm({ todayKey, onAdd, onAdded }: Props): React.JSX.Element {
  const [date, setDate] = useState(todayKey)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault()
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0 || !note.trim()) return
    setSaving(true)
    try {
      await onAdd({ date, amount: value, note })
      setAmount('')
      setNote('')
      onAdded(date)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="manager-form-panel">
      <h2>Add expense</h2>
      <form className="product-form" onSubmit={handleSubmit}>
        <label>
          Date
          <input
            type="date"
            value={date}
            max={todayKey}
            onChange={(e) => setDate(e.target.value || todayKey)}
            required
          />
        </label>
        <label>
          Amount (Rs)
          <input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>
        <label>
          Note
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Milk, gas, utilities…"
            required
          />
        </label>
        <Button type="submit" disabled={saving}>
          Add expense
        </Button>
      </form>
    </section>
  )
}
