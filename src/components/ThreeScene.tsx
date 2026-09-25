"use client";
import { useEffect, useRef } from "react";

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;
    let animId: number;
    let renderer: any;

    const init = async () => {
      const THREE = await import("three");
      const w = mount.clientWidth || 600;
      const h = mount.clientHeight || 600;

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xEBEBEB);

      // Camera
      const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
      camera.position.set(0, 0, 11);

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      mount.appendChild(renderer.domElement);

      // Lights
      const ambient = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambient);

      const key = new THREE.DirectionalLight(0xffffff, 3.5);
      key.position.set(6, 8, 6);
      key.castShadow = true;
      scene.add(key);

      const fill = new THREE.DirectionalLight(0xffffff, 1.5);
      fill.position.set(-6, -4, 4);
      scene.add(fill);

      const rim = new THREE.DirectionalLight(0xffffff, 0.8);
      rim.position.set(0, -8, -4);
      scene.add(rim);

      // Materials
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xFFFFFF,
        roughness: 0.04,
        metalness: 0.05,
        transmission: 0.88,
        thickness: 1.8,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        ior: 1.52,
        envMapIntensity: 1.2,
      });

      const chromeMat = new THREE.MeshPhysicalMaterial({
        color: 0xC8C8C8,
        roughness: 0.06,
        metalness: 0.98,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
      });

      const darkMat = new THREE.MeshPhysicalMaterial({
        color: 0x1A1A1A,
        roughness: 0.15,
        metalness: 0.7,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
      });

      // Group
      const group = new THREE.Group();

      // 4 corner glass cubes (cross / plus pattern)
      const cubeGeo = new THREE.BoxGeometry(1.7, 1.7, 1.7, 3, 3, 3);
      const corners = [[-1.95, 1.95, 0], [1.95, 1.95, 0], [-1.95, -1.95, 0], [1.95, -1.95, 0]];
      corners.forEach(([x, y, z]) => {
        const m = new THREE.Mesh(cubeGeo, glassMat);
        m.position.set(x, y, z);
        m.rotation.set(0.3, 0.5, 0.15);
        m.castShadow = true;
        group.add(m);
      });

      // Center chrome sphere
      const sphereGeo = new THREE.SphereGeometry(0.85, 64, 64);
      const sphere = new THREE.Mesh(sphereGeo, chromeMat);
      sphere.castShadow = true;
      group.add(sphere);

      // Small dark accent rings
      const ringGeo = new THREE.TorusGeometry(1.35, 0.055, 20, 80);
      const ring1 = new THREE.Mesh(ringGeo, darkMat);
      ring1.rotation.x = Math.PI / 2;
      group.add(ring1);
      const ring2 = new THREE.Mesh(ringGeo, darkMat);
      ring2.rotation.y = Math.PI / 2;
      group.add(ring2);

      // Shadow plane
      const planeGeo = new THREE.PlaneGeometry(30, 30);
      const planeMat = new THREE.ShadowMaterial({ opacity: 0.07 });
      const plane = new THREE.Mesh(planeGeo, planeMat);
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = -4;
      plane.receiveShadow = true;
      scene.add(plane);

      scene.add(group);

      // Mouse parallax
      let mx = 0, my = 0;
      const onMouse = (e: MouseEvent) => {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener("mousemove", onMouse);

      // Animate
      let t = 0;
      const animate = () => {
        animId = requestAnimationFrame(animate);
        t += 0.008;
        group.rotation.y = t * 0.35 + mx * 0.12;
        group.rotation.x = Math.sin(t * 0.25) * 0.12 + my * 0.08;
        group.position.y = Math.sin(t * 0.6) * 0.12;
        renderer.render(scene, camera);
      };
      animate();

      // Resize
      const onResize = () => {
        const nw = mount.clientWidth;
        const nh = mount.clientHeight;
        if (!nw || !nh) return;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("mousemove", onMouse);
        window.removeEventListener("resize", onResize);
        cancelAnimationFrame(animId);
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        renderer.dispose();
      };
    };

    let cleanup: (() => void) | undefined;
    init().then(fn => { cleanup = fn; });
    return () => { cleanup?.(); };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "100%", minHeight: 480 }}
      aria-hidden="true"
    />
  );
}