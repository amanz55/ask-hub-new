import type { Metadata } from 'next';
import SuggestResourceModal from '@/components/public/SuggestResourceModal';
import { CONTACT_TILE_BUTTON } from '@/components/public/contact-tile-button';
import { t } from '@/lib/i18n';

/**
 * Contact, and the one route by which a visitor can propose something for the
 * directory.
 *
 * Two tiles. Getting in touch is a `mailto:` link with the subject filled in --
 * the visitor's own mail client, and this application never sees the message.
 * Suggesting a resource is a form, `SuggestResourceModal`, because a suggestion has
 * structure a mailbox would lose: a category, a link, the countries and
 * sectors it is for. It lands in `submissions` as `pending` through the
 * `submit_resource_suggestion` function (migration 0024), and the AI Hub
 * team approves, edits or rejects it on the admin Review Queue.
 *
 * This is the product's one public write path, and it is where the personal
 * data it collects is collected: the submitter's name and email, and an
 * optional programme contact. Those go to `@sensitive` columns that no
 * public view can project and no approval copies into a resource.
 *
 * `contact_messages`, its RLS policies and the contact RPC (0020) remain in
 * the database, unused: the contact form itself is still a `mailto:`.
 *
 * Content rule: one mailbox only. `site.contactEmail` is the single source for
 * it here and in the footer, so there is no second address to drift from it.
 *
 * Statically rendered: nothing here reads the request. The modal is a client
 * component and the action it calls runs at request time.
 */
export const metadata: Metadata = {
  title: t('contact.title'),
};

const BODY = { fontSize: 16, lineHeight: 1.7, color: '#2B3A5C' } as const;

/** A column, so the body text can take up the slack and the buttons line up. */
const TILE = {
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid #DDE5EE',
  borderRadius: 14,
  padding: 28,
} as const;

const TILE_HEADING = { margin: 0, fontSize: 16, fontWeight: 800 } as const;

const TILE_BODY = {
  ...BODY,
  margin: '10px 0 0 0',
  fontSize: 14.5,
  flex: 1,
  whiteSpace: 'pre-line',
} as const;

export default function ContactPage() {
  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '56px 32px 80px 32px' }}>
      <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em' }}>
        {t('contact.title')}
      </h1>

      {/* Two equal tiles side by side, stacking once they would drop below
          280px. `min()` stops that floor overflowing the narrowest phones. */}
      <div
        style={{
          marginTop: 32,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
          gap: 20,
        }}
      >
        <section style={TILE}>
          <h2 style={TILE_HEADING}>{t('contact.getInTouch')}</h2>
          <p style={TILE_BODY}>{t('contact.getInTouchBody')}</p>
          <a
            href={`mailto:${t('site.contactEmail')}?subject=${encodeURIComponent(t('contact.emailSubject'))}`}
            className="proto-primary-button"
            style={CONTACT_TILE_BUTTON}
          >
            {t('contact.emailAction')}
          </a>
        </section>

        {/* The prototype's bordered panel, holding the suggest-a-resource
            invitation and the button that opens the form. */}
        <section style={TILE}>
          <h2 style={TILE_HEADING}>{t('contact.suggestHeading')}</h2>
          <p style={TILE_BODY}>{t('contact.suggestBody')}</p>
          <SuggestResourceModal />
        </section>
      </div>
    </div>
  );
}
