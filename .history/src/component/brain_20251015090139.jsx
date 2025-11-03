import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const BrainAtlas3D = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const brainGroupRef = useRef(null);
  const clippingPlaneRef = useRef(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [viewMode, setViewMode] = useState('sagittal');
  const [slicePosition, setSlicePosition] = useState(50);
  const [showLayers, setShowLayers] = useState(true);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const [modelFile, setModelFile] = useState(null);
  const isDraggingRef = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const meshesRef = useRef([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [detectedRegions, setDetectedRegions] = useState([]);

  // Color mapping for brain regions
  const regionColorMap = {
    'frontal': 0xff6b6b,
    'parietal': 0x4ecdc4,
    'temporal': 0xffd93d,
    'occipital': 0xa8e6cf,
    'cerebellum': 0xff8b94,
    'brainstem': 0xc7ceea,
    'corpus': 0xf4a261,
    'hippocampus': 0xe9c46a,
    'thalamus': 0xf4a261,
    'default': 0xcccccc
  };

  // Function to assign color based on mesh name
  const getColorForMeshName = (name) => {
    const lowerName = name.toLowerCase();
    for (const [key, color] of Object.entries(regionColorMap)) {
      if (lowerName.includes(key)) {
        return color;
      }
    }
    return regionColorMap.default;
  };

  // Load GLB/GLTF model
  const loadBrainModel = async (file) => {
    try {
      setLoadingError(null);
      setModelLoaded(false);

      // Create a URL for the file
      const url = URL.createObjectURL(file);

      // Dynamically import GLTFLoader
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      
      const loader = new GLTFLoader();
      
      loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          
          // Clear previous model
          if (brainGroupRef.current) {
            brainGroupRef.current.children.forEach(child => {
              if (child.geometry) child.geometry.dispose();
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach(mat => mat.dispose());
                } else {
                  child.material.dispose();
                }
              }
            });
            brainGroupRef.current.clear();
          }

          meshesRef.current = [];
          const regions = [];

          // Process all meshes in the model
          model.traverse((child) => {
            if (child.isMesh) {
              const color = getColorForMeshName(child.name);
              
              // Create new material with clipping support
              const material = new THREE.MeshPhongMaterial({
                color: color,
                transparent: true,
                opacity: 0.88,
                shininess: 60,
                side: THREE.DoubleSide,
                clippingPlanes: [clippingPlaneRef.current],
              });

              child.material = material;
              child.userData = {
                name: child.name || Region ${meshesRef.current.length},
                originalColor: color,
                originalOpacity: 0.88
              };

              meshesRef.current.push(child);
              regions.push({
                name: child.name || Region ${meshesRef.current.length},
                color: color
              });
            }
          });

          // Center and scale the model
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 5 / maxDim;

          model.position.sub(center);
          model.scale.setScalar(scale);

          brainGroupRef.current.add(model);
          setDetectedRegions(regions);
          setModelLoaded(true);
          URL.revokeObjectURL(url);
        },
        (progress) => {
          console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
        },
        (error) => {
          console.error('Error loading model:', error);
          setLoadingError('Failed to load model. Please check the file format.');
          URL.revokeObjectURL(url);
        }
      );
    } catch (error) {
      console.error('Error:', error);
      setLoadingError('Error loading model: ' + error.message);
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 3, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, 3, -5);
    scene.add(directionalLight2);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
    scene.add(hemisphereLight);

    // Create brain group
    const brainGroup = new THREE.Group();
    scene.add(brainGroup);
    brainGroupRef.current = brainGroup;

    // Clipping plane
    const clippingPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
    clippingPlaneRef.current = clippingPlane;
    renderer.clippingPlanes = [clippingPlane];
    renderer.localClippingEnabled = true;

    // Grid helper
    const gridHelper = new THREE.GridHelper(10, 10, 0xcccccc, 0xeeeeee);
    gridHelper.position.y = -3;
    scene.add(gridHelper);

    // Mouse interactions
    const onMouseDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right) return;
      
      isDraggingRef.current = true;
      previousMouseRef.current = { x: event.clientX, y: event.clientY };
    };

    const onMouseMove = (event) => {
      if (!isDraggingRef.current) return;

      const deltaX = event.clientX - previousMouseRef.current.x;
      const deltaY = event.clientY - previousMouseRef.current.y;

      setRotation(prev => ({
        x: prev.x + deltaY * 0.005,
        y: prev.y + deltaX * 0.005
      }));

      previousMouseRef.current = { x: event.clientX, y: event.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onClick = (event) => {
      if (Math.abs(event.clientX - previousMouseRef.current.x) > 5) return;

      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(brainGroup.children, true);
      if (intersects.length > 0 && intersects[0].object.userData.name) {
        setSelectedPart(intersects[0].object.userData.name);
      } else {
        setSelectedPart(null);
      }
    };

    // Mouse wheel zoom
    const onWheel = (event) => {
      event.preventDefault();
      const delta = event.deltaY * 0.01;
      const distance = camera.position.length();
      const newDistance = Math.max(5, Math.min(30, distance + delta));
      camera.position.setLength(newDistance);
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('wheel', onWheel);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('click', onClick);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('wheel', onWheel);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('click', onClick);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setModelFile(file);
      loadBrainModel(file);
    }
  };

  // Update brain rotation
  useEffect(() => {
    if (brainGroupRef.current) {
      brainGroupRef.current.rotation.x = rotation.x;
      brainGroupRef.current.rotation.y = rotation.y;
    }
  }, [rotation]);

  // Update selection highlighting
  useEffect(() => {
    meshesRef.current.forEach((mesh) => {
      if (mesh.userData.name === selectedPart) {
        mesh.material.emissive = new THREE.Color(0x555555);
        mesh.material.opacity = 1;
        mesh.material.emissiveIntensity = 0.4;
      } else {
        mesh.material.emissive = new THREE.Color(0x000000);
        mesh.material.opacity = showLayers ? 0.88 : 0.25;
        mesh.material.emissiveIntensity = 0;
      }
    });
  }, [selectedPart, showLayers]);

  // Update clipping plane
  useEffect(() => {
    if (!clippingPlaneRef.current) return;

    const plane = clippingPlaneRef.current;
    const normalizedPos = (slicePosition - 50) / 50;
    const pos = normalizedPos * 5;

    switch (viewMode) {
      case 'sagittal':
        plane.normal.set(1, 0, 0);
        plane.constant = -pos;
        break;
      case 'horizontal':
        plane.normal.set(0, 1, 0);
        plane.constant = -pos;
        break;
      case 'coronal':
        plane.normal.set(0, 0, 1);
        plane.constant = -pos;
        break;
    }
  }, [viewMode, slicePosition]);

  const resetView = () => {
    setRotation({ x: 0, y: 0 });
    setSlicePosition(50);
    setSelectedPart(null);
    setViewMode('sagittal');
    if (cameraRef.current) {
      cameraRef.current.position.set(10, 3, 10);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  const setCameraView = (view) => {
    if (!cameraRef.current) return;
    const cam = cameraRef.current;
    
    switch(view) {
      case 'front':
        cam.position.set(0, 0, 12);
        break;
      case 'back':
        cam.position.set(0, 0, -12);
        break;
      case 'left':
        cam.position.set(-12, 0, 0);
        break;
      case 'right':
        cam.position.set(12, 0, 0);
        break;
      case 'top':
        cam.position.set(0, 12, 0);
        break;
      case 'bottom':
        cam.position.set(0, -12, 0);
        break;
      default:
        cam.position.set(10, 3, 10);
    }
    cam.lookAt(0, 0, 0);
    setRotation({ x: 0, y: 0 });
  };

  const filteredRegions = detectedRegions.filter(region =>
    region.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="w-96 bg-white shadow-2xl overflow-y-auto">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <h1 className="text-3xl font-bold mb-2">Brain Atlas 3D</h1>
          <p className="text-blue-100 text-sm">Interactive Neuroanatomy Explorer</p>
        </div>

        <div className="p-6 space-y-6">
          {/* File Upload */}
          {!modelLoaded && (
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
              <svg className="w-16 h-16 mx-auto text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <label className="cursor-pointer">
                <span className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block">
                  Upload Brain Model
                </span>
                <input
                  type="file"
                  accept=".glb,.gltf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-600 mt-3">
                Accepts GLB or GLTF files
              </p>
              {loadingError && (
                <p className="text-red-600 text-sm mt-2">{loadingError}</p>
              )}
            </div>
          )}

          {modelLoaded && (
            <>
              {/* Model Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-green-900 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Model Loaded Successfully
                </p>
                <p className="text-xs text-green-700 mt-1">
                  {detectedRegions.length} regions detected
                </p>
                <button
                  onClick={() => {
                    setModelLoaded(false);
                    setDetectedRegions([]);
                    setSelectedPart(null);
                  }}
                  className="text-xs text-green-600 hover:text-green-700 mt-2 underline"
                >
                  Load different model
                </button>
              </div>

              {/* Search */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Find area in the brain
                </label>
                <input
                  type="text"
                  placeholder="Search brain regions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Selected Region */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Selected Region
                </label>
                <div className={`p-4 rounded-lg border-2 transition-all ${
                  selectedPart 
                    ? 'bg-blue-50 border-blue-300' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className="text-gray-800 font-semibold text-sm break-words">
                    {selectedPart || 'Click on a brain region'}
                  </p>
                  {selectedPart && (
                    <button
                      onClick={() => setSelectedPart(null)}
                      className="text-xs text-blue-600 hover:text-blue-700 mt-2"
                    >
                      Clear selection
                    </button>
                  )}
                </div>
              </div>

              {/* Brain Regions List */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-3">
                  Brain Regions ({filteredRegions.length})
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {filteredRegions.map((region, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPart(region.name)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedPart === region.name
                          ? 'bg-blue-100 border-2 border-blue-500 shadow-md'
                          : 'bg-gray-50 border-2 border-transparent hover:border-gray-300 hover:shadow'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded shadow-sm flex-shrink-0"
                          style={{ backgroundColor: #${region.color.toString(16).padStart(6, '0')} }}
                        />
                        <span className="text-sm font-medium text-gray-800 break-words">
                          {region.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slice Controls */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-3">
                  Slice Position
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={slicePosition}
                    onChange={(e) => setSlicePosition(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: linear-gradient(to right, #3b82f6 ${slicePosition}%, #e5e7eb ${slicePosition}%)
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span className="font-semibold text-blue-600">{slicePosition}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* View Mode */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-3">
                  Slice Orientation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['sagittal', 'horizontal', 'coronal'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`py-3 px-2 rounded-lg text-xs font-bold uppercase transition-all ${
                        viewMode === mode
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Camera Views */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-3">
                  Camera Views
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['front', 'back', 'left', 'right', 'top', 'bottom'].map((view) => (
                    <button
                      key={view}
                      onClick={() => setCameraView(view)}
                      className="py-2 px-2 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-all"
                    >
                      {view.charAt(0).toUpperCase() + view.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Options */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={showLayers}
                    onChange={(e) => setShowLayers(e.target.checked)}
                    className="w-6 h-6 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Show Full Opacity
                  </span>
                </label>
              </div>

              {/* Reset Button */}
              <button
                onClick={resetView}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white py-4 rounded-lg font-bold hover:from-gray-800 hover:to-gray-900 transition-all shadow-lg"
              >
                Reset View
              </button>
            </>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-blue-900 mb-2">💡 Quick Tips</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Upload a GLB/GLTF brain model</li>
              <li>• Drag to rotate the brain</li>
              <li>• Scroll to zoom in/out</li>
              <li>• Click regions to select them</li>
              <li>• Use slider to slice through</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3D Viewer */}
      <div className="flex-1 relative">
        <div ref={mountRef} className="w-full h-full" />
        
        {!modelLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p className="text-xl font-semibold text-gray-400">Upload a 3D Brain Model to Begin</p>
              <p className="text-sm text-gray-500 mt-2">GLB or GLTF format</p>
            </div>
          </div>
        )}
        
        {modelLoaded && (
          <>
            {/* Info overlay */}
            <div className="absolute top-6 right-6 bg-white/95 backdrop-blur rounded-xl shadow-2xl p-5 max-w-xs">
              <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Interactive Controls
              </p>
              <div className="space-y-2 text-xs text-gray-600">
                <p><strong>Rotate:</strong> Click and drag</p>
                <p><strong>Zoom:</strong> Mouse wheel</p>
                <p><strong>Select:</strong> Click on regions</p>
                <p><strong>Slice:</strong> Use sidebar slider</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BrainAtlas3D;