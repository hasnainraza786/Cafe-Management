import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import './ThemeSelect.css'

export type SelectOption = {
  value: string
  label: string
}

export type SelectGroup = {
  label: string
  options: SelectOption[]
}

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  options?: SelectOption[]
  groups?: SelectGroup[]
  disabled?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  /** When searchable and Enter is pressed with no matching options. */
  onCreateFromSearch?: (query: string) => void
  createHint?: string
  className?: string
  'aria-label'?: string
}

function flattenOptions(options: SelectOption[], groups: SelectGroup[]): SelectOption[] {
  return [...options, ...groups.flatMap((group) => group.options)]
}

function computeMenuStyle(anchor: HTMLElement): React.CSSProperties {
  const rect = anchor.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const openUp = spaceBelow < 220 && rect.top > spaceBelow
  const maxHeight = Math.min(260, Math.max(140, openUp ? rect.top - 16 : spaceBelow - 16))

  return {
    position: 'fixed',
    left: rect.left,
    width: rect.width,
    top: openUp ? undefined : rect.bottom + 6,
    bottom: openUp ? window.innerHeight - rect.top + 6 : undefined,
    maxHeight,
    visibility: 'visible'
  }
}

export function ThemeSelect({
  value,
  onChange,
  placeholder,
  options = [],
  groups = [],
  disabled = false,
  searchable = false,
  searchPlaceholder = 'Search…',
  onCreateFromSearch,
  createHint,
  className = '',
  'aria-label': ariaLabel
}: Props): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    visibility: 'hidden'
  })
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  const flat = flattenOptions(options, groups)
  const selected = flat.find((option) => option.value === value)

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((option) => option.label.toLowerCase().includes(q))
  }, [options, query])

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return groups
    return groups
      .map((group) => ({
        ...group,
        options: group.options.filter((option) => option.label.toLowerCase().includes(q))
      }))
      .filter((group) => group.options.length > 0)
  }, [groups, query])

  const filteredFlat = flattenOptions(filteredOptions, filteredGroups)
  const trimmedQuery = query.trim()
  const canCreate =
    Boolean(onCreateFromSearch) &&
    trimmedQuery.length > 0 &&
    !filteredFlat.some((option) => option.label.toLowerCase() === trimmedQuery.toLowerCase())

  function placeMenu(): void {
    if (!rootRef.current) return
    setMenuStyle(computeMenuStyle(rootRef.current))
  }

  function openMenu(): void {
    if (disabled) return
    if (rootRef.current) {
      setMenuStyle(computeMenuStyle(rootRef.current))
    }
    setQuery('')
    setOpen(true)
  }

  function closeMenu(): void {
    setOpen(false)
    setQuery('')
  }

  useLayoutEffect(() => {
    if (!open) return
    placeMenu()
    window.addEventListener('resize', placeMenu)
    window.addEventListener('scroll', placeMenu, true)
    return () => {
      window.removeEventListener('resize', placeMenu)
      window.removeEventListener('scroll', placeMenu, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    if (searchable) {
      inputRef.current?.focus()
    }

    function handlePointer(event: MouseEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeMenu()
      }
    }

    function handleKey(event: KeyboardEvent): void {
      if (event.key === 'Escape') closeMenu()
    }

    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, searchable])

  function choose(next: string): void {
    onChange(next)
    closeMenu()
  }

  function handleCreate(): void {
    if (!canCreate || !onCreateFromSearch) return
    onCreateFromSearch(trimmedQuery)
    closeMenu()
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (filteredFlat.length === 1) {
        choose(filteredFlat[0].value)
        return
      }
      const exact = filteredFlat.find(
        (option) => option.label.toLowerCase() === trimmedQuery.toLowerCase()
      )
      if (exact) {
        choose(exact.value)
        return
      }
      if (canCreate) {
        handleCreate()
      }
    }
  }

  return (
    <div
      ref={rootRef}
      className={`theme-select ${open ? 'open' : ''} ${disabled ? 'disabled' : ''} ${className}`.trim()}
    >
      {searchable ? (
        <div className="theme-select-search-wrap">
          <input
            ref={inputRef}
            type="text"
            className="theme-select-search"
            value={open ? query : selected?.label ?? ''}
            placeholder={placeholder ?? searchPlaceholder}
            aria-label={ariaLabel}
            aria-expanded={open}
            aria-controls={listId}
            aria-haspopup="listbox"
            disabled={disabled}
            onFocus={openMenu}
            onClick={openMenu}
            onChange={(e) => {
              setQuery(e.target.value)
              if (!open) openMenu()
            }}
            onKeyDown={handleSearchKeyDown}
          />
          <span className="theme-select-chevron" aria-hidden />
        </div>
      ) : (
        <button
          type="button"
          className="theme-select-trigger"
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          disabled={disabled}
          onClick={() => {
            if (open) closeMenu()
            else openMenu()
          }}
        >
          <span className={selected ? 'theme-select-value' : 'theme-select-placeholder'}>
            {selected?.label ?? placeholder ?? 'Select…'}
          </span>
          <span className="theme-select-chevron" aria-hidden />
        </button>
      )}

      {open && (
        <ul
          id={listId}
          className="theme-select-menu"
          role="listbox"
          aria-label={ariaLabel}
          style={menuStyle}
        >
          {!searchable && placeholder && (
            <li role="option" aria-selected={!value}>
              <button
                type="button"
                className={!value ? 'theme-select-option active' : 'theme-select-option muted'}
                onClick={() => choose('')}
              >
                {placeholder}
              </button>
            </li>
          )}

          {filteredOptions.map((option) => (
            <li key={option.value} role="option" aria-selected={option.value === value}>
              <button
                type="button"
                className={
                  option.value === value ? 'theme-select-option active' : 'theme-select-option'
                }
                onClick={() => choose(option.value)}
              >
                {option.label}
              </button>
            </li>
          ))}

          {filteredGroups.map((group) => (
            <li key={group.label} className="theme-select-group" role="presentation">
              <span className="theme-select-group-label">{group.label}</span>
              <ul role="group" aria-label={group.label}>
                {group.options.map((option) => (
                  <li key={option.value} role="option" aria-selected={option.value === value}>
                    <button
                      type="button"
                      className={
                        option.value === value
                          ? 'theme-select-option active'
                          : 'theme-select-option'
                      }
                      onClick={() => choose(option.value)}
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}

          {canCreate && (
            <li role="option" aria-selected={false}>
              <button type="button" className="theme-select-option create" onClick={handleCreate}>
                {createHint ?? `Create “${trimmedQuery}”`}
              </button>
            </li>
          )}

          {filteredFlat.length === 0 && !canCreate && (
            <li className="theme-select-empty">No matches</li>
          )}
        </ul>
      )}
    </div>
  )
}
