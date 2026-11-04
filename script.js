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

const orbit = document.querySelector(".hero-photo");
if (orbit) {
  const hero = orbit.closest(".hero");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = null;

  function updateOrbit() {
    frame = null;
    if (reducedMotion.matches) return;
    const distance = Math.max(0, -hero.getBoundingClientRect().top);
    orbit.style.setProperty("--drift", `${Math.min(distance * .22, 110)}px`);
  }

  function scheduleOrbit() {
    if (frame === null) frame = requestAnimationFrame(updateOrbit);
  }

  window.addEventListener("scroll", scheduleOrbit, { passive: true });
  reducedMotion.addEventListener("change", scheduleOrbit);
  scheduleOrbit();
}
