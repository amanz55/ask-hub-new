# Deployment

This is the runbook for the first Vercel deployment of AskHub: a gated,
non-indexable stakeholder preview of SP2a, the public read surface only. It
covers what is deployed, why it is gated, the environment variables it needs,
the DNS records the eventual subdomain will need, and — most importantly —
the checklist that must be fully satisfied before Deployment Protection and
`noindex` come off and the site goes public.

Nothing in this document is a claim that a deployment exists. Connecting a
Vercel project and setting its environment variables requires operator
credentials this repository's automation does not have; see "Operator steps"
at the end.

## 1. What is deployed and what is not

This build is SP2a: the public read surface. It contains browsing, search,
filtering, resource detail pages, and export — all read-only. There is no public
About page: `/about` is a permanent redirect to the AI Hub website
(`next.config.ts`). SP3's authenticated admin portal at `/admin` has since
merged onto this branch and is included in any build off it — role-gated
curation through server actions, not public write endpoints.

It contains **no write endpoints**. `src/app/api/README.md` records that
`/api/events`, `/api/contact`, `/api/submissions` and `/api/subscribers` are
each added later, by SP2 proper, and each is called out there as "a public
write endpoint" needing Zod validation, a payload size cap, and — from SP4 —
Cloudflare Turnstile, a honeypot field, and rate limiting. None of that exists
yet in this build, and none of it needs to: with no form to submit, there is
nothing on this deployment for that hardening to protect. That is precisely
why this build can go up ahead of SP4 (CSP, HSTS, Turnstile, honeypots, rate
limiting) — the attack surface those defend does not exist here yet.

The admin portal at `/admin` is out of scope for this deployment's read-only
premise in spirit — it is a real authenticated write surface — but SP4's
hardening is written for the public write endpoints, not for admin, so gating
the whole deployment behind Vercel Deployment Protection (below) is what
keeps `/admin` covered in the meantime, not an assumption that admin is safe
on its own.

## 2. Why it is gated

> **Update 2026-11-20: indexing is enabled on Production** at the project
> manager's request. `src/lib/indexing.ts` decides it per deployment: Vercel
> Production drops the `X-Robots-Tag` header and serves `index, follow`
> metadata, and Preview and Development keep `noindex, nofollow`. `/admin` is
> `noindex` in every environment. `src/app/robots.ts` and `src/app/sitemap.ts`
> serve `robots.txt` and `sitemap.xml`. The sitemap leaves out closed
> resources and `/impact`. `NEXT_PUBLIC_SITE_URL` must be set on Production,
> or both files will contain relative URLs. The rest of this section records
> the earlier gated posture. The content items in Section 5's checklist were
> not re-verified when indexing was turned on.

Two independent mechanisms keep this build out of search, plus one operator
setting that keeps it out of the public's hands entirely. All three must
stay on together — removing one while the others remain is still a failure
if the intent was to go public, and removing the header while the metadata
stays (or vice versa) leaves the page half-declared.

**Vercel Deployment Protection.** Enabled for both the Preview and Production
environments (see "Operator steps"). Without a valid bypass, the deployment
does not render for anyone. This is the only one of the three that stops a
visitor from reaching content at all — the two below only ask search engines
not to index what they can already reach.

**`X-Robots-Tag` header.** `next.config.ts` returns this header on every
route via the `headers()` function:

```
X-Robots-Tag: noindex, nofollow
```

Verified in `next.config.ts`: the `headers()` function matches `source:
'/(.*)'` (every route) and sets exactly that value, alongside
`X-Content-Type-Options: nosniff` and `Referrer-Policy:
strict-origin-when-cross-origin`. A comment there marks the fuller header set
— CSP, HSTS with `includeSubDomains`, `frame-ancestors`, `Permissions-Policy`
— as SP4's, not this build's.

**`robots` metadata.** `src/app/layout.tsx` sets, in the root layout's
exported `metadata`:

```ts
robots: { index: false, follow: false }
```

This renders the equivalent `<meta name="robots" content="noindex,
nofollow">` tag on every page that uses the root layout, which is all of
them.

All three — protection, header, metadata — stay in place until the launch
checklist in Section 5 is fully satisfied. The database currently holds
placeholder content transcribed from a prototype, not the client's dataset
(`scripts/seed-data.ts` says so in its own header).

