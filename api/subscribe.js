// Vercel serverless function — POST /api/subscribe
//
// Environment variables (Vercel > Settings > Environment Variables):
//   KLAVIYO_PRIVATE_KEY   pk_xxxxxxxx   (server side only, never exposed)
//   KLAVIYO_LIST_ID       XxXxXx        (the waitlist)
//
// Returns { ok: true, position: <n> } so the page can show "No. 0042".
// If the count cannot be read the position is simply omitted.

const REVISION = '2024-10-15';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const key = process.env.KLAVIYO_PRIVATE_KEY;
  const listId = process.env.KLAVIYO_LIST_ID;
  if (!key || !listId) return res.status(500).json({ error: 'not_configured' });

  let email = '';
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    email = String(body.email || '').trim().toLowerCase();
  } catch (_) {
    return res.status(400).json({ error: 'bad_request' });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'invalid_email' });
  }

  const headers = {
    'Authorization': `Klaviyo-API-Key ${key}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'revision': REVISION,
  };

  try {
    // Subscribe with consent. Idempotent: re-submitting the same address is fine.
    const r = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: {
          type: 'profile-subscription-bulk-create-job',
          attributes: {
            profiles: {
              data: [{
                type: 'profile',
                attributes: {
                  email,
                  subscriptions: { email: { marketing: { consent: 'SUBSCRIBED' } } },
                },
              }],
            },
            historical_import: false,
          },
          relationships: { list: { data: { type: 'list', id: listId } } },
        },
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error('klaviyo subscribe failed', r.status, detail.slice(0, 500));
      return res.status(502).json({ error: 'upstream' });
    }
  } catch (err) {
    console.error('klaviyo subscribe threw', err);
    return res.status(502).json({ error: 'upstream' });
  }

  // Best effort: the waitlist position. Never fail the signup over this.
  let position;
  try {
    const c = await fetch(
      `https://a.klaviyo.com/api/lists/${listId}?additional-fields[list]=profile_count`,
      { headers }
    );
    if (c.ok) {
      const j = await c.json();
      const n = j?.data?.attributes?.profile_count;
      if (Number.isFinite(n)) position = n;
    }
  } catch (_) { /* ignore */ }

  return res.status(200).json({ ok: true, position });
}
