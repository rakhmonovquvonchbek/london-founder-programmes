import { useEffect, useRef, type ReactNode } from 'react'

type FocusLockProps = {
  active: boolean
  children: ReactNode
}

export default function FocusLock({ active, children }: FocusLockProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return
    const root = rootRef.current
    if (!root) return

    const focusables = () =>
      [...root.querySelectorAll<HTMLElement>('button, [href], input, textarea, select')].filter(
        (node) => !node.hasAttribute('disabled') && node.getAttribute('aria-hidden') !== 'true',
      )

    const initial = focusables()[0]
    initial?.focus()

    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Tab') return
      const nodes = focusables()
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    root.addEventListener('keydown', onKey)
    return () => root.removeEventListener('keydown', onKey)
  }, [active])

  return <div ref={rootRef}>{children}</div>
}