Be precise about the risk, because an imprecise version of it was carried in
this document and reasoned from. The opportunities are real: AWS Activate,
CINECA Leonardo, the AfDB Digital Jobs Programme and the rest are genuine
programmes run by the named organisations. Nobody would apply to something
that does not exist. What is unverified is every *detail* — the application
URL, the deadline, the eligibility, the description — none of which has been
confirmed with the partner, and all of which was transcribed from a demo of
unknown vintage. AskHub links out rather than collecting applications, so the
failure mode is a visitor sent to a dead URL, an application window that
closed, or eligibility they do not meet: wasted effort and a directory that
looks unmaintained, attributed to MIMIT and UNDP. That is why
`docs/client-deliverables-request.md` asks for the dataset with a verified
application URL per resource, and why a resource whose URL cannot be verified
is held unpublished rather than shipped.

## 3. Environment variables

Names only, taken from `.env.example`, which is the committed source of
truth and carries names with no values (enforced by
`tests/structure/env-contract.test.ts`, which fails the build if a value is
committed or if a required name goes missing):

| Name | Public or secret | Set on Vercel for this deployment? | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | **Yes** — Preview and Production | Supabase project URL. `NEXT_PUBLIC_`-prefixed variables are inlined into the client bundle by Next.js at build time — public by definition, per PRD 13.5. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | **Yes** — Preview and Production | Supabase anonymous key. Also inlined into the client bundle; it only ever grants what RLS policies allow the `anon` role. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | **Yes** — the Team access card on `/admin/settings` has shipped, so a build off this branch needs it | Bypasses Row Level Security entirely. Server-only. **Not needed by a build scoped to the SP2a public read surface**, and needed by exactly one code path in any build that includes the Team access card — `src/lib/actions/users.ts`, the sole caller of `createAdminSupabase()` under `src/`; see the note below. **Must never be given a `NEXT_PUBLIC_` prefix** — `tests/structure/env-contract.test.ts` asserts `.env.example` contains no such name, and that assertion is what makes this invariant structural rather than a matter of discipline. |
| `SUBMISSION_IP_PEPPER` | **Secret** | Recommended — Production | Optional. Mixed into the SHA-256 of a visitor's IP before the public suggestion form's per-network rate limit stores the hash (`src/lib/actions/suggestions.ts`); the address itself is never stored. Any long random string. Unset, no hash is stored and only the per-address and global limits in migration 0024 apply. Server-only; never `NEXT_PUBLIC_`. |
| `SUPABASE_URL` | Test-only | **No, never.** | Read directly by test helpers and `tests/smoke.test.ts` from `.env.test`, against the local Supabase CLI stack. Not a deployment variable under any circumstance. |
| `SUPABASE_ANON_KEY` | Test-only | **No, never.** | Same as above — a local-stack test credential, not something a Vercel project ever needs. |

Set the two `NEXT_PUBLIC_` variables on Vercel for both the Preview and
Production environments (see "Operator steps"), and
`SUPABASE_SERVICE_ROLE_KEY` for any deployment whose build includes SP3's
Team access card — it has shipped, so a build off this branch does. `.env.example`'s
remaining two names, `SUPABASE_URL` and `SUPABASE_ANON_KEY`, are test-only —
read directly by test helpers and `tests/smoke.test.ts` from `.env.test`
against the local Supabase CLI stack — and have no place in a Vercel project.

### What actually needs the service-role key

Worth stating precisely, because an earlier draft of the SP3 design concluded
that **every** admin write would need this key, and that conclusion was wrong.
It followed from a true premise — `audit_log` has no insert policy for any
role, so a server action running on the caller's session cannot write its own
audit row — but the fix it implied put the mutation and its audit row on two
different connections, therefore in two different transactions, therefore able
to end up inconsistent. SP3 instead has the database write the audit row from
a trigger inside the mutation's own transaction, so ordinary admin writes run
as the signed-in user, under RLS, with no service-role key in the path
(`docs/superpowers/specs/2026-07-30-sp3-admin-portal-design.md` §4).

What is left:

| Caller | Needs it because | Where |
|---|---|---|
| The Team access card's invite action | Creating a Supabase Auth user is a GoTrue Admin API call, not a table write. No RLS policy can grant it, and there is no public sign-up route to do it instead (PRD §3, §14.3) | `src/lib/actions/users.ts` (SP3, shipped — `inviteUser` wraps only the `auth.admin.inviteUserByEmail` call in it) |
| `scripts/provision-admins.ts` | Bootstraps the first admin accounts before any admin exists to invite them. Operator-run, never deployed | already in the repository |
| `scripts/seed.ts` | Writes seed content across tables no single role may write | already in the repository |
| `tests/helpers/clients.ts` | Creates and role-assigns the RLS fixture users, and reads what a given role must *not* see | already in the repository |
| SP2b's four public write endpoints | Anonymous submissions, after Zod validation | not built yet |

