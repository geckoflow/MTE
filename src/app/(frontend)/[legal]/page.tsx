import { notFound } from 'next/navigation'

import { Breadcrumbs, RichText } from '@/components/ui'
import { getLegalPage } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ legal: string }> }

export async function generateMetadata({ params }: Props) {
  const { legal } = await params
  const page = await getLegalPage(legal)
  if (!page) return {}
  return pageMetadata({ title: page.title, path: `/${legal}`, meta: page.meta })
}

export default async function LegalPageView({ params }: Props) {
  const { legal } = await params
  if (!/^[a-z0-9-]+$/.test(legal)) notFound()
  const page = await getLegalPage(legal)
  if (!page) notFound()
  return (
    <section className="section-sm">
      <div className="wrap legal">
        <Breadcrumbs items={[{ href: '/', label: 'Startseite' }, { label: page.title }]} />
        <h1 className="h-l" style={{ marginBottom: 40 }}>
          {page.title}
        </h1>
        <RichText data={page.content} />
        <p className="muted" style={{ marginTop: 48, fontSize: '.8rem' }}>
          Stand: {new Date(page.updatedAt).toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </p>
      </div>
    </section>
  )
}
