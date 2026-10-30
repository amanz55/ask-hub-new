/**
 * ============================================================================
 * PLACEHOLDER CONTENT — NOT THE CLIENT'S DATASET.
 * ============================================================================
 *
 * Everything below is transcribed from the prototype's `seed()` method (the
 * demo app the client reviewed before this rebuild started). The client's
 * real dataset has not arrived. This module exists so the site has
 * something real-shaped to render in the meantime, and it is expected to be
 * REPLACED WHOLESALE the moment real partner names, resources, programmes
 * and copy are supplied. Do not treat any name, URL, description or figure
 * here as confirmed, current, or delivered.
 *
 * Three categories of prototype content are deliberately absent, not
 * forgotten:
 *   - `impact_stories`, `headline_stats` and `compute_metrics` get no rows
 *     (the prototype's numbers are unsourced demo figures, and CLAUDE.md
 *     forbids seeding a plausible-looking metric onto a UN programme's
 *     reporting surface).
 *   - `programmes` gets no rows either, on later human review: every one of
 *     the prototype's six programme descriptions carries an unattested AI
 *     Hub performance figure of its own — "120 companies... 376
 *     applications", "10 ventures... 135 applications", "Mobilising up to
 *     $10B by 2035, targeting up to 45M jobs" — and `programmes_public` is
 *     anon-readable, so seeding them would put the same class of unattested
 *     claim CLAUDE.md forbids in front of a public visitor, just in prose
 *     rather than in a number column. This is a different case from the
 *     `resources` descriptions kept below: "Up to $150K in Azure credits" is
 *     Microsoft's own offer terms (directory content about someone else's
 *     programme, inherent to what a directory is), not the AI Hub reporting
 *     its own performance. `programmes` stays empty until the client
 *     supplies attested copy, consistent with the three tables above.
 *   - The four tables that would carry a real person's email address, a
 *     public proposal, a digest send history, or per-visit analytics get no
 *     rows either (the prototype's version of each is fabricated personal
 *     data / reporting history that must never enter a real system, even as
 *     a placeholder — deliberately not named here; see the note on
 *     scripts/seed.ts for why).
 * See task-12a-brief.md for the full table of what is and is not seeded
 * (programmes at 0 rows is a later human decision, made after that brief was
 * written — see task-12a-report.md's fix report for the full reasoning).
 *
 * No `@/*` imports here or anywhere under scripts/: vitest aliases `@` to
 * `./src`, but `tsx` (which runs `npm run seed`) does not, so a module that
 * typechecks and passes tests would still crash at runtime. Every union
 * below is declared locally instead of imported from generated types.
 *
 * This file is data only: no logic, no Supabase client, no database access.
 * scripts/seed.ts is the runner that upserts these arrays.
 */

// Mirrors supabase/migrations/0002_enums.sql and 0013_reconcile_partners.sql
// exactly. Declared locally (see file header) rather than imported from
// src/lib/supabase/database.types.ts.
export type ResourceStatus = 'live' | 'pipeline' | 'reference';
export type NeedType =
  | 'compute' | 'training' | 'funding' | 'accelerator'
  | 'data' | 'challenges' | 'community';
export type GeoScope = 'global' | 'all_africa' | 'partner_countries' | 'specific';
export type PartnerTier =
  | 'strategic'
  | 'government'
  | 'development_partner'
  | 'academic'
  | 'network';
export type Exclusivity = 'exclusive' | 'early_access';

// ============================================================================
// Partners — 19 rows, names only.
// ============================================================================
//
// `logo_url` and `website_url` are null for every row except the three in
// `PARTNER_ASSETS` below. The prototype carries no partner URLs at all (its
// favicon-domain trick even misattributes Stanford to coursera.org — see
// 0013_reconcile_partners.sql), so every logo here comes from the client's
// asset pack instead. supabase/migrations/0014_partner_logos.sql keeps both
// columns nullable precisely so the rest can wait: a partner row can exist
// before its asset pair (logo + site) arrives, and
// `partners_logo_requires_site` only refuses a logo with no link, which a
// name-only row never triggers.
//
// "Cyber 4.0 and Cisco" is kept as one combined name, matching the prototype
// exactly, even though it names two organisations. An earlier ruling called
// for splitting it into two partner rows so each could carry its own logo
// and link. That split is deferred to the real dataset: splitting a
// placeholder name now produces two logo-less rows that will not match
// whatever the client's real data calls these two organisations anyway, and
// the one resource that names this partner (`cyber4africa`) is seeded as
// `pipeline` regardless (see the resources section below) — the ambiguity
// is not currently public-facing.
//
// "Deep Learning Indaba" is included even though no seeded resource names it
// as a partner: it appears only on a prototype *submitted proposal* for a
// new resource (out of scope for this seed — see file header), but the task
// brief lists it among the 19 verbatim partner names, so it is seeded as a
// name-only row like the rest.
//
// "CINECA" replaces the prototype's "CINECA / AI Hub" on the client's
// confirmation that the entity is CINECA — the prototype had folded the
// facility and the programme into one free-text provider string.
// supabase/migrations/0019_ai_hub_partners.sql carried the same rename as an
// UPDATE, for a database that already held rows when it was applied (its
// partner flag has since been dropped by 0027); this array is what performs
// the rename on a `db:reset` + `npm run seed`, where migrations run against an
// empty table. Both must stay in step: leaving the
// old name here would re-insert it as a 20th partner row on the next seed,
// and (because the resources upsert key is `partner,name`) would re-insert
// "CINECA Leonardo" under it as a 21st resource.
export const PARTNERS: readonly string[] = [
  'Accelerate Africa',
  'African Development Bank',
  'African Supercomputing Center (UM6P)',
  'AfriLabs',
  'AI Research Society of Africa (AIRSA)',
  'AIMS South Africa and Google DeepMind',
  'Air Street Capital',
  'Amazon Web Services',
  'Anthropic',
  'Baobab Network',
  'CHPC / NICIS, South Africa',
  'CINECA',
  'Cloudflare',
  'Codecademy',
  'Coursera (Google Career Certificates)',
  'Cyber 4.0 and Cisco',
  'Databricks',
  'DataLens Africa',
  'Deep Learning Indaba',
  'Digital Africa',
  'DigitalOcean',
  'European Commission',
  'European Commission / Horizon Europe',
  'Google',
  'Google / Kaggle',
  'Google Cloud',
  'Google Research',
  'GSMA',
  'Huawei Cloud',
  'Hugging Face',
  'IBM, via Coursera',
  'Injini',
  'Intel',
  'International Development Research Centre (IDRC)',
  'Lacuna Fund',
  'Mahara-Tech (ITI, Egypt)',
  'Masakhane',
  'Mercy Corps',
  'Meta',
  'Microsoft',
  'Microsoft Learn',
  'MIDAS, University of Michigan',
  'NaijaVoices Community',
  'NVIDIA',
  'OpenAI (OpenAI Academy)',
  'Orange',
  'Safaricom',
  'Salesforce (Trailhead)',
  'Science for Africa Foundation',
  'Stanford / Coursera',
  'Starweaver, via Coursera',
  'Weights & Biases',
  'Zindi',
];

