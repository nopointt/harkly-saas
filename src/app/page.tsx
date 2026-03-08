'use client'

import { useState } from 'react'

export default function Home() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else if (res.status === 409) {
        setStatus('error')
        setErrorMessage('This email is already on the waitlist.')
      } else {
        setStatus('error')
        setErrorMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setErrorMessage('Network error. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-white">
      <main className="flex max-w-2xl flex-col items-center text-center">
        <h1 className="mb-6 text-5xl font-semibold tracking-tight sm:text-6xl">
          Harkly — AI research assistant
        </h1>
        <p className="mb-12 text-lg text-zinc-400 sm:text-xl">
          Transform your research workflow with intelligent analysis and evidence extraction.
        </p>

        <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-4 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={status === 'loading' || status === 'success'}
            className="flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
            required
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="rounded-md bg-white px-6 py-3 font-medium text-black transition-opacity hover:bg-zinc-200 disabled:opacity-50"
          >
            {status === 'loading' ? 'Joining...' : status === 'success' ? 'Joined!' : 'Join Waitlist'}
          </button>
        </form>

        {status === 'success' && (
          <p className="mt-4 text-green-400">Thanks! We&apos;ll be in touch soon.</p>
        )}

        {status === 'error' && errorMessage && (
          <p className="mt-4 text-red-400">{errorMessage}</p>
        )}
      </main>

      <footer className="mt-20 text-sm text-zinc-600 flex items-center gap-6">
        <span>© {new Date().getFullYear()} Harkly. All rights reserved.</span>
        <a href="/auth/login" className="text-zinc-700 hover:text-zinc-400 transition-colors">
          Dev →
        </a>
      </footer>
    </div>
  )
}
