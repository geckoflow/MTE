'use client'

import './configurator.css'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  ENGRAVING_HINT,
  blockedOptions,
  encodeSelection,
  formatEuro,
  isEngravingAllowed,
  quote as computeQuote,
} from '@/lib/configurator/engine'
import {
  FONT_FAMILIES,
  MOTIF_PATHS,
  WOODS,
  renderIllustration,
  visualStateFrom,
  type Motif,
  type WoodPreset,
} from '@/lib/configurator/illustration'
import {
  STEP_KEYS,
  STEP_LABELS,
  type Catalog,
  type CatalogGroup,
  type CatalogOption,
  type Selection,
  type StepKey,
  type TextSelection,
  type VatMode,
} from '@/lib/configurator/types'

export type ConfiguratorProps = {
  catalog: Catalog
  products: { slug: string; name: string }[]
  showPrices: boolean
  vat: { mode: VatMode; rate: number }
  vatNote: string
  leadTimeNote: string
  inquiryNote: string
  initialSelection: Selection
  initialStep?: 'uebersicht'
  savedCode?: string
  notice?: string
}

type StepId = StepKey | 'uebersicht'

const plusPrice = (cents: number, show: boolean) => (!show ? '' : cents === 0 ? 'inklusive' : `+ ${formatEuro(cents)}`)

function OptionVisual({ option }: { option: CatalogOption }) {
  if (option.imageUrl) return <img className="opt-thumb" src={option.imageUrl} alt="" loading="lazy" />
  if (option.visual.startsWith('holz-')) {
    const w = WOODS[option.visual as WoodPreset]
    return <span className="swatch" style={{ ['--c' as string]: `linear-gradient(160deg,${w.c[2]},${w.c[0]} 55%,${w.c[1]})` }} />
  }
  if (option.visual === 'riemen' && option.color) return <span className="swatch" style={{ ['--c' as string]: option.color }} />
  if (option.visual.startsWith('motiv-')) {
    return (
      <svg
        className="motif"
        viewBox="-40 -40 80 80"
        fill="rgba(216,194,165,.18)"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: MOTIF_PATHS[option.visual.slice(6) as Motif] }}
      />
    )
  }
  if (option.key === 'keine' || option.key === 'ohne') {
    return (
      <svg className="motif" viewBox="-40 -40 80 80" aria-hidden="true">
        <circle r="30" fill="none" stroke="currentColor" strokeDasharray="3 5" />
      </svg>
    )
  }
  return null
}

