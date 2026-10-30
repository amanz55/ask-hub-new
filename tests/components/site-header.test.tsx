// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import SiteHeader from '@/components/public/SiteHeader';

afterEach(cleanup);

const navLinks = () =>
  within(screen.getByRole('navigation'))
    .getAllByRole('link')
    .map((link) => ({ text: link.textContent ?? '', href: link.getAttribute('href') ?? '' }));

/** The nav item row only, without the brand link that opens the bar. */
const navItems = () =>
  within(screen.getByRole('navigation'))
    .getAllByRole('listitem')
    .map((item) => within(item).getByRole('link').getAttribute('href') ?? '');

/**
 * The public header is where PRD 5.8's "no login link or admin reference
 * anywhere in public navigation" is either honoured or lost, and nothing
 * asserted it. The prototype's own header ends in an outlined ADMIN button
 *; every future transcription pass will look at that
 * button and be tempted to bring it across, and the docblock explaining why
 * not is a comment, which no build reads.
 */
describe('the public header', () => {
  it('carries no route into the admin portal, and names it nowhere', () => {
    render(<SiteHeader />);
    const links = navLinks();
    expect(links.filter((l) => l.href.includes('/admin'))).toEqual([]);
    expect(screen.getByRole('navigation').textContent).not.toMatch(/admin/i);
  });

  it('offers Home and Contact, and no second route to the same page', () => {
    // "Browse resources" pointed at /#directory, one slot away from Home,
    // which scrolls to the top of that same page: two nav items for one
    // document. The exact-array assertion is the point -- a "does not contain
    // Browse" check would pass against a header that had quietly grown a
    // fourth item, an ADMIN one included. The brand link is excluded because
    // it is the wordmark, not a nav item; that a logo goes home is not a
    // second route on offer.
    render(<SiteHeader />);
    expect(navItems()).toEqual(['/', '/contact']);
  });

  it('has no search of its own, since the directory has the one search box', () => {
    render(<SiteHeader />);
    expect(screen.queryByRole('search')).toBeNull();
    expect(screen.queryByRole('searchbox')).toBeNull();
  });

  it('styles Contact as a nav item, not as an outlined action', () => {
    // The prototype styles Contact exactly as the other nav items:
    // 14px/600 navy, 8px 12px, 6px radius, #F1F4FA on hover. It had been
    // wearing the ADMIN button's outlined uppercase pill, which gave a
    // Contact link the visual weight of a sign-in -- the one emphasis PRD
    // 5.8 wants absent from this bar.
    render(<SiteHeader />);
    // Compared against Home rather than About, which this release removes.
    // Home is the only other nav item left, and the assertion is unchanged in
    // substance: Contact must be styled as a peer, not as an outlined action.
    const contact = screen.getByRole('link', { name: 'Contact' });
    const home = screen.getByRole('link', { name: 'Home' });
    expect(contact.className).toBe(home.className);
    expect(contact.getAttribute('style')).toBe(home.getAttribute('style'));
    expect(contact.getAttribute('style')).not.toMatch(/uppercase|border:/);
  });
});
