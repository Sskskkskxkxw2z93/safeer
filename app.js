// Theme + header + mobile nav
(function(){
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('theme');
  if(savedTheme === 'light'){ root.classList.add('light'); }
  themeToggle?.addEventListener('click', ()=>{
    root.classList.toggle('light');
    localStorage.setItem('theme', root.classList.contains('light') ? 'light' : 'dark');
  });

  const openMenu = document.getElementById('openMenu');
  const mobileNav = document.getElementById('mobileNav');
  openMenu?.addEventListener('click', () => {
    const isHidden = mobileNav.hasAttribute('hidden');
    if(isHidden){ mobileNav.removeAttribute('hidden'); openMenu.setAttribute('aria-expanded','true'); }
    else{ mobileNav.setAttribute('hidden',''); openMenu.setAttribute('aria-expanded','false'); }
  });

  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const id = a.getAttribute('href');
      const el = document.querySelector(id);
      if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); }
    })
  });

  const year = document.getElementById('year');
  if(year) year.textContent = new Date().getFullYear();
})();

// Blog loader
async function loadPosts(){
  const listEl = document.getElementById('postList');
  if(!listEl) return;
  const res = await fetch('assets/posts.json');
  const posts = await res.json();

  const search = new URLSearchParams(location.search);
  const q = (search.get('q') || '').toLowerCase();
  const tag = (search.get('tag') || '').toLowerCase();

  const filtered = posts.filter(p=>{
    const inQ = !q || p.title.toLowerCase().includes(q) || (p.excerpt||'').toLowerCase().includes(q);
    const inTag = !tag || (p.tags||[]).map(t=>t.toLowerCase()).includes(tag);
    return inQ && inTag;
  });

  listEl.innerHTML = filtered.map(p=>`
    <article class="card post-card">
      <h3><a href="post.html?slug=${encodeURIComponent(p.slug)}">${p.title}</a></h3>
      <div class="post-meta">${p.date} · ${p.readTime} min read · ${(p.tags||[]).map(t=>`<span class="tag">${t}</span>`).join(' ')}</div>
      <p class="muted">${p.excerpt||''}</p>
      <a class="btn ghost" href="post.html?slug=${encodeURIComponent(p.slug)}">Read →</a>
    </article>
  `).join('');

  // Build tag cloud
  const tagSet = new Set();
  posts.forEach(p => (p.tags||[]).forEach(t=>tagSet.add(t)));
  const tagsEl = document.getElementById('tagCloud');
  if(tagsEl){
    tagsEl.innerHTML = Array.from(tagSet).sort().map(t=>`<a class="tag" href="blog.html?tag=${encodeURIComponent(t)}">${t}</a>`).join(' ');
  }
}

// Single post loader
async function loadPost(){
  const article = document.getElementById('post');
  if(!article) return;
  const res = await fetch('assets/posts.json');
  const posts = await res.json();
  const search = new URLSearchParams(location.search);
  const slug = search.get('slug');
  const p = posts.find(x=>x.slug===slug);
  if(!p){
    article.innerHTML = '<p class="muted">Post not found.</p>';
    document.title = 'Post not found';
    return;
  }
  document.title = p.title + ' — Safeer Writes';
  article.innerHTML = `
    <h1>${p.title}</h1>
    <div class="post-meta">${p.date} · ${p.readTime} min read · ${(p.tags||[]).map(t=>`<span class="tag">${t}</span>`).join(' ')}</div>
    <div>${p.content}</div>
  `;
}

// Contact form
(function(){
  const form = document.getElementById('contactForm');
  const msg = document.getElementById('formMsg');
  if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = new FormData(form);
    const name = data.get('name')?.toString().trim();
    const email = data.get('email')?.toString().trim();
    if(!name || !email){
      if(msg){ msg.textContent = 'Please fill in your name and email.'; msg.style.color = 'tomato'; }
      return;
    }
    const subject = encodeURIComponent('LinkedIn Ghostwriting — New Inquiry');
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPackage: ${data.get('package')}\nLinkedIn: ${data.get('linkedin')}\nGoals:\n${data.get('goals') || ''}`
    );
    if(msg){ msg.textContent = 'Opening your email app…'; msg.style.color = 'var(--muted)'; }
    window.location.href = `mailto:safeerwarraich8@gmail.com?subject=${subject}&body=${body}`;
    form.reset();
    setTimeout(()=>{ if(msg){ msg.textContent='Thanks! If your email app did not open, email us directly.'; } }, 1200);
  });
})();