import { NextResponse, type NextRequest } from 'next/server'

import { hasPreviewAccess, previewPassword } from '@/lib/preview'

const NOINDEX = 'noindex, nofollow'

/** Vorschau-Schutz: Passwort für die ganze Website (inkl. Admin, Bilder, PDF), bis SITE_PUBLIC=true gesetzt ist */
export function proxy(request: NextRequest) {
  const password = previewPassword()
  if (!password) return NextResponse.next()

  if (hasPreviewAccess(request.headers.get('authorization'), password)) {
    const response = NextResponse.next()
    response.headers.set('X-Robots-Tag', NOINDEX)
    return response
  }
  return new NextResponse('Diese Website ist noch nicht öffentlich.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Schaftboeller Ebner - Vorschau", charset="UTF-8"',
      'X-Robots-Tag': NOINDEX,
      'Cache-Control': 'no-store',
    },
  })
}

export const config = {
  // Offen bleiben: Health-Check (Docker, Deploy) und robots.txt, die Suchmaschinen aussperrt
  matcher: ['/((?!api/health|robots\\.txt).*)'],
}