/**
 * The partners whose logo and official site the client's asset pack covers.
 *
 * The files are `public/partners/*.png`, committed in 744108a ("the client's
 * asset pack, PNG (the schema rejects SVG)"). That commit also uploaded them
 * to a Supabase Storage bucket by hand and wired three partners to the
 * resulting https URLs, because `partners_logo_https` accepted nothing else.
 * That upload is still live on the hosted project behind Vercel and still
 * renders in production -- what was never committed is anything that
 * *reproduces* it: no bucket migration, no upload script, no seeded URL. So
 * every other environment starts with 19 null logos, and a local stack cannot
 * be brought up to match, since its Supabase URL is http and the constraint
 * refused it.
 *
 * supabase/migrations/0021_partner_logo_asset_paths.sql widens that
 * constraint to also accept a site-root-relative path, which is what these
 * are: Next serves them from `public/`, on the page's own origin, with no
 * bucket involved, and they survive a `db:reset` because they are declared
 * here rather than uploaded.
 *
 * **These do not disturb the hosted rows.** The seed writes them only where
 * `logo_url` is null (see scripts/seed.ts), so running it against the
 * deployed project leaves its Storage URLs exactly as they are. The two
 * sources coexist on purpose: the deployment keeps what it has, and a
 * checkout stops depending on a bucket this repository cannot recreate.
 *
 * **Three partners, not five.** The pack also contains `cisco.png` and
 * `domyn.png`, and both stay unwired for the reason 744108a gave and this
 * seed's own header repeats. There is no Domyn partner row at all, and Cisco
 * exists only inside the combined name "Cyber 4.0 and Cisco" -- putting the
 * Cisco mark on a row that names two organisations would state something
 * about a UN programme's partnerships that nobody has confirmed. Adding a row
 * for either is a client decision, not a seeding one.
 *
 * Each site is the organisation's own, which is content rule 10.10 ("each
 * logo must link to its own official site") and is also the only reason the
 * pair is declared together: `partners_logo_requires_site` refuses to store a
 * logo whose partner has no link.
 */
export const PARTNER_ASSETS: readonly {
  name: string;
  logoUrl: string;
  websiteUrl: string;
}[] = [
  {
    name: 'Amazon Web Services',
    logoUrl: '/partners/aws.png',
    websiteUrl: 'https://aws.amazon.com/',
  },
  {
    name: 'CINECA',
    logoUrl: '/partners/cineca.png',
    websiteUrl: 'https://www.cineca.it/',
  },
  {
    name: 'Microsoft',
    logoUrl: '/partners/microsoft.png',
    websiteUrl: 'https://www.microsoft.com/',
  },
  {
    name: 'NVIDIA',
    logoUrl: '/partners/nvidia.png',
    websiteUrl: 'https://www.nvidia.com/',
  },
  {
    name: 'Google',
    logoUrl: '/partners/google.png',
    websiteUrl: 'https://www.google.com/',
  },
  {
    name: 'African Development Bank',
    logoUrl: '/partners/african-development-bank.png',
    websiteUrl: 'https://www.afdb.org/',
  },
  {
    name: 'AfriLabs',
    logoUrl: '/partners/afrilabs.png',
    websiteUrl: 'https://www.afrilabs.com/',
  },
  {
    name: 'Zindi',
    logoUrl: '/partners/zindi.png',
    websiteUrl: 'https://zindi.africa/',
  },
  {
    name: 'Stanford / Coursera',
    logoUrl: '/partners/coursera.png',
    websiteUrl: 'https://www.coursera.org/',
  },
  {
    // Two organisations under one partner row, and the asset pack carries no
    // Kaggle mark. The client's instruction is to use the Google mark, which
    // is defensible -- Kaggle is Google-owned -- and is recorded here because
    // the logo does not name everything the row does.
    name: 'Google / Kaggle',
    logoUrl: '/partners/google.png',
    websiteUrl: 'https://www.kaggle.com/',
  },
];

// ============================================================================
// Resources — 20 rows, transcribed from the prototype's seed() `resources`
// array (its `R()` factory defaults applied, then its `META` overrides
// merged in, exactly as the prototype's own `forEach` does at runtime).
// ============================================================================
//
// Field mapping applied uniformly below, not repeated per row:
//   - `partner_tier`: prototype's Strategic|Government|Development
//     partner|Academic|Network, lowercased/snake_cased to match
//     supabase/migrations/0013_reconcile_partners.sql's enum.
//   - `status`: prototype's Live|Pipeline|Reference, lowercased. The
//     prototype's R() factory defaults `status` to 'Live' — a row with no
//     explicit status in the prototype IS live, not pipeline. Applied here
//     except for the one deliberate demotion noted on `cyber4africa` below.
//   - `exclusivity`: '' -> null, 'Exclusive to AskHub' -> 'exclusive',
//     'Early access' -> 'early_access'.
//   - `geo_scope`: Global -> 'global', 'All Africa' -> 'all_africa',
//     '18 priority countries' -> 'partner_countries', 'Selected' ->
//     'specific'.
//   - `sectors_eligible`: every one of these 20 resources carries the
//     prototype's sentinel `sectors: 'All'` (none override it), which means
//     "all sectors" — transcribed as `[]`, never as `['All']` (which would
//     read as a literal, single sector named "All").
//   - `banner_image_url`: the prototype's `image` field is `''` on every one
//     of these 20 resources — transcribed as `null`.
//   - `description_fr` / `description_pt` / `description_ar`: the prototype
//     has no translated copy at all. Left `null` rather than invented —
//     locales/en.json stubs exist for fr/pt/ar, but resource copy is not a
//     UI string and has no source translation here.
//   - Dropped entirely, matching the brief: `views`, `clicks`, `match_weight`
//     (fabricated-metric columns that do not exist on `resources`),
//     `verified` (no such column — the per-resource "Verified" badge the
//     prototype renders is exactly what content rule 10.x forbids; curation
//     is stated once, globally, via site_content), `notified`, and the
//     prototype's own `id` (the real table generates its own uuid).
//   - `added_date` is transcribed from the prototype's `added` field
//     (merged with its `META` override where present) rather than left to
//     default to `current_date` — the prototype gives an explicit date for
//     every one of these 20 rows, so defaulting to today would silently
//     discard real (if placeholder) information.
export interface SeedResource {
  name: string;
  partner: string;
  partner_tier: PartnerTier;
  resource_type: string;
  need_primary: NeedType;
  need_secondary: NeedType | null;
  sub_category: string | null;
  description: string;
  action_label: string;
  external_url: string;
  banner_image_url: string | null;
  countries_eligible: string[];
  sectors_eligible: string[];
  stages_eligible: string[];
  geo_scope: GeoScope;
  deadline: string | null;
  status: ResourceStatus;
  is_featured: boolean;
  exclusivity: Exclusivity | null;
  added_date: string;
  sort_order: number;
}

