/* ============================================================
   CONTACT OVERLAY — formulario de contacto.
   Sin backend: compone un correo (mailto) con el mensaje del
   visitante y lo abre en su cliente de correo. También ofrece
   copiar el email y contactar por LinkedIn.
   ============================================================ */

import { el, $ } from '../utils/dom.js';
import { ICONS } from '../data/icons.js';
import { CONFIG } from '../../config.js';
import { Sound } from '../utils/sound.js';

let _keyHandler = null;

export function openContact() {
  const overlay = $('#contact-overlay');
  overlay.replaceChildren(buildForm());
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');

  overlay.onclick = (e) => { if (e.target === overlay) closeContact(); };
  _keyHandler = (e) => { if (e.key === 'Escape') closeContact(); };
  window.addEventListener('keydown', _keyHandler);

  // foco al primer campo
  requestAnimationFrame(() => overlay.querySelector('input')?.focus());
}

export function closeContact() {
  const overlay = $('#contact-overlay');
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  if (_keyHandler) { window.removeEventListener('keydown', _keyHandler); _keyHandler = null; }
  Sound.play('back');
}

function buildForm() {
  const to = CONFIG.contact?.email || '';
  const prefix = CONFIG.contact?.subjectPrefix || 'Contacto';

  const nameInput = el('input', { type: 'text', id: 'c-name', placeholder: 'Tu nombre', autocomplete: 'name', required: 'true' });
  const emailInput = el('input', { type: 'email', id: 'c-email', placeholder: 'Tu email', autocomplete: 'email', required: 'true' });
  const msgInput = el('textarea', { id: 'c-msg', rows: '5', placeholder: 'Escribe tu mensaje…', required: 'true' });
  const status = el('p', { class: 'contact__status', role: 'status' }, '');

  const field = (label, input) => el('label', { class: 'contact__field' }, [
    el('span', {}, label), input,
  ]);

  const form = el('form', {
    class: 'contact__form', novalidate: 'true',
    onsubmit: (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const msg = msgInput.value.trim();
      if (!name || !msg) {
        status.textContent = 'Por favor, escribe tu nombre y un mensaje.';
        status.dataset.type = 'error';
        return;
      }
      const subject = `${prefix} — ${name}`;
      const body = `Nombre: ${name}\nEmail: ${email || '(no indicado)'}\n\n${msg}`;
      const href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      Sound.play('open');
      window.location.href = href; // abre el cliente de correo del visitante
      status.textContent = 'Abriendo tu aplicación de correo…';
      status.dataset.type = 'ok';
    },
  }, [
    field('Nombre', nameInput),
    field('Email', emailInput),
    field('Mensaje', msgInput),
    status,
    el('div', { class: 'contact__actions' }, [
      el('button', {
        type: 'submit', class: 'btn btn--primary',
        html: `${ICONS.send}<span>Enviar mensaje</span>`,
        onmouseenter: () => Sound.play('hover'),
      }),
    ]),
  ]);

  // Métodos alternativos
  const alt = el('div', { class: 'contact__alt' }, [
    to && el('button', {
      class: 'contact__chip', html: `${ICONS.copy}<span>Copiar email</span>`, title: to,
      onmouseenter: () => Sound.play('hover'),
      onclick: async () => {
        try { await navigator.clipboard.writeText(to); flash(alt, 'Email copiado ✓'); }
        catch { flash(alt, to); }
        Sound.play('select');
      },
    }),
    to && el('a', {
      class: 'contact__chip', href: `mailto:${to}`, html: `${ICONS.mail}<span>${to}</span>`,
      onmouseenter: () => Sound.play('hover'),
    }),
    CONFIG.social?.linkedin && el('a', {
      class: 'contact__chip', href: CONFIG.social.linkedin, target: '_blank', rel: 'noopener',
      html: `${ICONS.linkedin}<span>LinkedIn</span>`,
      onmouseenter: () => Sound.play('hover'),
    }),
  ].filter(Boolean));

  return el('div', { class: 'overlay__card overlay__card--narrow' }, [
    el('div', { class: 'overlay__head' }, [
      el('h2', {}, 'Contacto'),
      el('button', { class: 'overlay__close', 'aria-label': 'Cerrar', html: ICONS.close, onclick: closeContact }),
    ]),
    el('p', { class: 'contact__intro' }, `¿Quieres ponerte en contacto con ${CONFIG.name}? Rellena el formulario y se abrirá tu correo con el mensaje listo para enviar.`),
    form,
    el('div', { class: 'contact__divider' }, 'o también'),
    alt,
  ]);
}

function flash(container, text) {
  let tip = container.querySelector('.contact__flash');
  if (!tip) { tip = el('span', { class: 'contact__flash' }); container.append(tip); }
  tip.textContent = text;
  tip.classList.add('is-visible');
  clearTimeout(tip._t);
  tip._t = setTimeout(() => tip.classList.remove('is-visible'), 1800);
}
