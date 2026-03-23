/* ============================================================
   THE INSIGHTS — script.js
   ============================================================ */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const POST_IDS = [
  "social-network",
  "boyhood",
  "pirataria",
  "coisas-antigas",
  "jogos-tycoon",
];

// ---------------------------------------------------------------------------
// Markdown parser
// ---------------------------------------------------------------------------
function parseMarkdown(raw) {
  const DELIMITER = "---";
  const parts = raw.split(DELIMITER);

  let meta = {};
  let body = raw;

  if (parts.length >= 3 && parts[0].trim() === "") {
    const frontmatter = parts[1];
    body = parts.slice(2).join(DELIMITER).trim();

    frontmatter.split("\n").forEach(line => {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) return;
      const key   = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      if (key) meta[key] = value;
    });
  }

  return { meta, body };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function tagsHTML(tagsStr = "") {
  return tagsStr
    .split(",")
    .map(t => t.trim())
    .filter(Boolean)
    .map(t => `<span class="tag-pill">${t}</span>`)
    .join("");
}

// ---------------------------------------------------------------------------
// Scroll animation — adiciona .visible nos cards ao entrar na viewport
// ---------------------------------------------------------------------------
function initScrollAnimations() {
  const cards = document.querySelectorAll(".card");
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // dispara só uma vez
        }
      });
    },
    { threshold: 0.12 }
  );

  cards.forEach(card => observer.observe(card));
}

// ---------------------------------------------------------------------------
// Masthead — anima as linhas horizontais ao aparecer na tela
// ---------------------------------------------------------------------------
function initMastheadAnimation() {
  const rules = document.querySelectorAll(".masthead-rule");
  if (!rules.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  rules.forEach(r => observer.observe(r));
}

// ---------------------------------------------------------------------------
// Barra de progresso de leitura (só na post.html)
// ---------------------------------------------------------------------------
function initReadingProgress() {
  if (!document.body.classList.contains("post-page")) return;

  const bar = document.createElement("div");
  bar.className = "reading-progress";
  document.body.prepend(bar);

  const content = document.querySelector(".content");
  if (!content) return;

  window.addEventListener("scroll", () => {
    const contentTop    = content.getBoundingClientRect().top + window.scrollY;
    const contentHeight = content.offsetHeight;
    const scrolled      = window.scrollY - contentTop;
    const percent       = Math.min(100, Math.max(0, (scrolled / contentHeight) * 100));
    bar.style.width     = percent + "%";
  }, { passive: true });
}

// ---------------------------------------------------------------------------
// Cursor magnético nos objetos da colagem (efeito de repulsão/atração leve)
// ---------------------------------------------------------------------------
function initMagneticObjects() {
  const objects = document.querySelectorAll(".hero-wrap .obj");
  if (!objects.length) return;

  objects.forEach(obj => {
    obj.addEventListener("mousemove", (e) => {
      const rect   = obj.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / rect.width  * 10;
      const dy     = (e.clientY - cy) / rect.height * 10;
      const rotate = parseFloat(obj.style.getPropertyValue("--r") || "0");

      obj.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotate}deg) scale(1.06)`;
    });

    obj.addEventListener("mouseleave", () => {
      const rotate = obj.style.getPropertyValue("--r") || "0deg";
      obj.style.transform = `rotate(${rotate})`;
    });
  });
}

// ---------------------------------------------------------------------------
// Index page: carrega posts dinamicamente (se usar #posts-container)
// ---------------------------------------------------------------------------
async function loadPosts() {
  const container = document.getElementById("posts-container");
  if (!container) return;

  const results = await Promise.allSettled(
    POST_IDS.map(id =>
      fetch(`posts/${id}.md`).then(r => r.text()).then(t => ({ id, ...parseMarkdown(t) }))
    )
  );

  results.forEach((result, i) => {
    if (result.status !== "fulfilled") return;
    const { id, meta } = result.value;

    const card = document.createElement("a");
    card.href  = `post.html?id=${id}`;
    card.className = "card grid-card";
    card.style.setProperty("--delay", `${i * 80}ms`);

    card.innerHTML = `
      ${meta.image ? `<div class="grid-card-image"><img src="${meta.image}" alt="${meta.title || ""}"></div>` : ""}
      <div class="grid-card-body${meta.image ? "" : " no-image"}">
        <div class="card-meta">${tagsHTML(meta.tags)}</div>
        <h3>${meta.title || id}</h3>
        <p class="card-excerpt">${meta.description || ""}</p>
        <small class="card-date">${formatDate(meta.date)}</small>
      </div>
    `;

    container.appendChild(card);
  });

  // re-observa os cards recém criados
  initScrollAnimations();
}

// ---------------------------------------------------------------------------
// Post page
// ---------------------------------------------------------------------------
async function loadPostPage() {
  const titleEl = document.getElementById("post-title");
  if (!titleEl) return;

  const params = new URLSearchParams(window.location.search);
  const id     = params.get("id");

  if (!id) { titleEl.textContent = "Post não encontrado."; return; }

  document.title = "Carregando… · The Insights";

  let raw;
  try {
    const res = await fetch(`posts/${id}.md`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    raw = await res.text();
  } catch (err) {
    titleEl.textContent = "Post não encontrado.";
    console.error("[The Insights] Erro ao carregar post:", err);
    return;
  }

  const { meta, body } = parseMarkdown(raw);

  document.title = meta.title ? `${meta.title} · The Insights` : "The Insights";

  titleEl.textContent = meta.title || "";

  const descEl = document.getElementById("post-desc");
  if (descEl) descEl.textContent = meta.description || "";

  const imgEl = document.getElementById("post-image");
  if (imgEl) {
    if (meta.image) { imgEl.src = meta.image; imgEl.alt = meta.title || ""; }
    else imgEl.style.display = "none";
  }

  const tagsEl = document.getElementById("post-tags");
  if (tagsEl) tagsEl.innerHTML = tagsHTML(meta.tags);

  const dateEl = document.getElementById("post-date");
  if (dateEl) dateEl.textContent = formatDate(meta.date);

  const contentEl = document.getElementById("post-content");
  if (contentEl && typeof marked !== "undefined") {
    contentEl.innerHTML = marked.parse(body);
  }
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initScrollAnimations();
  initMastheadAnimation();
  initReadingProgress();
  initMagneticObjects();
  loadPosts();
  loadPostPage();
});