export const RESOURCES: readonly SeedResource[] = [
  {
    name: 'Microsoft for Startups Founders Hub',
    sort_order: 1,
    partner: 'Microsoft',
    partner_tier: 'strategic',
    resource_type: 'Credits',
    need_primary: 'compute',
    need_secondary: 'training',
    sub_category: 'Cloud credits',
    description:
      'Up to $150K in Azure credits, plus access to OpenAI, GitHub Enterprise, and developer tools for early-stage AI startups.',
    action_label: 'Apply on Microsoft',
    external_url: 'https://startups.microsoft.com/en-us/founders-hub/',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Getting started', 'Building', 'Scaling'],
    geo_scope: 'global',
    deadline: null,
    status: 'live',
    is_featured: true,
    exclusivity: null,
    added_date: '2026-05-12',
  },
  {
    name: 'AWS Activate',
    sort_order: 7,
    partner: 'Amazon Web Services',
    partner_tier: 'strategic',
    resource_type: 'Credits',
    need_primary: 'compute',
    need_secondary: null,
    sub_category: 'Cloud credits',
    description:
      'Up to $100K in AWS credits, plus technical support and training for startups building on AWS.',
    action_label: 'Apply on AWS',
    external_url: 'https://aws.amazon.com/startups/credits/',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Building', 'Scaling'],
    geo_scope: 'global',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
  },
  {
    name: 'CINECA Leonardo',
    sort_order: 2,
    partner: 'CINECA',
    partner_tier: 'strategic',
    resource_type: 'Programme',
    need_primary: 'compute',
    need_secondary: null,
    sub_category: 'HPC allocation',
    description:
      "GPU hours on Europe’s leading HPC facility, dedicated to African AI researchers and builders.",
    action_label: 'Apply for allocation',
    external_url: 'https://leonardo-supercomputer.cineca.eu/',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Building', 'Scaling'],
    geo_scope: 'partner_countries',
    deadline: '2026-07-31',
    status: 'live',
    is_featured: true,
    // Prototype META override: 'Exclusive to AskHub'.
    exclusivity: 'exclusive',
    added_date: '2026-06-02',
  },
  {
    name: 'Microsoft AI Fluency',
    sort_order: 4,
    partner: 'Microsoft',
    partner_tier: 'strategic',
    resource_type: 'Course',
    need_primary: 'training',
    need_secondary: null,
    sub_category: 'Curriculum',
    description:
      'Foundational AI skills curriculum, ready to deploy immediately, available in 22 languages.',
    action_label: 'Start the curriculum',
    external_url: 'https://learn.microsoft.com/en-us/training/paths/ai-fluency/',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['New to AI', 'Getting started'],
    geo_scope: 'global',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-07-06',
  },
  {
    name: 'AfriLabs Talent Hub & AI Community',
    sort_order: 8,
    partner: 'AfriLabs',
    partner_tier: 'network',
    resource_type: 'Programme',
    need_primary: 'training',
    need_secondary: null,
    sub_category: 'Training pathway',
    description:
      'A 10-week training pathway delivered through 450+ innovation hubs across 53 African countries.',
    action_label: 'Register',
    external_url: 'https://www.afrilabs.com/',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['New to AI', 'Getting started'],
    geo_scope: 'all_africa',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-06-18',
  },
  {
    name: 'NVIDIA Inception',
    sort_order: 3,
    partner: 'NVIDIA',
    partner_tier: 'strategic',
    resource_type: 'Programme',
    need_primary: 'accelerator',
    need_secondary: 'compute',
    sub_category: 'Startup programme',
    description:
      'A free programme for AI startups: technical training, GPU credits, marketing support, and investor connections.',
    action_label: 'Join Inception',
    external_url: 'https://www.nvidia.com/en-us/startups/',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Building', 'Scaling'],
    geo_scope: 'global',
    deadline: null,
    status: 'live',
    is_featured: true,
    exclusivity: null,
    added_date: '2026-06-25',
  },
  {
    // DEMOTED live -> pipeline (deviation from the prototype, which defaults
    // this row to 'Live' with no explicit status). PRD §15 licenses seeding
    // a resource with an unconfirmed URL as pipeline rather than publishing
    // it broken. Two independent reasons here, either one sufficient:
    //   1. `external_url` is a path on AskHub's own domain
    //      (aihubfordevelopment.org/cyber4africa-programme), not a page on
    //      either named partner's site — it cannot be confirmed as the
    //      partner's real application URL from the prototype alone.
    //   2. `partner` is the combined name "Cyber 4.0 and Cisco" (two
    //      organisations); which one this URL and the "Apply now" action
    //      actually belong to is unresolved (see the partners section
    //      above for the same ambiguity).
    // A pipeline resource is admin-visible but not public, so this is the
    // safe default until the client confirms the real programme URL.
    name: 'Cyber4Africa Programme',
    sort_order: 12,
    partner: 'Cyber 4.0 and Cisco',
    partner_tier: 'strategic',
    resource_type: 'Programme',
    need_primary: 'training',
    need_secondary: null,
    sub_category: 'Security training',
    description:
      'AI security and cybersecurity training programme for African startups, delivered in partnership with Italian institutions.',
    action_label: 'Apply now',
    external_url: 'https://aihubfordevelopment.org/cyber4africa-programme',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Building', 'Scaling'],
    geo_scope: 'partner_countries',
    deadline: '2026-07-18',
    status: 'pipeline',
    is_featured: false,
    // Prototype META override: 'Early access'. Kept as transcribed even
    // though the row is seeded pipeline — the badge only ever renders
    // publicly once (if ever) a human promotes this row to live, at which
    // point it will reflect the prototype's original intent.
    exclusivity: 'early_access',
    added_date: '2026-05-28',
  },
  {
    name: 'Zindi Community',
    sort_order: 6,
    partner: 'Zindi',
    partner_tier: 'network',
    resource_type: 'Community',
    need_primary: 'challenges',
    need_secondary: 'training',
    sub_category: 'Data science community',
    description:
      "Africa’s largest data science community — competitions, challenges, learning paths, and job opportunities.",
    action_label: 'Join Zindi',
    external_url: 'https://zindi.africa',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['New to AI', 'Getting started', 'Building', 'Scaling'],
    geo_scope: 'all_africa',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-07-04',
  },
  {
    name: 'Google AI Essentials',
    sort_order: 5,
    partner: 'Google',
    partner_tier: 'strategic',
    resource_type: 'Course',
    need_primary: 'training',
    need_secondary: null,
    sub_category: 'AI literacy',
    description:
      'Foundational AI literacy course — self-paced, no prerequisites, certificate on completion.',
    action_label: 'Start learning',
    external_url: 'https://grow.google/ai-essentials',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['New to AI', 'Getting started'],
    geo_scope: 'global',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-07-07',
  },
  {
    name: 'Stanford Machine Learning Specialisation',
    sort_order: 9,
    partner: 'Stanford / Coursera',
    partner_tier: 'academic',
    resource_type: 'Course',
    need_primary: 'training',
    need_secondary: null,
    sub_category: 'Specialisation',
    description:
      'Three-course specialisation in supervised and unsupervised learning, taught by Andrew Ng.',
    action_label: 'Enrol on Coursera',
    external_url: 'https://www.coursera.org/specializations/machine-learning-introduction',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Getting started', 'Building'],
    geo_scope: 'global',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-20',
  },
  {
    name: 'Kaggle Datasets & Competitions',
    sort_order: 10,
    partner: 'Google / Kaggle',
    partner_tier: 'network',
    resource_type: 'Community',
    need_primary: 'training',
    need_secondary: null,
    sub_category: 'Datasets & competitions',
    description: 'Datasets, competitions, notebooks, and a global data science community.',
    action_label: 'Explore Kaggle',
    external_url: 'https://www.kaggle.com',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Getting started', 'Building', 'Scaling'],
    geo_scope: 'global',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-06-10',
  },
  {
    name: 'AfDB Digital Jobs Programme',
    sort_order: 11,
    partner: 'African Development Bank',
    partner_tier: 'development_partner',
    resource_type: 'Programme',
    need_primary: 'training',
    need_secondary: 'funding',
    sub_category: 'Workforce programme',
    description:
      "Training and placement programme building Africa’s digital workforce, with pathways into AI and data roles.",
    action_label: 'Apply now',
    external_url:
      'https://www.afdb.org/en/topics-and-sectors/initiatives-partnerships/digital-skills-and-jobs-for-youth',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Getting started', 'Building'],
    geo_scope: 'all_africa',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-07-03',
  },
  {
    name: 'Google for Startups Africa',
    sort_order: 13,
    partner: 'Google',
    partner_tier: 'strategic',
    resource_type: 'Programme',
    need_primary: 'funding',
    need_secondary: 'accelerator',
    sub_category: 'Accelerator & fund',
    description:
      "Equity-free support, mentorship, and up to $200K for African startups in Google’s accelerator network.",
    action_label: 'Apply now',
    external_url: 'https://www.googleforstartups.com/regions/africa',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Building', 'Scaling'],
    geo_scope: 'all_africa',
    deadline: '2026-07-10',
    // Prototype's own explicit status, unchanged.
    status: 'pipeline',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-06-20',
  },
  {
    name: 'Meta Llama Impact Grants',
    sort_order: 14,
    partner: 'Meta',
    partner_tier: 'strategic',
    resource_type: 'Programme',
    need_primary: 'funding',
    need_secondary: null,
    sub_category: 'Grants',
    description:
      'Grants for teams using open Llama models to address social and economic challenges.',
    action_label: 'Apply now',
    external_url: 'https://llama-impact.org/',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Building', 'Scaling'],
    geo_scope: 'global',
    deadline: '2026-06-30',
    status: 'pipeline',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-06-12',
  },
  {
    name: 'Mercy Corps Ventures',
    sort_order: 15,
    partner: 'Mercy Corps',
    partner_tier: 'development_partner',
    resource_type: 'Fund',
    need_primary: 'funding',
    need_secondary: null,
    sub_category: 'Early-stage capital',
    description:
      'Early-stage capital and venture support for startups serving climate-vulnerable and underserved communities.',
    action_label: 'Pitch to MCV',
    external_url: 'https://www.mercycorpsventures.org/',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Building', 'Scaling'],
    geo_scope: 'all_africa',
    deadline: null,
    status: 'pipeline',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-06-15',
  },
  {
    name: 'Orange Ventures Africa',
    sort_order: 16,
    partner: 'Orange',
    partner_tier: 'strategic',
    resource_type: 'Fund',
    need_primary: 'funding',
    need_secondary: null,
    sub_category: 'Corporate VC',
    description:
      "Corporate venture fund investing in startups across Orange’s African and Middle Eastern footprint.",
    action_label: 'Apply now',
    external_url: 'https://orangeventures.fr/en',
    banner_image_url: null,
    // Transcribed verbatim from the prototype, including the full country
    // name — CLAUDE.md requires "Democratic Republic of the Congo" in full,
    // never "DRC", and the prototype already writes it this way here.
    countries_eligible: [
      'Senegal',
      "Côte d'Ivoire",
      'Morocco',
      'Tunisia',
      'Democratic Republic of the Congo',
      'Egypt',
    ],
    sectors_eligible: [],
    stages_eligible: ['Scaling'],
    geo_scope: 'specific',
    deadline: null,
    status: 'pipeline',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-06-22',
  },
  {
    name: 'Safaricom Spark Venture Fund',
    sort_order: 17,
    partner: 'Safaricom',
    partner_tier: 'strategic',
    resource_type: 'Fund',
    need_primary: 'funding',
    need_secondary: null,
    sub_category: 'Corporate VC',
    description:
      'Venture fund backing growth-stage East African tech companies building on mobile and data rails.',
    action_label: 'Apply now',
    external_url: 'https://sparkvf.safaricom.co.ke/',
    banner_image_url: null,
    countries_eligible: ['Kenya', 'Ethiopia'],
    sectors_eligible: [],
    stages_eligible: ['Scaling'],
    geo_scope: 'specific',
    deadline: null,
    status: 'pipeline',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-06-25',
  },
  {
    name: 'GSMA Innovation Fund — Africa',
    sort_order: 18,
    partner: 'GSMA',
    partner_tier: 'strategic',
    resource_type: 'Programme',
    need_primary: 'funding',
    need_secondary: 'accelerator',
    sub_category: 'Grant fund',
    description: 'Grant funding and technical assistance for digital innovation with development impact.',
    action_label: 'Apply now',
    external_url: 'https://www.gsma.com/innovation/accelerate-africa/',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Building', 'Scaling'],
    geo_scope: 'all_africa',
    deadline: null,
    status: 'pipeline',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-06-28',
  },
  {
    name: 'State of AI Report',
    sort_order: 19,
    partner: 'Air Street Capital',
    partner_tier: 'network',
    resource_type: 'Report',
    need_primary: 'training',
    need_secondary: null,
    sub_category: 'Research reference',
    description:
      'Annual review of AI research, industry, and geopolitics — background reading for the team.',
    action_label: 'Read the report',
    external_url: 'https://www.stateof.ai/',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    // Prototype gives this row no `stages` override, so the R() factory
    // default (all four stages) applies, same as every other resource here.
    stages_eligible: ['New to AI', 'Getting started', 'Building', 'Scaling'],
    geo_scope: 'global',
    deadline: null,
    status: 'reference',
    is_featured: false,
    exclusivity: null,
    // No META override for this id — the R() factory default applies.
    added_date: '2026-05-12',
  },
  {
    name: 'EU AI Act Summary',
    sort_order: 20,
    partner: 'European Commission',
    partner_tier: 'government',
    resource_type: 'Report',
    need_primary: 'training',
    need_secondary: null,
    sub_category: 'Policy reference',
    description:
      "Summary of the EU AI Act’s risk tiers and obligations — reference for policy conversations with partners.",
    action_label: 'Read the summary',
    external_url: 'https://artificialintelligenceact.eu/',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['New to AI', 'Getting started', 'Building', 'Scaling'],
    geo_scope: 'global',
    deadline: null,
    status: 'reference',
    is_featured: false,
    exclusivity: null,
    // No META override for this id — the R() factory default applies.
    added_date: '2026-05-12',
  },
  {
    name: 'Use AI Responsibly',
    partner: 'Coursera (Google Career Certificates)',
    partner_tier: 'strategic',
    resource_type: 'Course',
    need_primary: 'training',
    need_secondary: null,
    sub_category: null,
    description:
      'A short Google course in which learners identify data bias and potential AI harms, recognise security risks of using AI at work, and consider applications of AI for social good. Delivery: Online. Cost: Free to enrol; certificate requires paid enrolment, financial aid available. Eligibility: beginner, no prerequisites.',
    action_label: 'Start the course',
    external_url: 'https://www.coursera.org/learn/google-use-ai-responsibly',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['New to AI', 'Getting started', 'Building', 'Scaling'],
    geo_scope: 'global',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 21,
  },
  {
    name: 'Introduction to AI & Entrepreneurship',
    partner: 'AI Research Society of Africa (AIRSA)',
    partner_tier: 'strategic',
    resource_type: 'Course',
    need_primary: 'training',
    need_secondary: null,
    sub_category: null,
    description:
      'A free self-paced course combining video lectures, hands-on exercises and assessments, with a live Q&A session, on applying AI in an entrepreneurial context. Delivery: Online. Cost: free. Eligibility: African learners and professionals, no prerequisites; a site account is required to enrol.',
    action_label: 'Enrol free',
    external_url: 'https://www.airesearchsocietyofafrica.org/courses/introduction-to-ai-entrepreneurship',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['New to AI', 'Getting started', 'Building', 'Scaling'],
    geo_scope: 'all_africa',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 22,
  },
  {
    name: 'AI Agents Course',
    partner: 'Hugging Face',
    partner_tier: 'strategic',
    resource_type: 'Course',
    need_primary: 'training',
    need_secondary: null,
    sub_category: null,
    description:
      'A free self-paced course on building AI agents — fundamentals, the smolagents, LangGraph and LlamaIndex frameworks, real-world use cases and a final project, with two free certificates. Delivery: Online. Cost: free. Eligibility: beginner to advanced; basic Python and LLM knowledge, with a recap in the first unit.',
    action_label: 'Start the course',
    external_url: 'https://huggingface.co/learn/agents-course/unit0/introduction',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['New to AI', 'Getting started', 'Building', 'Scaling'],
    geo_scope: 'global',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 23,
  },
  {
    name: 'GenAI for Executives & Business Leaders: An Introduction',
    partner: 'IBM, via Coursera',
    partner_tier: 'strategic',
    resource_type: 'Course',
    need_primary: 'training',
    need_secondary: null,
    sub_category: null,
    description:
      'A short course on generative AI for business decision-makers — AI history, foundation models, trust and governance, and applications — with a shareable certificate. Delivery: Online. Cost: free to enrol and audit; financial aid available. Eligibility: beginner, no prior AI experience required.',
    action_label: 'Enrol on Coursera',
    external_url: 'https://www.coursera.org/learn/generative-ai-for-executives-business-leaders-introduction',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['New to AI', 'Getting started', 'Building', 'Scaling'],
    geo_scope: 'global',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 24,
  },
  {
    name: 'Supporting STISA 2034: SGCI Multilateral Research Call',
    partner: 'International Development Research Centre (IDRC)',
    partner_tier: 'strategic',
    resource_type: 'Fund',
    need_primary: 'funding',
    need_secondary: null,
    sub_category: null,
    description:
      'Multi-country research grants for STISA-2034, including an Artificial Intelligence & Digital Technologies stream. CAD 50,000–300,000 per project, up to 36 months. Eligibility: African research-performing institutions; consortia of 3–5 institutions across three SGCI countries; some country rules also allow SMEs and startups. Delivery: Online. Cost: no fee to apply.',
    action_label: 'Apply now',
    external_url: 'https://idrc-crdi.smapply.io/prog/supporting_stisa_2034_sgci_multilateral_research_call_advancing_africas_science_technology_and_innovation_priorities/',
    banner_image_url: null,
    countries_eligible: ['Ethiopia', 'Ghana', 'Kenya', 'Mozambique', 'Rwanda', 'Senegal', 'Tanzania', 'Zambia', "Côte d'Ivoire"],
    sectors_eligible: [],
    stages_eligible: ['New to AI', 'Getting started', 'Building', 'Scaling'],
    geo_scope: 'specific',
    deadline: '2026-09-25',
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 25,
  },
  {
    name: 'AI Fluency: Framework & Foundations',
    partner: 'Anthropic',
    partner_tier: 'strategic',
    resource_type: 'Course',
    need_primary: 'training',
    need_secondary: null,
    sub_category: null,
    description:
      'A free self-paced course teaching the 4D framework for working with AI — Delegation, Description, Discernment and Diligence — alongside generative AI fundamentals, prompting techniques and planning projects with AI. Certificate of completion. Delivery: Online. Cost: free. Eligibility: beginners through experienced practitioners.',
    action_label: 'Start the course',
    external_url: 'https://anthropic.skilljar.com/ai-fluency-framework-foundations',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['New to AI', 'Getting started', 'Building'],
    geo_scope: 'global',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 26,
  },
  {
    name: 'How to Build an Entrepreneurial AI Strategy',
    partner: 'Starweaver, via Coursera',
    partner_tier: 'strategic',
    resource_type: 'Course',
    need_primary: 'training',
    need_secondary: null,
    sub_category: null,
    description:
      'A non-technical course walking entrepreneurs through identifying AI opportunities, choosing low-cost AI tools, drafting an AI strategy with templates, and piloting and scaling it. Delivery: Online. Cost: free to audit; optional paid certificate. Eligibility: founders and managers, no prior analytics experience needed.',
    action_label: 'Enrol on Coursera',
    external_url: 'https://www.coursera.org/learn/how-to-build-an-entrepreneurial-ai-strategy',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Getting started', 'Building'],
    geo_scope: 'global',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 27,
  },
  {
    name: 'Transform your business with AI',
    partner: 'Microsoft Learn',
    partner_tier: 'strategic',
    resource_type: 'Course',
    need_primary: 'training',
    need_secondary: null,
    sub_category: null,
    description:
      'A four-module learning path for business leaders on adopting AI — AI tooling, measurable business value, responsible AI principles and scaling AI across teams. Delivery: Online. Cost: free. Eligibility: business leaders and owners, no technical background required.',
    action_label: 'Start the path',
    external_url: 'https://learn.microsoft.com/en-us/training/paths/transform-your-business-with-microsoft-ai/',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Getting started', 'Building'],
    geo_scope: 'global',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 28,
  },
  {
    name: 'Gain The AI Skills You Need To Succeed',
    partner: 'Salesforce (Trailhead)',
    partner_tier: 'strategic',
    resource_type: 'Course',
    need_primary: 'training',
    need_secondary: null,
    sub_category: null,
    description:
      'A four-section trail covering AI fundamentals, generative AI, NLP, responsible AI, large language models, prompt engineering, fine-tuning and data analytics, with stackable badges. Delivery: Online. Cost: free, badges included. Eligibility: no prerequisites; free Trailhead account.',
    action_label: 'Start the trail',
    external_url: 'https://trailhead.salesforce.com/content/learn/trails/gain-the-ai-skills-you-need-to-succeed',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['New to AI', 'Getting started'],
    geo_scope: 'global',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 29,
  },
  {
    name: 'AI Engineering: Agents',
    partner: 'Weights & Biases',
    partner_tier: 'strategic',
    resource_type: 'Course',
    need_primary: 'training',
    need_secondary: null,
    sub_category: null,
    description:
      'A self-paced course on building production-grade AI agents — deterministic LLM workflows, single- and multi-agent systems, context and memory, evaluation and benchmarking, and the Model Context Protocol. Delivery: Online. Cost: free. Eligibility: developers already familiar with language models.',
    action_label: 'Start the course',
    external_url: 'https://wandb.ai/site/courses/agents/',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Building', 'Scaling'],
    geo_scope: 'global',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 30,
  },
  {
    name: 'Get Started With Generative AI',
    partner: 'Databricks',
    partner_tier: 'strategic',
    resource_type: 'Course',
    need_primary: 'training',
    need_secondary: null,
    sub_category: null,
    description:
      'Five short video modules covering generative AI opportunities and challenges, prompt engineering, retrieval-augmented generation, fine-tuning and AI governance, with a certificate after a quiz. Delivery: Online. Cost: free. Eligibility: beginners.',
    action_label: 'Start free training',
    external_url: 'https://www.databricks.com/resources/learn/training/get-started-with-generative-ai',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['New to AI', 'Getting started'],
    geo_scope: 'global',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 31,
  },
  {
    name: 'Learn Prompt Engineering',
    partner: 'Codecademy',
    partner_tier: 'strategic',
    resource_type: 'Course',
    need_primary: 'training',
    need_secondary: null,
    sub_category: null,
    description:
      'Three lessons, three projects and four quizzes on prompt fundamentals, effective prompts, prompt patterns and an introduction to retrieval-augmented generation. Delivery: Online. Cost: content free; certificate requires a paid plan. Eligibility: beginners; the free ChatGPT-basics course is a prerequisite.',
    action_label: 'Start the course',
    external_url: 'https://www.codecademy.com/learn/learn-prompt-engineering',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['New to AI', 'Getting started'],
    geo_scope: 'global',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 32,
  },
  {
    name: 'AI Foundations',
    partner: 'OpenAI (OpenAI Academy)',
    partner_tier: 'strategic',
    resource_type: 'Course',
    need_primary: 'training',
    need_secondary: null,
    sub_category: null,
    description:
      'An introductory course on AI, large language models and ChatGPT — writing clear instructions, supplying context, reviewing outputs and applying AI responsibly. Delivery: Online. Cost: free. Eligibility: beginners; a free ChatGPT account is required.',
    action_label: 'Start the course',
    external_url: 'https://academy.openai.com/public/courses/ai-foundations-juzjs',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['New to AI', 'Getting started'],
    geo_scope: 'global',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 33,
  },
  {
    name: 'LLM Fine-Tuning, Prompt Engineering & Model Evaluation',
    partner: 'DataLens Africa',
    partner_tier: 'strategic',
    resource_type: 'Course',
    need_primary: 'training',
    need_secondary: null,
    sub_category: null,
    description:
      'An advanced six-module course on LLM foundations, prompt engineering, instruction dataset preparation, supervised fine-tuning, retrieval-augmented generation and model evaluation — built for African domain tasks. Delivery: Online. Cost: free. Eligibility: practitioners with intermediate Python and basic ML.',
    action_label: 'View the course',
    external_url: 'https://academy.datalens.africa/courses/llm-fine-tuning-prompt-engineering',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Building', 'Scaling'],
    geo_scope: 'all_africa',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 34,
  },
  {
    name: 'AI 4 Everyone',
    partner: 'Mahara-Tech (ITI, Egypt)',
    partner_tier: 'strategic',
    resource_type: 'Course',
    need_primary: 'training',
    need_secondary: null,
    sub_category: null,
    description:
      'An introductory course in the Mahara-Tech AI Academy awareness track explaining what AI is and how it already appears in everyday life. Delivery: Online. Cost: free, certificate included. Eligibility: open to anyone; free Mahara-Tech account.',
    action_label: 'Open the course',
    external_url: 'https://maharatech.gov.eg/course/view.php?id=1619',
    banner_image_url: null,
    countries_eligible: ['Egypt'],
    sectors_eligible: [],
    stages_eligible: ['New to AI'],
    geo_scope: 'specific',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 35,
  },
  {
    name: 'Google for Startups Cloud Program',
    partner: 'Google Cloud',
    partner_tier: 'strategic',
    resource_type: 'Credits',
    need_primary: 'compute',
    need_secondary: null,
    sub_category: 'Cloud credits',
    description:
      'Google Cloud’s credit programme for startups — tiered Google Cloud and training credits with technical support, from USD 2,000 for early teams to larger allocations for funded startups. Delivery: Online. Cost: free to apply; usage beyond credits at standard rates.',
    action_label: 'Apply now',
    external_url: 'https://cloud.google.com/startup/apply',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Getting started', 'Building', 'Scaling'],
    geo_scope: 'global',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 36,
  },
  {
    name: 'Cloudflare for Startups',
    partner: 'Cloudflare',
    partner_tier: 'strategic',
    resource_type: 'Credits',
    need_primary: 'compute',
    need_secondary: null,
    sub_category: 'Cloud credits',
    description:
      'Tiered credits — up to USD 350,000 for one year — against usage-based compute, AI, storage and delivery services on Cloudflare’s developer platform. Delivery: Online. Cost: free to apply. Eligibility: for-profit companies up to Series B, incorporated within 10 years.',
    action_label: 'Apply now',
    external_url: 'https://www.cloudflare.com/lp/startups',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Getting started', 'Building', 'Scaling'],
    geo_scope: 'global',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 37,
  },
  {
    name: 'DigitalOcean Startups',
    partner: 'DigitalOcean',
    partner_tier: 'strategic',
    resource_type: 'Credits',
    need_primary: 'compute',
    need_secondary: null,
    sub_category: 'Cloud credits',
    description:
      'Twelve months of cloud infrastructure credits with premium support and technical guidance, with AI-native startups prioritised. Delivery: Online. Cost: free to apply. Eligibility: new DigitalOcean customers that have raised USD 10M or less.',
    action_label: 'Apply now',
    external_url: 'https://www.digitalocean.com/startups',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Getting started', 'Building'],
    geo_scope: 'global',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 38,
  },
  {
    name: 'Intel Liftoff for Startups',
    partner: 'Intel',
    partner_tier: 'strategic',
    resource_type: 'Programme',
    need_primary: 'compute',
    need_secondary: 'training',
    sub_category: 'AI startup programme',
    description:
      'A free virtual programme for early-stage AI startups: Intel compute on the Tiber AI Cloud, technical mentorship, engineering support and hackathons. Delivery: Online. Cost: free, no equity. Eligibility: early-stage AI and ML startups worldwide.',
    action_label: 'Join Liftoff',
    external_url: 'https://www.intel.com/content/www/us/en/developer/tools/oneapi/liftoff.html',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Getting started', 'Building'],
    geo_scope: 'global',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 39,
  },
  {
    name: 'Huawei Cloud Startup Program',
    partner: 'Huawei Cloud',
    partner_tier: 'strategic',
    resource_type: 'Credits',
    need_primary: 'compute',
    need_secondary: null,
    sub_category: 'Cloud credits',
    description:
      'Cloud credit vouchers from USD 5,000 up to USD 150,000 for startups under five years old, with dedicated support and a Cairo cloud region serving Northern Africa. Delivery: Online. Cost: free to join. Eligibility: unlisted companies under five years old.',
    action_label: 'Apply now',
    external_url: 'https://startup.huaweicloud.com/intl/center',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Getting started', 'Building', 'Scaling'],
    geo_scope: 'global',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 40,
  },
  {
    name: 'TPU Research Cloud (TRC)',
    partner: 'Google Research',
    partner_tier: 'strategic',
    resource_type: 'Programme',
    need_primary: 'compute',
    need_secondary: null,
    sub_category: 'Research compute',
    description:
      'Free quota on a cluster of 1,000+ Cloud TPUs for machine-learning researchers, usable with TensorFlow, PyTorch, Julia and JAX, in exchange for sharing the resulting research. Delivery: Online. Cost: free TPU quota; supporting VM and storage billed normally. Eligibility: open to anyone conducting ML research.',
    action_label: 'Express interest',
    external_url: 'https://sites.research.google/trc/',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Building', 'Scaling'],
    geo_scope: 'global',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 41,
  },
  {
    name: 'Toubkal supercomputer access',
    partner: 'African Supercomputing Center (UM6P)',
    partner_tier: 'strategic',
    resource_type: 'Programme',
    need_primary: 'compute',
    need_secondary: null,
    sub_category: 'HPC access',
    description:
      'Africa’s most powerful supercomputer, hosted at Mohammed VI Polytechnic University in Morocco — HPC and GPU access for AI, data analytics, genomics, agriculture and materials research, serving researchers and entrepreneurs within Africa and internationally. Cost: application-based access.',
    action_label: 'Request access',
    external_url: 'https://toubkal.um6p.ma',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Building', 'Scaling'],
    geo_scope: 'all_africa',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 42,
  },
  {
    name: 'Centre for High Performance Computing access',
    partner: 'CHPC / NICIS, South Africa',
    partner_tier: 'strategic',
    resource_type: 'Programme',
    need_primary: 'compute',
    need_secondary: null,
    sub_category: 'HPC access',
    description:
      'South Africa’s national supercomputing facility — access to the Lengau system plus SANReN networking and DIRISA data services for researchers in academia and industry. Cost: application-based access; primarily South African researchers.',
    action_label: 'Request access',
    external_url: 'https://www.nicis.ac.za',
    banner_image_url: null,
    countries_eligible: ['South Africa'],
    sectors_eligible: [],
    stages_eligible: ['Building', 'Scaling'],
    geo_scope: 'specific',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 43,
  },
  {
    name: 'Schmidt AI in Science African Faculty Fellowship (2027 cohort)',
    partner: 'MIDAS, University of Michigan',
    partner_tier: 'strategic',
    resource_type: 'Fund',
    need_primary: 'funding',
    need_secondary: null,
    sub_category: null,
    description:
      'A two-year fellowship for faculty at African universities applying AI to science and engineering research: USD 35,000 annual stipend plus housing, insurance, visa and travel during a one-year Michigan residence, and a USD 50,000 pilot grant on return. Eligibility: PhD holders with a primary appointment at an African institution. Cost: no fee to apply.',
    action_label: 'Apply now',
    external_url: 'https://midas.infoready4.com/#freeformCompetitionDetail/2027387',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Building', 'Scaling'],
    geo_scope: 'all_africa',
    deadline: '2026-10-05',
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 44,
  },
  {
    name: 'Grand Challenges Africa — Round 15 AI call',
    partner: 'Science for Africa Foundation',
    partner_tier: 'strategic',
    resource_type: 'Fund',
    need_primary: 'funding',
    need_secondary: null,
    sub_category: null,
    description:
      'Grand Challenges Africa funds Africa-led scientific innovation; Round 15 targets equitable AI use to improve global health, with seed and full grants to Africa-led innovations. Cost: no fee to apply.',
    action_label: 'Read the call',
    external_url: 'https://scienceforafrica.foundation/funding-resources/rules-and-guidelines-round-15-ai-call',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Building', 'Scaling'],
    geo_scope: 'all_africa',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 45,
  },
  {
    name: 'Lacuna Fund dataset creation grants',
    partner: 'Lacuna Fund',
    partner_tier: 'strategic',
    resource_type: 'Fund',
    need_primary: 'funding',
    need_secondary: 'data',
    sub_category: null,
    description:
      'Grants — typically USD 100,000–300,000 per project — for creating, augmenting and maintaining open labelled ML datasets for underserved populations and languages, across agriculture, language, health and climate cohorts.',
    action_label: 'View funding calls',
    external_url: 'https://lacunafund.org',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Building', 'Scaling'],
    geo_scope: 'all_africa',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 46,
  },
  {
    name: 'AI for Science Master’s Programme',
    partner: 'AIMS South Africa and Google DeepMind',
    partner_tier: 'strategic',
    resource_type: 'Fund',
    need_primary: 'funding',
    need_secondary: 'training',
    sub_category: null,
    description:
      'A fully funded one-year residential master’s combining AI and ML with cosmology, epidemiology and ecology — full scholarship covering tuition, equipment and computation, with 40 scholars funded per year. Eligibility: students from across Africa meeting degree requirements.',
    action_label: 'Apply now',
    external_url: 'https://ai.aims.ac.za',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Getting started', 'Building'],
    geo_scope: 'all_africa',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 47,
  },
  {
    name: 'Digital Africa Seed Fund',
    partner: 'Digital Africa',
    partner_tier: 'strategic',
    resource_type: 'Fund',
    need_primary: 'funding',
    need_secondary: null,
    sub_category: null,
    description:
      'A seed fund investing up to €2M per startup across AI, fintech, healthtech, climate tech and digital infrastructure — deliberately beyond the Nigeria, Kenya, South Africa and Egypt hubs, with a francophone-Africa focus.',
    action_label: 'View the programme',
    external_url: 'https://www.digital-africa.co/en/key-program',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Building', 'Scaling'],
    geo_scope: 'all_africa',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 48,
  },
  {
    name: 'Accelerate Africa',
    partner: 'Accelerate Africa',
    partner_tier: 'strategic',
    resource_type: 'Programme',
    need_primary: 'accelerator',
    need_secondary: null,
    sub_category: null,
    description:
      'A 12-week programme for early-stage African companies connecting founders to mentors, investors and potential funding — product, go-to-market, operations, storytelling and fundraising readiness. Delivery: Hybrid (Lagos). Cost: no fee to apply.',
    action_label: 'Apply now',
    external_url: 'https://acceler8.africa/',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Getting started', 'Building'],
    geo_scope: 'all_africa',
    deadline: '2027-01-31',
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 49,
  },
  {
    name: 'Baobab Network Accelerator',
    partner: 'Baobab Network',
    partner_tier: 'strategic',
    resource_type: 'Programme',
    need_primary: 'accelerator',
    need_secondary: 'funding',
    sub_category: null,
    description:
      'A remote, cohort-based accelerator and investor for African-led early-stage ventures: USD 100,000 for 12.5% equity, intensive consulting, three months of hands-on support and lifetime network access. Eligibility: Africa-based, African-led, for-profit tech startups. Cost: no fee to apply.',
    action_label: 'Apply now',
    external_url: 'https://thebaobabnetwork.com/apply-now/',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Getting started', 'Building'],
    geo_scope: 'all_africa',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 50,
  },
  {
    name: 'AI for Education Venture Builder & Incubation Program',
    partner: 'Injini',
    partner_tier: 'strategic',
    resource_type: 'Programme',
    need_primary: 'accelerator',
    need_secondary: null,
    sub_category: null,
    description:
      'An eight-month hybrid venture builder helping ideation-stage Southern African teams develop, test and launch AI-enabled education ventures, with the top five receiving further support. Delivery: Hybrid (Johannesburg). Eligibility: teams covering technical, education-context and commercial roles. Cost: free.',
    action_label: 'Apply now',
    external_url: 'https://form.jotform.com/262423557243557',
    banner_image_url: null,
    countries_eligible: ['Botswana', 'Eswatini', 'Lesotho', 'Malawi', 'Mozambique', 'Namibia', 'South Africa', 'Zambia', 'Zimbabwe'],
    sectors_eligible: [],
    stages_eligible: ['New to AI', 'Getting started'],
    geo_scope: 'specific',
    deadline: '2026-09-27',
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 51,
  },
  {
    name: 'Lacuna Fund open dataset repository',
    partner: 'Lacuna Fund',
    partner_tier: 'strategic',
    resource_type: 'Dataset',
    need_primary: 'data',
    need_secondary: null,
    sub_category: 'Open datasets',
    description:
      'Openly accessible labelled ML datasets across agriculture, language, health and climate, developed in and for the Global South — including 29+ African languages. Cost: free, openly licensed.',
    action_label: 'Browse datasets',
    external_url: 'https://lacunafund.org/datasets/language/',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Getting started', 'Building', 'Scaling'],
    geo_scope: 'all_africa',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 52,
  },
  {
    name: 'Masakhane — African language NLP datasets & benchmarks',
    partner: 'Masakhane',
    partner_tier: 'strategic',
    resource_type: 'Dataset',
    need_primary: 'data',
    need_secondary: null,
    sub_category: 'Language datasets',
    description:
      'A participatory research community building African language technologies — open datasets and benchmarks including MasakhaNER, MAFAND-MT, MasakhaPOS and AfriIntent across 20+ African languages. Cost: free, open access.',
    action_label: 'Explore Masakhane',
    external_url: 'https://www.masakhane.io',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Getting started', 'Building', 'Scaling'],
    geo_scope: 'all_africa',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 53,
  },
  {
    name: 'African Datasets initiative',
    partner: 'Deep Learning Indaba',
    partner_tier: 'strategic',
    resource_type: 'Dataset',
    need_primary: 'data',
    need_secondary: null,
    sub_category: 'Open datasets',
    description:
      'A repository of Africa-relevant datasets positioned as digital public infrastructure for equitable AI — open to African dataset contributors and users, with contributor visibility across the pan-African AI community.',
    action_label: 'View the initiative',
    external_url: 'https://deeplearningindaba.com/2026/african-datasets/',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Getting started', 'Building', 'Scaling'],
    geo_scope: 'all_africa',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 54,
  },
  {
    name: 'NaijaVoices dataset',
    partner: 'NaijaVoices Community',
    partner_tier: 'strategic',
    resource_type: 'Dataset',
    need_primary: 'data',
    need_secondary: null,
    sub_category: 'Voice & speech datasets',
    description:
      'A community-built Nigerian language voice dataset produced under Lacuna Fund support — open speech data for Nigerian languages. Cost: free, open access.',
    action_label: 'View the dataset',
    external_url: 'https://naijavoices.com/dataset',
    banner_image_url: null,
    countries_eligible: ['Nigeria'],
    sectors_eligible: [],
    stages_eligible: ['Getting started', 'Building', 'Scaling'],
    geo_scope: 'specific',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 55,
  },
  {
    name: 'Indaba Hackathon',
    partner: 'Deep Learning Indaba',
    partner_tier: 'strategic',
    resource_type: 'Competition',
    need_primary: 'challenges',
    need_secondary: null,
    sub_category: 'Hackathons',
    description:
      'The hackathon run alongside the annual Deep Learning Indaba gathering — competition experience and visibility with sponsors and partners for Indaba participants. Cost: free.',
    action_label: 'View the Indaba',
    external_url: 'https://deeplearningindaba.com/2026/',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['Getting started', 'Building'],
    geo_scope: 'all_africa',
    deadline: null,
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-05-12',
    sort_order: 56,
  },
  {
    name: 'International Cooperation in AI (Horizon Europe)',
    partner: 'European Commission / Horizon Europe',
    partner_tier: 'strategic',
    resource_type: 'Fund',
    need_primary: 'funding',
    need_secondary: null,
    sub_category: null,
    description:
      'A Horizon Europe call funding international cooperation in AI between Europe, Africa and other LMICs — for research institutions and growth-stage organisations. Opens on a known date; closes 18 Mar 2027. Primary language: English. Cross-sector.',
    action_label: 'View the call',
    external_url: 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-search',
    banner_image_url: null,
    countries_eligible: ['Ethiopia', 'Ghana', 'Kenya', 'Mozambique', 'Nigeria', 'Rwanda', 'Senegal', 'South Africa', 'Tanzania', 'Zambia', "Côte d'Ivoire"],
    sectors_eligible: [],
    stages_eligible: ['Building', 'Scaling'],
    geo_scope: 'specific',
    deadline: '2027-03-18',
    status: 'live',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-09-10',
    sort_order: 57,
  },
  {
    name: 'Deep Learning Indaba 2027 annual gathering',
    partner: 'Deep Learning Indaba',
    partner_tier: 'strategic',
    resource_type: 'Community',
    need_primary: 'community',
    need_secondary: null,
    sub_category: 'Conferences',
    description:
      'The annual gathering of the African machine learning community — workshops, research training, mentorship and networking across the continent. Currently closed; expected to reopen for the 2027 edition. Open to all. Cross-sector.',
    action_label: 'View the Indaba',
    external_url: 'https://deeplearningindaba.com',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['New to AI', 'Getting started', 'Building', 'Scaling'],
    geo_scope: 'all_africa',
    deadline: null,
    status: 'pipeline',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-09-10',
    sort_order: 58,
  },
  {
    name: 'IndabaX country chapters',
    partner: 'Deep Learning Indaba',
    partner_tier: 'strategic',
    resource_type: 'Community',
    need_primary: 'community',
    need_secondary: null,
    sub_category: 'Local chapters',
    description:
      'Locally-organised IndabaX events bringing the Deep Learning Indaba experience to individual countries — community meetups, talks and hands-on sessions. Chapter applications currently closed; expected to reopen. Open to all. Cross-sector.',
    action_label: 'Find a chapter',
    external_url: 'https://deeplearningindaba.com/indabax/',
    banner_image_url: null,
    countries_eligible: [],
    sectors_eligible: [],
    stages_eligible: ['New to AI', 'Getting started', 'Building', 'Scaling'],
    geo_scope: 'all_africa',
    deadline: null,
    status: 'pipeline',
    is_featured: false,
    exclusivity: null,
    added_date: '2026-09-10',
    sort_order: 59,
  },
];

