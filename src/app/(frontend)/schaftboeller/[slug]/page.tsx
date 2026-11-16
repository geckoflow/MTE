import { notFound } from 'next/navigation'

import { ProductDetail } from '@/components/ProductDetail'
import { getProductBySlug, getProducts, getSettings } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug, 'schaftboeller')
  if (!product) return {}
  return pageMetadata({ title: product.name, description: product.tagline, path: `/schaftboeller/${slug}`, meta: product.meta })
}

export default async function SchaftboellerDetail({ params }: Props) {
  const { slug } = await params
  const [product, settings, accessories] = await Promise.all([
    getProductBySlug(slug, 'schaftboeller'),
    getSettings(),
    getProducts('zubehoer'),
  ])
  if (!product) notFound()
  return <ProductDetail product={product} settings={settings} related={accessories} parent={{ href: '/schaftboeller', label: 'Schaftböller' }} />
}
