'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { submitResourceSuggestion } from '@/lib/actions/suggestions';
import {
  suggestionInput,
  SUGGESTION_DESCRIPTION_MAX,
  type SuggestionField,
} from '@/lib/schemas/suggestion';
import { COUNTRIES, SECTORS, NEED_KEYS } from '@/lib/reference';
import { CONTACT_TILE_BUTTON } from './contact-tile-button';
import { t } from '@/lib/i18n';

const LABEL = {
  fontSize: 11.5,
  fontWeight: 800,
  color: '#5B6B8C',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  display: 'block',
  marginBottom: 6,
} as const;

const FIELD = {
  width: '100%',
  padding: '11px 14px',
  border: '1px solid #C9D3E8',
  borderRadius: 8,
  fontSize: 14,
  outline: 'none',
  background: '#fff',
  color: '#1A2332',
} as const;

const HINT = { fontSize: 11.5, color: '#5B6B8C', marginTop: 5 } as const;
const ERROR = { fontSize: 12.5, color: '#C0392B', fontWeight: 700, marginTop: 5 } as const;
const TWO_UP = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } as const;

/** The admin form's required-field marker: one asterisk, hidden from screen readers. */
function Required() {
  return (
    <span aria-hidden="true" style={{ color: '#C0392B' }}>
      {' *'}
    </span>
  );
}

