'use client'

import { useRowLabel } from '@payloadcms/ui'

/** Zeigt in Listen-Feldern (Arrays) den Namen des Eintrags statt „Eintrag 01“ */
export const RowLabel = () => {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>()
  const label = [data?.label, data?.title, data?.name, data?.item, data?.question, data?.text, data?.word, data?.key].find(
    (v) => typeof v === 'string' && v.trim(),
  ) as string | undefined
  const num = String((rowNumber ?? 0) + 1).padStart(2, '0')
  return <span>{label ? `${num} · ${label}` : `Eintrag ${num}`}</span>
}