Only the first of those runs on Vercel. Three consequences for this runbook:

- If a deployment is scoped without the Team access card, this variable can be
  omitted entirely and nothing else in the application will look for it.
- The role, name, label and deactivation controls on that screen are ordinary
  `profiles` updates made as the signed-in admin — they are *not* reasons for
  this key, and an implementation that reaches for it there has widened the
  blast radius for no gain.
- `tests/structure/service-role-containment.test.ts` (SP3) pins the production
  caller list to exactly one file, so a second caller has to argue for itself
  in a diff rather than appearing quietly.

`.env.example` may also carry `NEXT_PUBLIC_SITE_URL` by the time this
deployment happens; check the file as it stands rather than trusting this
list, and if it names something not covered above with a `NEXT_PUBLIC_`
prefix, set it too — it would be public by the same rule.

No value for any of these belongs in this document, in a commit, or in any
other file `git` tracks. The service role key in particular is the one
credential in this list that must never be pasted anywhere a client bundle,
a log, or a chat transcript could pick it up.

## 4. DNS records

PRD 13.3 anticipates a subdomain such as `askhub.aihubfordevelopment.org`
(the PRD's own example — the exact hostname is the client's to confirm, not
this document's to invent). Once Vercel issues its target for that
subdomain, record it here:

- **Record type:** `CNAME`
- **Host:** `<subdomain — client-confirmed, e.g. askhub>`
- **Target:** `<CNAME value Vercel issues when the domain is added to the project — operator to fill in>`

Two things this task does not cover:

- **Who manages DNS for the parent domain, and whether existing MX records
  survive the change** is PRD open question 8 — unanswered as of this
  writing, and it blocks pointing the subdomain regardless of what Vercel
  issues.
- **SPF and DKIM** for the digest and contact-form sending domain are SP5's
  concern, not this deployment's. PRD 9's schedule risk note is explicit that
  sending from an `@undp.org` or `aihubfordevelopment.org` address needs
  those records on a domain controlled by UNDP IT, and that this is an
  external dependency measured in days — start it early, independent of this
  runbook.

## 5. The pre-launch checklist

**This is the gate.** Every item below must be true before Deployment
Protection comes off and `noindex` is removed. The database right now holds
placeholder content transcribed from a prototype the client reviewed, not
the client's real dataset — `scripts/seed-data.ts`'s header says this in its
own words. Skipping any item here means a real innovator can apply to an
opportunity, a partnership, or a figure that was never real. Do not skim
this list; do not remove protection with any box unchecked.

- [ ] **The client's real dataset replaces the placeholder seed.** Resources,
      partners and any other seeded content currently come from
      `scripts/seed-data.ts`, transcribed from the prototype. None of it is
      the client's confirmed content. See `docs/client-deliverables-request.md`
      for exactly what the client must supply and in what shape — this
      checklist does not restate that list, only gates on it being done.
- [ ] **The fifteen headline figures are attested, each with a source and a
      named attester.** `headline_stats` (and `compute_metrics`) enforce this
      structurally, not just by convention: migration `0015_stat_provenance.sql`
      adds `source`, `attested_by` and `attested_on` as `not null` with a
      non-blank check on `source` and `attested_by`, so a row cannot exist
      without them. That constraint guarantees provenance is recorded; it
      does not by itself guarantee all fifteen have arrived — confirm the
      full set against `docs/client-deliverables-request.md` before treating
      this item as done. Partial delivery is expected and tolerated by the
      product (the stats band renders whatever subset exists), but this
      checklist item is about whether launch content is complete, not about
      whether the mechanism works.
- [ ] **Partner logos and their link-out URLs are uploaded.** Content rule 10
      of PRD Section 10 requires "Partner and institution logos link to
      their official sites"; the `partners` table's `website_url` is
      `not null` and constrained to `https://`, and `logo_url` (nullable) is
      constrained to `https://` and rejects SVG when present — but a
      constraint only stops a bad value, it does not supply a missing one.
      Confirm every partner intended for launch has a real logo and a real
      official-site URL, not a placeholder.
- [ ] **Legal-reviewed Privacy and Terms copy is in `site_content`.** PRD
      content rule 9 states privacy copy stays "minimal and factual pending
      legal review" — that review has to have happened, and the reviewed
      copy has to be the copy actually stored under the `privacy_body` and
      `terms_body` keys (set by the seed or by SQL -- the admin portal's Settings
      screen carries only the prototype's four cards, and legal copy is not one
      of them),
      not the placeholder that shipped with the seed.
- [ ] **At least two admin accounts are provisioned, and the client team's
      roles are assigned.** PRD §3 requires two admins so that a single
      lockout does not lock out the team, and it is the one launch requirement
      that cannot be fixed after the fact by an operator who is themselves
      locked out. Run `scripts/provision-admins.ts` for the first two; every
      account after that is invited from the Team access card on
      `/admin/settings`. Confirm no
      account is still sitting at the default `viewer` role that was meant to
      be an editor — `handle_new_user()` mints every profile as `viewer` by
      design, so an unassigned invitation looks like a deliberate viewer.
- [ ] **SP4 is merged**: CSP, HSTS (with `includeSubDomains`), Turnstile,
      honeypots, rate limiting, payload caps, and the image-host policy
      `next/image` needs. This deployment intentionally predates all of it;
      going public without it does not.
- [ ] **`noindex` is removed from both places it is set**, together, not one
      at a time:
  - the `X-Robots-Tag` header in `next.config.ts`
  - the `robots` metadata in `src/app/layout.tsx`

      Removing only one leaves the page half-declared to search engines and
      is not a smaller version of done.
- [ ] **Deployment Protection is turned off** in the Vercel project settings,
      at the same time as the two `noindex` removals above — not before, not
      long after.
- [ ] **Sitemap and `robots.txt` are added.** This is SP6's work, not SP2a's
      or this task's, but a public site with neither is discoverable in
      theory and unfindable in practice. Confirm they exist and are correct
      before or at the same moment protection comes off.

**What this checklist deliberately excludes:** total reach, growth, session
counts, and user counts. Those are Google Analytics' to report at runtime —
no column in this schema stores them, by design (see the note in
`supabase/migrations/0015_stat_provenance.sql`, which draws this line
explicitly: `headline_stats` and `compute_metrics` hold only client-supplied,
attested figures, "never a cache of anything GA4 supplies"). If a number like
that is ever proposed for this checklist or for the site, it is being
fabricated, not reported — GA4's dashboards are where it belongs, not a
database column, and not this document.

## Operator steps (not automatable, not executed here)

The remainder of this runbook is for the human operator; no credentials or
external-service access exist in the environment that authors this
document, and none were used or attempted while writing it.

1. **Connect the project.** Import this repository into Vercel. Set the
   environment variables from Section 3 for both the Preview and Production
   environments. Enable Deployment Protection for both.
2. **Verify the deployed site.** Against the real deployed URL, execute and
   record the result of each of the following — this is a checklist to run,
   not a set of claims already confirmed:
   - [ ] The site requires the Deployment Protection bypass to load at all
         (try it in a fresh private-browsing window with no bypass cookie).
   - [ ] `curl -sI <deployed-url>/ | grep -i x-robots-tag` returns
         `noindex, nofollow`. Repeat against one resource detail URL.
         (`/about` now 308-redirects off-site, so the header check does not
         apply there.)
   - [ ] `/` renders the bands that currently have data, and omits the ones
         that do not.
   - [ ] A resource detail page resolves.
   - [ ] `/impact` returns 404 (the feature flag `feature_public_impact_page`
         is off at launch).
   - [ ] The rendered page source and the built client JS contain no
         `service_role` string and no Supabase service-role token. Search the
         built JS bundles specifically, not just the HTML.
   - [ ] Publish a resource directly in the database, let the relevant tag or
         path revalidate, and confirm its detail page resolves on the
         deployed site **without a redeploy**. This exercises the
         `dynamicParams` behaviour that `src/app/(public)/resources/[id]/page.tsx`
         (added by Task 5) depends on for `generateStaticParams` — a
         route table that only ever worked at build time would fail this
         check silently, by 404ing instead of resolving. (That file now
         exists and exposes `dynamicParams`; the earlier note that it was
         absent from the authoring worktree is resolved.)

Steps 1 and 2 above are the human's to run together with an assistant, not
something this document certifies as already done.
