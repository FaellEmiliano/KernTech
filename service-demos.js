document.querySelectorAll(".service-demo").forEach(demo => {
  const button = demo.querySelector(".demo-button");
  const status = demo.querySelector(".demo-status");
  const steps = [...demo.querySelectorAll("[data-demo-step]")];
  let step = 0;

  button.addEventListener("click", () => {
    step = (step + 1) % steps.length;
    const current = steps[step];
    demo.dataset.step = step;
    status.textContent = current.textContent;
    button.textContent = current.dataset.action;
    demo.querySelectorAll(".demo-steps .demo-node").forEach((item, index) => {
      if (index === step) {
        item.setAttribute("aria-current", "step");
      } else {
        item.removeAttribute("aria-current");
      }
    });
  });

  button.hidden = false;
});
