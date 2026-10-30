import { Suspense } from "react";
import WelcomeBand from "@/components/public/WelcomeBand";
import StatsBand from "@/components/public/StatsBand";
import BrowseByNeed from "@/components/public/BrowseByNeed";
import BrowseByNeedClient from "@/components/public/BrowseByNeedClient";
import RecentlyAddedRail from "@/components/public/RecentlyAddedRail";
import RecentlyAddedRailClient from "@/components/public/RecentlyAddedRailClient";
import ResourceDirectoryStatic from "@/components/public/ResourceDirectoryStatic";
import ResourceDirectoryClient from "@/components/public/ResourceDirectoryClient";
import { buildNeedMenu } from "@/lib/public/need-menu";
import { openResources } from "@/lib/public/filters";
import {
  listPublicResources,
  listNeedCounts,
  listHeadlineStats,
  getSiteContent,
} from "@/lib/public/readers";

/**
 * The storefront home, PRD 5.1 in order: welcome, reach strip, search,
 * browse by need, recently added, then the full
 * directory on the same page (PRD 5.1 item 8 puts it here rather than on a
 * route of its own).
 *
 * Every band hides itself when it has no rows, so the page reads as finished
 * rather than broken while the client's data is still arriving. The five
 * readers are awaited together rather than in sequence: five sequential round
 * trips would be five times the latency for no benefit. The bands take rows
 * as props rather than fetching their own, which is what keeps each of them a
 * synchronous pure function a test renderer can mount -- an `async` server
 * component cannot be rendered by one, so a self-fetching band could only be
 * exercised by loading a page.
 *
 * `searchParams` is deliberately not read here: doing so would make this
 * route dynamic and lose its static prerender, and PRD 12.2 requires the
 * directory to be server-rendered content -- not client-only rendering --
 * which a dynamic-per-request page would undermine just as badly as an empty
 * fallback does.
 *
 * `ResourceDirectoryClient` calls `useSearchParams()`, which opts its
 * subtree, and only its subtree, into client-side rendering during
 * prerender. `Suspense`'s `fallback` is not a spinner: it is
 * `ResourceDirectoryStatic`, the same live resources rendered as real,
 * crawlable, no-JS-safe HTML with no dependency on search params. Next can
 * and does render that fallback fully at build time, so the static shell for
 * `/` contains genuine resource markup rather than nothing. Once a real
 * browser hydrates, the client component takes over and swaps in the
 * filtered view.
 *
 * The boundary is drawn here, around the smallest subtree that needs it, so
 * the bands above the directory still prerender as static HTML.
 *
 * **The hero and header searches are gone.** The client asked for one search
 * box, not repeats of it, so the directory's is the only one, and it no longer
 * sits above the fold as PRD 5.1 item 3 first asked. The directory keeps its own field, exactly as the prototype
 * does.
 */
export default async function PublicHomePage() {
  const [resources, needCounts, stats, content] = await Promise.all([
    listPublicResources(),
    listNeedCounts(),
    listHeadlineStats(),
    getSiteContent(),
  ]);

  // Closed resources leave every listing on this page -- the browse menu, the
  // rail, and the directory in both its renderers -- while keeping their own
  // detail page, which reads the unfiltered list. See openResources.
  const open = openResources(resources);
  const needMenu = buildNeedMenu(needCounts, open);

  return (
    <>
      <WelcomeBand content={content} />
      <StatsBand stats={stats} />

      {/* The prototype's storefront is two columns:
          a sticky department menu on the left and a single scrolling column
          on the right, inside a 1280px measure. `flex-wrap` collapses it to
          one column on a narrow screen, with no breakpoint needed.

          The main column is `flex: 1 1 300px`, not the prototype's `flex: 1`
          with `min-width: 300px`. Those are not equivalent: `flex: 1` means
          `flex-basis: 0`, and flex line-breaking decides what fits using the
          basis — so the column claims to need no width, stays on the
          sidebar's line, and only then does `min-width` force it past the
          container's edge. The result is horizontal overflow where a wrap was
          intended. Stating the 300px as the basis makes the line-breaking
          arithmetic use the number that actually governs, and the column
          drops below the menu as soon as the two cannot sit side by side.
          The prototype carries the same latent bug; at its 1280px measure it
          simply never bites. */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "22px 28px 0 28px",
          display: "flex",
          gap: 28,
          // Stretch, not flex-start: with the featured band gone this row
          // holds just the browse rail and the recently-added cards, and the
          // two ended at different heights. Stretching lets the shorter
          // column fill the row so their bottoms line up.
          alignItems: "stretch",
          flexWrap: "wrap",
        }}
      >
        {/* The menu's entries are derived here, on the server, from the
            counts and the same resource list the directory renders, and
            passed to both renderings below so they cannot list different
            things. `BrowseByNeedClient` reads the active need from the URL;
            the fallback is the same menu with nothing active, which is real
            markup rather than a placeholder — every category, count and
            category link is in the static HTML and works without JavaScript.
            Only the sub-items of an already-applied filter wait for
            hydration. Same boundary, same reasoning, as the directory below. */}
        <Suspense
          fallback={<BrowseByNeed entries={needMenu} activeNeed={null} />}
        >
          <BrowseByNeedClient entries={needMenu} />
        </Suspense>

        <div
          style={{
            flex: "1 1 300px",
            display: "flex",
            flexDirection: "column",
            gap: 22,
            minInlineSize: 0,
          }}
        >
          <Suspense fallback={<RecentlyAddedRail resources={open} />}>
            <RecentlyAddedRailClient resources={open} />
          </Suspense>
        </div>
      </div>

      {/* Only this subtree calls useSearchParams(), so only this subtree
          needs the boundary — everything above still prerenders. */}
      <Suspense fallback={<ResourceDirectoryStatic resources={open} />}>
        <ResourceDirectoryClient resources={open} />
      </Suspense>
    </>
  );
}
