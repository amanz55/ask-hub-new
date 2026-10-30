'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { t } from '@/lib/i18n';

/**
 * PRD 5.3: copy link, LinkedIn, email and WhatsApp, with editable
 * pre-written text. The default text comes from en.json rather than being
 * written here, so it is policed by the content-rule scan like every other
 * user-facing string and can be translated later.
 */
/**
 * A phone's own share sheet, which is what can reach an installed LinkedIn app:
 * LinkedIn's web share link stays in the browser. Touch devices only, because
 * desktop browsers that have this API offer a sheet with no LinkedIn in it.
 * Absent on plain http, where the web link below still works.
 */
function canUseShareSheet(): boolean {
  return typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches;
}

export default function ShareModal({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(t('share.defaultText'));
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [manualText, setManualText] = useState('');
  const fallbackRef = useRef<HTMLTextAreaElement>(null);

  const body = `${message}\n\n${title}\n${url}`;
  const linkedInHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  /**
   * Copying can fail in two ways that both used to be invisible.
   *
   * `navigator.clipboard` is undefined on any non-secure origin except
   * localhost, so the property access below throws a TypeError before the
   * await is ever reached -- a staging deploy on plain http, or an IP address,
   * hits this on every click. And even where the API exists, `writeText`
   * rejects when the document is not focused or permission is denied.
   *
   * Neither is exceptional enough to surface as an error, but neither may be
   * swallowed: the previous version left the label reading "Copy link" with no
   * clipboard write and no explanation. The catch shows the failure and puts
   * the same text on screen, selected, so the reader can copy it by hand; that
   * fallback needs no permission and no secure context.
   */
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState('copied');
    } catch {
      setManualText(text);
      setCopyState('failed');
    }
  }

  /**
   * LinkedIn's share link takes a URL and nothing else, so the text travels by
   * clipboard for the visitor to paste into their post. The panel says so up
   * front, because a message shown after the click would be behind the new tab.
   *
   * The copy finishes before the tab opens, because a page that has lost focus
   * can be refused the clipboard. A failed copy still opens LinkedIn: the
   * fallback text is waiting on this page when the visitor comes back.
   */
  async function shareToLinkedIn(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (canUseShareSheet()) {
      // Not awaited: the sheet must open within the tap, and it takes focus, so
      // a refusal here says nothing worth showing a visitor who has just shared.
      void navigator.clipboard?.writeText(body).then(
        () => setCopyState('copied'),
        () => undefined,
      );
      try {
        await navigator.share({ title, text: message, url });
        return;
      } catch (error) {
        // Dismissing the sheet is a choice, not a failure. Anything else falls
        // back to the web link.
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    } else {
      await copy(body);
    }
    // Without `noopener`, which would make a blocked tab undetectable: opening
    // after an await is what a popup blocker may refuse, and then the visitor
    // is sent to LinkedIn in this tab rather than left with nothing happening.
    const tab = window.open(linkedInHref, '_blank');
    if (tab) tab.opener = null;
    else window.location.assign(linkedInHref);
  }

  // Selecting happens here rather than in the catch because the textarea does
  // not exist until the failed state has rendered.
  useEffect(() => {
    if (copyState !== 'failed') return;
    const fallback = fallbackRef.current;
    if (!fallback) return;
    fallback.focus();
    fallback.select();
  }, [copyState]);

  function close() {
    setOpen(false);
    // Reset, or reopening the panel next time greets the reader with "Link
    // copied" (or a copy failure) for something that never happened.
    setCopyState('idle');
  }

  // The trigger wears the prototype's secondary action:
  // a 1.5px hairline that takes the primary blue on hover, beside the solid
  // apply button.
  if (!open) {
    return (
      <button
        type="button"
        className="proto-outline-button"
        onClick={() => setOpen(true)}
        style={{
          border: '1.5px solid #C9D3E8',
          color: '#1A2332',
          background: '#fff',
          fontSize: 14,
          fontWeight: 700,
          padding: '12px 20px',
          borderRadius: 10,
          cursor: 'pointer',
        }}
      >
        {t('share.open')}
      </button>
    );
  }

  return (
    <div
      style={{
        background: '#F4F6F9',
        border: '1px solid #DDE5EE',
        borderRadius: 14,
        padding: '18px 20px',
        width: '100%',
      }}
    >
      <h2 className="text-sm font-semibold text-navy">{t('share.title')}</h2>
      <label className="mt-3 block text-sm text-muted">
        <span>{t('share.message')}</span>
        <textarea
          className="mt-1 w-full rounded-lg border border-hairline p-3 text-navy"
          rows={3}
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            setCopyState('idle');
          }}
        />
      </label>
      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <button type="button" className="text-primary underline" onClick={() => void copy(url)}>
          {copyState === 'copied' ? t('share.copied') : t('share.copyLink')}
        </button>
        <a
          className="text-primary underline"
          target="_blank"
          rel="noopener noreferrer"
          href={linkedInHref}
          onClick={(event) => void shareToLinkedIn(event)}
        >
          {t('share.linkedin')}
        </a>
        <a
          className="text-primary underline"
          href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`}
        >
          {t('share.email')}
        </a>
        <a
          className="text-primary underline"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://wa.me/?text=${encodeURIComponent(body)}`}
        >
          {t('share.whatsapp')}
        </a>
        <button type="button" className="ml-auto text-muted underline" onClick={close}>
          {t('share.close')}
        </button>
      </div>
      <p className="mt-3 text-sm text-muted">{t('share.linkedinPaste')}</p>
      {copyState === 'failed' ? (
        <div className="mt-3 text-sm text-muted">
          <p className="text-danger">{t('share.copyFailed')}</p>
          <textarea
            ref={fallbackRef}
            aria-label={t('share.manualCopy')}
            className="mt-1 w-full rounded-lg border border-hairline p-3 text-navy"
            rows={4}
            readOnly
            value={manualText}
          />
        </div>
      ) : null}
    </div>
  );
}
