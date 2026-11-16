import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const mint = 0x70ffd0;
const metal = 0x435864;
const dark = 0x1a2c35;
const paper = 0xd3e8e7;
const amber = 0xf7bd70;
const red = 0xff676f;

function box(parent, size, position, color) {
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.62 });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
}

function point(parent, color) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 16, 12),
    new THREE.MeshBasicMaterial({ color })
  );
  parent.add(mesh);
  return mesh;
}

function wire(parent, points) {
  const geometry = new THREE.BufferGeometry().setFromPoints(
    points.map(position => new THREE.Vector3(...position))
  );
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: metal }));
  parent.add(line);
  return line;
}

function monitor(parent, x, z, color = metal) {
  box(parent, [0.54, 0.12, 0.4], [x, 0.15, z], dark);
  box(parent, [0.13, 0.45, 0.13], [x, 0.36, z], metal);
  box(parent, [1.04, 0.68, 0.12], [x, 0.83, z], dark);
  return box(parent, [0.89, 0.53, 0.03], [x, 0.83, z + 0.07], color);
}

function maintenance(model) {
  box(model, [3.4, 0.18, 2.1], [0, 0.18, 0], dark);
  for (const x of [-1.65, 1.65]) {
    box(model, [0.1, 0.43, 2.1], [x, 0.4, 0], metal);
  }
  box(model, [3.3, 0.42, 0.10], [0, 0.4, -1], metal);
  box(model, [1.95, 0.08, 1.65], [-0.53, 0.34, 0], 0x286d5a);
  box(model, [0.53, 0.17, 0.53], [-0.85, 0.47, 0], paper);
  for (const x of [-0.38, -0.16, 0.06]) {
    box(model, [0.10, 0.17, 1.1], [x, 0.47, 0], mint);
  }
  box(model, [0.63, 0.16, 0.93], [0.98, 0.4, 0.35], amber);
  const lid = box(model, [3.45, 0.14, 2.14], [0, 0.67, 0], metal);
  for (let x = -1.1; x < 1.2; x += 0.22) {
    box(lid, [0.08, 0.015, 1.15], [x, 0.078, 0], dark);
  }
  return value => {
    lid.position.set(0, 0.67 + value * 0.82, -value * 1.6);
    lid.rotation.x = value * 0.48;
  };
}

function networks(model) {
  const router = box(model, [1.24, 0.32, 0.66], [0, 0.27, -1.0], dark);
  for (const x of [-0.5, 0.5]) box(router, [0.06, 0.5, 0.06], [x, 0.24, -0.24], metal);
  const screens = [monitor(model, -1.55, 0.86), monitor(model, 0, 1.08)];
  const access = box(model, [0.65, 0.24, 0.65], [1.55, 0.23, 0.86], metal);
  const cables = [-1.55, 0, 1.55].map(x => wire(model, [
    [0, 0.14, -0.69], [0, 0.14, 0], [x, 0.14, 0], [x, 0.14, 0.87]
  ]));
  return value => {
    for (const item of [...screens, access, ...cables]) item.material.color.set(value > 0.5 ? mint : metal);
  };
}

function security(model) {
  const good = point(model, mint);
  const threat = point(model, red);
  const screen = monitor(model, 1.72, 0);
  for (let row = 0; row < 4; row++) {
    for (const z of [-0.58, 0, 0.58]) {
      box(model, [0.25, 0.22, 0.52], [0, 0.22 + row * 0.24, z], row % 2 ? 0x8e5c46 : 0xa97054);
    }
  }
  wire(model, [[-1.98, 0.18, -0.93], [1.72, 0.18, -0.93], [1.72, 0.18, 0]]);
  wire(model, [[-1.98, 0.18, 0.47], [-0.23, 0.18, 0.47]]);
  return value => {
    good.position.set(-1.98 + 3.7 * value, 0.22, -0.93 * Math.min(1, (1 - value) * 6));
    threat.position.set(-1.98 + 1.69 * value, 0.22, 0.47);
    screen.material.color.set(value > 0.95 ? mint : metal);
  };
}

function backup(model) {
  for (let row = 0; row < 3; row++) {
    box(model, [1.03, 0.22, 0.84], [-1.4, 0.22 + row * 0.25, 0], dark);
    box(model, [0.08, 0.06, 0.03], [-1.76, 0.22 + row * 0.25, 0.43], mint);
  }
  box(model, [1.12, 0.09, 0.92], [1.47, 0.17, 0], amber);
  box(model, [1.12, 0.43, 0.07], [1.47, 0.37, -0.43], amber);
  box(model, [1.12, 0.25, 0.07], [1.47, 0.30, 0.43], amber);
  const file = box(model, [0.53, 0.74, 0.07], [-1.4, 0.55, 0.48], paper);
  for (const y of [-0.14, 0, 0.14]) box(file, [0.31, 0.024, 0.01], [0, y, 0.041], metal);
  wire(model, [[-1.4, 0.12, 0.5], [1.47, 0.12, 0.5]]);
  return value => {
    file.position.set(-1.4 + 2.87 * value, 0.58 + Math.sin(value * Math.PI) * 0.6, 0.48 * (1 - value));
  };
}

