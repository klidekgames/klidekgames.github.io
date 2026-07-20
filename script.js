const revealItems = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

revealItems.forEach((item) => observer.observe(item));

const waterCanvas = document.querySelector('.water-canvas');

// The water effect is painted directly onto a canvas by drawing a few layered
// sine-wave shapes that move gently over time to suggest rippling water.
if (waterCanvas) {
  const ctx = waterCanvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;

  const resizeCanvas = () => {
    const rect = waterCanvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = window.devicePixelRatio || 1;
    waterCanvas.width = width * dpr;
    waterCanvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const drawWater = (time) => {
    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(10, 48, 67, 0.42)');
    gradient.addColorStop(0.55, 'rgba(17, 102, 133, 0.2)');
    gradient.addColorStop(1, 'rgba(74, 188, 186, 0.08)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    for (let layer = 0; layer < 3; layer += 1) {
      const depth = 24 + layer * 16;
      const alpha = 0.16 + layer * 0.07;
      const amplitude = 10 + layer * 8;
      const speed = 0.0014 + layer * 0.0002;

      ctx.beginPath();
      ctx.moveTo(0, height * 0.62 + depth);

      for (let x = 0; x <= width; x += 16) {
        const wave = Math.sin((x / width) * Math.PI * 2.2 + time * speed) * amplitude;
        const ripple = Math.cos((x / width) * Math.PI * 4.2 + time * 0.0011 + layer) * (amplitude * 0.3);
        const y = height * 0.62 + depth + wave + ripple;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle = `rgba(117, 220, 221, ${alpha})`;
      ctx.fill();
    }

    requestAnimationFrame(drawWater);
  };

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  requestAnimationFrame(drawWater);
}

const heroScene = document.querySelector('.hero-scene');

// The sun is a tiny three.js scene: a toon-shaded sphere, a ring of soft rays,
// and a subtle glow, all composited together to feel like a simple illustrated sun.
if (heroScene && typeof THREE !== 'undefined') {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(heroScene.clientWidth || 220, heroScene.clientHeight || 220, false);
  heroScene.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, -0.3, 12);

  scene.add(new THREE.AmbientLight(0x2a2640, 0.95));

  const keyLight = new THREE.DirectionalLight(0xfff0c8, 2.2);
  keyLight.position.set(6, 5, 8);
  scene.add(keyLight);

  const sunGroup = new THREE.Group();
  scene.add(sunGroup);

  const gradientColors = new Uint8Array([
    0, 0, 0, 255,
    92, 0, 0, 255,
    255, 145, 0, 255,
    255, 220, 100, 255
  ]);

  const gradientMap = new THREE.DataTexture(gradientColors, 4, 1, THREE.RGBAFormat);
  gradientMap.minFilter = THREE.NearestFilter;
  gradientMap.magFilter = THREE.NearestFilter;
  gradientMap.generateMipmaps = false;
  gradientMap.needsUpdate = true;

  const sunMaterial = new THREE.MeshToonMaterial({
    color: 0xffa500,
    gradientMap,
    transparent: true,
    opacity: 0.99
  });

  const sun = new THREE.Mesh(new THREE.SphereGeometry(1.35, 32, 32), sunMaterial);
  sunGroup.add(sun);

  const rayMaterial = new THREE.LineBasicMaterial({ color: 0xffdd7a, transparent: true, opacity: 0.6 });

  for (let index = 0; index < 16; index += 1) {
    const angle = (index / 16) * Math.PI * 2;
    const radius = 2.3;
    const points = [
      new THREE.Vector3(0, 0, 0.02),
      new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.02)
    ];
    const rayGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const ray = new THREE.Line(rayGeometry, rayMaterial);
    sunGroup.add(ray);
  }



  const resizeScene = () => {
    const width = heroScene.clientWidth;
    const height = heroScene.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const animate = (time) => {
    requestAnimationFrame(animate);
    sunGroup.rotation.y = Math.sin(time * 0.00025) * 0.16;
    sunGroup.rotation.x = Math.sin(time * 0.00018) * 0.06;
    sunGroup.position.y = Math.sin(time * 0.0008) * 0.12;
    renderer.render(scene, camera);
  };

  resizeScene();
  window.addEventListener('resize', resizeScene);
  animate(0);
}

const yearNode = document.getElementById('year');
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}
