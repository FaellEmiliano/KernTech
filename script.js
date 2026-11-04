const grid = document.querySelector("#service-grid");
if (grid) {
  grid.innerHTML = services.map(service => `
    <article class="service-card">
      <a href="servicos/${service.id}.html">
        <div class="service-photo" style="--photo: url('${service.image}')">
          <span class="service-number">${service.number} / 06</span>
        </div>
        <div class="service-info">
          <div class="service-tag">${service.cat}</div>
          <h3>${service.title}</h3>
          <p>${service.desc}</p>
          <div class="service-footer"><span>Orçamento personalizado</span><strong>Ver serviço ↗</strong></div>
        </div>
      </a>
    </article>
  `).join("");
}

const select = document.querySelector("#service");
if (select) {
  services.forEach(service => select.add(new Option(service.title, service.id)));
  const chosen = new URLSearchParams(location.search).get("servico");
  if (services.some(service => service.id === chosen)) select.value = chosen;
}

const form = document.querySelector("#contact-form");
if (form) {
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const chosen = services.find(service => service.id === data.get("service"));
    const feedback = document.querySelector("#form-feedback");
    feedback.hidden = false;
    feedback.textContent = `Demonstração: solicitação de ${data.get("name")} para ${chosen?.title ?? "serviço"} preparada. Nenhuma informação foi enviada.`;
  });
}

const toggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");
if (toggle && menu) {
  const setMenu = open => {
    menu.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    toggle.textContent = open ? "✕" : "☰";
  };
  toggle.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  menu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menu.classList.contains("open")) {
      setMenu(false);
      toggle.focus();
    }
  });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      // Animate below-the-fold content as it enters, without hiding anchor targets.
      if (entry.boundingClientRect.top > window.innerHeight * .45) {
        entry.target.classList.add("in-view");
      }
      observer.unobserve(entry.target);
    });
  }, { threshold: .08 });

  document.querySelectorAll(".section-heading, .service-card, .campaign-inner, .contact-form, .content-cols > div").forEach(element => {
    element.classList.add("reveal");
    observer.observe(element);
  });
}

const heroTitle = document.querySelector(".hero-copy h1");
if (heroTitle && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const terminalText = document.createElement("span");
  terminalText.setAttribute("aria-hidden", "true");
  heroTitle.setAttribute("aria-label", heroTitle.innerText.replace(/\s+/g, " ").trim());
  terminalText.append(...heroTitle.childNodes);
  heroTitle.append(terminalText);
  heroTitle.classList.add("is-typing");

  const walker = document.createTreeWalker(terminalText, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  const characters = textNodes.flatMap(node => {
    const letters = Array.from(node.textContent, letter => {
      const character = document.createElement("span");
      character.className = "terminal-character";
      character.textContent = letter;
      return character;
    });
    node.replaceWith(...letters);
    return letters;
  });

  characters.forEach((character, index) => {
    setTimeout(() => {
      characters[index - 1]?.classList.remove("terminal-cursor");
      character.classList.add("typed", "terminal-cursor");
    }, 100 + index * 65);
  });
}

const codeLines = [
  'import { network, storage } from "./infrastructure";',
  'const session = await network.connect({ secure: true });',
  'const snapshot = await storage.createSnapshot();',
  'await storage.verify(snapshot.checksum);',
  'const routes = network.routes.filter(route => route.active);',
  'const status = await session.healthCheck();',
  'if (status.ready) await session.sync(routes);',
  'export { session, snapshot };',
];
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

document.querySelectorAll(".hero, .campaign, .subhero").forEach(section => {
  const backdrop = document.createElement("div");
  backdrop.className = "code-backdrop";
  backdrop.setAttribute("aria-hidden", "true");

  const rows = Array.from({ length: 48 }, (_, index) => {
    const row = document.createElement("div");
    const number = String(index + 1).padStart(2, "0");
    const line = codeLines[index % codeLines.length];
    row.textContent = `  ${number}  ${line}      `.repeat(6);
    return row;
  });
  backdrop.append(...rows);
  section.prepend(backdrop);

  let activeRow;
  function resetBackdrop() {
    backdrop.style.removeProperty("--code-x");
    backdrop.style.removeProperty("--code-y");
    activeRow?.classList.remove("code-active");
    activeRow = undefined;
  }

  section.addEventListener("pointermove", event => {
    if (event.pointerType === "touch" || reducedMotion.matches) return;
    const bounds = section.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const driftX = (x / bounds.width - .5) * 54;
    const driftY = (y / bounds.height - .5) * 36;
    backdrop.style.setProperty("--code-x", `${driftX}px`);
    backdrop.style.setProperty("--code-y", `${driftY}px`);

    const backdropTop = backdrop.getBoundingClientRect().top;
    const rowHeight = rows[0].getBoundingClientRect().height;
    const row = rows[Math.floor((event.clientY - backdropTop) / rowHeight)];
    if (row === activeRow) return;
    activeRow?.classList.remove("code-active");
    row?.classList.add("code-active");
    activeRow = row;
  }, { passive: true });
  section.addEventListener("pointerleave", resetBackdrop);
  reducedMotion.addEventListener("change", resetBackdrop);
});
