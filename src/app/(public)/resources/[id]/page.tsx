import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { t } from '@/lib/i18n';
import NeedBadge from '@/components/public/NeedBadge';
import ShareModal from '@/components/public/ShareModal';
import { deadlineLabel } from '@/lib/public/deadline-label';
import { needBanner, bannerPartner } from '@/lib/public/need-banner';
import { geoEligibilityLabel } from '@/lib/public/geo';
import { resourceJsonLd, serialiseJsonLd } from '@/lib/public/jsonld';
import { getPublicResource, listPublicResources } from '@/lib/public/readers';

/**
 * Pre-generate the detail pages that exist at build time.
 *
 * `dynamicParams` stays at its default of true, deliberately: a resource
 * published from the admin portal after a deploy must resolve without a
 * rebuild. PRD 12.2 wants these pages server-rendered, not that they exist
 * only for rows that happened to be live when the bundle was built.
 */
export async function generateStaticParams() {
  const resources = await listPublicResources();
  return resources.map((resource) => ({ id: resource.id }));
}

function canonicalUrl(id: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  return `${base}/resources/${id}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const resource = await getPublicResource(id);
  if (!resource) return {};
  return {
    title: resource.name,
    ...(resource.description ? { description: resource.description } : {}),
  };
}

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resource = await getPublicResource(id);

  // Absent from resources_public means status is not 'live'. It never means
  // the deadline passed: the view filters on status alone, and PRD 4.2 keeps
  // a closed resource listed and reachable -- a past opportunity is still
  // worth reading about, and a 404 on a shared link is a dead end.
  if (!resource) notFound();

  const label = deadlineLabel(resource);
  const jsonLd = resourceJsonLd(resource, canonicalUrl(resource.id));


  return (
    <article style={{ maxWidth: 900, margin: '0 auto', padding: '36px 32px 80px 32px' }}>
      {/* Server-rendered from public view fields only, and serialised by
          `serialiseJsonLd`, which escapes < > & so a description containing
          `</script>` cannot break out of this element. See that function for
          why JSON.stringify alone is not enough. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serialiseJsonLd(jsonLd) }}
      />

      <Link
        href="/#directory"
        className="proto-back-link"
        style={{ color: '#5B6B8C', fontSize: 13.5, fontWeight: 700 }}
      >
        {t('detail.backToDirectory')}
      </Link>

      {/* The prototype's 170px hero band. A partner
          banner image, when one exists, sits in the same place at the same
          size rather than being appended above it -- two banners stacked was
          never the design.

          The prototype opens this band with the same decorative three-dot
          marker the welcome band carries. It is removed here on the client's
          instruction, together with the home one -- see WelcomeBand, which
          holds the note for both. Nothing is lost: the marker was
          `aria-hidden` and carried no information. That was also this file's
          last reference to `var(--acc)`, a custom property the prototype sets
          on its own root from a settings value and that nothing in this app
          defines, so it had been resolving to its literal fallback. */}
      <div
        style={{
          marginTop: 18,
          height: 170,
          borderRadius: 16,
          background: needBanner(resource.needPrimary),
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {resource.bannerImageUrl ? (
          // Partner banner URLs are arbitrary remote hosts; next/image would
          // need every one allow-listed in next.config.ts, and SP4 owns the
          // image policy.
          // eslint-disable-next-line @next/next/no-img-element -- see above
          <img
            src={resource.bannerImageUrl}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : null}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '24px 30px',
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: 'rgba(255,255,255,0.75)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            {bannerPartner(resource.partnerName)}
          </div>
          <div
            style={{
              fontSize: 27,
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.15,
              marginTop: 5,
              letterSpacing: '-0.01em',
            }}
          >
            {resource.name}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 22, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <NeedBadge need={resource.needPrimary} />
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: 99,
            background: resource.isClosed ? '#FBEAE8' : '#F1F4FA',
            color: resource.isClosed ? '#C0392B' : '#5B6B8C',
          }}
        >
          {label}
        </span>
      </div>

      <h1
        style={{
          margin: '14px 0 0 0',
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
          textWrap: 'balance',
        }}
      >
        {resource.name}
      </h1>

      <div style={{ marginTop: 10, fontSize: 15, fontWeight: 700, color: '#1F5FBF' }}>
        {resource.partnerWebsiteUrl ? (
          <a
            href={resource.partnerWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1F5FBF' }}
          >
            {resource.partnerName}
          </a>
        ) : (
          resource.partnerName
        )}
      </div>

      {resource.description ? (
        <p
          style={{
            margin: '20px 0 0 0',
            fontSize: 16.5,
            lineHeight: 1.65,
            color: '#2B3A5C',
            maxWidth: 720,
            whiteSpace: 'pre-line',
          }}
        >
          {resource.description}
        </p>
      ) : null}

      <div
        style={{
          marginTop: 28,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {resource.externalUrl && !resource.isClosed ? (
          <a
            href={resource.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="proto-primary-button"
            style={{
              display: 'inline-block',
              background: '#1F5FBF',
              color: '#fff',
              borderRadius: 10,
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            {resource.actionLabel ?? t('cta.apply')}
          </a>
        ) : null}
        {resource.isClosed ? (
          <span
            style={{
              display: 'inline-block',
              background: '#F1F4FA',
              color: '#5B6B8C',
              borderRadius: 10,
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            {t('deadline.closed')}
          </span>
        ) : null}
        <ShareModal url={canonicalUrl(resource.id)} title={resource.name} />
      </div>

      {/* "Who it's for": auto-fit rather than the
          prototype's fixed four columns, so the four facts reflow instead of
          shrinking to unreadable slivers on a narrow screen. */}
      <section
        style={{
          marginTop: 36,
          background: '#F4F6F9',
          border: '1px solid #DDE5EE',
          borderRadius: 14,
          padding: '26px 28px',
        }}
      >
        <dl
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 24,
            margin: 0,
          }}
        >
          <Row term={t('detail.stages')} value={
            resource.stagesEligible.length > 0
              ? resource.stagesEligible.join(', ')
              : t('card.allStages')
          } />
          <Row term={t('detail.sectors')} value={
            resource.sectorsEligible.length > 0
              ? resource.sectorsEligible.join(', ')
              : t('card.allSectors')
          } />
          {/* Wording lives in lib/public/geo.ts, not here: an unscoped row must
              read as "not specified", never as open to everyone. */}
          <Row term={t('detail.countries')} value={geoEligibilityLabel(resource)} />
          <Row term={t('detail.deadline')} value={label} />
        </dl>
      </section>

      {/* The prototype closes with a "Related resources" grid. It is not built
          here: this page reads one resource, and populating that grid means
          fetching and ranking others -- a feature, not a restyling of one.
          Recorded rather than approximated. */}

      <p style={{ marginTop: 36, fontSize: 13, color: '#5B6B8C' }}>
        {t('site.curationStatement')}
      </p>
    </article>
  );
}

function Row({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt style={{ fontSize: 12, fontWeight: 700, color: '#5B6B8C', marginBottom: 5 }}>
        {term}
      </dt>
      <dd style={{ fontSize: 14, lineHeight: 1.55, fontWeight: 600, margin: 0 }}>{value}</dd>
    </div>
  );
}