/** The prototype's chip: a pill that fills in blue when selected. */
function Chip({
  label,
  on,
  onToggle,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onToggle}
      style={{
        border: `1.5px solid ${on ? '#1F5FBF' : '#C9D3E8'}`,
        background: on ? '#1F5FBF' : '#fff',
        color: on ? '#fff' : '#42506E',
        borderRadius: 99,
        padding: '6px 13px',
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

interface Values {
  resourceName: string;
  organisation: string;
  need: string;
  sectors: string[];
  countries: string[];
  openToAll: boolean;
  description: string;
  link: string;
  deadline: string;
  programmeContactEmail: string;
  submitterName: string;
  submitterEmail: string;
  website: string;
}

const EMPTY: Values = {
  resourceName: '',
  organisation: '',
  need: 'training',
  sectors: [],
  countries: [],
  openToAll: false,
  description: '',
  link: '',
  deadline: '',
  programmeContactEmail: '',
  submitterName: '',
  submitterEmail: '',
  website: '',
};

/**
 * The prototype's "Submit resource" modal: eleven fields in its order and
 * wording, a native `<dialog>`, and on success the form is replaced by the
 * prototype's confirmation with a Close button.
 *
 * Validation runs here first against the same `suggestionInput` the action
 * parses, so a visitor gets a field-level message without a round trip; the
 * action's own parse and the database function's caps remain the boundary.
 *
 * The `website` field is a honeypot: positioned off-screen, `tabIndex={-1}`,
 * `aria-hidden`, and `autoComplete="off"`, so neither a person nor a screen
 * reader nor a browser's autofill reaches it. A script that fills every
 * input does, and the schema refuses the submission.
 *
 * What is stored, and where: the chips and the deadline are folded into the
 * description as one line (`composeSuggestionDescription`); the three
 * personal fields go to columns of their own and never into anything a
 * visitor could later read.
 */
export default function SuggestResourceModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<SuggestionField, string>>>({});
  const [outcome, setOutcome] = useState<'idle' | 'sent' | 'rateLimited' | 'failed'>('idle');
  const [pending, startTransition] = useTransition();

  // `/contact#suggest` opens the form straight away, for the directory's "can't
  // find what you need" link. The state is already blank on arrival.
  useEffect(() => {
    if (window.location.hash === '#suggest') dialogRef.current?.showModal();
  }, []);

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function toggleIn(key: 'sectors' | 'countries', item: string) {
    setValues((prev) => {
      const list = prev[key];
      const next = list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
      // Picking a country is choosing a restriction, so it turns "Open to all" off.
      return key === 'countries' ? { ...prev, countries: next, openToAll: false } : { ...prev, [key]: next };
    });
  }

  function open() {
    setValues(EMPTY);
    setErrors({});
    setOutcome('idle');
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = suggestionInput.safeParse({
      ...values,
      deadline: values.deadline === '' ? null : values.deadline,
    });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors as Partial<Record<SuggestionField, string[]>>;
      const next: Partial<Record<SuggestionField, string>> = {};
      for (const field of Object.keys(flat) as SuggestionField[]) {
        if (flat[field]?.length) next[field] = t(`suggest.error.${field}`);
      }
      setErrors(next);
      return;
    }
    setErrors({});
    startTransition(async () => {
      const result = await submitResourceSuggestion(parsed.data);
      if (result.ok) setOutcome('sent');
      else if (result.reason === 'rateLimited') setOutcome('rateLimited');
      else if (result.reason === 'invalid') setErrors({ resourceName: t('suggest.error.generic') });
      else setOutcome('failed');
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="proto-primary-button"
        style={CONTACT_TILE_BUTTON}
      >
        {t('contact.suggestAction')}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="suggest-title"
        style={{
          border: 'none',
          borderRadius: 16,
          width: 640,
          maxWidth: 'calc(100% - 48px)',
          padding: 28,
          boxShadow: '0 20px 60px rgba(20,32,60,0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 id="suggest-title" style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
            {t('suggest.title')}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label={t('suggest.close')}
            style={{ background: 'none', border: 'none', fontSize: 22, color: '#5B6B8C', cursor: 'pointer', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {outcome === 'sent' ? (
          <div role="status" aria-live="polite" style={{ marginTop: 16 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>{t('suggest.sentHeading')}</p>
            <p style={{ margin: '6px 0 0 0', fontSize: 13.5, color: '#5B6B8C', lineHeight: 1.6 }}>
              {t('suggest.sentBody')}
            </p>
            <button type="button" onClick={close} style={{ ...FIELD, width: 'auto', marginTop: 16, fontWeight: 700, cursor: 'pointer' }}>
              {t('suggest.close')}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#5B6B8C' }}>{t('suggest.intro')}</p>

            <div>
              <label htmlFor="suggest-name" style={LABEL}>{t('suggest.field.resourceName')}<Required /></label>
              <input id="suggest-name" value={values.resourceName} onChange={(e) => set('resourceName', e.target.value)} placeholder={t('suggest.placeholder.resourceName')} style={FIELD} />
              {errors.resourceName ? <p style={ERROR}>{errors.resourceName}</p> : null}
            </div>

            <div style={TWO_UP}>
              <div>
                <label htmlFor="suggest-org" style={LABEL}>{t('suggest.field.organisation')}<Required /></label>
                <input id="suggest-org" value={values.organisation} onChange={(e) => set('organisation', e.target.value)} placeholder={t('suggest.placeholder.organisation')} style={FIELD} />
                {errors.organisation ? <p style={ERROR}>{errors.organisation}</p> : null}
              </div>
              <div>
                <label htmlFor="suggest-need" style={LABEL}>{t('suggest.field.need')}<Required /></label>
                <select id="suggest-need" value={values.need} onChange={(e) => set('need', e.target.value)} style={{ ...FIELD, padding: '11px 12px', cursor: 'pointer' }}>
                  {NEED_KEYS.map((need) => (
                    <option key={need} value={need}>{t(`need.${need}`)}</option>
                  ))}
                </select>
              </div>
            </div>

            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend style={LABEL}>{t('suggest.field.sectors')}</legend>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {SECTORS.map((sector) => (
                  <Chip key={sector} label={sector} on={values.sectors.includes(sector)} onToggle={() => toggleIn('sectors', sector)} />
                ))}
              </div>
              <p style={HINT}>{t('suggest.hint.sectors')}</p>
            </fieldset>

            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend style={LABEL}>{t('suggest.field.countries')}</legend>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                <Chip label={t('suggest.openToAll')} on={values.openToAll} onToggle={() => setValues((prev) => ({ ...prev, openToAll: !prev.openToAll, countries: [] }))} />
                {COUNTRIES.map((country) => (
                  <Chip key={country} label={country} on={values.countries.includes(country)} onToggle={() => toggleIn('countries', country)} />
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="suggest-description" style={LABEL}>{t('suggest.field.description')}<Required /></label>
              <textarea id="suggest-description" rows={3} maxLength={SUGGESTION_DESCRIPTION_MAX} value={values.description} onChange={(e) => set('description', e.target.value)} placeholder={t('suggest.placeholder.description')} style={{ ...FIELD, resize: 'vertical' }} />
              {errors.description ? <p style={ERROR}>{errors.description}</p> : null}
            </div>

            <div style={TWO_UP}>
              <div>
                <label htmlFor="suggest-link" style={LABEL}>{t('suggest.field.link')}<Required /></label>
                <input id="suggest-link" type="url" value={values.link} onChange={(e) => set('link', e.target.value)} placeholder={t('suggest.placeholder.link')} style={FIELD} />
                {errors.link ? <p style={ERROR}>{errors.link}</p> : null}
              </div>
              <div>
                <label htmlFor="suggest-deadline" style={LABEL}>{t('suggest.field.deadline')}</label>
                <input id="suggest-deadline" type="date" value={values.deadline} onChange={(e) => set('deadline', e.target.value)} style={{ ...FIELD, padding: '10px 13px' }} />
                <p style={{ ...HINT, marginTop: 4 }}>{t('suggest.hint.deadline')}</p>
                {errors.deadline ? <p style={ERROR}>{errors.deadline}</p> : null}
              </div>
            </div>

            <div>
              <label htmlFor="suggest-contact" style={LABEL}>{t('suggest.field.programmeContactEmail')}</label>
              <input id="suggest-contact" type="email" value={values.programmeContactEmail} onChange={(e) => set('programmeContactEmail', e.target.value)} placeholder={t('suggest.placeholder.programmeContactEmail')} style={FIELD} />
              {errors.programmeContactEmail ? <p style={ERROR}>{errors.programmeContactEmail}</p> : null}
            </div>

            <div style={TWO_UP}>
              <div>
                <label htmlFor="suggest-your-name" style={LABEL}>{t('suggest.field.submitterName')}<Required /></label>
                <input id="suggest-your-name" value={values.submitterName} onChange={(e) => set('submitterName', e.target.value)} placeholder={t('suggest.placeholder.submitterName')} style={FIELD} />
                {errors.submitterName ? <p style={ERROR}>{errors.submitterName}</p> : null}
              </div>
              <div>
                <label htmlFor="suggest-your-email" style={LABEL}>{t('suggest.field.submitterEmail')}<Required /></label>
                <input id="suggest-your-email" type="email" value={values.submitterEmail} onChange={(e) => set('submitterEmail', e.target.value)} placeholder={t('suggest.placeholder.submitterEmail')} style={FIELD} />
                {errors.submitterEmail ? <p style={ERROR}>{errors.submitterEmail}</p> : null}
              </div>
            </div>

            {/* Honeypot. Off-screen, unfocusable, hidden from assistive
                technology and from autofill; a value here fails the schema. */}
            <div aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}>
              <input name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set('website', e.target.value)} />
            </div>

            {outcome === 'rateLimited' ? <p role="alert" style={ERROR}>{t('suggest.rateLimited')}</p> : null}
            {outcome === 'failed' ? <p role="alert" style={ERROR}>{t('suggest.failed')}</p> : null}

            <button
              type="submit"
              disabled={pending}
              className="proto-primary-button"
              style={{ background: '#1F5FBF', color: '#fff', border: 'none', borderRadius: 9, padding: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              {t('suggest.submit')}
            </button>
          </form>
        )}
      </dialog>
    </>
  );
}
