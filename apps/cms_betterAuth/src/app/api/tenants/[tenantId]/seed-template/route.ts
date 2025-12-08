import { NextResponse } from 'next/server'
import { seedTemplateForTenant } from '@/seeders/seedTemplateForTenant' // adjust import path

export async function GET(req: Request, { params }: { params: { tenantId: string } }) {
  try {
    const tenantId = params.tenantId
    const { searchParams } = new URL(req.url)
    const templateId = searchParams.get('templateId')

    if (!tenantId || !templateId) {
      return NextResponse.json({ error: 'Tenant or template not found' }, { status: 400 })
    }

    const result = await seedTemplateForTenant({
      tenantId,
      templateId,
      overwrite: false,
    })

    return NextResponse.json(result, { status: 200 })
  } catch (err: any) {
    console.error('seedTemplateEndpoint error', err)
    return NextResponse.json({ error: err.message || 'internal error' }, { status: 500 })
  }
}
