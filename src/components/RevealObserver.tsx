'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/** Blendet `.reveal`-Elemente beim Scrollen ein und färbt `.tone`-Bilder ein. */
export function RevealObserver() {
  const pathname = usePathname()

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal, .tone').forEach((el) => el.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.12 },
    )
    const observe = () => document.querySelectorAll('.reveal:not(.in), .tone:not(.in)').forEach((el) => io.observe(el))
    observe()
    // Später nachgeladene Inhalte (z. B. Client-Komponenten) ebenfalls beobachten
    const mo = new MutationObserver(observe)
    mo.observe(document.body, { childList: true, subtree: true })
    if (!document.documentElement.classList.contains('intro-active')) document.body.classList.add('ready')
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [pathname])

  return null
}
