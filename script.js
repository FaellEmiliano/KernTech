const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const serviceIndex = document.querySelector("#service-index");
if (serviceIndex) {
  serviceIndex.innerHTML = `
    <ol class="service-list" aria-label="Serviços da kernTech">
      ${services.map(service => `
        <li>
          <a class="service-link" href="servicos/${service.id}.html" aria-describedby="desc-${service.id}">
            <span class="service-number" aria-hidden="true">${service.number}</span>
            <span class="service-title">${service.title}</span>
            <span class="service-arrow" aria-hidden="true">↗</span>
            <span class="service-description" id="desc-${service.id}">${service.desc}</span>
          </a>
        </li>
      `).join("")}
    </ol>
    <div class="service-preview" aria-hidden="true">
      <picture>
        <source media="(min-width: 801px)">
        <img alt="" decoding="async" width="960" height="640">
      </picture>
      <div class="service-preview-copy">
        <span class="eyebrow"></span>
        <p></p>
      </div>
    </div>
  `;

  const links = [...serviceIndex.querySelectorAll(".service-link")];
  const preview = serviceIndex.querySelector(".service-preview");
  const photo = preview.querySelector("source");
  const category = preview.querySelector(".eyebrow");
  const description = preview.querySelector("p");
  let activeLink;
  let transition;

  function showService(index) {
    const link = links[index];
    if (link === activeLink) return;
    const service = services[index];

    activeLink?.classList.remove("is-previewed");
    link.classList.add("is-previewed");
    photo.srcset = service.image;
    category.textContent = `${service.number} / 06 · ${service.cat}`;
    description.textContent = service.desc;

    if (activeLink && !reducedMotion.matches && preview.offsetWidth) {
      transition?.cancel();
      transition = preview.animate([{ opacity: .55 }, { opacity: 1 }], {
        duration: 230,
        easing: "ease-out",
      });
    }
    activeLink = link;
  }

  links.forEach((link, index) => {
    link.addEventListener("pointerenter", event => {
      if (event.pointerType !== "touch") showService(index);
    });
    link.addEventListener("focus", () => showService(index));
  });
  reducedMotion.addEventListener("change", () => transition?.cancel());
  showService(0);
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

  document.querySelectorAll(".section-heading, .service-index, .campaign-inner, .contact-form, .content-cols > div").forEach(element => {
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

document.querySelectorAll(".hero, .campaign, .subhero").forEach(section => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return;

  canvas.className = "binary-backdrop";
  canvas.setAttribute("aria-hidden", "true");
  section.prepend(canvas);

  const spacing = 17;
  const lifetime = 1150;
  const waves = [];
  let frame = null;
  let lastPoint;
  let width = 0;
  let height = 0;
  let scale = 0;

  function render(now) {
    frame = null;
    context.clearRect(0, 0, width, height);

    while (waves.length && now - waves[0].time >= lifetime) waves.shift();
    for (const wave of waves) {
      const progress = Math.max(0, (now - wave.time) / lifetime);
      const radius = progress * 200;
      const band = 25 + progress * 18;
      const reach = radius + band;
      const left = Math.max(0, Math.ceil((wave.x - reach) / spacing));
      const right = Math.min(Math.floor(width / spacing), Math.floor((wave.x + reach) / spacing));
      const top = Math.max(0, Math.ceil((wave.y - reach) / spacing));
      const bottom = Math.min(Math.floor(height / spacing), Math.floor((wave.y + reach) / spacing));

      for (let row = top; row <= bottom; row++) {
        for (let column = left; column <= right; column++) {
          const x = column * spacing;
          const y = row * spacing;
          const distanceFromWave = Math.abs(Math.hypot(x - wave.x, y - wave.y) - radius);
          if (distanceFromWave >= band) continue;

          const pattern = Math.imul(column + wave.seed, 73856093) ^ Math.imul(row, 19349663);
          if ((pattern & 7) === 0) continue;
          context.globalAlpha = .48 * (1 - progress) ** 1.4 * (1 - distanceFromWave / band);
          context.fillText(pattern & 8 ? "1" : "0", x, y);
        }
      }
    }

    if (waves.length) frame = requestAnimationFrame(render);
  }

  section.addEventListener("pointermove", event => {
    if (event.pointerType === "touch" || reducedMotion.matches) return;
    const bounds = section.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const time = performance.now();
    if (lastPoint && (time - lastPoint.time < 55 || Math.hypot(x - lastPoint.x, y - lastPoint.y) < spacing)) return;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    if (width !== bounds.width || height !== bounds.height || scale !== pixelRatio) {
      width = bounds.width;
      height = bounds.height;
      scale = pixelRatio;
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      context.font = "12px ui-monospace, Consolas, monospace";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "#a6ffd8";
    }

    lastPoint = { x, y, time };
    waves.push({ ...lastPoint, seed: Math.floor(time) });
    if (frame === null) frame = requestAnimationFrame(render);
  }, { passive: true });

  section.addEventListener("pointerleave", () => {
    lastPoint = undefined;
  });
  reducedMotion.addEventListener("change", () => {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    waves.length = 0;
    lastPoint = undefined;
    context.clearRect(0, 0, width, height);
  });
});