// ============================================================================
// Programmes are NOT seeded. See the file header above for why: all six of
// the prototype's programme descriptions carry an unattested AI Hub
// performance figure, and programmes_public is anon-readable. `programmes`
// stays at 0 rows, same as impact_stories/headline_stats/compute_metrics,
// until the client supplies attested copy.
// ============================================================================

// ============================================================================
// Site content — the prototype's `settings.welcome` and `settings.identity`,
// flattened into (key, locale, value) rows.
// ============================================================================
//
// Key names (`welcome_title`, `welcome_body`, ...) are this seed's own
// invention — the prototype has no key/locale structure at all (it renders
// `settings.welcome.title` etc. directly) and no naming convention exists
// yet elsewhere in the codebase (checked: no other seed or source file
// establishes one). All rows are `locale: 'en'`; fr/pt/ar are stubs only
// (CLAUDE.md), not seeded here.
//
// Two content-rule rewrites applied — see task-12a-report.md for the full
// before/after of both:
//   1. `identity_align` drops the prototype's "Italy–Africa Mattei Plan"
//      clause entirely. CLAUDE.md: "'CINECA Leonardo' with no 'Mattei
//      Plan'". (The prototype's *second* Mattei Plan mention, on a
//      `partnerships` row -- "Leonardo GPU allocations under the Mattei
//      Plan" -- needs no rewrite here because `partnerships` is out of this
//      task's scope and is not seeded at all; it simply never lands.)
//   2. `welcome_body` dropped the prototype's "Curated and verified by the
//      AI Hub team." sentence. The prototype states this curation claim in
//      three different wordings across the app; content rule 10.8 wants it
//      stated once. `identity_lead` already carries the brief's canonical
//      wording verbatim ("Every resource is curated and verified by the AI
//      Hub team.") unchanged, so it is kept as the single instance and the
//      duplicate in `welcome_body` was removed rather than rephrased.
//
//      That rewrite is now history rather than a live edit: `welcome_body`
//      has since been rewritten again by an editor on the hosted project and
//      this file transcribes that value, which carries no curation claim
//      either. Rule 10.8 still holds, by the same argument and not by
//      inheritance — it was re-checked against the live string.
//
// **These rows are not the source of truth.** `site_content` is editable
// from /admin/content precisely so copy can change without a deploy, and the
// upsert below is keyed on (key, locale), so a seed run overwrites whatever
// an editor has since written. When the two disagree, the hosted value is
// the one that has been reviewed and published; update this file to match it
// rather than re-running the seed to overwrite it. Verified divergent once
// already, on 2026-08-14, for exactly this key.
export interface SeedSiteContent {
  key: string;
  locale: string;
  value: string;
}

