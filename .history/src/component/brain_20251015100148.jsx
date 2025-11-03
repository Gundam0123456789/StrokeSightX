// src/component/BrainViewer.jsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function Brain() {
  const mountRef = useRef(null);
  const groupRef = useRef(null);
  const camRef = useRef(null);
  const rendererRef = useRef(null);
  const planeRef = useRef(null);
  const meshesRef = useRef([]);

  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState("");
  const [slice, setSlice] = useState(50);
  const [view, setView] = useState("sagittal");

  // เปลี่ยนเป็น URL GLB ของคุณได้
  const DEFAULT_MODEL_URL =
    "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BrainStem/glTF-Binary/BrainStem.glb";

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf7f7f8);

    const w = mountRef.current.clientWidth;
    const h = Math.max(1, mountRef.current.clientHeight);

    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.set(8, 3, 8);
    camera.lookAt(0, 0, 0);
    camRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(w, h);
    renderer.localClippingEnabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const d1 = new THREE.DirectionalLight(0xffffff, 0.8);
    d1.position.set(5, 6, 5);
    scene.add(d1);
    const d2 = new THREE.DirectionalLight(0xffffff, 0.3);
    d2.position.set(-5, 2, -5);
    scene.add(d2);

    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    const plane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
    planeRef.current = plane;

    // interactions
    let dragging = false;
    let prev = { x: 0, y: 0 };
    let rot = { x: 0, y: 0 };

    const onDown = (e) => {
      dragging = true;
      prev = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      rot = { x: rot.x + dy * 0.005, y: rot.y + dx * 0.005 };
      group.rotation.x = rot.x;
      group.rotation.y = rot.y;
      prev = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => (dragging = false);
    const onWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY * 0.01;
      const dist = camera.position.length();
      camera.position.setLength(Math.max(5, Math.min(30, dist + delta)));
    };
    const onResize = () => {
      if (!rendererRef.current || !camRef.current || !mountRef.current) return;
      const W = mountRef.current.clientWidth;
      const H = Math.max(1, mountRef.current.clientHeight);
      rendererRef.current.setSize(W, H);
      camRef.current.aspect = W / H;
      camRef.current.updateProjectionMatrix();
    };

    renderer.domElement.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", onResize);

    let raf;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      renderer.domElement.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);

      scene.traverse((o) => {
        if (o.isMesh) {
          o.geometry?.dispose();
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose?.());
          else o.material?.dispose?.();
        }
      });
      renderer.dispose?.();
      if (renderer.domElement && mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // clipping update
  useEffect(() => {
    if (!rendererRef.current || !planeRef.current) return;
    const plane = planeRef.current;
    const norm = (slice - 50) / 50; // -1..1
    const pos = norm * 5;

    if (view === "sagittal") plane.normal.set(1, 0, 0);
    else if (view === "horizontal") plane.normal.set(0, 1, 0);
    else plane.normal.set(0, 0, 1);
    plane.constant = -pos;

    rendererRef.current.clippingPlanes = [plane];
    meshesRef.current.forEach((mesh) => {
      if (!mesh.material) return;
      if (Array.isArray(mesh.material)) mesh.material.forEach((m) => (m.clippingPlanes = [plane]));
      else mesh.material.clippingPlanes = [plane];
    });
  }, [slice, view]);

  // load model (file or external url)
  const handleUpload = async (file) => {
    try {
      setLoadingError("");
      setModelLoaded(false);
      const url = URL.createObjectURL(file);

      const [{ GLTFLoader }, { DRACOLoader }, { MeshoptDecoder }] = await Promise.all([
        import("three/examples/jsm/loaders/GLTFLoader.js"),
        import("three/examples/jsm/loaders/DRACOLoader.js"),
        import("three/examples/jsm/libs/meshopt_decoder.module.js"),
      ]);

      const loader = new GLTFLoader();
      const draco = new DRACOLoader();
      draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
      loader.setDRACOLoader(draco);
      loader.setMeshoptDecoder(MeshoptDecoder);

      loader.load(
        url,
        (gltf) => {
          const obj = gltf.scene;

          // clear old
          if (groupRef.current) {
            groupRef.current.traverse((c) => {
              if (c.isMesh) {
                c.geometry?.dispose();
                if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose?.());
                else c.material?.dispose?.();
              }
            });
            groupRef.current.clear();
          }

          meshesRef.current = [];
          obj.traverse((child) => {
            if (child.isMesh) {
              child.material = new THREE.MeshPhongMaterial({
                color: 0x92b4ec,
                transparent: true,
                opacity: 0.92,
                shininess: 60,
                side: THREE.DoubleSide,
              });
              meshesRef.current.push(child);
            }
          });

          // center + scale + fit
          const box = new THREE.Box3().setFromObject(obj);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z) || 1;

          obj.position.sub(center);
          obj.scale.setScalar(5 / maxDim);

          groupRef.current.add(obj);
          camRef.current.position.setLength(10);
          camRef.current.lookAt(0, 0, 0);

          setModelLoaded(true);
          URL.revokeObjectURL(url);
        },
        undefined,
        (err) => {
          console.error("[GLTF] load error", err);
          setLoadingError("Failed to parse GLB/GLTF.");
        }
      );
    } catch (e) {
      console.error(e);
      setLoadingError(e.message);
    }
  };

  const handleUploadFromURL = async (url) => {
    try {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
      const blob = await res.blob();
      await handleUpload(new File([blob], "external.glb", { type: "model/gltf-binary" }));
    } catch (e) {
      console.error("[GLB URL] error", e);
      setLoadingError("Load external model failed (CORS/URL).");
    }
  };

  // auto-load
  useEffect(() => {
    handleUploadFromURL(DEFAULT_MODEL_URL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
        <div className="text-sm font-semibold">3D Brain Viewer</div>
        <div className="flex items-center gap-2">
          <select
            className="text-sm border rounded-lg px-2 py-1"
            value={view}
            onChange={(e) => setView(e.target.value)}
          >
            <option value="sagittal">Sagittal</option>
            <option value="horizontal">Horizontal</option>
            <option value="coronal">Coronal</option>
          </select>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-12 text-right">Slice</span>
            <input
              type="range"
              min={0}
              max={100}
              value={slice}
              onChange={(e) => setSlice(Number(e.target.value))}
            />
          </div>
          <label className="text-sm px-2 py-1 border rounded-lg cursor-pointer hover:bg-slate-50">
            Upload GLB/GLTF
            <input
              type="file"
              className="hidden"
              accept=".glb,.gltf"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
          </label>
        </div>
      </div>
      <div className="relative">
        <div ref={mountRef} className="w-full" style={{ minHeight: "50vh" }} />
        <div className="absolute top-2 left-2 text-[11px] bg-white/90 border border-slate-200 rounded px-2 py-1 shadow">
          <div>Model: {modelLoaded ? "Loaded" : "Loading..."}</div>
          <div>Meshes: {meshesRef.current.length}</div>
        </div>
        {loadingError && (
          <div className="absolute bottom-3 left-3 right-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
            {loadingError}
          </div>
        )}
      </div>
    </div>
  );
}