export function Configurator(props: ConfiguratorProps) {
  const { catalog, showPrices, vat } = props
  const router = useRouter()
  const [selection, setSelection] = useState<Selection>(props.initialSelection)
  const [savedCode, setSavedCode] = useState<string | undefined>(props.savedCode)
  const [view, setView] = useState('seite')
  const [toast, setToast] = useState('')
  const [busy, setBusy] = useState<'' | 'share' | 'pdf'>('')
  const touched = useRef(false)

  const steps: StepId[] = useMemo(() => {
    const present = STEP_KEYS.filter((k) => k === 'modell' || catalog.groups.some((g) => g.step === k))
    return [...present, 'uebersicht']
  }, [catalog])
  const [stepIndex, setStepIndex] = useState(props.initialStep === 'uebersicht' ? steps.length - 1 : 0)
  const step = steps[stepIndex]

  const q = useMemo(() => computeQuote(catalog, selection, vat), [catalog, selection, vat])
  const blocked = useMemo(() => blockedOptions(catalog, selection), [catalog, selection])
  const visual = useMemo(() => visualStateFrom(catalog, selection), [catalog, selection])
  const photoMode = catalog.product.layers.length > 0
  const views = useMemo(() => [...new Set(catalog.product.layers.map((l) => l.view))], [catalog])

  // Auswahl in der URL halten (Neuladen, Zurück-Taste, Link teilen)
  useEffect(() => {
    if (!touched.current) return
    const url = `/konfigurator?modell=${encodeURIComponent(catalog.product.slug)}&k=${encodeSelection(selection)}`
    window.history.replaceState(window.history.state, '', url)
  }, [selection, catalog.product.slug])

  // Preis kurz hervorheben, wenn er sich ändert
  const totalRef = useRef<HTMLElement>(null)
  const lastTotal = useRef(q.totalCents)
  useEffect(() => {
    if (lastTotal.current === q.totalCents) return
    lastTotal.current = q.totalCents
    const el = totalRef.current
    if (!el) return
    el.classList.remove('bump')
    void el.offsetWidth
    el.classList.add('bump')
  }, [q.totalCents])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(''), 3800)
    return () => window.clearTimeout(t)
  }, [toast])

  const update = useCallback((key: string, value: Selection[string]) => {
    touched.current = true
    setSavedCode(undefined)
    setSelection((s) => ({ ...s, [key]: value }))
  }, [])

  const goTo = (index: number, focus = false) => {
    const next = Math.max(0, Math.min(steps.length - 1, index))
    setStepIndex(next)
    if (focus) window.requestAnimationFrame(() => document.getElementById(`tab-${steps[next]}`)?.focus())
  }

  async function save(): Promise<{ code: string; url: string; pdfUrl: string } | null> {
    const res = await fetch('/api/konfiguration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: catalog.product.slug, selection }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      setToast(json.error || 'Konfiguration konnte nicht gespeichert werden.')
      return null
    }
    setSavedCode(json.code)
    return json
  }

  async function share() {
    setBusy('share')
    try {
      const saved = await save()
      if (!saved) return
      const url = `${window.location.origin}${saved.url}`
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
        await navigator.share({ title: `Meine Schaftböller-Konfiguration ${saved.code}`, url }).catch(() => {})
      } else {
        await navigator.clipboard.writeText(url)
        setToast(`Link kopiert: ${saved.code}`)
      }
    } catch {
      setToast('Link konnte nicht kopiert werden.')
    } finally {
      setBusy('')
    }
  }

  async function pdf() {
    setBusy('pdf')
    const win = window.open('', '_blank')
    try {
      const saved = await save()
      if (!saved) {
        win?.close()
        return
      }
      if (win) win.location.href = saved.pdfUrl
      else window.location.href = saved.pdfUrl
    } finally {
      setBusy('')
    }
  }

  const groupsOf = (s: StepId) => catalog.groups.filter((g) => g.step === s)

  function renderGroup(group: CatalogGroup) {
    const value = selection[group.key]
    const help = group.help ? <p className="group-help">{group.help}</p> : null
    if (group.kind === 'single' || group.kind === 'multi') {
      const type = group.kind === 'single' ? 'radio' : 'checkbox'
      const chosen = group.kind === 'single' ? [value as string] : ((value as string[]) ?? [])
      return (
        <fieldset className="group" key={group.key}>
          <legend className={group.label === STEP_LABELS[group.step] ? 'visually-hidden' : undefined}>{group.label}</legend>
          {help}
          <div className="opts">
            {group.options.map((o) => {
              const id = `${group.key}.${o.key}`
              const isBlocked = blocked.has(id)
              return (
                <label className="opt" key={o.key}>
                  <input
                    type={type}
                    name={group.key}
                    value={o.key}
                    checked={chosen.includes(o.key)}
                    disabled={!o.available || isBlocked}
                    onChange={(e) => {
                      if (group.kind === 'single') update(group.key, o.key)
                      else {
                        const set = new Set(chosen)
                        if (e.target.checked) set.add(o.key)
                        else set.delete(o.key)
                        update(
                          group.key,
                          group.options.map((x) => x.key).filter((k) => set.has(k)),
                        )
                      }
                    }}
                  />
                  <span className="opt-body">
                    <OptionVisual option={o} />
                    <span className="opt-name">{o.label}</span>
                    {o.description && <span className="opt-desc">{o.description}</span>}
                    {!o.available && <span className="opt-desc">derzeit nicht verfügbar</span>}
                    {isBlocked && o.available && <span className="opt-desc">mit deiner Auswahl nicht kombinierbar</span>}
                    <span className="opt-price">{plusPrice(o.priceCents, showPrices)}</span>
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>
      )
    }
    if (group.kind === 'accessories') {
      const chosen = (value as string[]) ?? []
      return (
        <fieldset className="group" key={group.key}>
          <legend className={group.label === STEP_LABELS[group.step] ? 'visually-hidden' : undefined}>{group.label}</legend>
          {help}
          <div className="opts">
            {group.accessoryIds.map((id) => {
              const a = catalog.accessories[id]
              if (!a) return null
              return (
                <label className="opt" key={id}>
                  <input
                    type="checkbox"
                    name={group.key}
                    value={id}
                    checked={chosen.includes(id)}
                    disabled={!a.available}
                    onChange={(e) => {
                      const set = new Set(chosen)
                      if (e.target.checked) set.add(id)
                      else set.delete(id)
                      update(
                        group.key,
                        group.accessoryIds.filter((x) => set.has(x)),
                      )
                    }}
                  />
                  <span className="opt-body">
                    {a.imageUrl && <img className="opt-thumb" src={a.imageUrl} alt="" loading="lazy" />}
                    <span className="opt-name">{a.name}</span>
                    {a.description && <span className="opt-desc">{a.description}</span>}
                    {!a.available && <span className="opt-desc">derzeit nicht verfügbar</span>}
                    <span className="opt-price">{plusPrice(a.priceCents, showPrices)}</span>
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>
      )
    }
    // Texteingabe (Beschriftung)
    const text = group.text!
    const v = (value as TextSelection) ?? { enabled: false, text: '', font: text.fonts[0]?.key ?? '' }
    const inputId = `txt-${group.key}`
    return (
      <div className="group" key={group.key}>
        <label className="switch">
          <input
            type="checkbox"
            checked={v.enabled}
            onChange={(e) => update(group.key, { ...v, enabled: e.target.checked, text: e.target.checked ? v.text : '' })}
          />
          {group.label}
          <small>{plusPrice(text.priceCents, showPrices)}</small>
        </label>
        {help}
        {v.enabled && (
          <>
            <div className="field">
              <label htmlFor={inputId}>Text (Name, Verein, Datum)</label>
              <input
                id={inputId}
                type="text"
                maxLength={text.maxLength}
                placeholder={text.placeholder}
                value={v.text}
                autoComplete="off"
                autoFocus
                aria-invalid={!isEngravingAllowed(v.text)}
                aria-describedby={`${inputId}-hint`}
                onChange={(e) => update(group.key, { ...v, text: e.target.value })}
              />
              <span className="counter">
                {v.text.length} / {text.maxLength}
              </span>
              {!isEngravingAllowed(v.text) && (
                <span className="err" id={`${inputId}-hint`} role="alert">
                  {ENGRAVING_HINT}
                </span>
              )}
            </div>
            {text.fonts.length > 1 && (
              <fieldset className="group">
                <legend>Schriftart</legend>
                <div className="opts">
                  {text.fonts.map((f) => (
                    <label className="opt" key={f.key}>
                      <input type="radio" name={`${group.key}-font`} value={f.key} checked={v.font === f.key} onChange={() => update(group.key, { ...v, font: f.key })} />
                      <span className="opt-body">
                        <span className="font-sample" style={{ fontFamily: FONT_FAMILIES[f.font].css, fontWeight: FONT_FAMILIES[f.font].weight }}>
                          {v.text.split(' ')[0] || 'Ebner'}
                        </span>
                        <span className="opt-name">{f.label}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </>
        )}
      </div>
    )
  }

  const chips = (Object.entries(selection).flatMap(([key, value]) => {
    const g = catalog.groups.find((x) => x.key === key)
    return g?.kind === 'accessories' && Array.isArray(value) ? value.map((id) => catalog.accessories[id]?.name).filter(Boolean) : []
  }) as string[])

  return (
    <section className="konfig" aria-labelledby="konfig-h">
      <div className="wrap">
        <div className="konfig-head">
          <div>
            <p className="eyebrow">Konfigurator · {catalog.product.name}</p>
            <h1 className="h-l" id="konfig-h">
              Dein <span className="outline">Unikat.</span>
            </h1>
          </div>
          <p className="lead">
            Stell dir deinen Schaftböller zusammen. Vorschau und Preis ändern sich mit jeder Auswahl. Am Ende fragst du unverbindlich an oder teilst
            deine Konfiguration per Link.
          </p>
        </div>
        {props.notice && (
          <p className="konfig-notice" role="status">
            {props.notice}
          </p>
        )}

        <div className="konfig-grid">
          <div className="konfig-stage">
            {photoMode ? (
              <div className="photo-stage" role="img" aria-label={`Vorschau ${catalog.product.name}`}>
                {[
                  ...catalog.product.layers.filter((l) => l.view === view),
                  ...catalog.groups.flatMap((g) => {
                    const v = selection[g.key]
                    const keys = typeof v === 'string' ? [v] : Array.isArray(v) ? v : []
                    if (g.kind === 'accessories') return keys.flatMap((id) => catalog.accessories[id]?.layers ?? [])
                    return g.options.filter((o) => keys.includes(o.key)).flatMap((o) => o.layers)
                  }).filter((l) => l.view === view),
                ]
                  .sort((a, b) => a.z - b.z)
                  .map((l, i) => (
                    <img key={`${l.url}-${i}`} src={l.url} alt="" />
                  ))}
                {visual.text && catalog.product.textArea && view === 'seite' && (
                  <span
                    className="engraving"
                    style={{
                      left: `${catalog.product.textArea.x}%`,
                      top: `${catalog.product.textArea.y}%`,
                      maxWidth: `${catalog.product.textArea.width}%`,
                      transform: `translate(-50%,-50%) rotate(${catalog.product.textArea.rotate}deg)`,
                      fontFamily: FONT_FAMILIES[visual.font].css,
                      fontWeight: FONT_FAMILIES[visual.font].weight,
                      fontSize: 'clamp(12px, 2.2vw, 26px)',
                    }}
                  >
                    {visual.text}
                  </span>
                )}
              </div>
            ) : (
              <div
                className="stage-svg"
                dangerouslySetInnerHTML={{ __html: renderIllustration(visual, { uid: 'k', title: `Vorschau ${catalog.product.name}` }) }}
              />
            )}
            {photoMode && views.length > 1 && (
              <div className="view-toggle" role="group" aria-label="Ansicht">
                {views.map((v) => (
                  <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}>
                    {v === 'seite' ? 'Seite' : 'Detail'}
                  </button>
                ))}
              </div>
            )}
            <ul className="stage-chips" aria-label="Gewähltes Zubehör">
              {chips.map((c) => (
                <li key={c}>+ {c}</li>
              ))}
            </ul>
            <p className="stage-note">
              {photoMode
                ? 'Vorschau aus Produktfotos. Jedes Stück ist ein handgefertigtes Unikat.'
                : 'Schematische Illustration. Jedes Stück ist ein handgefertigtes Unikat.'}
            </p>
          </div>

          <div className="konfig-panel">
            <div
              className="steps"
              role="tablist"
              aria-label="Konfigurationsschritte"
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') goTo(stepIndex + 1, true)
                if (e.key === 'ArrowLeft') goTo(stepIndex - 1, true)
              }}
            >
              {steps.map((s, i) => (
                <button
                  key={s}
                  role="tab"
                  type="button"
                  id={`tab-${s}`}
                  aria-controls={`panel-${s}`}
                  aria-selected={i === stepIndex}
                  tabIndex={i === stepIndex ? 0 : -1}
                  className={i < stepIndex ? 'done' : undefined}
                  onClick={() => goTo(i)}
                >
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  {STEP_LABELS[s]}
                </button>
              ))}
            </div>

            <div className="step-panel" role="tabpanel" id={`panel-${step}`} aria-labelledby={`tab-${step}`} key={step}>
              {step === 'modell' && (
                <>
                  <h2>Grundmodell</h2>
                  <p className="hint">Wähle das Modell, mit dem du startest.</p>
                  <fieldset className="group">
                    <legend>Modell</legend>
                    <div className="opts" style={{ gridTemplateColumns: '1fr' }}>
                      {props.products.map((p) => (
                        <label className="opt" key={p.slug}>
                          <input
                            type="radio"
                            name="modell"
                            value={p.slug}
                            checked={p.slug === catalog.product.slug}
                            onChange={() => router.push(`/konfigurator?modell=${encodeURIComponent(p.slug)}`)}
                          />
                          <span className="opt-body model-card">
                            <span className="badge" aria-hidden="true">
                              SE
                            </span>
                            <span>
                              <span className="opt-name">{p.name}</span>
                              {p.slug === catalog.product.slug && <span className="opt-desc" style={{ display: 'block' }}>{catalog.product.baseLabel}</span>}
                            </span>
                            <span className="opt-price">{p.slug === catalog.product.slug && showPrices ? formatEuro(catalog.product.basePriceCents) : ''}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {groupsOf('modell').map(renderGroup)}
                </>
              )}

              {step !== 'modell' && step !== 'uebersicht' && (
                <>
                  <h2>{STEP_LABELS[step]}</h2>
                  {groupsOf(step).map(renderGroup)}
                </>
              )}

              {step === 'uebersicht' && (
                <>
                  <h2>Deine Konfiguration</h2>
                  <div className="code" aria-live="polite">
                    <span>Konfigurations-Code</span>
                    {savedCode ? <strong data-testid="code">{savedCode}</strong> : <span>wird beim Teilen oder Anfragen vergeben</span>}
                  </div>
                  <ul className="summary">
                    {q.lines.map((l, i) => (
                      <li key={i}>
                        <span>
                          {l.label}
                          {l.detail && <small>{l.detail}</small>}
                        </span>
                        <span>{showPrices ? (l.amountCents ? formatEuro(l.amountCents) : 'inklusive') : ''}</span>
                      </li>
                    ))}
                    <li className="total">
                      <span>Gesamt</span>
                      <span>{showPrices ? formatEuro(q.totalCents) : 'Preis auf Anfrage'}</span>
                    </li>
                  </ul>
                  <p className="hint" style={{ marginTop: 14 }}>
                    {showPrices && `${props.vatNote}. `}
                    {props.leadTimeNote} Sonderwünsche? <Link href="/kontakt?thema=sonderwunsch">Schreib uns</Link>.
                  </p>
                  <div className="sum-actions">
                    <InquiryButton catalog={catalog} selection={selection} totalLabel={showPrices ? formatEuro(q.totalCents) : ''} note={props.inquiryNote} onSent={(code) => setSavedCode(code)} />
                    <button className="btn btn-ghost" type="button" onClick={share} disabled={busy !== ''}>
                      {busy === 'share' ? 'Speichere …' : 'Link teilen'}
                    </button>
                    <button className="btn btn-ghost" type="button" onClick={pdf} disabled={busy !== ''}>
                      {busy === 'pdf' ? 'Erzeuge …' : 'PDF'}
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="step-nav">
              <button className="btn btn-ghost" type="button" onClick={() => goTo(stepIndex - 1)} style={{ visibility: stepIndex === 0 ? 'hidden' : 'visible' }}>
                ← Zurück
              </button>
              {stepIndex < steps.length - 1 && (
                <button className="btn btn-light" type="button" onClick={() => goTo(stepIndex + 1)}>
                  Weiter →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="price-bar">
        <div className="wrap">
          <div>
            <span className="label">Gesamtpreis</span>
            <strong ref={totalRef} aria-live="polite" data-testid="total">
              {showPrices ? formatEuro(q.totalCents) : 'auf Anfrage'}
            </strong>
            {showPrices && <small>{props.vatNote}</small>}
          </div>
          <button className="btn btn-light" type="button" onClick={() => goTo(steps.length - 1)}>
            Zur Übersicht
          </button>
        </div>
      </div>

      <div className={`toast${toast ? ' show' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </section>
  )
}

function InquiryButton({
  catalog,
  selection,
  totalLabel,
  note,
  onSent,
}: {
  catalog: Catalog
  selection: Selection
  totalLabel: string
  note: string
  onSent: (code: string) => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const openedAt = useRef(0)
  const [state, setState] = useState<{ kind: 'idle' | 'sending' | 'ok' | 'error'; message?: string; code?: string }>({ kind: 'idle' })

  function open() {
    openedAt.current = Date.now()
    setState({ kind: 'idle' })
    dialog.current?.showModal()
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.reportValidity()) return
    const data = Object.fromEntries(new FormData(form).entries())
    setState({ kind: 'sending' })
    try {
      const res = await fetch('/api/anfrage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          consent: data.consent === 'on',
          topic: 'konfiguration',
          product: catalog.product.slug,
          selection,
          startedAt: openedAt.current,
          sourcePath: window.location.pathname,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Die Anfrage konnte nicht gesendet werden.')
      setState({ kind: 'ok', code: json.code })
      if (json.code) onSent(json.code)
      form.reset()
    } catch (err) {
      setState({ kind: 'error', message: err instanceof Error ? err.message : 'Unbekannter Fehler' })
    }
  }

  return (
    <>
      <button className="btn btn-light wide" type="button" onClick={open}>
        Unverbindlich anfragen
      </button>
      <dialog className="dlg" ref={dialog} aria-labelledby="dlg-h">
        {state.kind === 'ok' ? (
          <div style={{ padding: 28 }}>
            <h2 id="dlg-h">Danke!</h2>
            <p className="form-status ok" role="status">
              Deine Anfrage ist bei uns eingegangen{state.code ? ` (Konfiguration ${state.code})` : ''}. Du bekommst gleich eine Bestätigung per E-Mail,
              wir melden uns persönlich mit einem Angebot.
            </p>
            <div className="dlg-actions">
              <button className="btn btn-light" type="button" onClick={() => dialog.current?.close()}>
                Schließen
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h2 id="dlg-h">Unverbindlich anfragen</h2>
            <p className="hint" style={{ color: '#9a9aa0', fontSize: '.85rem' }}>
              {note}
            </p>
            <div className="mini">
              <strong>{catalog.product.name}</strong>
              {totalLabel && <> · {totalLabel}</>}
            </div>
            <div className="field">
              <label htmlFor="r-name">Name *</label>
              <input id="r-name" name="name" required autoComplete="name" maxLength={120} />
            </div>
            <div className="field">
              <label htmlFor="r-mail">E-Mail *</label>
              <input id="r-mail" name="email" type="email" required autoComplete="email" maxLength={200} />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="r-phone">Telefon</label>
                <input id="r-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} />
              </div>
              <div className="field">
                <label htmlFor="r-org">Verein</label>
                <input id="r-org" name="organisation" maxLength={120} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="r-msg">Anmerkungen</label>
              <textarea id="r-msg" name="message" rows={3} maxLength={4000} />
            </div>
            <div className="hp" aria-hidden="true">
              <label htmlFor="r-website">Website</label>
              <input id="r-website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <label className="check">
              <input type="checkbox" name="consent" required /> Ich habe die <Link href="/datenschutz" target="_blank">Datenschutzerklärung</Link>&nbsp;gelesen
              und bin mit der Verarbeitung meiner Angaben einverstanden.
            </label>
            {state.kind === 'error' && (
              <p className="form-status error" role="alert">
                {state.message}
              </p>
            )}
            <div className="dlg-actions">
              <button className="btn btn-ghost" type="button" onClick={() => dialog.current?.close()}>
                Abbrechen
              </button>
              <button className="btn btn-light" type="submit" disabled={state.kind === 'sending'}>
                {state.kind === 'sending' ? 'Wird gesendet …' : 'Anfrage senden'}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  )
}
