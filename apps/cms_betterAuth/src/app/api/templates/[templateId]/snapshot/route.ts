import { NextResponse } from 'next/server'
import payload from 'payload' // import your Payload instance

export async function POST(req: Request) {
  try {
    const { templateId } = await req.json()

    // 1) Find template by ID
    const template = await payload.findByID({
      collection: 'templates',
      id: templateId,
      depth: 0,
      overrideAccess: true,
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // 2) Fetch related components
    const comps = await payload.find({
      collection: 'templateComponents',
      where: { template: { equals: templateId } },
      limit: 1000,
      depth: 0,
    })

    // 3) Normalize component map
    const componentMap: Record<string, any> = {}
    for (const c of comps.docs) {
      componentMap[c.slug] = {
        slug: c.slug,
        props: c.props,
        style: c.style,
        responsive: c.responsive,
        restricted: c.restricted ?? false,
      }
    }

    // 4) Produce snapshot shaped for storefront
    const snapshot = {
      templateId,
      version: template.updatedAt,
      snapshot: template.snapshot ??
        template.snapshotData ?? {
          components: componentMap,
          defaults: template.defaults,
          settings: template.settings,
          assets: {
            images: template.images ?? [],
            fonts: template.fonts ?? [],
          },
        },
    }

    // 5) Return response with cache headers
    return new NextResponse(JSON.stringify(snapshot), {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Content-Type': 'application/json',
      },
    })
  } catch (err: any) {
    console.error('snapshot endpoint error', err)
    return NextResponse.json({ error: err.message || 'internal error' }, { status: 500 })
  }
}
