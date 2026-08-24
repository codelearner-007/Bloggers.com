'use server'

// Public endpoint, no auth required -- deliberately fetch() directly instead
// of apiSend(), which requires a signed-in user's access token.
export async function submitContactMessage({ name, email, message }) {
  const response = await fetch(`${process.env.API_BASE_URL}/api/v1/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, message }),
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    throw new Error((payload && (payload.detail || payload.message)) || 'Failed to send your message')
  }

  return payload
}
