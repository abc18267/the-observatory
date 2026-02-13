<script lang="ts">
  import { onMount } from 'svelte';
  import { clickStar, addConstellation } from '../../lib/discovery/store';
  import constellationData from '../../data/constellations.json';

  let canvasEl: HTMLCanvasElement | undefined = $state();

  interface ConstellationStar {
    id: string;
    x: number;
    y: number;
    size: number;
  }

  interface Constellation {
    name: string;
    label: string;
    stars: ConstellationStar[];
    connections: [string, string][];
  }

  const constellations: Constellation[] = constellationData.constellations as Constellation[];

  onMount(() => {
    if (!canvasEl) return;

    let destroyed = false;
    let animId: number;
    let renderer: any;
    let scene: any;
    let camera: any;

    // Track clicked star IDs
    const clickedStarIds = new Set<string>();
    // Track completed constellations
    const completedConstellations = new Set<string>();

    async function init() {
      const THREE = await import('three');

      if (destroyed || !canvasEl) return;

      // Scene setup
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 50;

      renderer = new THREE.WebGLRenderer({
        canvas: canvasEl,
        alpha: true,
        antialias: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // --- Random background stars ---
      const randomStarCount = 200;
      const randomPositions = new Float32Array(randomStarCount * 3);
      for (let i = 0; i < randomStarCount; i++) {
        // Spread across viewport in a flat plane
        randomPositions[i * 3] = (Math.random() - 0.5) * 100;
        randomPositions[i * 3 + 1] = (Math.random() - 0.5) * 60;
        randomPositions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
      }

      const randomGeometry = new THREE.BufferGeometry();
      randomGeometry.setAttribute('position', new THREE.BufferAttribute(randomPositions, 3));

      const starTexture = createStarTexture(THREE);

      const randomMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.5,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.8,
        map: starTexture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const randomStars = new THREE.Points(randomGeometry, randomMaterial);
      scene.add(randomStars);

      // --- Constellation stars (interactive) ---
      // Map constellation star positions (0-1 normalized) to world coords
      const constellationMeshes = new Map<string, any>();
      const constellationGlows = new Map<string, any>();
      const interactiveObjects: any[] = [];

      for (const constellation of constellations) {
        for (const star of constellation.stars) {
          // Convert 0-1 coords to world space
          const worldX = (star.x - 0.5) * 100;
          const worldY = (0.5 - star.y) * 60; // Flip Y
          const worldZ = -2;

          const geometry = new THREE.SphereGeometry(star.size * 0.4, 16, 16);
          const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9,
          });

          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(worldX, worldY, worldZ);
          mesh.userData = {
            starId: star.id,
            constellationName: constellation.name,
            baseSize: star.size,
          };
          scene.add(mesh);
          constellationMeshes.set(star.id, mesh);
          interactiveObjects.push(mesh);

          // Glow ring (hidden until clicked)
          const glowGeometry = new THREE.RingGeometry(star.size * 0.5, star.size * 0.9, 32);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xfbbf24,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
          });
          const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
          glowMesh.position.set(worldX, worldY, worldZ + 0.1);
          scene.add(glowMesh);
          constellationGlows.set(star.id, glowMesh);
        }
      }

      // --- Constellation lines (drawn when complete) ---
      const constellationLines = new Map<string, any>();

      function drawConstellationLines(constellation: Constellation) {
        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0x60a5fa,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
        });

        const points: any[] = [];

        for (const [fromId, toId] of constellation.connections) {
          const fromMesh = constellationMeshes.get(fromId);
          const toMesh = constellationMeshes.get(toId);
          if (!fromMesh || !toMesh) continue;

          const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            fromMesh.position.clone(),
            toMesh.position.clone(),
          ]);
          const line = new THREE.Line(lineGeometry, lineMaterial.clone());
          scene.add(line);
          points.push(line);
        }

        constellationLines.set(constellation.name, points);

        // Fade in the lines
        let fadeProgress = 0;
        function fadeIn() {
          fadeProgress += 0.02;
          if (fadeProgress > 1) fadeProgress = 1;
          for (const line of points) {
            line.material.opacity = fadeProgress * 0.5;
          }
          if (fadeProgress < 1) {
            requestAnimationFrame(fadeIn);
          }
        }
        requestAnimationFrame(fadeIn);
      }

      // --- Raycaster for click detection ---
      const raycaster = new THREE.Raycaster();
      raycaster.params.Points = { threshold: 2 };
      const mouse = new THREE.Vector2();

      function onCanvasClick(event: MouseEvent) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactiveObjects);

        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const starId = hit.userData.starId as string;
          const constellationName = hit.userData.constellationName as string;

          if (!clickedStarIds.has(starId)) {
            clickedStarIds.add(starId);
            clickStar();

            // Brighten the glow
            const glow = constellationGlows.get(starId);
            if (glow) {
              glow.material.opacity = 0.8;
            }

            // Brighten the star
            (hit as any).material.color.set(0xfbbf24);
            hit.scale.setScalar(1.4);

            // Check if constellation is complete
            checkConstellationCompletion(constellationName);
          }
        }
      }

      function checkConstellationCompletion(constellationName: string) {
        if (completedConstellations.has(constellationName)) return;

        const constellation = constellations.find((c) => c.name === constellationName);
        if (!constellation) return;

        const allClicked = constellation.stars.every((s) => clickedStarIds.has(s.id));
        if (allClicked) {
          completedConstellations.add(constellationName);
          drawConstellationLines(constellation);
          addConstellation(
            constellation.name,
            constellation.stars.map((s) => s.id)
          );
        }
      }

      canvasEl.addEventListener('click', onCanvasClick);

      // --- Resize handler ---
      function onResize() {
        if (!renderer || !camera || destroyed) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
      window.addEventListener('resize', onResize);

      // --- Animation loop ---
      let time = 0;

      function animate() {
        if (destroyed) return;
        animId = requestAnimationFrame(animate);
        time += 0.01;

        // Subtle global twinkle via material opacity
        randomMaterial.opacity = 0.6 + Math.sin(time * 0.5) * 0.15;

        // Twinkle individual constellation stars
        for (const [starId, mesh] of constellationMeshes) {
          if (!clickedStarIds.has(starId)) {
            const twinkle = Math.sin(time * (2 + mesh.position.x * 0.1)) * 0.15 + 0.85;
            mesh.material.opacity = twinkle;
          }
        }

        // Pulse glows on clicked stars
        for (const [starId, glow] of constellationGlows) {
          if (clickedStarIds.has(starId)) {
            glow.material.opacity = 0.4 + Math.sin(time * 3) * 0.3;
          }
        }

        renderer.render(scene, camera);
      }

      animate();

      // Store cleanup references
      return () => {
        canvasEl?.removeEventListener('click', onCanvasClick);
        window.removeEventListener('resize', onResize);
      };
    }

    let cleanupListeners: (() => void) | undefined;

    init().then((cleanup) => {
      cleanupListeners = cleanup;
    });

    return () => {
      destroyed = true;
      if (animId) cancelAnimationFrame(animId);
      cleanupListeners?.();

      if (renderer) {
        renderer.dispose();
        renderer = null;
      }
      if (scene) {
        scene.traverse((obj: any) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (obj.material.map) obj.material.map.dispose();
            obj.material.dispose();
          }
        });
        scene = null;
      }
      camera = null;
    };
  });

  function createStarTexture(THREE: any): any {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }
</script>

<canvas bind:this={canvasEl} class="starfield-canvas"></canvas>

<style>
  .starfield-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
    pointer-events: auto;
  }
</style>
