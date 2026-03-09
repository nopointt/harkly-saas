import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function isValidTelegram(handle: string): boolean {
  return /^@?[a-zA-Z0-9_]{5,32}$/.test(handle)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { telegram, role } = body

    if (!telegram || typeof telegram !== 'string') {
      return NextResponse.json(
        { error: 'Telegram handle is required' },
        { status: 400 }
      )
    }

    const normalized = telegram.trim().startsWith('@') ? telegram.trim() : `@${telegram.trim()}`

    if (!isValidTelegram(normalized)) {
      return NextResponse.json(
        { error: 'Invalid Telegram handle' },
        { status: 400 }
      )
    }

    const existing = await prisma.waitlistEntry.findUnique({
      where: { telegram: normalized }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Already registered' },
        { status: 409 }
      )
    }

    await prisma.waitlistEntry.create({
      data: {
        telegram: normalized,
        role: role && typeof role === 'string' ? role.trim() : null,
      }
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Waitlist error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
