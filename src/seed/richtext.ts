/** Minimaler Builder für Lexical-Richtext (Seed-Inhalte) */

type Node = Record<string, unknown>

type Inline = string | { text: string; bold?: boolean } | { link: string; text: string }

const textNode = (text: string, bold = false): Node => ({
  type: 'text',
  text,
  format: bold ? 1 : 0,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

const inline = (part: Inline): Node => {
  if (typeof part === 'string') return textNode(part)
  if ('link' in part)
    return {
      type: 'link',
      fields: { url: part.link, newTab: part.link.startsWith('http'), linkType: 'custom' },
      format: '',
      indent: 0,
      version: 3,
      direction: 'ltr',
      children: [textNode(part.text)],
    }
  return textNode(part.text, part.bold)
}

const block = (type: string, children: Node[], extra: Node = {}): Node => ({
  type,
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children,
  ...extra,
})

export type Block =
  | string
  | { p: Inline[] }
  | { h2: string }
  | { h3: string }
  | { ul: (string | Inline[])[] }

export function richText(blocks: Block[]) {
  const children = blocks.map((b): Node => {
    if (typeof b === 'string') return block('paragraph', [textNode(b)], { textFormat: 0, textStyle: '' })
    if ('p' in b) return block('paragraph', b.p.map(inline), { textFormat: 0, textStyle: '' })
    if ('h2' in b) return block('heading', [textNode(b.h2)], { tag: 'h2' })
    if ('h3' in b) return block('heading', [textNode(b.h3)], { tag: 'h3' })
    return block(
      'list',
      b.ul.map((item, i) =>
        block('listitem', (Array.isArray(item) ? item : [item]).map(inline), { value: i + 1 }),
      ),
      { listType: 'bullet', tag: 'ul', start: 1 },
    )
  })
  return { root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children } } as never
}