function support(model) {
  const colors = [amber, 0x7bc4fe, mint];
  const cards = colors.map((color, index) => {
    const x = (index - 1) * 1.4;
    const card = box(model, [1.12, 1.04, 0.11], [x, 0.76, 0], dark);
    box(card, [0.2, 0.15, 0.035], [-0.29, 0.25, 0.066], color);
    for (const y of [0, -0.18]) box(card, [0.68, 0.045, 0.035], [0, y, 0.066], metal);
    return card;
  });
  return value => {
    cards.forEach((card, index) => {
      const active = Math.max(0, 1 - Math.abs(index - value));
      card.position.y = 0.76 + 0.28 * active;
      card.material.emissive.set(colors[index]).multiplyScalar(active * 0.16);
    });
  };
}

function installation(model) {
  box(model, [2.4, 0.14, 1.4], [0, 0.22, 0.4], metal);
  box(model, [1.75, 0.023, 0.62], [0, 0.31, 0.35], dark);
  box(model, [2.4, 1.44, 0.12], [0, 1.03, -0.26], dark);
  const screen = box(model, [2.18, 1.23, 0.04], [0, 1.03, -0.18], 0x235361);
  const progress = box(screen, [1.65, 0.085, 0.023], [0, -0.28, 0.036], mint);
  const taskbar = box(screen, [2.05, 0.14, 0.02], [0, -0.49, 0.034], dark);
  const icons = [0.5, 0.78].map(y => box(model, [0.19, 0.19, 0.022], [-0.81, y + 0.5, -0.145], paper));
  const usb = box(model, [0.45, 0.13, 0.22], [1.4, 0.2, 0.76], amber);
  box(usb, [0.18, 0.09, 0.13], [-0.28, 0, 0], paper);
  return value => {
    usb.position.z = 0.76 - Math.min(1, value) * 0.55;
    progress.visible = value > 0.05 && value < 1.8;
    progress.scale.x = 0.10 + 0.9 * Math.min(1, value / 1.6);
    taskbar.visible = value >= 1.8;
    for (const icon of icons) icon.visible = taskbar.visible;
    screen.material.color.set(taskbar.visible ? 0x358c84 : 0x235361);
  };
}

const scenes = { maintenance, network: networks, security, backup, support, install: installation };
const demo = document.querySelector(".service-demo");
const stage = demo?.querySelector(".demo-stage");
const build = scenes[demo?.dataset.scene];

if (stage && build) {
  try {
    mountScene(stage, demo, build);
  } catch (error) {
    console.warn("Demonstração 3D indisponível", error);
  }
}

function mountScene(stage, demo, build) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  const canvas = renderer.domElement;
  canvas.className = "demo-canvas";
  const scene = new THREE.Scene();
  const model = new THREE.Group();
  scene.add(model, new THREE.HemisphereLight(0xd3fff4, 0x41515e, 2.4));
  const key = new THREE.DirectionalLight(0xf0fcff, 2.5);
  key.position.set(2, 6, 4);
  scene.add(key);
  box(model, [4.65, 0.10, 2.85], [0, 0.04, 0], 0x12302d);
  const updateModel = build(model);
  const camera = new THREE.OrthographicCamera();
  camera.position.set(3.8, 3.65, 6);
  camera.lookAt(0, 0.60, 0);
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let current = Number(demo.dataset.step);
  let frame = 0;

  function draw() {
    updateModel(current);
    renderer.render(scene, camera);
  }

  function resize() {
    const width = stage.clientWidth;
    const height = canvas.clientHeight || Math.max(220, width * 0.58);
    const halfHeight = Math.max(2.05, 2.65 * height / Math.max(1, width));
    const halfWidth = halfHeight * width / height;
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setSize(width, height, false);
    draw();
  }

  const sizeObserver = new ResizeObserver(resize);
  const stepObserver = new MutationObserver(() => {
    if (demo.classList.contains("demo-scroll")) return;
    const previous = current;
    const next = Number(demo.dataset.step);
    cancelAnimationFrame(frame);

    if (reducedMotion.matches) {
      current = next;
      draw();
      return;
    }

    const start = performance.now();
    function animate(time) {
      const fraction = Math.min(1, (time - start) / 650);
      current = THREE.MathUtils.lerp(previous, next, fraction * fraction * (3 - 2 * fraction));
      draw();
      if (fraction < 1) frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
  });

  function followScroll(event) {
    cancelAnimationFrame(frame);
    if (current === event.detail) return;
    current = event.detail;
    draw();
  }

  demo.addEventListener("demo-progress", followScroll);
  canvas.addEventListener("webglcontextlost", () => {
    cancelAnimationFrame(frame);
    sizeObserver.disconnect();
    stepObserver.disconnect();
    canvas.remove();
    stage.classList.remove("demo-stage-3d");
    demo.removeEventListener("demo-progress", followScroll);
    demo.dispatchEvent(new Event("demo-renderer-change"));
  });
  resize();
  stage.append(canvas);
  stage.classList.add("demo-stage-3d");
  sizeObserver.observe(stage);
  stepObserver.observe(demo, { attributes: true, attributeFilter: ["data-step"] });
  demo.dispatchEvent(new Event("demo-renderer-change"));
}
