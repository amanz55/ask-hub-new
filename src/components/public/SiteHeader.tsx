import Image from 'next/image';
import Link from 'next/link';
import { t } from '@/lib/i18n';

/**
 * Transcribed from the approved prototype
 * (the approved prototype): a sticky white rail with a 1px hairline, 1180px wide, 68px
 * tall, carrying the roundel and wordmark on the left and the navigation on the
 * right.
 *
 * **The prototype's search pill is gone, at the client's request.** It repeated
 * the directory's own search box, so the directory is now the one place to
 * search.
 *
 * **The one thing not transcribed: the ADMIN button.** The prototype ends the
 * rail with an outlined ADMIN button linking to the portal. PRD 5.8 forbids
 * it in as many words -- "No login link or admin reference anywhere in public
 * navigation" -- and putting an admin entry point in front of every anonymous
 * visitor is not a styling decision. Raised with the client, who ruled that
 * PRD 5.8 governs (spec D11). The portal is reachable at /admin/login and is
 * advertised nowhere, which is the whole point; nothing stands in the slot.
 *
 * **Contact is a plain nav item, not an outlined pill.** It had been wearing
 * the ADMIN button's treatment on the reasoning that the slot should keep its
 * shape. That was a guess dressed as a transcription: the prototype styles
 * Contact at line 21, in the nav row beside Home, Browse and About, with the
 * same 14px/600 navy on a 6px radius and the same #F1F4FA hover -- identical
 * to its siblings. An outlined uppercase pill gave a Contact link the visual
 * weight of a sign-in, which is exactly the emphasis PRD 5.8 wants absent.
 *
 * **Browse is gone from the nav.** The prototype's Browse item switches to a
 * directory screen. Here the directory is a band on the home page (PRD 5.1
 * item 8), so the item was an in-page jump to #directory sitting one slot
 * away from Home, which scrolls to the top of the same page -- two nav items
 * for one document. The directory is reached from the browse menu, the welcome
 * CTA and the footer, all of which target it directly.
 * `nav.directory` stays in en.json because the footer still labels a link
 * with it.
 *
 * **On the wordmark.** `site.wordmark` is "AskHub", the product's own name,
 * as against the programme -- the AI Hub for Sustainable Development -- which
 * CLAUDE.md requires be named in full wherever it appears.
 *
 * The mark is a local asset, so this uses next/image (which fingerprints and
 * sizes it) rather than the bare <img> PartnerRow needs for arbitrary remote
 * logo hosts. `alt=""` is deliberate: the wordmark text sits immediately
 * beside it in the same link, so announcing the image too would make screen
 * readers read the brand name twice for one control.
 *
 * Hover states arrive in the prototype as `style-hover` attributes, which are
 * not real HTML. This is a server component and converting it to a client one
 * for a background colour would be a poor trade, so the nav item's hover is
 * the global class `.proto-nav-item`.
 */
export default function SiteHeader() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#FFFFFF',
        borderBottom: '1px solid #DDE5EE',
      }}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:text-primary"
      >
        {t('nav.skipToContent')}
      </a>
      <nav
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '10px 24px',
          minHeight: 68,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}
        >
          <Image
            src="/partners/askhub-wordmark.png"
            alt=""
            width={165}
            height={165}
            style={{ height: 40, width: 40, objectFit: 'contain', display: 'block' }}
            priority
          />
          <span
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#1A2332',
              letterSpacing: '-0.02em',
            }}
          >
            {t('site.wordmark')}
          </span>
        </Link>

        <ul
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flexWrap: 'wrap',
            listStyle: 'none',
            padding: 0,
          }}
        >
          <li>
            <Link
              href="/"
              className="proto-nav-item"
              style={{
                display: 'inline-block',
                fontSize: 14,
                fontWeight: 600,
                color: '#1A2332',
                padding: '8px 12px',
                borderRadius: 6,
              }}
            >
              {t('nav.home')}
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="proto-nav-item"
              style={{
                display: 'inline-block',
                fontSize: 14,
                fontWeight: 600,
                color: '#1A2332',
                padding: '8px 12px',
                borderRadius: 6,
              }}
            >
              {t('nav.contact')}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
