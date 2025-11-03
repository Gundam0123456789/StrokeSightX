import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Brain Atlas — single-file demo inspired by Neurotorium
 * - Left: Search + Region list
 * - Center: 3D brain viewer (GLB/GLTF upload)
 * - Right: Region details with tabs (Overview / Function / Arterial Supply / Lesion)
 * - Deep-link via #slug (e.g., #postcentral-gyrus)
 *
 * Notes:
 * - This is a self-contained demo. Drop it into your React app and render <BrainAtlas />
 * - Uses Three.js (npm i three). Drag to rotate, wheel to zoom, click to select mesh.
 * - Works even without a model (right panel still shows educational content).
 */

export default function Brain() {
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [selectedSlug, setSelectedSlug] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");

  // Minimal catalog (you can expand this list)
  const catalog = useMemo(() => (
    [
      {
        slug: "postcentral-gyrus",
        title: "Postcentral Gyrus (Primary Somatosensory Cortex)",
        lobe: "Parietal lobe",
        color: 0x4ecdc4,
        overview: `Located posterior to the central sulcus. Cytoarchitectonic areas Brodmann 3, 1, 2. Receives dense input from the ventral posterolateral (VPL) and ventral posteromedial (VPM) nuclei of the thalamus. Somatotopic representation (sensory homunculus).`,
        function: `Primary processing of tactile, proprioceptive, vibration, and joint position senses. Critical for conscious perception and localization of body sensations.`,
        arterial: `Lateral aspect mainly by the superior division of the Middle Cerebral Artery (MCA). Medial aspect (paracentral lobule) by the Anterior Cerebral Artery (ACA).`,
        lesion: `Contralateral loss/reduction of discriminative touch, vibration sense, and proprioception; astereognosis; sensory extinction/neglect if non-dominant parietal involvement.`,
        refs: [
          { label: "Brodmann 3/1/2", url: "https://en.wikipedia.org/wiki/Primary_somatosensory_cortex" },
        ]
      },
      {
        slug: "precentral-gyrus",
        title: "Precentral Gyrus (Primary Motor Cortex)",
        lobe: "Frontal lobe",
        color: 0xff6b6b,
        overview: `Anterior to the central sulcus. Brodmann area 4. Corticospinal and corticobulbar output neurons (Betz cells). Somatotopic motor homunculus.`,
        function: `Voluntary motor initiation and force control for contralateral body musculature.`,
        arterial: `MCA (lateral convexity) and ACA (medial leg area).`,
        lesion: `Contralateral weakness/paresis with UMN signs; face/hand more with MCA, leg more with ACA territory.`,
        refs: [
          { label: "Primary motor cortex", url: "https://en.wikipedia.org/wiki/Primary_motor_cortex" },
        ]
      },
      {
        slug: "superior-temporal-gyrus",
        title: "Superior Temporal Gyrus (incl. Primary Auditory Cortex)",
        lobe: "Temporal lobe",
        color: 0xffd93d,
        overview: `Contains Heschl's gyrus (A1). Wernicke's area is posterior STG in the dominant hemisphere.`,
        function: `Auditory processing; language comprehension (dominant hemisphere posterior STG).`,
        arterial: `MCA temporal branches.`,
        lesion: `Receptive (Wernicke) aphasia if dominant posterior STG; auditory agnosia or deficits in sound localization.`,
        refs: [
          { label: "Superior temporal gyrus", url: "https://en.wikipedia.org/wiki/Superior_temporal_gyrus" },
        ]
      },
    ]
  ), []);

  // Filtered region list
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(r =>
      r.title.toLowerCase().includes(q) || r.slug.includes(q) || r.lobe.toLowerCase().includes(q)
    );
  }, [catalog, search]);

  // Hash deep-linking
  useEffect(() => {
    const fromHash = () => {
      const slug = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      if (!slug) return;
      const found = catalog.find((c) => c.slug === slug);
      if (found) {
        setSelectedSlug(found.slug);
        setSelectedTitle(found.title);
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [catalog]);

  const onSelect = (slug) => {
    const found = catalog.find(c => c.slug === slug);
    if (found) {
      window.location.hash = slug; // update hash for deep-link
      setSelectedSlug(slug);
      setSelectedTitle(found.title);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
          <div className="text-xl font-bold">Brain Atlas</div>
          <div className="hidden md:block text-sm text-slate-500">Neuroanatomy explorer (demo)</div>
          <div className="ml-auto flex items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search regions, lobes…"
              className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: list */}
        <aside className="lg:col-span-3">
          <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-3">
            <div className="text-xs font-semibold uppercase text-slate-500 px-1 pb-2">Regions</div>
            <div className="space-y-1 max-h-[70vh] overflow-auto pr-1">
              {filtered.map((r) => (
                <button
                  key={r.slug}
                  onClick={() => onSelect(r.slug)}
                  className={`w-full text-left rounded-xl px-3 py-2 border transition ${
                    selectedSlug === r.slug
                      ? "border-blue-500 bg-blue-50 shadow"
                      : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: "#" + r.color.toString(16).padStart(6, "0") }}
                    />
                    <div>
                      <div className="text-sm font-medium leading-tight">{r.title}</div>
                      <div className="text-[11px] text-slate-500">{r.lobe}</div>
                    </div>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="text-sm text-slate-500 px-2 py-6">No matches.</div>
              )}
            </div>
          </div>
        </aside>

        {/* Center: 3D viewer */}
        <section className="lg:col-span-5">
          <BrainViewer selectedSlug={selectedSlug} catalog={catalog} />
        </section>

        {/* Right: details */}
        <aside className="lg:col-span-4">
          <RegionDetails
            catalog={catalog}
            selectedSlug={selectedSlug}
            selectedTitle={selectedTitle}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </aside>
      </main>
    </div>
  );
}

/** 3D viewer component (GLB/GLTF upload + click/highlight) */
/** 3D viewer component (auto-load external GLB URL + upload optional) */
function BrainViewer({ selectedSlug, catalog }) {
  const mountRef = useRef(null);
  const meshesRef = useRef([]);      // all meshes
  const groupRef = useRef(null);
  const camRef = useRef(null);
  const rendererRef = useRef(null);
  const planeRef = useRef(null);

  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState("");
  const [slice, setSlice] = useState(50);
  const [view, setView] = useState("sagittal");

  const dragging = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });
  const rot = useRef({ x: 0, y: 0 });

  // 🟠 External default model URL (เปลี่ยน URL นี้เป็นของคุณได้)
  // ตัวอย่างจาก Khronos glTF Sample Models (สาธารณะ)
  const DEFAULT_MODEL_URL =
    "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BrainStem/glTF-Binary/BrainStem.glb";

  // Simple name→color mapping by slug hit
  const colorForName = (name) => {
    const lower = (name || "").toLowerCase();
    const hit = catalog.find((c) => lower.includes(c.slug.replace(/-/g, " ")));
    return hit ? hit.color : 0xcccccc;
  };

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

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const d1 = new THREE.DirectionalLight(0xffffff, 0.8);
    d1.position.set(5, 6, 5); scene.add(d1);
    const d2 = new THREE.DirectionalLight(0xffffff, 0.3);
    d2.position.set(-5, 2, -5); scene.add(d2);

    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    const plane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
    planeRef.current = plane; // attach later when user slices

    // Interactions
    const onDown = (e) => {
      dragging.current = true;
      prevMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e) => {
      if (!dragging.current) return;
      const dx = e.clientX - prevMouse.current.x;
      const dy = e.clientY - prevMouse.current.y;
      rot.current = { x: rot.current.x + dy * 0.005, y: rot.current.y + dx * 0.005 };
      group.rotation.x = rot.current.x;
      group.rotation.y = rot.current.y;
      prevMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => { dragging.current = false; };
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
    const animate = () => { raf = requestAnimationFrame(animate); renderer.render(scene, camera); };
    animate();

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

  // Attach / update clipping when user adjusts
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

  // ⛳️ Helper: Load by URL (fetch → blob → File → reuse handleUpload)
  const handleUploadFromURL = async (url) => {
    try {
      setLoadingError("");
      setModelLoaded(false);

      // fetch with CORS allowed
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
      const blob = await res.blob();
      await handleUpload(new File([blob], "external.glb", { type: "model/gltf-binary" }));
    } catch (e) {
      console.error("[GLB URL] load error", e);
      setLoadingError("Failed to load external model. Check CORS/URL availability.");
    }
  };

  // Load GLB/GLTF file object (used by both upload and URL)
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
          const sceneObj = gltf.scene;

          // clear previous
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

          sceneObj.traverse((child) => {
            if (child.isMesh) {
              const col = colorForName(child.name);
              const mat = new THREE.MeshPhongMaterial({
                color: col,
                transparent: true,
                opacity: 0.9,
                shininess: 60,
                side: THREE.DoubleSide,
              });
              child.material = mat;
              meshesRef.current.push(child);
            }
          });

          // center + scale + fit camera
          const box = new THREE.Box3().setFromObject(sceneObj);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z) || 1;

          sceneObj.position.sub(center);
          sceneObj.scale.setScalar(5 / maxDim);

          groupRef.current.add(sceneObj);

          // fit camera distance
          camRef.current.position.setLength(10);
          camRef.current.lookAt(0, 0, 0);

          setModelLoaded(true);
          URL.revokeObjectURL(url);
        },
        undefined,
        (err) => {
          console.error("[GLTF] load error", err);
          setLoadingError("Failed to parse GLB/GLTF. If using .gltf, ensure buffers/textures are accessible.");
        }
      );
    } catch (e) {
      console.error(e);
      setLoadingError(e.message);
    }
  };

  // Auto-load external model on mount
  useEffect(() => {
    handleUploadFromURL(DEFAULT_MODEL_URL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Highlight if selected from list
  useEffect(() => {
    const slug = selectedSlug;
    meshesRef.current.forEach((mesh) => {
      if (!mesh.material) return;
      const name = (mesh.name || "").toLowerCase();
      const matched = slug && name.includes(slug.replace(/-/g, " "));
      if (matched) {
        mesh.material.emissive = new THREE.Color(0x333333);
        mesh.material.opacity = 1;
        mesh.material.emissiveIntensity = 0.35;
      } else {
        mesh.material.emissive = new THREE.Color(0x000000);
        mesh.material.emissiveIntensity = 0;
        mesh.material.opacity = 0.9;
      }
    });
  }, [selectedSlug]);

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-0 overflow-hidden">
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
          {/* ยังอัปโหลดเองได้ */}
          <label className="text-sm px-2 py-1 border rounded-lg cursor-pointer hover:bg-slate-50">
            Upload GLB/GLTF
            <input
              type="file"
              className="hidden"
              accept=".glb,.gltf"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
          </label>
          {/* ปุ่มโหลดจาก URL ใหม่ */}
          <button
            onClick={() => handleUploadFromURL(DEFAULT_MODEL_URL)}
            className="text-sm px-2 py-1 border rounded-lg hover:bg-slate-50"
            title="Reload default model"
          >
            Reload default
          </button>
        </div>
      </div>

      <div className="relative">
        <div ref={mountRef} className="w-full" style={{ minHeight: "50vh" }} />
        {/* Diagnostics overlay */}
        <div className="absolute top-2 left-2 text-[11px] bg-white/90 border border-slate-200 rounded px-2 py-1 shadow">
          <div>Canvas: OK</div>
          <div>Model: {modelLoaded ? "Loaded" : "Not loaded"}</div>
          <div>Meshes: {meshesRef.current.length}</div>
          <div>View: {view} | Slice: {slice}%</div>
        </div>
        {!modelLoaded && !loadingError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-slate-400 font-semibold">Loading default brain model…</div>
              <div className="text-xs text-slate-500">From external URL</div>
            </div>
          </div>
        )}
        {loadingError && (
          <div className="absolute bottom-3 left-3 right-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
            {loadingError}
          </div>
        )}
      </div>
    </div>
  );
}


/** Right panel with tabs and content */
function RegionDetails({ catalog, selectedSlug, selectedTitle, activeTab, setActiveTab }) {
  const region = useMemo(() => catalog.find((c) => c.slug === selectedSlug) || catalog[0], [catalog, selectedSlug]);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "function", label: "Function" },
    { key: "arterial", label: "Arterial Supply" },
    { key: "lesion", label: "Lesion" },
  ];

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-5 pt-5">
        <div className="text-[11px] uppercase tracking-wide text-slate-500">Region</div>
        <h2 className="text-xl font-semibold leading-snug mt-1">{selectedTitle || region.title}</h2>
        <div className="text-sm text-slate-500 mt-1">{region.lobe}</div>
      </div>

      <div className="mt-4 border-b border-slate-200 px-3">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-2 text-sm rounded-t-lg border-b-2 -mb-[1px] ${
                activeTab === t.key ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {activeTab === "overview" && <Paragraph text={region.overview} />}
        {activeTab === "function" && <Paragraph text={region.function} />}
        {activeTab === "arterial" && <Paragraph text={region.arterial} />}
        {activeTab === "lesion" && <Paragraph text={region.lesion} />}

        <div className="pt-2">
          <div className="text-xs font-semibold text-slate-500 uppercase">References</div>
          <ul className="list-disc ml-5 mt-1 space-y-1">
            {region.refs?.map((r) => (
              <li key={r.url}>
                <a className="text-blue-700 hover:underline" href={r.url} target="_blank" rel="noreferrer">{r.label}</a>
              </li>
            ))}
            {!region.refs?.length && <li className="text-slate-400 text-xs">No references.</li>}
          </ul>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 p-3 bg-slate-50 text-[12px] text-slate-600">
          <div className="font-semibold mb-1">Tip</div>
          You can deep-link to a region with the URL hash, e.g. <code className="px-1 bg-white rounded border">#postcentral-gyrus</code>
        </div>
      </div>
    </div>
  );
}

function Paragraph({ text }) {
  return (
    <div className="prose prose-slate max-w-none text-sm">
      <p>{text}</p>
    </div>
  );
}