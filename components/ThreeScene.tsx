import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeSceneProps {
  intensity: number; // 0 to 1, derived from movement or audio
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ intensity }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Fog for depth
    scene.fog = new THREE.FogExp2(0x0f172a, 0.03);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer | undefined;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    } catch (e) {
      console.error("WebGL Initialization failed:", e);
      return; // Exit if WebGL fails
    }

    // Main central sphere (The "Core")
    const geometry = new THREE.IcosahedronGeometry(1.5, 2);
    const material = new THREE.MeshPhongMaterial({
      color: 0x6366f1, // Indigo 500
      wireframe: true,
      emissive: 0x4338ca,
      emissiveIntensity: 0.5
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    sphereRef.current = sphere;

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x38bdf8, // Sky 400
      transparent: true,
      opacity: 0.8
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (sphereRef.current) {
        sphereRef.current.rotation.x += 0.005;
        sphereRef.current.rotation.y += 0.005;
      }

      if (particlesRef.current) {
        particlesRef.current.rotation.y -= 0.002;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // React to intensity updates
  useEffect(() => {
    if (sphereRef.current) {
      // Pulse scale based on intensity
      const scale = 1 + intensity * 0.5;
      sphereRef.current.scale.setScalar(scale);

      // Change color based on intensity
      const mat = sphereRef.current.material as THREE.MeshPhongMaterial;
      if (intensity > 0.5) {
        mat.emissive.setHex(0xe11d48); // Red for high intensity
      } else {
        mat.emissive.setHex(0x4338ca); // Indigo for calm
      }
    }
    if (particlesRef.current) {
      // Rotate particles faster with intensity
      particlesRef.current.rotation.y -= intensity * 0.05;
    }
  }, [intensity]);

  return <div ref={containerRef} className="fixed top-0 left-0 w-full h-full -z-10 opacity-60" />;
};

export default ThreeScene;