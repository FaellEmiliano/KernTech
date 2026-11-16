document.querySelectorAll(".service-demo").forEach(demo => {
  const button = demo.querySelector(".demo-button");
  const status = demo.querySelector(".demo-status");
  const steps = [...demo.querySelectorAll("[data-demo-step]")];
  const nodes = demo.querySelectorAll(".demo-steps .demo-node");
  const stage = demo.querySelector(".demo-stage");
  const header = document.querySelector(".header");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const maxStep = steps.length - 1;
  let step = 0;
  let frame = 0;
  let headerHeight = 0;
  let travel = 0;

  function showStep(index) {
    if (index === step) return;
    step = index;
    const current = steps[step];
    demo.dataset.step = step;
    status.textContent = current.textContent;
    button.textContent = current.dataset.action;
    nodes.forEach((item, index) => {
      if (index === step) {
        item.setAttribute("aria-current", "step");
      } else {
        item.removeAttribute("aria-current");
      }
    });
  }

  function syncScroll() {
    frame = 0;
    if (!demo.classList.contains("demo-scroll")) return;
    const distance = headerHeight - demo.getBoundingClientRect().top;
    const progress = Math.max(0, Math.min(1, distance / travel));
    const value = progress * maxStep;
    showStep(Math.floor(value + 0.15));
    demo.dispatchEvent(new CustomEvent("demo-progress", { detail: value }));
  }

  function scheduleScroll() {
    if (!frame && demo.classList.contains("demo-scroll")) {
      frame = requestAnimationFrame(syncScroll);
    }
  }

  function updateLayout() {
    headerHeight = header?.offsetHeight ?? 0;
    const height = document.documentElement.clientHeight - headerHeight;
    const enabled = stage.classList.contains("demo-stage-3d") && !motion.matches && height >= 300;
    demo.classList.toggle("demo-scroll", enabled);
    button.hidden = enabled;
    if (enabled) {
      travel = Math.round(Math.max(380, height * 0.75) * maxStep);
      demo.style.setProperty("--demo-header", headerHeight + "px");
      demo.style.setProperty("--demo-screen", height + "px");
      demo.style.setProperty("--demo-travel", travel + "px");
      syncScroll();
    } else {
      demo.dispatchEvent(new CustomEvent("demo-progress", { detail: step }));
    }
  }

  button.addEventListener("click", () => showStep((step + 1) % steps.length));
  demo.addEventListener("demo-renderer-change", updateLayout);
  motion.addEventListener("change", updateLayout);
  window.addEventListener("resize", updateLayout);
  window.addEventListener("scroll", scheduleScroll, { passive: true });
  button.hidden = false;

  if (!("IntersectionObserver" in window)) return;
  const visibility = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    visibility.disconnect();
    import("./service-scenes.js?v=immersive").catch(error => {
      console.warn("Demonstração 3D indisponível", error);
    });
  }, { rootMargin: "160px" });
  visibility.observe(stage);
});
