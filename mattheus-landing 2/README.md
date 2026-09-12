# Mattheus · landing page

Two screens, built on the design guidelines. Static HTML plus one serverless
function for the Klaviyo signup. No build step.

```
index.html            the page (wordmark is inlined as SVG)
wordmark.svg          the wordmark as vector, also inlined in index.html
favicon.png           64 x 64
apple-touch-icon.png  180 x 180
og.png                social share image, 1200 x 630
api/subscribe.js      Vercel serverless function, POST /api/subscribe
```

Drop these at the root of the Vercel project. `api/subscribe.js` is picked up
automatically; no `vercel.json` needed.

## How the guidelines are applied

| Guideline | On the page |
| --- | --- |
| Mattheus Navy `#1E2A3A`, 60-70% | Screen 1, full bleed |
| Sail `#F6F1E7`, 20-30% | The wordmark on navy |
| Paper `#F2EEE3` | Screen 2 ground, a half step warmer than Sail |
| H3 / Product title | "The first release is limited to 50 pieces." at 24-32px, -0.01em |
| Small / Caption | Footer at 13px, +0.02em, sentence case |
| Button / UI | "Request access" at 14px, 500, +0.02em |

Screen 2 sits on a light ground rather than navy, which is what puts the light
half of the palette into its 20-30% band on an otherwise dark site and makes the
signup the brightest thing on the page. The ground is `--paper` `#F2EEE3`, a
half step warmer and slightly deeper than Sail; Sail stays the type colour on
navy. To make screen 2 navy instead, delete `background:var(--paper)` and
`color:var(--navy)` from `#access` and swap the form colours back.

`#F2EEE3` is not in the guidelines. Either add it there as a named ground, or
decide Sail is the ground and change `--paper` back, but do not leave two
near-identical creams undocumented; that is how a palette starts drifting.

## Typefaces

The page asks for `GT Super Display` and `GT Super Text` first and falls back to
Newsreader, which is a free stand-in with a similar editorial build. Once the GT
Super licence is in place, add the webfont files and a `@font-face` block; the
stack picks them up with no other change.

**One inconsistency in the guidelines worth fixing.** Page 02 says GT Super is
"paired with a clean, modern sans-serif", but the secondary typeface shown and
specified in the hierarchy table is GT Super Text, which is a serif, and the
specimen underneath it is set in serif. Body and UI are built as serif here,
following the table rather than the paragraph. Decide which one is the real
intent and correct the other, otherwise the next person to build something for
you will guess differently.

## Environment variables

Vercel > Project > Settings > Environment Variables:

| Name | Value |
| --- | --- |
| `KLAVIYO_PRIVATE_KEY` | `pk_...` (private key) |
| `KLAVIYO_LIST_ID` | the waitlist's list ID, single opt in, no existing profiles |

The key stays server side; the browser never talks to Klaviyo directly. Create
the key in Klaviyo under Settings > API keys with only `List` read and write,
`Profiles` write, and `Subscriptions` write.

`POST /api/subscribe` returns `{ ok: true, position: 41 }`, which is the list's
profile count read after the write. The page turns that into `Confirmed. No. 41
of 50` for the first fifty and `Confirmed. You are on the waitlist.` after that,
so the page never promises a numbered piece it cannot deliver. The edition size
is the `EDITION` constant in the page script; it has to match the copy on screen.

The count is best effort and it is not a reservation. Two people submitting in
the same second can both read the same number, and nothing stops the fifty-first
signup, it just gets the generic message. If a number is going to become a
commitment, take the order of `joined_at` in Klaviyo as the truth, not this.

The list must be a **clean, dedicated** one for these numbers to mean anything.
Point `KLAVIYO_LIST_ID` at a list with existing profiles and the first signup
reads whatever that count already was.

## Still open

- The wordmark SVG was traced from the raster logo you supplied. It is clean at
  any size, but if you have the original vector from your design file, replace
  `wordmark.svg` with it and re-inline it.
- No materials, no origin, no price, and now no product image either. The site
  shows the mark and asks for an email. That is the most mysterious the page can
  get, and it is also the version that converts worst, because a visitor who has
  never heard of Mattheus is given nothing to want. Worth revisiting once you
  have a photograph of a finished piece.

## Motion

Reveals are a 1.2s translate and fade on `cubic-bezier(.16,1,.3,1)`, fired by an
IntersectionObserver at 16% visibility. The slowness is the point; do not speed
it up.

The junction between the two screens is a sticky reveal, not a colour blend.
Screen 1 is `position:sticky` and stays in place while screen 2 slides up over
it, and a scroll listener dissolves the wordmark across the first 45% of a
viewport height.

The seam is softened by the panel's own shadow: an outer `box-shadow` cast
upward onto the navy, plus a `#access::before` band 42vh tall that lays the same
navy over the paper at 14% and falls off on a squared smoothstep, so the paper
darkens at the edge and recovers slowly.

Two things were tried and rejected on the way here. Interpolating navy straight
into the cream runs the midtones through a muddy grey that looks like fog,
whichever easing you use. And the same shadow band at 34% opacity reaches that
grey too; 14% is about the ceiling before the shade stops reading as warm.

`prefers-reduced-motion` disables the reveals and the wordmark dissolve. The
sticky panel still works, because it is scroll position rather than animation.
