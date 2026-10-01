import type { ButtonHTMLAttributes } from 'react'
import './Button.css'

type Variant = 'primary' | 'ghost'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: 'sm' | 'md'
  block?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  className = '',
  type = 'button',
  ...rest
}: Props): React.JSX.Element {
  const classes = [
    variant === 'primary' ? 'btn-primary' : 'btn-ghost',
    size === 'sm' ? 'btn-sm' : '',
    block ? 'btn-block' : '',
    className
  ]
    .filter(Boolean)
    .join(' ')

  return <button type={type} className={classes} {...rest} />
}
