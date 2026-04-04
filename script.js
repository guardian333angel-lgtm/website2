const starfield = document.querySelector('.starfield');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (starfield) {
  const isSmallScreen = window.innerWidth < 700;
  const lowPowerDevice = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
    || (navigator.deviceMemory && navigator.deviceMemory <= 4);
  const totalStars = prefersReducedMotion
    ? (isSmallScreen ? 40 : 80)
    : lowPowerDevice
      ? (isSmallScreen ? 90 : 180)
      : (isSmallScreen ? 150 : 300);
  const starPalettes = [
    {
      core: 'rgba(223, 248, 255, 0.98)',
      mid: 'rgba(162, 229, 255, 0.8)',
      glow: 'rgba(143, 214, 255, 0.64)',
      glowSoft: 'rgba(123, 194, 248, 0.35)',
    },
    {
      core: 'rgba(255, 247, 226, 0.98)',
      mid: 'rgba(255, 218, 160, 0.82)',
      glow: 'rgba(255, 205, 128, 0.62)',
      glowSoft: 'rgba(255, 164, 103, 0.34)',
    },
    {
      core: 'rgba(230, 255, 238, 0.98)',
      mid: 'rgba(156, 245, 194, 0.82)',
      glow: 'rgba(133, 232, 173, 0.62)',
      glowSoft: 'rgba(95, 193, 150, 0.34)',
    },
    {
      core: 'rgba(244, 234, 255, 0.98)',
      mid: 'rgba(203, 184, 255, 0.82)',
      glow: 'rgba(181, 160, 248, 0.62)',
      glowSoft: 'rgba(145, 130, 215, 0.35)',
    },
  ];

  const createStar = (index) => {
    const star = document.createElement('span');
    const roll = Math.random();
    let depthClass = 'depth-mid';
    let size = Math.random() * 1.4 + 0.45;
    let alpha = Math.random() * 0.22 + 0.44;

    if (roll < 0.5) {
      depthClass = 'depth-far';
      size = Math.random() * 1.1 + 0.35;
      alpha = Math.random() * 0.18 + 0.28;
    } else if (roll > 0.8) {
      depthClass = 'depth-near';
      size = Math.random() * 2.3 + 1.2;
      alpha = Math.random() * 0.24 + 0.68;
    }

    const palette = starPalettes[Math.floor(Math.random() * starPalettes.length)];
    const hasCross = depthClass !== 'depth-far' && Math.random() > 0.7;

    star.className = `star ${depthClass}${hasCross ? ' cross' : ''}`;
    star.style.width = `${size.toFixed(2)}px`;
    star.style.height = `${size.toFixed(2)}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty('--alpha', `${alpha.toFixed(3)}`);
    star.style.setProperty('--speed', `${(Math.random() * 4.2 + 2.1 + (depthClass === 'depth-near' ? 0 : 0.6)).toFixed(2)}s`);
    star.style.setProperty('--drift-speed', `${(Math.random() * 34 + 28 + index * 0.04).toFixed(2)}s`);
    star.style.setProperty('--drift-x', `${(Math.random() * 20 - 10).toFixed(1)}px`);
    star.style.setProperty('--drift-y', `${(Math.random() * 16 - 8).toFixed(1)}px`);
    star.style.setProperty('--star-core', palette.core);
    star.style.setProperty('--star-mid', palette.mid);
    star.style.setProperty('--star-glow', palette.glow);
    star.style.setProperty('--star-glow-soft', palette.glowSoft);

    return star;
  };

  const starFragment = document.createDocumentFragment();
  for (let i = 0; i < totalStars; i += 1) {
    starFragment.appendChild(createStar(i));
  }
  starfield.appendChild(starFragment);

  if (!prefersReducedMotion) {
    const spawnShootingStar = () => {
      const streak = document.createElement('span');
      const startX = 68 + Math.random() * 34;
      const startY = Math.random() * 46;
      const travelX = -(180 + Math.random() * 260);
      const travelY = 95 + Math.random() * 170;
      const duration = 1.1 + Math.random() * 1.4;

      streak.className = 'shooting-star';
      streak.style.left = `${startX}%`;
      streak.style.top = `${startY}%`;
      streak.style.setProperty('--shoot-duration', `${duration.toFixed(2)}s`);
      streak.style.setProperty('--travel-x', `${travelX.toFixed(1)}px`);
      streak.style.setProperty('--travel-y', `${travelY.toFixed(1)}px`);
      streak.style.setProperty('--trail', `${(70 + Math.random() * 90).toFixed(0)}px`);

      starfield.appendChild(streak);
      window.setTimeout(() => streak.remove(), (duration + 0.25) * 1000);

      const nextDelay = (isSmallScreen ? 6500 : 4600) + Math.random() * (isSmallScreen ? 3800 : 3000);
      window.setTimeout(spawnShootingStar, nextDelay);
    };

    window.setTimeout(spawnShootingStar, 1400 + Math.random() * 2600);
  }
}

const links = document.querySelectorAll('[data-nav]');
const currentPath = window.location.pathname.split('/').pop() || 'index.html';
const checkoutContextKey = 'zenergyPaymentContext';

const getCheckoutContext = () => {
  try {
    const raw = window.sessionStorage.getItem(checkoutContextKey);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    return parsed;
  } catch (error) {
    return null;
  }
};

const firstLoadKey = 'zenergy-first-home-load';
const hasLoadedHomeFirst = window.sessionStorage.getItem(firstLoadKey) === '1';
if (!hasLoadedHomeFirst) {
  window.sessionStorage.setItem(firstLoadKey, '1');
  if (currentPath.toLowerCase() !== 'index.html') {
    window.location.replace('index.html');
  }
}

const serviceTabs = document.querySelector('.tabs[aria-label="Services"]');
if (serviceTabs) {
  const portalLink = Array.from(serviceTabs.querySelectorAll('a[data-nav]')).find((link) => {
    const label = link.textContent.trim().toLowerCase();
    const href = (link.getAttribute('href') || '').toLowerCase();
    return label === 'portal' || href === 'index.html';
  });
  if (portalLink) {
    portalLink.remove();
  }

  const preferredOrder = [
    'Angel Work',
    'Books',
    'Energy Scans',
    'Magick Work',
    'Mentorship',
    'One-on-One Sessions',
    'Oracle Readings',
    'Shadow Work',
    'Spiritual Court Sessions',
    'Tarot Readings',
  ];

  const rank = new Map(preferredOrder.map((label, index) => [label, index]));
  const tabLinks = Array.from(serviceTabs.querySelectorAll('a[data-nav]'));

  tabLinks
    .sort((a, b) => {
      const aLabel = a.textContent.trim();
      const bLabel = b.textContent.trim();
      const aRank = rank.has(aLabel) ? rank.get(aLabel) : Number.MAX_SAFE_INTEGER;
      const bRank = rank.has(bLabel) ? rank.get(bLabel) : Number.MAX_SAFE_INTEGER;

      if (aRank === bRank) {
        return aLabel.localeCompare(bLabel);
      }

      return aRank - bRank;
    })
    .forEach((link) => serviceTabs.appendChild(link));
}

if (currentPath === 'index.html' && !document.querySelector('.home-ankh')) {
  const homeAnkh = document.createElement('a');
  homeAnkh.className = 'home-ankh';
  homeAnkh.href = 'index.html';
  homeAnkh.setAttribute('aria-label', 'Go to home page');
  homeAnkh.innerHTML = '&#9765;';
  document.body.appendChild(homeAnkh);
}

links.forEach((link) => {
  const href = link.getAttribute('href');
  if (href === currentPath) {
    link.classList.add('active');
  }
});

if (currentPath !== 'index.html' && !document.querySelector('.home-scarab')) {
  const scarabFab = document.createElement('a');
  scarabFab.className = 'home-scarab';
  scarabFab.href = 'index.html';
  scarabFab.setAttribute('aria-label', 'Return to home page');
  scarabFab.innerHTML = '&#x13183;';
  document.body.appendChild(scarabFab);
}

if (currentPath !== 'contact.html' && !document.querySelector('.contact-me-fab')) {
  const contactFab = document.createElement('a');
  contactFab.className = 'contact-me-fab';
  contactFab.href = 'contact.html';
  contactFab.textContent = 'Contact Me';
  contactFab.setAttribute('aria-label', 'Open contact form');
  document.body.appendChild(contactFab);
}

const addonSelectors = document.querySelectorAll('[data-addon-select]');
addonSelectors.forEach((select) => {
  const offer = select.closest('.tarot-offer-extended');
  if (!offer) {
    return;
  }

  const basePrice = Number.parseInt(offer.dataset.basePrice || '0', 10);
  const session = offer.dataset.session || '50-minutes';
  const addonCost = Number.parseInt(offer.dataset.addonCost || '20', 10);
  const addonMax = Number.parseInt(offer.dataset.addonMax || '3', 10);
  const addonUnit = offer.dataset.addonUnit || 'minute';
  const addonStep = Number.parseInt(offer.dataset.addonStep || '10', 10);
  const totalEl = offer.querySelector('[data-total-price]');
  const readingLink = offer.querySelector('[data-reading-link]');

  if (!readingLink || !totalEl || Number.isNaN(basePrice) || Number.isNaN(addonCost)) {
    return;
  }

  const refreshOffer = () => {
    let extraBlocks = Number.parseInt(select.value || '0', 10);
    if (Number.isNaN(extraBlocks)) {
      extraBlocks = 0;
    }
    extraBlocks = Math.min(addonMax, Math.max(0, extraBlocks));

    const totalPrice = basePrice + extraBlocks * addonCost;
    totalEl.textContent = `$${totalPrice}`;
    readingLink.textContent = `$${totalPrice}`;

    const params = new URLSearchParams({
      session,
      addon: `${extraBlocks}`,
      total: `${totalPrice}`,
      addonUnit,
      addonStep: `${addonStep}`,
    });
    readingLink.href = `payment-method.html?next=reading-detail.html&${params.toString()}`;
  };

  select.addEventListener('change', refreshOffer);
  refreshOffer();
});

const scanLevelSelect = document.querySelector('[data-scan-level-select]');
if (scanLevelSelect) {
  const scanOffer = scanLevelSelect.closest('[data-scan-level-offer]');
  const scanTotalEl = scanOffer ? scanOffer.querySelector('[data-total-price]') : null;
  const scanLink = scanOffer ? scanOffer.querySelector('[data-reading-link]') : null;

  if (scanOffer && scanTotalEl && scanLink) {
    const basePrice = Number.parseInt(scanOffer.dataset.basePrice || '90', 10);
    const stepPrice = Number.parseInt(scanOffer.dataset.addonCost || '30', 10);

    const refreshScanLevel = () => {
      let level = Number.parseInt(scanLevelSelect.value || '1', 10);
      if (Number.isNaN(level)) {
        level = 1;
      }
      level = Math.min(5, Math.max(1, level));

      const totalPrice = basePrice + (level - 1) * stepPrice;
      scanTotalEl.textContent = `$${totalPrice}`;
      scanLink.href = `payment-method.html?next=reading-detail.html&session=energy-scan-level-${level}&total=${totalPrice}`;
    };

    scanLevelSelect.addEventListener('change', refreshScanLevel);
    refreshScanLevel();
  }
}

const readingSubjectInput = document.querySelector('.reading-detail-form input[name="Subject"]');
if (readingSubjectInput) {
  const checkoutContext = getCheckoutContext() || {};
  const params = new URLSearchParams(window.location.search);
  const session = params.get('session') || checkoutContext.session;
  const addon = Number.parseInt(params.get('addon') || '0', 10);
  const total = params.get('total');
  const addonUnit = params.get('addonUnit') || 'minute';
  const addonStep = Number.parseInt(params.get('addonStep') || '10', 10);
  const birthDate = params.get('birthDate') || checkoutContext.birthDate;
  const birthTime = params.get('birthTime') || checkoutContext.birthTime;
  const paymentMethod = checkoutContext.paymentMethod || params.get('paymentMethod');
  const payerEmail = checkoutContext.payerEmail || params.get('payerEmail');
  const cardholderName = checkoutContext.cardholderName || params.get('cardholderName');
  const cardLast4 = checkoutContext.cardLast4 || params.get('cardLast4');
  const billingZip = checkoutContext.billingZip || params.get('billingZip');
  const cashappTag = checkoutContext.cashappTag || params.get('cashappTag');
  const venmoUser = checkoutContext.venmoUser || params.get('venmoUser');
  const paypalEmail = checkoutContext.paypalEmail || params.get('paypalEmail');
  const readingMessageInput = document.querySelector('.reading-detail-form textarea[name="Message"]');

  if (session) {
    let subjectText = `Scan request for ${session}`;
    if (!Number.isNaN(addon) && addon > 0) {
      const quantity = Number.isNaN(addonStep) ? addon : addon * addonStep;
      const unitLabel = quantity === 1 ? addonUnit : `${addonUnit}s`;
      subjectText += ` + ${quantity} extra ${unitLabel}`;
    }
    if (total) {
      subjectText += ` (total $${total})`;
    }
    readingSubjectInput.value = subjectText;

    if (readingMessageInput) {
      const dateLine = birthDate ? `Berth Date: ${birthDate}` : '';
      const timeLine = birthTime ? `Berth Time: ${birthTime}` : '';
      const paymentLine = paymentMethod ? `Payment Method: ${paymentMethod}` : '';
      const payerEmailLine = payerEmail ? `Payer Email: ${payerEmail}` : '';

      let methodDetailLine = '';
      if (paymentMethod === 'card') {
        const cardParts = [
          cardholderName ? `Name ${cardholderName}` : '',
          cardLast4 ? `Last4 ${cardLast4}` : '',
          billingZip ? `ZIP ${billingZip}` : '',
        ].filter(Boolean).join(', ');
        methodDetailLine = cardParts ? `Card Details: ${cardParts}` : '';
      }
      if (paymentMethod === 'cashapp') {
        methodDetailLine = cashappTag ? `Cash App Tag: ${cashappTag}` : '';
      }
      if (paymentMethod === 'venmo') {
        methodDetailLine = venmoUser ? `Venmo Username: ${venmoUser}` : '';
      }
      if (paymentMethod === 'paypal') {
        methodDetailLine = paypalEmail ? `PayPal Email: ${paypalEmail}` : '';
      }

      const prefills = [dateLine, timeLine, paymentLine, payerEmailLine, methodDetailLine].filter(Boolean);
      if (prefills.length > 0) {
        readingMessageInput.value = prefills.join('\n');
      }
    }
  }
}

const oneOnOneEmailInput = document.querySelector('main .reading-detail-form input[name="Client Email"]');
if (oneOnOneEmailInput) {
  const checkoutContext = getCheckoutContext() || {};
  const params = new URLSearchParams(window.location.search);
  const payerEmail = checkoutContext.payerEmail || params.get('payerEmail');
  const paymentMethod = checkoutContext.paymentMethod || params.get('paymentMethod');
  const messageInput = document.querySelector('main .reading-detail-form textarea[name="Message"]');

  if (payerEmail) {
    oneOnOneEmailInput.value = payerEmail;
  }

  if (messageInput && paymentMethod) {
    const existing = messageInput.value.trim();
    const paymentPrefix = `Payment Method: ${paymentMethod}`;
    messageInput.value = existing ? `${paymentPrefix}\n${existing}` : paymentPrefix;
  }
}

const trustedPaymentHosts = new Set([
  'cash.app',
  'paypal.me',
  'venmo.com',
  'account.venmo.com',
]);

document.querySelectorAll('a[href]').forEach((link) => {
  try {
    const destination = new URL(link.href, window.location.href);
    const host = destination.hostname.toLowerCase();

    if (!trustedPaymentHosts.has(host)) {
      return;
    }

    if (destination.protocol !== 'https:') {
      destination.protocol = 'https:';
      link.href = destination.toString();
    }

    const relValues = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
    relValues.add('noopener');
    relValues.add('noreferrer');
    link.setAttribute('rel', Array.from(relValues).join(' '));
    link.referrerPolicy = 'no-referrer';
  } catch (error) {
    // Ignore malformed href values.
  }
});

const possibleCardNumberPattern = /(?:\d[ -]*?){13,19}/;
document.querySelectorAll('form').forEach((form) => {
  form.addEventListener('submit', (event) => {
    const rawValues = Array.from(form.querySelectorAll('input, textarea'))
      .map((field) => ('value' in field ? String(field.value || '') : ''))
      .join(' ');

    if (possibleCardNumberPattern.test(rawValues)) {
      event.preventDefault();
      window.alert('For your security, do not submit full card numbers on this form. Use only the approved secure payment links.');
    }
  });
});

const secureRequestForms = document.querySelectorAll('form[data-secure-request-form]');
secureRequestForms.forEach((form) => {
  const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
  const statusEl = document.createElement('p');
  statusEl.style.marginTop = '0.6rem';
  statusEl.style.fontSize = '1.1rem';
  statusEl.style.color = 'var(--text-sub)';
  statusEl.setAttribute('aria-live', 'polite');
  form.appendChild(statusEl);

  const upsertHiddenInput = (name, value) => {
    let input = form.querySelector(`input[type="hidden"][name="${name}"]`);
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      form.appendChild(input);
    }
    input.value = value;
  };

  const applyDefaultSubmitFields = () => {
    upsertHiddenInput('_captcha', 'false');
    upsertHiddenInput('_template', 'table');
    upsertHiddenInput('_subject', `New request from ${window.location.pathname.split('/').pop() || 'site'}`);
    upsertHiddenInput('Request URL', window.location.href);
  };

  form.addEventListener('submit', async (event) => {
    if (form.dataset.submitting === '1') {
      return;
    }

    event.preventDefault();

    const endpoint = String(form.getAttribute('action') || '').trim();
    if (!endpoint.startsWith('https://formsubmit.co/')) {
      statusEl.textContent = 'Secure endpoint is not configured.';
      statusEl.style.color = '#ffb4b4';
      return;
    }

    applyDefaultSubmitFields();

    if (window.location.protocol === 'file:') {
      statusEl.textContent = 'Submitting securely...';
      statusEl.style.color = 'var(--text-sub)';
      form.dataset.submitting = '1';
      form.submit();
      return;
    }

    const ajaxEndpoint = endpoint.replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/');
    const payload = new FormData(form);

    if (submitButton) {
      submitButton.disabled = true;
    }
    statusEl.textContent = 'Sending securely...';
    statusEl.style.color = 'var(--text-sub)';

    try {
      const response = await fetch(ajaxEndpoint, {
        method: 'POST',
        body: payload,
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      form.reset();
      statusEl.textContent = 'Request sent securely. Check your inbox for confirmation.';
      statusEl.style.color = '#b8ffd0';
    } catch (error) {
      statusEl.textContent = 'Network issue detected. Sending with secure fallback...';
      statusEl.style.color = '#ffd79a';
      form.dataset.submitting = '1';
      form.submit();
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
});

if (!prefersReducedMotion) {
  document.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest('a') : null;
    if (!link) {
      return;
    }

    const burst = document.createElement('div');
    burst.className = 'sparkle-burst';
    burst.style.left = `${event.clientX}px`;
    burst.style.top = `${event.clientY}px`;

    for (let index = 0; index < 9; index += 1) {
      const sparkle = document.createElement('span');
      const angle = (Math.PI * 2 * index) / 9;
      const distance = 18 + Math.random() * 26;

      sparkle.style.setProperty('--spark-x', `${Math.cos(angle) * distance}px`);
      sparkle.style.setProperty('--spark-y', `${Math.sin(angle) * distance}px`);
      sparkle.style.animationDelay = `${Math.random() * 80}ms`;
      burst.appendChild(sparkle);
    }

    document.body.appendChild(burst);
    window.setTimeout(() => burst.remove(), 700);
  });
}
