import { NextResponse } from 'next/server'
import payload from 'payload' // import your Payload instance
import { seedTemplateForTenant } from '@/seeders/seedTemplateForTenant' // adjust path

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { name, slug, domain, ownerEmail, template } = data

    if (!name || !slug || !template) {
      return NextResponse.json({ error: 'name, slug and template are required' }, { status: 400 })
    }

    // 1) Create tenant entry
    const tenant = await payload.create({
      collection: 'tenants',
      data: {
        name,
        slug,
        domain,
        ownerEmail,
        template,
        onboardingCompleted: false,
      },
      overrideAccess: true,
    })

    // 2) Seed tenant with template
    await seedTemplateForTenant({
      tenantId: tenant.id,
      templateId: template,
      overwrite: false,
    })

    // 3) Mark onboarding completed
    await payload.update({
      collection: 'tenants',
      id: tenant.id,
      data: { onboardingCompleted: true },
      overrideAccess: true,
    })

    return NextResponse.json({
      ok: true,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
    })
  } catch (err: any) {
    console.error('createTenantEndpoint error', err)
    return NextResponse.json({ error: err.message || 'internal error' }, { status: 500 })
  }
}
