'use client'

import { useEffect, useLayoutEffect, useState } from 'react'

const KEY = 'se-intro'
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * Logo-Intro: nur beim Einstieg über die Startseite, einmal pro Browser-Sitzung,
 * überspringbar, respektiert „reduzierte Bewegung“. Liegt als Overlay über der
 * bereits gerenderten Seite und blockiert weder Laden noch Suchmaschinen.
 * Das Skript im <head> setzt `intro-seen`, wenn das Intro nicht laufen soll (CSS blendet es sofort aus).
 */
export function Intro({ tagline }: { tagline: string }) {
  const [state, setState] = useState<'hidden' | 'show' | 'out'>('show')

  useIsoLayoutEffect(() => {
    const html = document.documentElement
    const force = new URLSearchParams(window.location.search).has('intro')
    if (html.classList.contains('intro-seen') && !force) {
      setState('hidden')
      document.body.classList.add('ready')
      return
    }
    html.classList.add('intro-active')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let done = false
    const close = () => {
      if (done) return
      done = true
      try {
        sessionStorage.setItem(KEY, '1')
      } catch {}
      html.classList.remove('intro-active')
      setState('out')
      window.setTimeout(() => document.body.classList.add('ready'), 250)
      window.setTimeout(() => {
        html.classList.add('intro-seen')
        setState('hidden')
      }, 1100)
    }
    const timer = window.setTimeout(close, reduced ? 900 : 2400)
    window.addEventListener('keydown', close, { once: true })
    ;(window as unknown as { __closeIntro?: () => void }).__closeIntro = close
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', close)
      html.classList.remove('intro-active')
    }
  }, [])

  if (state === 'hidden') return null
  const close = () => (window as unknown as { __closeIntro?: () => void }).__closeIntro?.()

  return (
    <div className={`intro${state === 'out' ? ' out' : ''}`} onClick={close} role="presentation" data-testid="intro">
      <div className="intro-inner">
        <img className="intro-logo" src="/brand/logo-widder-weiss.webp" alt="Schaftböller Ebner" width={513} height={581} />
        <p className="intro-tag">{tagline}</p>
      </div>
      <button className="intro-skip" type="button" onClick={close}>
        Überspringen
      </button>
      <div className="intro-bar" />
    </div>
  )
}