export const SITE_CONTENT: readonly SeedSiteContent[] = [
  {
    key: 'welcome_title',
    locale: 'en',
    value: 'Welcome to AskHub',
  },
  {
    key: 'welcome_tagline',
    locale: 'en',
    // Taken verbatim from the prototype's welcome band, which sets this line
    // between the title and the body copy. It carries no curation claim and
    // no attribution, so neither content rule 10.8 nor 10.1 applies to it —
    // unlike `welcome_body`, it needed no rewrite to land here.
    value: "Building Africa's AI future together",
  },
  {
    key: 'welcome_body',
    locale: 'en',
    // Transcribed from the hosted project, where an editor rewrote this line
    // through the Site Content screen; the seed's original wording ("The open
    // directory for African AI — find the compute, funding, training,
    // accelerators, and partners to move your idea forward.") is no longer
    // what the site says, and the seed upserts on (key, locale), so leaving
    // the two out of step meant any future `npm run seed` would silently
    // revert a deliberate copy change.
    //
    // Still rule-compliant, checked against the live value rather than
    // assumed: it names the programme in full, carries content rule 10.1's
    // attribution verbatim, and makes no curation claim — so `identity_lead`
    // remains the single place that states it (rule 10.8).
    value:
      "An open directory for discovering compute, funding, training, accelerators, and partnerships opportunities. Curated by the AI Hub for Sustainable Development, co-led by Italy’s Ministry of Enterprises and Made in Italy (MIMIT) and the United Nations Development Programme (UNDP).",
  },
  {
    key: 'welcome_cta',
    locale: 'en',
    value: 'Start exploring ↓',
  },
  {
    key: 'identity_lead',
    locale: 'en',
    // Matches the canonical curation sentence verbatim (site.curationStatement,
    // src/locales/en.json) -- "and verified" dropped from both on 2026-09-09.
    value:
      'AskHub is the open directory of the AI Hub for Sustainable Development — co-led by MIMIT and UNDP. Every resource is curated by the AI Hub team.',
  },
  {
    key: 'identity_align',
    locale: 'en',
    // Rewritten: dropped "and the Italy–Africa Mattei Plan" (see the
    // rule-1 rewrite note above). Everything else transcribed verbatim.
    value:
      'The AI Hub is aligned with the African Union AI Strategy, co-designing 20 programmes with the private sector over its mandate — across 18 partner countries and six priority sectors.',
  },
  {
    // Placeholder pending legal review (PRD content rule 9 / §5.8). Seeded so
    // the row exists for the Site Content screen to UPDATE; an editor replaces
    // this with the reviewed notice, no deploy. Text matches the `privacy.pending`
    // locale fallback so the page reads identically until then, and it is
    // rule-compliant (names the programme in full, one mailbox, no bare "the Hub").
    key: 'privacy_body',
    locale: 'en',
    value:
      'The privacy notice is being finalised. For any question about how the AI Hub for Sustainable Development handles your data, write to the address below.',
  },
  {
    // Placeholder pending legal review, seeded for the same reason as privacy_body.
    key: 'terms_body',
    locale: 'en',
    value:
      'The terms of use are being finalised. For any question, write to the address below.',
  },
];
