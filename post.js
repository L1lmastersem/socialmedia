// post.js — exports makePost to build and append a post element
export function makePost(data, parent = document.querySelector('.container')) {
  if (!parent) throw new Error('Parent element not found for makePost');

  const article = document.createElement('article');
  article.className = 'card ig';
  article.setAttribute('aria-label', 'Instagram post');

  // Header
  const header = document.createElement('header');
  header.className = 'igheader';

  const avatar = document.createElement('img');
  avatar.className = 'igavatar';
  // small avatar placeholder SVG
  const AVATAR_PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="100%" height="100%" rx="32" fill="#e6e9ee" />
      <circle cx="32" cy="24" r="12" fill="#cbd5e1" />
      <rect x="12" y="40" width="40" height="12" rx="6" fill="#cbd5e1" />
    </svg>
  `);
  avatar.src = data.avatar || AVATAR_PLACEHOLDER;
  avatar.alt = `Profiel van ${data.author || 'gebruiker'}`;
  avatar.decoding = 'async';
  // Retry avatar a couple of times before falling back to placeholder
  (function setupAvatarRetry(img, originalSrc) {
    const maxAttempts = 2;
    let attempts = 0;
    img.addEventListener('error', () => {
      if (attempts < maxAttempts && originalSrc) {
        attempts += 1;
        // force cache-bypass when retrying
        const retrySrc = originalSrc + (originalSrc.includes('?') ? '&' : '?') + 'r=' + Date.now();
        setTimeout(() => { img.src = retrySrc; }, 300 * attempts);
      } else {
        if (img.src !== AVATAR_PLACEHOLDER) img.src = AVATAR_PLACEHOLDER;
      }
    });
  })(avatar, data.avatar);

  const who = document.createElement('div');
  who.className = 'igwho';
  const name = document.createElement('strong');
  name.className = 'igname';
  name.innerText = data.author || '';
  const place = document.createElement('span');
  place.className = 'igplace';
  place.innerText = data.place || '';
  who.appendChild(name);
  who.appendChild(place);

  const more = document.createElement('button');
  more.className = 'igmore';
  more.type = 'button';
  more.title = 'Meer';
  more.setAttribute('aria-label', 'Meer opties');
  more.innerText = '⋯';

  header.appendChild(avatar);
  header.appendChild(who);
  header.appendChild(more);

  // Media
  const figure = document.createElement('figure');
  figure.className = 'igmedia';
  // Small inline SVG placeholder (used on error or when no image provided)
  const SVG_PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <g fill="#d1d5db">
        <circle cx="600" cy="480" r="180" />
        <rect x="260" y="720" width="680" height="120" rx="20" />
      </g>
    </svg>
  `);

  function setImg(src, alt) {
    const img = document.createElement('img');
    const original = src || SVG_PLACEHOLDER;
    img.src = original;
    img.alt = alt || 'Foto van de post';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.draggable = false;

    // retry logic with cache-bypass, then fallback to placeholder
    const maxAttempts = 2;
    let attempts = 0;
    function doFallback() {
      if (img.src !== SVG_PLACEHOLDER) img.src = SVG_PLACEHOLDER;
      img.classList.add('broken');
    }

    img.addEventListener('error', () => {
      if (attempts < maxAttempts && original !== SVG_PLACEHOLDER) {
        attempts += 1;
        const retrySrc = original + (original.includes('?') ? '&' : '?') + 'r=' + Date.now();
        // small backoff
        setTimeout(() => { img.src = retrySrc; }, 300 * attempts);
      } else {
        doFallback();
      }
    });

    return img;
  }

  if (data.image) {
    figure.appendChild(setImg(data.image, data.imageAlt));
  } else {
    // No image provided — show placeholder
    figure.appendChild(setImg(SVG_PLACEHOLDER, 'Geen afbeelding'));
  }

  // Actions
  const actions = document.createElement('div');
  actions.className = 'igactions';
  actions.setAttribute('role', 'group');
  actions.setAttribute('aria-label', 'Acties');

  const left = document.createElement('div');
  left.className = 'igleft';

  const likeBtn = makeIconButton('Vind ik leuk', 'fa-regular fa-heart');
  const commentBtn = makeIconButton('Reageren', 'fa-regular fa-comment');
  const shareBtn = makeIconButton('Delen', 'fa-regular fa-paper-plane');

  left.appendChild(likeBtn);
  left.appendChild(commentBtn);
  left.appendChild(shareBtn);
  actions.appendChild(left);

  // Stats & caption
  const stats = document.createElement('section');
  stats.className = 'igstats';

  const likesP = document.createElement('p');
  likesP.className = 'iglikes';
  const likesStrong = document.createElement('strong');
  likesStrong.innerText = (data.likes || 0).toLocaleString();
  likesP.appendChild(likesStrong);
  likesP.appendChild(document.createTextNode(' vind-ik-leuks'));

  const captionP = document.createElement('p');
  captionP.className = 'igcaption';
  captionP.innerHTML = `<strong>${escapeHtml(data.author || '')}</strong> ${escapeHtml(data.caption || '')}`;

  const commentsLink = document.createElement('p');
  commentsLink.className = 'igcomments-link';
  commentsLink.innerText = `Bekijk alle ${data.comments || 0} reacties`;

  const timeP = document.createElement('p');
  timeP.className = 'igtime';
  const timeEl = document.createElement('time');
  timeEl.dateTime = data.time || new Date().toISOString();
  timeEl.innerText = relativeTime(new Date(timeEl.dateTime));
  timeP.appendChild(timeEl);

  stats.appendChild(likesP);
  stats.appendChild(captionP);
  stats.appendChild(commentsLink);
  stats.appendChild(timeP);

  // Comment row
  const form = document.createElement('form');
  form.className = 'igcomment';
  form.action = '.';
  form.method = 'get';
  form.setAttribute('aria-label', 'Reactie veld');

  const input = document.createElement('input');
  input.className = 'iginput';
  input.type = 'text';
  input.placeholder = 'Plaats een reactie…';
  input.setAttribute('aria-label', 'Plaats een reactie');

  const postBtn = document.createElement('button');
  postBtn.className = 'igpost';
  postBtn.type = 'button';
  postBtn.innerText = 'Plaatsen';

  form.appendChild(input);
  form.appendChild(postBtn);

  // Assemble
  article.appendChild(header);
  article.appendChild(figure);
  article.appendChild(actions);
  article.appendChild(stats);
  article.appendChild(form);

  parent.appendChild(article);
  return article;
}

function makeIconButton(label, iconClass) {
  const btn = document.createElement('button');
  btn.className = 'icon';
  btn.type = 'button';
  btn.title = label;
  btn.setAttribute('aria-label', label);
  const i = document.createElement('i');
  i.className = iconClass;
  btn.appendChild(i);
  return btn;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function relativeTime(date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s geleden`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m geleden`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}u geleden`;
  return `${Math.floor(diff / 86400)}d geleden`;
}
