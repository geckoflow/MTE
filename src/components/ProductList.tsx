import type { Product } from '@/payload-types'

import { ProductCard } from './ProductCard'
import { Breadcrumbs, Heading } from './ui'

export function PageHead({
  eyebrow,
  heading,
  accent,
  lead,
  crumbs,
  children,
}: {
  eyebrow?: string
  heading: string
  accent?: string
  lead?: string | null
  crumbs: { href?: string; label: string }[]
  children?: React.ReactNode
}) {
  return (
    <header className="page-head">
      <div className="wrap">
        <Breadcrumbs items={crumbs} />
        <div className="split-2 end">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <Heading as="h1" text={heading} accent={accent} />
          </div>
          <div>
            {lead && <p className="lead">{lead}</p>}
            {children}
          </div>
        </div>
      </div>
    </header>
  )
}

export function ProductGrid({ products, showPrices, empty }: { products: Product[]; showPrices: boolean; empty: string }) {
  if (!products.length) return <p className="empty-state">{empty}</p>
  return (
    <div className="p-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} showPrices={showPrices} />
      ))}
    </div>
  )
}
