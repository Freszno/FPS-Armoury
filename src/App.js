import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

const ArmoryLoadoutHub = () => {
  const [activeTab, setActiveTab] = useState('loadouts');
  const [selectedLoadout, setSelectedLoadout] = useState(0);
  const [inGame, setInGame] = useState(false);
  const [botDifficulty, setBotDifficulty] = useState('normal');
  const [botCount, setBotCount] = useState(12);
  const [gameStats, setGameStats] = useState({ score: 0, health: 100, ammo: 0, kills: 0, firingMode: 'AUTO' });
  const [isZoomed, setIsZoomed] = useState(false);
  const [currentWeapon, setCurrentWeapon] = useState('primary');
  const [isReloading, setIsReloading] = useState(false);
  const [hitMarker, setHitMarker] = useState(false);
  const [damageVignette, setDamageVignette] = useState(0);
  const mountRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);

  const primaryWeapons = {
    'M16A4': { type: 'Assault Rifle', dmg: 2.2, rate: 0.12, mag: 50, spd: 4.2, color: '#ccaa33', spread: 0.015, hasScope: true, scopeZoom: 3.5, recoil: 0.08 },
    'AK-47': { type: 'Assault Rifle', dmg: 2.4, rate: 0.11, mag: 50, spd: 4, color: '#aa8844', spread: 0.02, hasScope: true, scopeZoom: 2.5, recoil: 0.12 },
    'M249 SAW': { type: 'Light Machine Gun', dmg: 1.8, rate: 0.06, mag: 220, spd: 3.8, color: '#556677', spread: 0.025, hasScope: true, scopeZoom: 2, recoil: 0.06 },
    'MP5': { type: 'Submachine Gun', dmg: 1.3, rate: 0.04, mag: 50, spd: 3.5, color: '#333333', spread: 0.03, hasScope: true, scopeZoom: 2, recoil: 0.04 },
    'SCAR-H': { type: 'Tactical Rifle', dmg: 2.8, rate: 0.18, mag: 40, spd: 4.5, color: '#667744', spread: 0.012, hasScope: true, scopeZoom: 4, recoil: 0.1 },
    'M4A1': { type: 'Carbine', dmg: 2.1, rate: 0.13, mag: 50, spd: 4.3, color: '#555555', spread: 0.014, hasScope: true, scopeZoom: 3, recoil: 0.07 },
    'AWP Dragon Lore': { type: 'Bolt Sniper', dmg: 12, rate: 1.5, mag: 25, spd: 9, color: '#ff9900', spread: 0.001, hasScope: true, scopeZoom: 8, recoil: 0.25 },
    'Benelli M4': { type: 'Combat Shotgun', dmg: 3.5, rate: 0.5, mag: 28, spd: 2.5, color: '#2a2a2a', spread: 0.18, pellets: 8, hasScope: false, recoil: 0.15 },
    'P90': { type: 'PDW', dmg: 1.2, rate: 0.035, mag: 70, spd: 3.2, color: '#444477', spread: 0.035, hasScope: true, scopeZoom: 1.8, recoil: 0.03 },
    'Intervention': { type: 'Magnum Sniper', dmg: 13, rate: 1.8, mag: 25, spd: 10, color: '#773333', spread: 0.0005, hasScope: true, scopeZoom: 9, recoil: 0.3 },
    'Barrett M82': { type: 'Anti-Material', dmg: 15, rate: 2, mag: 30, spd: 11, color: '#555500', spread: 0, hasScope: true, scopeZoom: 10, recoil: 0.35 },
    'Steyr AUG': { type: 'Bullpup Rifle', dmg: 2.3, rate: 0.12, mag: 50, spd: 4.1, color: '#337744', spread: 0.016, hasScope: true, scopeZoom: 3.2, recoil: 0.075 },

    'Vortex QS-1': { type: 'Precision Bolt-Action', dmg: 150, rate: 1.2, mag: 5, spd: 4.8, color: '#111111', spread: 0.001, hasScope: true, scopeZoom: 6, recoil: 0.4, adsSpeed: 0.15 },
    'Cyber Shotgun': { type: 'Cyberpunk Devastator', dmg: 999, rate: 1.5, mag: 23, spd: 5, color: '#00ff88', spread: 0.05, pellets: 1, hasScope: false, recoil: 0.4, splashRadius: 8, splashDmg: 999 }
  };

  const secondaryWeapons = {
    'Combat Knife': { type: 'Melee Blade', dmg: 15, rate: 0.3, range: 3.0, color: '#cccccc', speed: 'fast', weight: 'light' },
    'Machete': { type: 'Melee Blade', dmg: 25, rate: 0.5, range: 3.5, color: '#888888', speed: 'medium', weight: 'medium' },
    'Fire Axe': { type: 'Melee Heavy', dmg: 40, rate: 1.0, range: 3.2, color: '#ff6600', speed: 'slow', weight: 'heavy' },
    'Warhammer': { type: 'Melee Heavy', dmg: 45, rate: 1.1, range: 3.0, color: '#aaaaaa', speed: 'slow', weight: 'heavy' },
    'Crowbar': { type: 'Melee Pry', dmg: 20, rate: 0.4, range: 3.1, color: '#4a4a4a', speed: 'medium', weight: 'medium' }
  };

  const scopes = {
    'Iron Sights': { zoom: 1.0, adsSpeed: 1.0, sway: 0.0, category: 'iron' },
    'Red Dot': { zoom: 1.2, adsSpeed: 0.9, sway: 0.1, category: 'low' },
    'Holographic': { zoom: 1.3, adsSpeed: 0.85, sway: 0.15, category: 'low' },
    'ACOG': { zoom: 3.0, adsSpeed: 0.7, sway: 0.2, category: 'medium' },
    'Medium Scope': { zoom: 4.0, adsSpeed: 0.6, sway: 0.25, category: 'medium' },
    'Sniper Scope': { zoom: 8.0, adsSpeed: 0.4, sway: 0.3, category: 'high' },
    'Sniper Scope': { zoom: 8.0, adsSpeed: 0.4, sway: 0.3, category: 'high' },
    'High Power Scope': { zoom: 10.0, adsSpeed: 0.3, sway: 0.35, category: 'high' },
    'Vortex Prism': { zoom: 6.0, adsSpeed: 0.2, sway: 0.1, category: 'high' }
  };

  const [loadouts, setLoadouts] = useState([
    { name: 'Loadout 1', primary: 'M16A4', primaryScope: 'ACOG', secondary: 'Combat Knife', skinColor: '#ffaa00' },
    { name: 'Cyber Devastator', primary: 'Cyber Shotgun', primaryScope: 'Iron Sights', secondary: 'Combat Knife', skinColor: '#00ff88' }
  ]);
  const skinColors = ['#2a2a2a', '#ff3366', '#00ffff', '#ffff00', '#00ff00', '#ff00ff', '#ffffff', '#ffaa00'];

  const gameInstanceRef = useRef(null);
  const weaponGroupRef = useRef(null);



  useEffect(() => {
    if (!inGame || !mountRef.current) return;

    const lo = loadouts[selectedLoadout];
    const col = lo.skinColor;
    const wp = currentWeapon === 'primary' ? primaryWeapons[lo.primary] : secondaryWeapons[lo.secondary];

    // Only initialize scene once
    if (gameInstanceRef.current) {
      // Update weapon without resetting scene
      gameInstanceRef.current.currentWeapon = currentWeapon;
      gameInstanceRef.current.wp = wp;
      gameInstanceRef.current.updateWeapon(wp, lo.primary || lo.secondary);
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    // scene.fog = new THREE.Fog(0x87ceeb, 0, 200);
    const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 3;

    // Store references for use in other useEffects
    cameraRef.current = camera;
    sceneRef.current = scene;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Enhanced lighting with better shadows and atmosphere
    scene.add(new THREE.AmbientLight(0xffffff, 0.8)); // Increased ambient for better ground visibility

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(50, 80, 50);
    dirLight.castShadow = true;
    dirLight.shadow.camera.left = -150;
    dirLight.shadow.camera.right = 150;
    dirLight.shadow.camera.top = 150;
    dirLight.shadow.camera.bottom = -150;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 200;
    scene.add(dirLight);

    // Enhanced terrain with layered textures and height variation
    const groundGeometry = new THREE.PlaneGeometry(500, 500, 50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x228B22, // Forest green for visibility
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.DoubleSide // Render from both sides
    });

    // Add subtle height variation
    const vertices = groundGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1]; // Local Y is world Z before rotation
      // Fix: modify Z (index i+2) which becomes height (Y) after rotation, 
      // OR since it's a plane, just modify Z which is 'up' relative to the plane face
      // The PlaneGeometry is on XY plane by default. Rotation -PI/2 around X makes:
      // Local X -> World X
      // Local Y -> World Z
      // Local Z -> World Y (Height)

      const vHeight = Math.sin(x * 0.05) * 0.5 + Math.cos(y * 0.05) * 0.5; // Use x and y (local coord) to vary height
      vertices[i + 2] = vHeight; // Displace along normal (Z axis)
    }
    groundGeometry.attributes.position.needsUpdate = true;
    groundGeometry.computeVertexNormals();

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Add atmospheric fog
    // scene.fog = new THREE.Fog(0x87ceeb, 50, 300); // Temporarily disabled for testing

    // Enhanced skybox with gradient
    const skyGeometry = new THREE.SphereGeometry(400, 32, 32);
    const skyMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition).y;
          gl_FragColor = vec4(mix(vec3(0.5, 0.7, 1.0), vec3(0.0, 0.4, 0.8), max(pow(max(h, 0.0), 0.8), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);

    // Add distant background elements (non-interactive)
    const createDistantHill = (x, z, scale) => {
      const hillGeometry = new THREE.ConeGeometry(scale, scale * 0.5, 8);
      const hill = new THREE.Mesh(
        hillGeometry,
        new THREE.MeshStandardMaterial({ color: 0x2d5016, roughness: 1.0 })
      );
      hill.position.set(x, scale * 0.25, z);
      hill.castShadow = false; // No shadows for distant objects
      hill.receiveShadow = false;
      scene.add(hill);
    };

    createDistantHill(-200, -200, 50);
    createDistantHill(200, 200, 45);
    createDistantHill(150, -150, 40);
    createDistantHill(-150, 150, 35);

    // Add ground clutter: rocks and grass patches
    for (let i = 0; i < 100; i++) {
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(Math.random() * 0.5 + 0.2),
        new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 })
      );
      rock.position.set(
        (Math.random() - 0.5) * 280,
        Math.random() * 0.3,
        (Math.random() - 0.5) * 280
      );
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      rock.castShadow = true;
      rock.receiveShadow = true;
      scene.add(rock);
    }

    // Grass clumps
    for (let i = 0; i < 200; i++) {
      const grass = new THREE.Mesh(
        new THREE.ConeGeometry(0.1, 0.5, 6),
        new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.8 })
      );
      grass.position.set(
        (Math.random() - 0.5) * 290,
        0.25,
        (Math.random() - 0.5) * 290
      );
      grass.rotation.set(0, Math.random() * Math.PI * 2, 0);
      grass.castShadow = true;
      grass.receiveShadow = true;
      scene.add(grass);
    }

    // Solid collision objects array
    const solidObjects = [];

    // Create realistic houses with enhanced details and wear
    const createHouse = (x, z, w, d, h) => {
      const house = new THREE.Group();

      // Main walls with wear patterns
      const walls = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({
          color: 0x8b7355,
          roughness: 0.8,
          map: new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='), // Placeholder for stucco texture
        })
      );
      walls.position.y = h / 2;
      walls.castShadow = true;
      walls.receiveShadow = true;
      house.add(walls);
      solidObjects.push({ mesh: walls, pos: { x: x, z: z }, size: { w: w, h: h, d: d } });

      // Roof with overhang
      const roofGeom = new THREE.ConeGeometry(Math.sqrt(w * w + d * d) / 1.7, h * 0.4, 4);
      const roof = new THREE.Mesh(roofGeom, new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.7,
        metalness: 0.1
      }));
      roof.position.y = h + h * 0.2;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      house.add(roof);

      // Roof overhang
      const overhang = new THREE.Mesh(
        new THREE.RingGeometry(w * 0.6, w * 0.7, 4),
        new THREE.MeshStandardMaterial({ color: 0x654321, side: THREE.DoubleSide })
      );
      overhang.position.y = h + h * 0.15;
      overhang.rotation.x = Math.PI / 2;
      overhang.rotation.y = Math.PI / 4;
      house.add(overhang);

      // Windows with frames
      for (let i = 0; i < 2; i++) {
        const frame = new THREE.Mesh(
          new THREE.PlaneGeometry(w * 0.25, h * 0.3),
          new THREE.MeshStandardMaterial({ color: 0x4a4a4a })
        );
        frame.position.set(-w * 0.25 + i * w * 0.5, h * 0.5, d / 2 + 0.02);
        house.add(frame);

        const glass = new THREE.Mesh(
          new THREE.PlaneGeometry(w * 0.2, h * 0.25),
          new THREE.MeshStandardMaterial({
            color: 0x87ceeb,
            emissive: 0xffcc88,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.8
          })
        );
        glass.position.set(-w * 0.25 + i * w * 0.5, h * 0.5, d / 2 + 0.03);
        house.add(glass);
      }

      // Door with frame
      const doorFrame = new THREE.Mesh(
        new THREE.PlaneGeometry(w * 0.3, h * 0.45),
        new THREE.MeshStandardMaterial({ color: 0x4a4a4a })
      );
      doorFrame.position.set(0, h * 0.225, d / 2 + 0.02);
      house.add(doorFrame);

      const door = new THREE.Mesh(
        new THREE.PlaneGeometry(w * 0.25, h * 0.4),
        new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.9 })
      );
      door.position.set(0, h * 0.2, d / 2 + 0.03);
      house.add(door);

      // Chimney with smoke effect
      const chimney = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.15, h * 0.6, d * 0.15),
        new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 })
      );
      chimney.position.set(w * 0.3, h + h * 0.3, 0);
      chimney.castShadow = true;
      house.add(chimney);

      // Add dirt stains near ground
      const dirt = new THREE.Mesh(
        new THREE.PlaneGeometry(w * 0.8, h * 0.3),
        new THREE.MeshStandardMaterial({
          color: 0x3a2a1a,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide
        })
      );
      dirt.position.set(0, h * 0.15, d / 2 + 0.01);
      house.add(dirt);

      house.position.set(x, 0, z);
      scene.add(house);
    };

    // Create bigger neighborhood
    createHouse(-60, -60, 12, 10, 8);
    createHouse(60, -60, 14, 11, 9);
    createHouse(-60, 60, 11, 12, 8);
    createHouse(60, 60, 13, 10, 8.5);
    createHouse(-30, 0, 10, 9, 7);
    createHouse(30, 0, 11, 10, 7.5);
    createHouse(0, -40, 12, 11, 8);
    createHouse(0, 40, 11, 10, 7.5);
    createHouse(-80, 0, 13, 12, 9);
    createHouse(80, 0, 12, 11, 8);

    // Fences with collision
    for (let i = -120; i <= 120; i += 10) {
      const fence = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2, 8), new THREE.MeshStandardMaterial({ color: 0x654321 }));
      fence.position.set(i, 1, -140);
      fence.castShadow = true;
      scene.add(fence);
      solidObjects.push({ mesh: fence, pos: { x: i, z: -140 }, size: { w: 0.3, h: 2, d: 8 } });
    }

    // Enhanced props for cover and environmental detail
    const createBarrel = (x, y, z) => {
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.8, 1.5, 12),
        new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.9, metalness: 0.1 })
      );
      barrel.position.set(x, y, z);
      barrel.castShadow = true;
      barrel.receiveShadow = true;
      scene.add(barrel);
      solidObjects.push({ mesh: barrel, pos: { x: x, z: z }, size: { w: 1.6, h: 1.5, d: 1.6 } });

      // Barrel rings
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.82, 0.05, 8, 12),
          new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.8 })
        );
        ring.position.set(x, y - 0.5 + i * 0.5, z);
        scene.add(ring);
      }
    };

    const createSandbag = (x, y, z) => {
      const sandbag = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.6, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 1.0 })
      );
      sandbag.position.set(x, y, z);
      sandbag.castShadow = true;
      sandbag.receiveShadow = true;
      scene.add(sandbag);
      solidObjects.push({ mesh: sandbag, pos: { x: x, z: z }, size: { w: 1.2, h: 0.6, d: 0.8 } });
    };

    // Add barrels and sandbags for cover
    createBarrel(-40, 0.75, -30);
    createBarrel(40, 0.75, 30);
    createBarrel(0, 0.75, -60);
    createSandbag(-35, 0.3, -25);
    createSandbag(-32, 0.3, -25);
    createSandbag(35, 0.3, 25);
    createSandbag(38, 0.3, 25);

    // Add utility poles and cables
    const createUtilityPole = (x, z) => {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.15, 6, 8),
        new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.9 })
      );
      pole.position.set(x, 3, z);
      pole.castShadow = true;
      scene.add(pole);

      // Cross arms
      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.1, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x654321 })
      );
      arm.position.set(x, 5, z);
      scene.add(arm);

      // Cables
      const cableGeom = new THREE.CylinderGeometry(0.02, 0.02, 20, 6);
      const cable = new THREE.Mesh(cableGeom, new THREE.MeshStandardMaterial({ color: 0x333333 }));
      cable.position.set(x + 1, 5, z);
      cable.rotation.z = Math.PI / 6;
      scene.add(cable);
    };

    createUtilityPole(-50, -40);
    createUtilityPole(50, 40);

    // Add trash piles and debris
    for (let i = 0; i < 20; i++) {
      const trash = new THREE.Mesh(
        new THREE.BoxGeometry(Math.random() * 0.5 + 0.2, Math.random() * 0.3 + 0.1, Math.random() * 0.5 + 0.2),
        new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 1.0 })
      );
      trash.position.set(
        (Math.random() - 0.5) * 200,
        Math.random() * 0.2,
        (Math.random() - 0.5) * 200
      );
      trash.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      scene.add(trash);
    }

    // Street lights
    [-70, -40, -10, 10, 40, 70].forEach(pos => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 8), new THREE.MeshStandardMaterial({ color: 0x4a4a4a, metalness: 0.8 }));
      pole.position.set(pos, 4, -50);
      pole.castShadow = true;
      scene.add(pole);
      const light = new THREE.PointLight(0xffffaa, 3, 25);
      light.position.set(pos, 8, -50);
      light.castShadow = true;
      scene.add(light);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.3), new THREE.MeshStandardMaterial({ color: 0xffffaa, emissive: 0xffffaa, emissiveIntensity: 2 }));
      bulb.position.set(pos, 8, -50);
      scene.add(bulb);
    });

    // Unique detailed weapon models for each gun
    if (weaponGroupRef.current) {
      camera.remove(weaponGroupRef.current);
    }
    const wg = new THREE.Group();
    const wpName = currentWeapon === 'primary' ? lo.primary : lo.secondary;

    const createWeaponModel = (name) => {
      const group = new THREE.Group();

      if (currentWeapon === 'secondary') {
        // MELEE WEAPONS
        if (name === 'Combat Knife') {
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.015), new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.98, roughness: 0.02 }));
          blade.position.set(0.32, 0.05, -0.3);
          group.add(blade);
          const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.2, 8), new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.3, roughness: 0.7 }));
          handle.position.set(0.32, -0.18, -0.3);
          group.add(handle);
        } else if (name === 'Machete') {
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.02), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.95, roughness: 0.05 }));
          blade.position.set(0.35, 0.1, -0.3);
          group.add(blade);
          const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.25, 8), new THREE.MeshStandardMaterial({ color: 0x8b4513, metalness: 0.2, roughness: 0.8 }));
          handle.position.set(0.35, -0.25, -0.3);
          group.add(handle);
        } else if (name === 'Fire Axe') {
          const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.85, 8), new THREE.MeshStandardMaterial({ color: 0x654321, metalness: 0.1, roughness: 0.9 }));
          handle.position.set(0.3, 0.05, -0.3);
          group.add(handle);
          const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 0.12), new THREE.MeshStandardMaterial({ color: 0xff6600, metalness: 0.8, roughness: 0.2 }));
          head.position.set(0.3, 0.65, -0.3);
          group.add(head);
        } else if (name === 'Warhammer') {
          const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.8, 8), new THREE.MeshStandardMaterial({ color: 0x5a4a3a, metalness: 0.15, roughness: 0.85 }));
          handle.position.set(0.3, 0, -0.3);
          group.add(handle);
          const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.38, 0.28), new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.75, roughness: 0.25 }));
          head.position.set(0.3, 0.6, -0.3);
          group.add(head);
        } else if (name === 'Crowbar') {
          const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.75, 8), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.75, roughness: 0.25 }));
          shaft.position.set(0.3, 0.02, -0.3);
          group.add(shaft);
          const claw = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.05), new THREE.MeshStandardMaterial({ color: 0x3a3a3a, metalness: 0.8, roughness: 0.2 }));
          claw.position.set(0.35, 0.5, -0.3);
          group.add(claw);
        }
      } else {
        // PRIMARY FIREARMS - Each with unique design
        if (name === 'M16A4') {
          // Cold hammer-forged steel barrel with parkerized finish
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.032, 0.5, 16), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a, // Parkerized dark gray
            metalness: 0.95,
            roughness: 0.15,
            emissive: 0x111111, // Slight heat discoloration
            emissiveIntensity: 0.1
          }));
          barrel.rotation.z = Math.PI / 2;
          barrel.position.set(0.3, -0.15, -1);
          group.add(barrel);

          // Polymer handguard with scratches and dust embedded
          const handGuard = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.4), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a, // Dark polymer
            metalness: 0.1,
            roughness: 0.8,
            emissive: 0x080808, // Dust embedded
            emissiveIntensity: 0.05
          }));
          handGuard.position.set(0.3, -0.18, -0.65);
          group.add(handGuard);

          // Upper receiver with edge wear
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 1.05), new THREE.MeshStandardMaterial({
            color: new THREE.Color(col),
            metalness: 0.85,
            roughness: 0.25,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.02
          }));
          receiver.position.set(0.3, -0.2, -0.5);
          group.add(receiver);

          // Carry handle with wear
          const carryHandle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.5), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.8,
            roughness: 0.4,
            emissive: 0x050505,
            emissiveIntensity: 0.03
          }));
          carryHandle.position.set(0.3, 0.12, -0.5);
          group.add(carryHandle);

          // Brass deflector scuffed with carbon residue
          const brassDeflector = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 0.02), new THREE.MeshStandardMaterial({
            color: 0x8b7355, // Brass color
            metalness: 0.9,
            roughness: 0.6,
            emissive: 0x2a2a2a, // Carbon residue
            emissiveIntensity: 0.1
          }));
          brassDeflector.position.set(0.35, -0.1, -0.45);
          group.add(brassDeflector);

          // Selector switch with edge wear
          const selectorSwitch = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.04), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.7,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          selectorSwitch.position.set(0.38, -0.08, -0.3);
          group.add(selectorSwitch);

          // Charging handle with wear
          const chargingHandle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.12), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.85,
            roughness: 0.5,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          chargingHandle.position.set(0.35, 0.02, -0.25);
          group.add(chargingHandle);

          // Magazine release with wear
          const magRelease = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.03, 8), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.6,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          magRelease.position.set(0.25, -0.35, -0.4);
          group.add(magRelease);

          // Magazine with feed-lip wear and spring tension realism
          const magazine = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.12), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.7,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.03
          }));
          magazine.position.set(0.3, -0.52, -0.38);
          group.add(magazine);

          // Magazine feed lips with wear
          const feedLips = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.02, 0.13), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.8,
            roughness: 0.5,
            emissive: 0x050505,
            emissiveIntensity: 0.04
          }));
          feedLips.position.set(0.3, -0.68, -0.38);
          group.add(feedLips);

          // Stock with moderate recoil wear
          const stock = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.14, 0.32), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.2,
            roughness: 0.9,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.02
          }));
          stock.position.set(0.3, -0.16, 0.15);
          group.add(stock);

          // Muzzle device with minimal heat discoloration
          const muzzleDevice = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.04, 0.08, 16), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.85,
            roughness: 0.3,
            emissive: 0x111111,
            emissiveIntensity: 0.08
          }));
          muzzleDevice.rotation.z = Math.PI / 2;
          muzzleDevice.position.set(0.3, -0.15, -1.28);
          group.add(muzzleDevice);
        } else if (name === 'AK-47') {
          // Stamped steel receiver with visible rivets and weld seams
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.23, 1.02), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a, // Blued steel worn to bare metal on edges
            metalness: 0.85,
            roughness: 0.35,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          receiver.position.set(0.3, -0.2, -0.5);
          group.add(receiver);

          // Visible rivets on receiver
          const rivet1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.02, 8), new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            metalness: 0.9,
            roughness: 0.4
          }));
          rivet1.position.set(0.35, -0.1, -0.3);
          group.add(rivet1);

          const rivet2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.02, 8), new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            metalness: 0.9,
            roughness: 0.4
          }));
          rivet2.position.set(0.25, -0.1, -0.7);
          group.add(rivet2);

          // Weld seams (rough machining)
          const weldSeam = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.005, 0.03), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.95,
            roughness: 0.6,
            emissive: 0x080808,
            emissiveIntensity: 0.05
          }));
          weldSeam.position.set(0.3, -0.08, -0.5);
          group.add(weldSeam);

          // Barrel with heavy carbon buildup near muzzle
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.036, 0.52, 16), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.95,
            roughness: 0.15,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.08
          }));
          barrel.rotation.z = Math.PI / 2;
          barrel.position.set(0.3, -0.12, -1.02);
          group.add(barrel);

          // Gas tube with carbon buildup
          const gasTube = new THREE.Mesh(new THREE.CylinderGeometry(0.023, 0.021, 0.45, 12), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.3,
            emissive: 0x1a1a1a,
            emissiveIntensity: 0.1
          }));
          gasTube.rotation.z = Math.PI / 2;
          gasTube.position.set(0.32, 0.08, -0.75);
          group.add(gasTube);

          // Curved magazine (rough machining, imperfect symmetry)
          const curvedMag = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.4, 0.14), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.7,
            roughness: 0.5,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          curvedMag.position.set(0.28, -0.5, -0.35);
          curvedMag.rotation.z = -0.25;
          group.add(curvedMag);

          // Front sight (worn)
          const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.06), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.75,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          frontSight.position.set(0.32, 0.12, -1.15);
          group.add(frontSight);

          // Rear sight (worn)
          const rearSight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.06), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.75,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          rearSight.position.set(0.32, 0.12, -0.1);
          group.add(rearSight);

          // Wooden furniture - dented, oil-soaked, chipped varnish
          const woodyStock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.4), new THREE.MeshStandardMaterial({
            color: 0x4a2a0a, // Oil-soaked wood
            metalness: 0.05,
            roughness: 0.95,
            emissive: 0x1a0a0a,
            emissiveIntensity: 0.02
          }));
          woodyStock.position.set(0.3, -0.14, 0.15);
          group.add(woodyStock);

          // Wooden handguard - chipped varnish
          const handGuard = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.12, 0.35), new THREE.MeshStandardMaterial({
            color: 0x5a3a1a,
            metalness: 0.1,
            roughness: 0.9,
            emissive: 0x2a1a0a,
            emissiveIntensity: 0.03
          }));
          handGuard.position.set(0.3, -0.18, -0.65);
          group.add(handGuard);

          // Dust cover with rough machining
          const dustCover = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.6), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.35,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          dustCover.position.set(0.3, 0.08, -0.5);
          group.add(dustCover);

          // Heavy carbon buildup near muzzle
          const carbonBuildup = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.05, 16), new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.9,
            roughness: 0.8,
            emissive: 0x1a1a1a,
            emissiveIntensity: 0.15
          }));
          carbonBuildup.rotation.z = Math.PI / 2;
          carbonBuildup.position.set(0.3, -0.12, -1.25);
          group.add(carbonBuildup);
        } else if (name === 'M249 SAW') {
          // Heavy steel receiver with overbuilt appearance
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.24, 1.08), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.88,
            roughness: 0.22,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          receiver.position.set(0.3, -0.2, -0.5);
          group.add(receiver);

          // Heavy steel barrel with heat discoloration
          const heavyBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.034, 0.55, 16), new THREE.MeshStandardMaterial({
            color: 0x3a2a1a, // Heat-discolored steel
            metalness: 0.97,
            roughness: 0.08,
            emissive: 0x2a1a0a,
            emissiveIntensity: 0.12
          }));
          heavyBarrel.rotation.z = Math.PI / 2;
          heavyBarrel.position.set(0.3, -0.14, -1.05);
          group.add(heavyBarrel);

          // Barrel shroud with scratches
          const barrelShroud = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.043, 0.5, 16), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.75,
            roughness: 0.3,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          barrelShroud.rotation.z = Math.PI / 2;
          barrelShroud.position.set(0.3, -0.14, -1.0);
          group.add(barrelShroud);

          // Large magazine with dents and wear
          const largeMag = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.2, 32), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.7,
            roughness: 0.35,
            emissive: 0x080808,
            emissiveIntensity: 0.03
          }));
          largeMag.rotation.z = Math.PI / 2;
          largeMag.position.set(0.3, -0.52, -0.28);
          group.add(largeMag);

          // Bipod with dirt-packed joints
          const bipod = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.15), new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            metalness: 0.7,
            roughness: 0.3,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.06
          }));
          bipod.position.set(0.3, -0.36, -0.8);
          group.add(bipod);

          // Dirt-packed bipod joints
          const bipodJoint1 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), new THREE.MeshStandardMaterial({
            color: 0x2a1a0a, // Dirt-packed
            metalness: 0.3,
            roughness: 0.9,
            emissive: 0x1a0a0a,
            emissiveIntensity: 0.08
          }));
          bipodJoint1.position.set(0.25, -0.36, -0.8);
          group.add(bipodJoint1);

          const bipodJoint2 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), new THREE.MeshStandardMaterial({
            color: 0x2a1a0a,
            metalness: 0.3,
            roughness: 0.9,
            emissive: 0x1a0a0a,
            emissiveIntensity: 0.08
          }));
          bipodJoint2.position.set(0.35, -0.36, -0.8);
          group.add(bipodJoint2);

          // Top handle with wear
          const topHandle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.15), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.6,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          topHandle.position.set(0.32, 0.15, -0.5);
          group.add(topHandle);

          // Stock with overbuilt mechanical stress appearance
          const stock = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.35), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.25,
            roughness: 0.85,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          stock.position.set(0.3, -0.16, 0.2);
          group.add(stock);

          // Visible belt-fed rounds
          for (let i = 0; i < 6; i++) {
            const round = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.08, 8), new THREE.MeshStandardMaterial({
              color: 0xd4af37, // Brass casing
              metalness: 0.9,
              roughness: 0.2,
              emissive: 0x2a2a0a,
              emissiveIntensity: 0.05
            }));
            round.position.set(0.3 + (i * 0.02 - 0.05), -0.45, -0.28);
            round.rotation.x = Math.PI / 2;
            group.add(round);
          }

          // Feed tray with scratches
          const feedTray = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.2), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.85,
            roughness: 0.6,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          feedTray.position.set(0.3, 0.02, -0.35);
          group.add(feedTray);
        } else if (name === 'MP5') {
          // Polymer frame with embedded dirt and scratches
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 0.85), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a, // Polymer with embedded dirt
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          receiver.position.set(0.3, -0.2, -0.45);
          group.add(receiver);

          // Threaded barrel with suppressor mounting
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.029, 0.38, 16), new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.98,
            roughness: 0.05,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          barrel.rotation.z = Math.PI / 2;
          barrel.position.set(0.3, -0.15, -0.85);
          group.add(barrel);

          // Threaded muzzle for suppressor
          const muzzleThread = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.032, 0.03, 16), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.95,
            roughness: 0.1,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          muzzleThread.rotation.z = Math.PI / 2;
          muzzleThread.position.set(0.3, -0.15, -1.02);
          group.add(muzzleThread);

          // Curved magazine with follower wear
          const mag = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.32, 0.13), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.75,
            roughness: 0.35,
            emissive: 0x080808,
            emissiveIntensity: 0.03
          }));
          mag.position.set(0.3, -0.48, -0.32);
          group.add(mag);

          // Magazine follower with wear
          const magFollower = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.12), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.6,
            roughness: 0.7,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          magFollower.position.set(0.3, -0.35, -0.32);
          group.add(magFollower);

          // Folding stock with mechanical wear
          const foldingStock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.25), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          foldingStock.position.set(0.3, -0.18, 0.15);
          group.add(foldingStock);

          // Stock hinge with wear
          const stockHinge = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 8), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.5,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          stockHinge.position.set(0.3, -0.12, 0.05);
          stockHinge.rotation.x = Math.PI / 2;
          group.add(stockHinge);

          // Trigger group with carbon buildup
          const triggerGroup = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.12), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.85,
            roughness: 0.3,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.08
          }));
          triggerGroup.position.set(0.3, -0.28, -0.2);
          group.add(triggerGroup);

          // Tactical rail with mounting hardware wear
          const rail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.08), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.7,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          rail.position.set(0.3, 0.02, -0.45);
          group.add(rail);

          // Rail mounting screws with wear
          const railScrew1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.04, 6), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          railScrew1.position.set(0.25, 0.02, -0.45);
          group.add(railScrew1);

          const railScrew2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.04, 6), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          railScrew2.position.set(0.35, 0.02, -0.45);
          group.add(railScrew2);
        } else if (name === 'SCAR-H') {
          // Modular upper and lower receivers with precision machining
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.98), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          receiver.position.set(0.3, -0.2, -0.5);
          group.add(receiver);

          // Upper receiver with precision machining marks
          const upperReceiver = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.18, 0.6), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.95,
            roughness: 0.15,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          upperReceiver.position.set(0.3, -0.08, -0.5);
          group.add(upperReceiver);

          // Free-floating barrel with carbon fiber handguard
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.038, 0.48, 16), new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.98,
            roughness: 0.05,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          barrel.rotation.z = Math.PI / 2;
          barrel.position.set(0.3, -0.15, -1);
          group.add(barrel);

          // Carbon fiber handguard
          const handguard = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.35, 16), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a, // Carbon fiber texture
            metalness: 0.1,
            roughness: 0.9,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.02
          }));
          handguard.rotation.z = Math.PI / 2;
          handguard.position.set(0.3, -0.15, -0.75);
          group.add(handguard);

          // Magazine well with reinforced construction
          const magwell = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.35, 0.16), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.7,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.03
          }));
          magwell.position.set(0.3, -0.48, -0.35);
          group.add(magwell);

          // Adjustable stock with wear on adjustment mechanisms
          const adjustableStock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.4), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.3,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          adjustableStock.position.set(0.3, -0.18, 0.2);
          group.add(adjustableStock);

          // Stock adjustment lever with wear
          const stockLever = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 0.06), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.5,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          stockLever.position.set(0.3, -0.12, 0.35);
          group.add(stockLever);

          // Ambidextrous controls with selector switch wear
          const selectorSwitch = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.08), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.85,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          selectorSwitch.position.set(0.32, -0.08, -0.2);
          group.add(selectorSwitch);

          // Integrated rail system with mounting points
          const picatinnyRail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.1), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.7,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          picatinnyRail.position.set(0.3, 0.02, -0.5);
          group.add(picatinnyRail);

          // Rail mounting screws
          for (let i = 0; i < 4; i++) {
            const railScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.03, 6), new THREE.MeshStandardMaterial({
              color: 0x2a2a2a,
              metalness: 0.9,
              roughness: 0.3,
              emissive: 0x0a0a0a,
              emissiveIntensity: 0.05
            }));
            railScrew.position.set(0.3 + (i * 0.04 - 0.06), 0.02, -0.5);
            group.add(railScrew);
          }

          // Heavy-duty construction with reinforced areas
          const reinforcement = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.08, 1.0), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.95,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.05
          }));
          reinforcement.position.set(0.3, -0.04, -0.5);
          group.add(reinforcement);
        } else if (name === 'M4A1') {
          // Flat-top receiver with picatinny rail
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.21, 0.9), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          receiver.position.set(0.3, -0.2, -0.45);
          group.add(receiver);

          // Picatinny rail on top
          const picatinnyRail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.6), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.7,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          picatinnyRail.position.set(0.3, 0.02, -0.45);
          group.add(picatinnyRail);

          // Carbine-length gas system with adjustable regulator
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.031, 0.4, 16), new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.98,
            roughness: 0.05,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          barrel.rotation.z = Math.PI / 2;
          barrel.position.set(0.3, -0.15, -0.92);
          group.add(barrel);

          // Gas block with adjustable regulator
          const gasBlock = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.06, 12), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.3,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          gasBlock.rotation.z = Math.PI / 2;
          gasBlock.position.set(0.3, -0.08, -0.65);
          group.add(gasBlock);

          // Muzzle break
          const muzzleBreak = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.039, 0.07, 16), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.85,
            roughness: 0.2,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          muzzleBreak.rotation.z = Math.PI / 2;
          muzzleBreak.position.set(0.3, -0.15, -1.1);
          group.add(muzzleBreak);

          // M4-style handguards with heat shields
          const keymod = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.35), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.6,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          keymod.position.set(0.3, -0.18, -0.6);
          group.add(keymod);

          // Heat shields on handguard
          for (let i = 0; i < 3; i++) {
            const heatShield = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.02, 0.08), new THREE.MeshStandardMaterial({
              color: 0x3a3a3a,
              metalness: 0.8,
              roughness: 0.3,
              emissive: 0x0a0a0a,
              emissiveIntensity: 0.04
            }));
            heatShield.position.set(0.3, -0.12 + (i * 0.04), -0.6 + (i * 0.08 - 0.08));
            group.add(heatShield);
          }

          // Collapsible stock with buffer tube wear
          const compactStock2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.13, 0.3), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.25,
            roughness: 0.85,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          compactStock2.position.set(0.3, -0.16, 0.1);
          group.add(compactStock2);

          // Buffer tube with wear
          const bufferTube = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.022, 0.25, 12), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          bufferTube.position.set(0.3, -0.16, 0.25);
          group.add(bufferTube);

          // RIS rail system with multiple mounting points
          const risRail1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.08), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.7,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          risRail1.position.set(0.3, -0.08, -0.6);
          group.add(risRail1);

          const risRail2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.08), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.7,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          risRail2.position.set(0.3, -0.28, -0.6);
          group.add(risRail2);

          // Magazine with follower wear
          const magazine2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 0.11), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.7,
            roughness: 0.35,
            emissive: 0x080808,
            emissiveIntensity: 0.03
          }));
          magazine2.position.set(0.3, -0.5, -0.32);
          group.add(magazine2);

          // Forward assist
          const forwardAssist = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.04, 8), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.05
          }));
          forwardAssist.position.set(0.32, -0.08, -0.25);
          forwardAssist.rotation.x = Math.PI / 2;
          group.add(forwardAssist);

          // Ejection port cover
          const ejectionCover = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.04), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          ejectionCover.position.set(0.35, -0.12, -0.15);
          group.add(ejectionCover);
        } else if (name === 'Cyber Shotgun') {
          // Cyberpunk shotgun with aggressive angular design
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.26, 1.1), new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.95, roughness: 0.1 }));
          receiver.position.set(0.3, -0.2, -0.55);
          group.add(receiver);

          // Neon energy coils on receiver
          const neonCoil1 = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 8, 16), new THREE.MeshBasicMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 2 }));
          neonCoil1.position.set(0.35, 0.05, -0.3);
          neonCoil1.rotation.y = Math.PI / 4;
          group.add(neonCoil1);

          const neonCoil2 = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 8, 16), new THREE.MeshBasicMaterial({ color: 0xff00ff, emissive: 0xff00ff, emissiveIntensity: 2 }));
          neonCoil2.position.set(0.35, -0.05, -0.7);
          neonCoil2.rotation.y = Math.PI / 4;
          group.add(neonCoil2);

          // Plasma-charged barrel vents (wide aggressive barrel)
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.062, 0.65, 16), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.98, roughness: 0.05 }));
          barrel.rotation.z = Math.PI / 2;
          barrel.position.set(0.3, -0.15, -1.1);
          group.add(barrel);

          // Barrel vent details (cyber vents)
          for (let i = 0; i < 4; i++) {
            const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 8), new THREE.MeshStandardMaterial({ color: 0x00ff88, metalness: 0.8, roughness: 0.2, emissive: 0x00ff88, emissiveIntensity: 0.8 }));
            vent.rotation.z = Math.PI / 2;
            vent.position.set(0.3, -0.08 + i * 0.05, -1.35);
            group.add(vent);
          }

          // Holographic ammo counter (glowing display)
          const ammoCounter = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.12), new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.7 }));
          ammoCounter.position.set(0.32, 0.12, -0.5);
          group.add(ammoCounter);

          // Sharp angular front sight
          const frontSightCyber = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.08), new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.9, roughness: 0.1 }));
          frontSightCyber.position.set(0.36, 0.1, -1.25);
          group.add(frontSightCyber);

          // Reinforced chrome stock (angular)
          const cyberStock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.4), new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.95, roughness: 0.05 }));
          cyberStock.position.set(0.3, -0.16, 0.2);
          group.add(cyberStock);

          // Exposed energy compartment
          const energyComp = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 0.3), new THREE.MeshStandardMaterial({ color: 0xff00ff, metalness: 0.7, roughness: 0.3, emissive: 0xff00ff, emissiveIntensity: 1.2 }));
          energyComp.position.set(0.3, -0.38, -0.4);
          group.add(energyComp);

          // Charging fins (industrial design)
          for (let i = 0; i < 3; i++) {
            const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.08), new THREE.MeshStandardMaterial({ color: 0x00ff88, metalness: 0.85, roughness: 0.15 }));
            fin.position.set(0.2 + i * 0.08, -0.35, -0.25);
            group.add(fin);
          }
        } else if (name === 'AWP Dragon Lore') {
          // Bullpup design with integrated scope rail
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 1.25), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          receiver.position.set(0.3, -0.2, -0.6);
          group.add(receiver);

          // Integrated scope rail
          const scopeRail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.8), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.7,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          scopeRail.position.set(0.3, 0.03, -0.6);
          group.add(scopeRail);

          // Heavy fluted barrel with suppressor threads
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.025, 1.0, 24), new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.99,
            roughness: 0.02,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          barrel.rotation.z = Math.PI / 2;
          barrel.position.set(0.3, -0.15, -1.3);
          group.add(barrel);

          // Fluting on barrel
          for (let i = 0; i < 6; i++) {
            const flute = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.03, 0.9), new THREE.MeshStandardMaterial({
              color: 0x0a0a0a,
              metalness: 0.99,
              roughness: 0.02,
              emissive: 0x080808,
              emissiveIntensity: 0.04
            }));
            flute.position.set(0.3 + Math.cos(i * Math.PI / 3) * 0.028, -0.15, -1.3 + Math.sin(i * Math.PI / 3) * 0.028);
            flute.rotation.z = i * Math.PI / 3;
            group.add(flute);
          }

          // Suppressor threads
          const suppressorThreads = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.028, 0.05, 16), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.95,
            roughness: 0.1,
            emissive: 0x080808,
            emissiveIntensity: 0.05
          }));
          suppressorThreads.rotation.z = Math.PI / 2;
          suppressorThreads.position.set(0.3, -0.15, -1.55);
          group.add(suppressorThreads);

          // Adjustable bipod with quick-detach mounts
          const bipodLeg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.006, 0.2, 8), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.3,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          bipodLeg1.position.set(0.28, -0.35, -1.4);
          bipodLeg1.rotation.z = -0.2;
          group.add(bipodLeg1);

          const bipodLeg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.006, 0.2, 8), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.3,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          bipodLeg2.position.set(0.32, -0.35, -1.4);
          bipodLeg2.rotation.z = 0.2;
          group.add(bipodLeg2);

          // Quick-detach bipod mount
          const bipodMount = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.04, 8), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.95,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          bipodMount.position.set(0.3, -0.15, -1.2);
          group.add(bipodMount);

          // Reinforced receiver with recoil mitigation
          const reinforcement = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.08, 1.3), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.95,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.05
          }));
          reinforcement.position.set(0.3, -0.04, -0.6);
          group.add(reinforcement);

          // High-precision trigger mechanism
          const triggerMech = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.08), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.3,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          triggerMech.position.set(0.3, -0.28, -0.3);
          group.add(triggerMech);

          // Magazine with precision follower
          const magazine = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.15, 0.08), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.03
          }));
          magazine.position.set(0.3, -0.35, -0.4);
          group.add(magazine);

          // Precision magazine follower
          const magFollower = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.07), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.7,
            roughness: 0.6,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          magFollower.position.set(0.3, -0.28, -0.4);
          group.add(magFollower);

          // Scope with high magnification
          const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.5, 20), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.85,
            roughness: 0.2,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          scope.rotation.z = Math.PI / 2;
          scope.position.set(0.3, 0.08, -0.5);
          group.add(scope);

          // Scope lens
          const scopeLens = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 20), new THREE.MeshStandardMaterial({
            color: 0x1a5aaa,
            metalness: 0.95,
            roughness: 0.02,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.1
          }));
          scopeLens.rotation.z = Math.PI / 2;
          scopeLens.position.set(0.3, 0.08, -0.8);
          group.add(scopeLens);
        } else if (name === 'Benelli M4') {
          // Gas-operated semi-automatic shotgun receiver
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.95), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          receiver.position.set(0.3, -0.2, -0.48);
          group.add(receiver);

          // Smoothbore barrel
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.08, 0.5, 16), new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.97,
            roughness: 0.1,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          barrel.rotation.z = Math.PI / 2;
          barrel.position.set(0.3, -0.15, -0.95);
          group.add(barrel);

          // Pistol grip with textured surface
          const pistolGrip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.12), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.3,
            roughness: 0.9,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          pistolGrip.position.set(0.3, -0.38, -0.2);
          group.add(pistolGrip);

          // Textured grip surface
          for (let i = 0; i < 8; i++) {
            const texture = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.01, 0.08), new THREE.MeshStandardMaterial({
              color: 0x2a2a2a,
              metalness: 0.4,
              roughness: 0.95,
              emissive: 0x0a0a0a,
              emissiveIntensity: 0.03
            }));
            texture.position.set(0.3, -0.38 + (i * 0.02), -0.2);
            group.add(texture);
          }

          // Extended magazine tube
          const tubeMag = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.55, 16), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.8,
            roughness: 0.25,
            emissive: 0x080808,
            emissiveIntensity: 0.03
          }));
          tubeMag.rotation.z = Math.PI / 2;
          tubeMag.position.set(0.3, -0.32, -0.7);
          group.add(tubeMag);

          // Magazine tube cap
          const tubeCap = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.03, 16), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.85,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          tubeCap.rotation.z = Math.PI / 2;
          tubeCap.position.set(0.3, -0.32, -0.95);
          group.add(tubeCap);

          // Ghost ring sights
          const frontSight = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.08, 8), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.8,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          frontSight.position.set(0.3, -0.08, -1.0);
          group.add(frontSight);

          const rearSight = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.04), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.8,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          rearSight.position.set(0.3, -0.08, -0.2);
          group.add(rearSight);

          // Pump-action slide with wear
          const pumpSlide = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.15), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.85,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          pumpSlide.position.set(0.3, -0.08, -0.6);
          group.add(pumpSlide);

          // Slide release with wear
          const slideRelease = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.04), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.5,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          slideRelease.position.set(0.32, -0.12, -0.35);
          group.add(slideRelease);

          // Reinforced polymer stock
          const polymerStock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.4), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.2,
            roughness: 0.9,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          polymerStock.position.set(0.3, -0.18, 0.15);
          group.add(polymerStock);

          // Stock reinforcement
          const stockReinforce = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.42), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.05
          }));
          stockReinforce.position.set(0.3, -0.04, 0.15);
          group.add(stockReinforce);

          // Loading port
          const loadingPort = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.04), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.7,
            roughness: 0.6,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          loadingPort.position.set(0.3, -0.28, -0.48);
          group.add(loadingPort);
        } else if (name === 'P90') {
          // Bullpup design with polymer construction
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.19, 0.75), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a, // Polymer base
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          receiver.position.set(0.3, -0.2, -0.4);
          group.add(receiver);

          // Top-mounted magazine (horizontal)
          const topMag = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.18, 32), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.7,
            roughness: 0.35,
            emissive: 0x080808,
            emissiveIntensity: 0.03
          }));
          topMag.rotation.z = Math.PI / 2;
          topMag.position.set(0.3, 0.05, -0.4);
          group.add(topMag);

          // Magazine window (transparent)
          const magWindow = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.15), new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            metalness: 0.1,
            roughness: 0.9,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          magWindow.position.set(0.3, 0.08, -0.4);
          group.add(magWindow);

          // Integrated barrel with suppressor threads
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.027, 0.33, 16), new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.98,
            roughness: 0.05,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          barrel.rotation.z = Math.PI / 2;
          barrel.position.set(0.3, -0.15, -0.8);
          group.add(barrel);

          // Suppressor threads
          const suppressorThreads = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.03, 16), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.95,
            roughness: 0.1,
            emissive: 0x080808,
            emissiveIntensity: 0.05
          }));
          suppressorThreads.rotation.z = Math.PI / 2;
          suppressorThreads.position.set(0.3, -0.15, -0.95);
          group.add(suppressorThreads);

          // Integrated reflex sight
          const reflexSight = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.04), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.8,
            roughness: 0.3,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          reflexSight.position.set(0.3, 0.08, -0.2);
          group.add(reflexSight);

          // Reflex sight lens
          const sightLens = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.01), new THREE.MeshStandardMaterial({
            color: 0x2a5aaa,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.1
          }));
          sightLens.position.set(0.3, 0.08, -0.18);
          group.add(sightLens);

          // Ambidextrous controls - left side
          const leftTrigger = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.04), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.85,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          leftTrigger.position.set(0.26, -0.28, -0.25);
          group.add(leftTrigger);

          // Ambidextrous controls - right side
          const rightTrigger = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.04), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.85,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          rightTrigger.position.set(0.34, -0.28, -0.25);
          group.add(rightTrigger);

          // Ergonomic pistol grip
          const pistolGrip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.1), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.3,
            roughness: 0.9,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          pistolGrip.position.set(0.3, -0.36, -0.15);
          group.add(pistolGrip);

          // Grip texture
          for (let i = 0; i < 6; i++) {
            const gripTexture = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.01, 0.08), new THREE.MeshStandardMaterial({
              color: 0x2a2a2a,
              metalness: 0.4,
              roughness: 0.95,
              emissive: 0x0a0a0a,
              emissiveIntensity: 0.03
            }));
            gripTexture.position.set(0.3, -0.36 + (i * 0.02), -0.15);
            group.add(gripTexture);
          }

          // Metal reinforcements
          const metalReinforce1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.77), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.95,
            roughness: 0.3,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          metalReinforce1.position.set(0.3, -0.08, -0.4);
          group.add(metalReinforce1);

          const metalReinforce2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.35), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.95,
            roughness: 0.3,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          metalReinforce2.position.set(0.3, -0.28, -0.4);
          group.add(metalReinforce2);

          // Forward grip
          const forwardGrip = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.15, 8), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.4,
            roughness: 0.8,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          forwardGrip.position.set(0.3, -0.25, -0.65);
          group.add(forwardGrip);
        } else if (name === 'Intervention') {
          // Bolt-action sniper rifle receiver
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.21, 1.3), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          receiver.position.set(0.3, -0.2, -0.65);
          group.add(receiver);

          // Heavy match-grade barrel
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.029, 1.05, 24), new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.99,
            roughness: 0.03,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          barrel.rotation.z = Math.PI / 2;
          barrel.position.set(0.3, -0.15, -1.35);
          group.add(barrel);

          // Barrel fluting for weight reduction
          for (let i = 0; i < 8; i++) {
            const flute = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.025, 0.95), new THREE.MeshStandardMaterial({
              color: 0x0a0a0a,
              metalness: 0.99,
              roughness: 0.03,
              emissive: 0x080808,
              emissiveIntensity: 0.04
            }));
            flute.position.set(0.3 + Math.cos(i * Math.PI / 4) * 0.032, -0.15, -1.35 + Math.sin(i * Math.PI / 4) * 0.032);
            flute.rotation.z = i * Math.PI / 4;
            group.add(flute);
          }

          // Adjustable stock with cheek rest
          const adjustableStock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.45), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.3,
            roughness: 0.9,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          adjustableStock.position.set(0.3, -0.18, 0.25);
          group.add(adjustableStock);

          // Cheek rest
          const cheekRest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.15), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.4,
            roughness: 0.8,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          cheekRest.position.set(0.3, -0.08, 0.35);
          group.add(cheekRest);

          // Stock adjustment mechanism
          const stockAdjust = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 8), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          stockAdjust.position.set(0.3, -0.12, 0.45);
          stockAdjust.rotation.x = Math.PI / 2;
          group.add(stockAdjust);

          // High-magnification scope
          const scope2 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.55, 20), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.85,
            roughness: 0.2,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          scope2.rotation.z = Math.PI / 2;
          scope2.position.set(0.3, 0.12, -0.55);
          group.add(scope2);

          // Scope lens
          const scopeLens = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 20), new THREE.MeshStandardMaterial({
            color: 0x1a5aaa,
            metalness: 0.95,
            roughness: 0.02,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.1
          }));
          scopeLens.rotation.z = Math.PI / 2;
          scopeLens.position.set(0.3, 0.12, -0.8);
          group.add(scopeLens);

          // Bipod mounting points
          const bipodMount1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.04, 8), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          bipodMount1.position.set(0.28, -0.35, -1.4);
          group.add(bipodMount1);

          const bipodMount2 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.04, 8), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          bipodMount2.position.set(0.32, -0.35, -1.4);
          group.add(bipodMount2);

          // Precision trigger mechanism
          const triggerMech = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.06), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.3,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          triggerMech.position.set(0.3, -0.28, -0.35);
          group.add(triggerMech);

          // Bolt handle
          const boltHandle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.12), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.85,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          boltHandle.position.set(0.35, -0.08, -0.45);
          boltHandle.rotation.z = Math.PI / 6;
          group.add(boltHandle);

          // Magazine
          const magazine = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.08), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.03
          }));
          magazine.position.set(0.3, -0.32, -0.45);
          group.add(magazine);

          // Scope rail
          const scopeRail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.6), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.7,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          scopeRail.position.set(0.3, 0.04, -0.65);
          group.add(scopeRail);
        } else if (name === 'Barrett M82') {
          // .50 BMG anti-materiel rifle receiver
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 1.35), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          receiver.position.set(0.3, -0.2, -0.68);
          group.add(receiver);

          // Massive recoil mitigation system
          const recoilPad = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.2), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.4,
            roughness: 0.9,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          recoilPad.position.set(0.3, -0.18, 0.45);
          group.add(recoilPad);

          // Heavy fluted barrel
          const heavyBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.035, 1.15, 24), new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.99,
            roughness: 0.02,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          heavyBarrel.rotation.z = Math.PI / 2;
          heavyBarrel.position.set(0.3, -0.15, -1.4);
          group.add(heavyBarrel);

          // Barrel fluting
          for (let i = 0; i < 12; i++) {
            const flute = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.03, 1.05), new THREE.MeshStandardMaterial({
              color: 0x0a0a0a,
              metalness: 0.99,
              roughness: 0.02,
              emissive: 0x080808,
              emissiveIntensity: 0.04
            }));
            flute.position.set(0.3 + Math.cos(i * Math.PI / 6) * 0.038, -0.15, -1.4 + Math.sin(i * Math.PI / 6) * 0.038);
            flute.rotation.z = i * Math.PI / 6;
            group.add(flute);
          }

          // Muzzle brake
          const muzzleBrake = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.048, 0.15, 16), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.15,
            emissive: 0x080808,
            emissiveIntensity: 0.05
          }));
          muzzleBrake.rotation.z = Math.PI / 2;
          muzzleBrake.position.set(0.3, -0.15, -1.8);
          group.add(muzzleBrake);

          // Bipod with quick-detach mounts
          const bipodLeg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.01, 0.25, 8), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          bipodLeg1.position.set(0.27, -0.4, -1.5);
          bipodLeg1.rotation.z = -0.3;
          group.add(bipodLeg1);

          const bipodLeg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.01, 0.25, 8), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          bipodLeg2.position.set(0.33, -0.4, -1.5);
          bipodLeg2.rotation.z = 0.3;
          group.add(bipodLeg2);

          // Quick-detach bipod mount
          const bipodMount = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 8), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.95,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          bipodMount.position.set(0.3, -0.15, -1.25);
          group.add(bipodMount);

          // High-magnification scope
          const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 20), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.85,
            roughness: 0.2,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          scope.rotation.z = Math.PI / 2;
          scope.position.set(0.3, 0.12, -0.6);
          group.add(scope);

          // Scope lens
          const scopeLens = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 20), new THREE.MeshStandardMaterial({
            color: 0x1a5aaa,
            metalness: 0.95,
            roughness: 0.02,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.1
          }));
          scopeLens.rotation.z = Math.PI / 2;
          scopeLens.position.set(0.3, 0.12, -0.9);
          group.add(scopeLens);

          // Reinforced receiver
          const reinforcement = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 1.4), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.95,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.05
          }));
          reinforcement.position.set(0.3, -0.04, -0.68);
          group.add(reinforcement);

          // Magazine
          const magazine = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.12), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.03
          }));
          magazine.position.set(0.3, -0.38, -0.45);
          group.add(magazine);

          // Bolt handle
          const boltHandle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.15), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.85,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          boltHandle.position.set(0.36, -0.08, -0.5);
          boltHandle.rotation.z = Math.PI / 4;
          group.add(boltHandle);

          // Carrying handle
          const carryHandle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.1), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          carryHandle.position.set(0.3, 0.08, -0.2);
          group.add(carryHandle);
        } else if (name === 'Steyr AUG') {
          // Bullpup assault rifle design
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.155, 0.22, 0.92), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          receiver.position.set(0.3, -0.2, -0.48);
          group.add(receiver);

          // Integrated optical sight
          const opticalSight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.06), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.8,
            roughness: 0.3,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          opticalSight.position.set(0.3, 0.08, -0.25);
          group.add(opticalSight);

          // Sight lens
          const sightLens = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.01), new THREE.MeshStandardMaterial({
            color: 0x2a5aaa,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.1
          }));
          sightLens.position.set(0.3, 0.08, -0.22);
          group.add(sightLens);

          // Barrel
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.033, 0.44, 16), new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.98,
            roughness: 0.05,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          barrel.rotation.z = Math.PI / 2;
          barrel.position.set(0.3, -0.15, -0.9);
          group.add(barrel);

          // Transparent polymer magazine
          const augMag = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.34, 0.14), new THREE.MeshStandardMaterial({
            color: 0x4a4a4a, // Semi-transparent polymer
            metalness: 0.1,
            roughness: 0.9,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          augMag.position.set(0.3, -0.48, -0.35);
          group.add(augMag);

          // Magazine follower visible through transparent polymer
          const magFollower = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.02, 0.12), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.6,
            roughness: 0.7,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          magFollower.position.set(0.3, -0.35, -0.35);
          group.add(magFollower);

          // Ambidextrous controls
          const leftTrigger = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.04), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.85,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          leftTrigger.position.set(0.26, -0.28, -0.2);
          group.add(leftTrigger);

          const rightTrigger = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.04), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.85,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          rightTrigger.position.set(0.34, -0.28, -0.2);
          group.add(rightTrigger);

          // Modular rail system
          const rail1 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.08), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.7,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          rail1.position.set(0.3, 0.02, -0.48);
          group.add(rail1);

          const rail2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.08), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.7,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          rail2.position.set(0.3, -0.08, -0.48);
          group.add(rail2);

          // Folding stock
          const foldingStock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.25), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          foldingStock.position.set(0.3, -0.18, 0.2);
          group.add(foldingStock);

          // Stock hinge
          const stockHinge = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 8), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.5,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          stockHinge.position.set(0.3, -0.12, 0.05);
          stockHinge.rotation.x = Math.PI / 2;
          group.add(stockHinge);

          // Bullpup trigger mechanism
          const triggerMech = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.08), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.3,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          triggerMech.position.set(0.3, -0.28, -0.15);
          group.add(triggerMech);

          // Carrying handle
          const carryHandle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.08), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          carryHandle.position.set(0.3, 0.08, -0.1);
          group.add(carryHandle);

          // Forward handguard
          const handguard = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.3, 16), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.6,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          handguard.rotation.z = Math.PI / 2;
          handguard.position.set(0.3, -0.15, -0.65);
          group.add(handguard);
        }
      }

      return group;
    };

    wg.add(createWeaponModel(wpName));

    const mf = new THREE.Mesh(new THREE.SphereGeometry(0.15), new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0 }));
    mf.position.set(0.3, -0.15, -1.1);
    wg.add(mf);

    camera.add(wg);
    weaponGroupRef.current = wg;
    scene.add(camera);

    const enemies = [];
    const projectiles = [];
    const particles = [];
    const speeds = { easy: 0.05, normal: 0.08, hard: 0.12, insane: 0.15 };

    const createBot = () => {
      const bot = new THREE.Group();

      // Humanoid scale
      const scale = 1.2;

      // Human-like body proportions
      // Feet (with shoes)
      const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.25 * scale, 0.15 * scale, 0.4 * scale), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9 }));
      leftFoot.position.set(-0.15 * scale, -0.85 * scale, 0.05 * scale);
      leftFoot.castShadow = true;
      bot.add(leftFoot);

      const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.25 * scale, 0.15 * scale, 0.4 * scale), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9 }));
      rightFoot.position.set(0.15 * scale, -0.85 * scale, 0.05 * scale);
      rightFoot.castShadow = true;
      bot.add(rightFoot);

      // Lower legs (calves)
      const leftCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.14 * scale, 0.5 * scale, 8), new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.8 }));
      leftCalf.position.set(-0.15 * scale, -0.45 * scale, 0);
      leftCalf.castShadow = true;
      bot.add(leftCalf);

      const rightCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.14 * scale, 0.5 * scale, 8), new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.8 }));
      rightCalf.position.set(0.15 * scale, -0.45 * scale, 0);
      rightCalf.castShadow = true;
      bot.add(rightCalf);

      // Thighs
      const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.16 * scale, 0.14 * scale, 0.55 * scale, 8), new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.7 }));
      leftThigh.position.set(-0.15 * scale, -0.05 * scale, 0);
      leftThigh.castShadow = true;
      bot.add(leftThigh);

      const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.16 * scale, 0.14 * scale, 0.55 * scale, 8), new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.7 }));
      rightThigh.position.set(0.15 * scale, -0.05 * scale, 0);
      rightThigh.castShadow = true;
      bot.add(rightThigh);

      // Pelvis/Hips
      const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.35 * scale, 0.2 * scale, 0.25 * scale), new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.8 }));
      pelvis.position.set(0, 0.25 * scale, 0);
      pelvis.castShadow = true;
      bot.add(pelvis);

      // Torso/Chest
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.25 * scale, 0.3 * scale, 0.7 * scale, 8), new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.6 }));
      torso.position.set(0, 0.75 * scale, 0);
      torso.castShadow = true;
      bot.add(torso);

      // Shirt/Jacket
      const shirt = new THREE.Mesh(new THREE.CylinderGeometry(0.28 * scale, 0.32 * scale, 0.65 * scale, 8), new THREE.MeshStandardMaterial({ color: 0x2a4a8a, roughness: 0.8 }));
      shirt.position.set(0, 0.75 * scale, 0);
      shirt.castShadow = true;
      bot.add(shirt);

      // Arms
      const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.09 * scale, 0.4 * scale, 6), new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.8 }));
      leftUpperArm.position.set(-0.35 * scale, 0.65 * scale, 0);
      leftUpperArm.castShadow = true;
      bot.add(leftUpperArm);

      const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.09 * scale, 0.4 * scale, 6), new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.8 }));
      rightUpperArm.position.set(0.35 * scale, 0.65 * scale, 0);
      rightUpperArm.castShadow = true;
      bot.add(rightUpperArm);

      const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.07 * scale, 0.08 * scale, 0.35 * scale, 6), new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.8 }));
      leftForearm.position.set(-0.35 * scale, 0.35 * scale, 0);
      leftForearm.castShadow = true;
      bot.add(leftForearm);

      const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.07 * scale, 0.08 * scale, 0.35 * scale, 6), new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.8 }));
      rightForearm.position.set(0.35 * scale, 0.35 * scale, 0);
      rightForearm.castShadow = true;
      bot.add(rightForearm);

      // Hands
      const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.08 * scale, 6, 6), new THREE.MeshStandardMaterial({ color: 0xD2B48C, roughness: 0.9 }));
      leftHand.position.set(-0.35 * scale, 0.15 * scale, 0);
      leftHand.castShadow = true;
      bot.add(leftHand);

      const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.08 * scale, 6, 6), new THREE.MeshStandardMaterial({ color: 0xD2B48C, roughness: 0.9 }));
      rightHand.position.set(0.35 * scale, 0.15 * scale, 0);
      rightHand.castShadow = true;
      bot.add(rightHand);

      // Neck
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.09 * scale, 0.15 * scale, 6), new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.8 }));
      neck.position.set(0, 1.25 * scale, 0);
      neck.castShadow = true;
      bot.add(neck);

      // Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.18 * scale, 12, 12), new THREE.MeshStandardMaterial({ color: 0xD2B48C, roughness: 0.7 }));
      head.position.set(0, 1.45 * scale, 0);
      head.castShadow = true;
      bot.add(head);

      // Hair
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.19 * scale, 8, 8), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9 }));
      hair.position.set(0, 1.5 * scale, 0);
      hair.scale.set(1, 0.8, 1);
      hair.castShadow = true;
      bot.add(hair);

      // Eyes
      const eyeGeom = new THREE.SphereGeometry(0.02 * scale);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
      leftEye.position.set(-0.06 * scale, 1.45 * scale, 0.16 * scale);
      bot.add(leftEye);
      const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
      rightEye.position.set(0.06 * scale, 1.45 * scale, 0.16 * scale);
      bot.add(rightEye);

      // Mouth (simple line)
      const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.04 * scale, 0.01 * scale, 0.01 * scale), new THREE.MeshBasicMaterial({ color: 0x000000 }));
      mouth.position.set(0, 1.35 * scale, 0.18 * scale);
      bot.add(mouth);

      // Simple clothing details
      // Belt
      const belt = new THREE.Mesh(new THREE.TorusGeometry(0.18 * scale, 0.02 * scale, 8, 16), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9 }));
      belt.position.set(0, 0.45 * scale, 0);
      belt.rotation.x = Math.PI / 2;
      bot.add(belt);

      // Pants
      const pants = new THREE.Mesh(new THREE.CylinderGeometry(0.26 * scale, 0.28 * scale, 0.8 * scale, 8), new THREE.MeshStandardMaterial({ color: 0x1a1a4a, roughness: 0.8 }));
      pants.position.set(0, -0.2 * scale, 0);
      bot.add(pants);

      // Health bar background
      const healthBarBg = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2 * scale, 0.15 * scale),
        new THREE.MeshBasicMaterial({ color: 0x330000 })
      );
      healthBarBg.position.set(0, 2.0 * scale, 0);
      healthBarBg.name = 'healthBarBg';
      bot.add(healthBarBg);

      // Health bar foreground
      const healthBarFg = new THREE.Mesh(
        new THREE.PlaneGeometry(1.0 * scale, 0.13 * scale),
        new THREE.MeshBasicMaterial({ color: 0x00ff00 })
      );
      healthBarFg.position.set(0, 2.0 * scale, 0.01);
      healthBarFg.name = 'healthBarFg';
      healthBarFg.scale.x = 1;
      bot.add(healthBarFg);

      const ang = Math.random() * Math.PI * 2;
      bot.position.set(Math.cos(ang) * 60, 0, Math.sin(ang) * 60);
      bot.maxHealth = 25;
      bot.health = 25;
      bot.spd = speeds[botDifficulty] * 1.5; // Increased speed by 50%
      bot.pathOffset = new THREE.Vector3((Math.random() - 0.5) * 10, 0, (Math.random() - 0.5) * 10); // Unique path offset
      scene.add(bot);
      enemies.push(bot);
    };

    for (let i = 0; i < botCount; i++) createBot();

    let score = 0, health = 100, ammo = wp.mag, kills = 0, lastShot = 0;
    const upd = () => {
      const weaponName = currentWeapon === 'primary' ? lo.primary : lo.secondary;
      const isSMG = weaponName === 'P90' || weaponName === 'MP5';
      const firingMode = isSMG ? (isSemiAuto ? 'SEMI' : 'AUTO') : 'N/A';
      setGameStats({ score, health, ammo, kills, firingMode });
      setDamageVignette(health < 50 ? 0.5 : 0);
    };

    const keys = { w: 0, a: 0, s: 0, d: 0, space: 0, shift: 0 };
    let mx = 0, my = 0.3, jump = 0, jv = 0, py = 3;
    let isMouseDown = false, isSemiAuto = true; // Semi-auto toggle for SMGs (true = semi, false = rapid)

    const fireWeapon = () => {
      const now = Date.now();
      if (now - lastShot < gameInstanceRef.current.wp.rate * 1000) return;

      if (currentWeapon === 'secondary') {
        // Melee attack with animation
        lastShot = now;
        const meleeRange = gameInstanceRef.current.wp.range || 1.5;
        let hitEnemy = false;

        // Stabbing/swinging animation
        wg.position.z = -0.3;
        wg.rotation.x = 0.3;
        setTimeout(() => {
          wg.position.z = -0.5;
          wg.rotation.x = 0;
        }, 200);

        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (camera.position.distanceTo(e.position) < meleeRange * 2.0) {
            const damage = e.maxHealth * 0.5; // Half of max health
            e.health -= damage;
            hitEnemy = true;

            // Intense hit effect with blood
            for (let k = 0; k < 25; k++) {
              const pt = new THREE.Mesh(new THREE.SphereGeometry(0.08), new THREE.MeshBasicMaterial({ color: 0xcc0000 }));
              pt.position.copy(e.position);
              pt.position.y += Math.random() - 0.5;
              pt.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.8, Math.random() * 0.6, (Math.random() - 0.5) * 0.8);
              pt.life = 1.2;
              scene.add(pt);
              particles.push(pt);
            }

            if (e.health <= 0) {
              for (let k = 0; k < 40; k++) {
                const ep = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
                ep.position.copy(e.position);
                ep.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.8, Math.random() * 0.8, (Math.random() - 0.5) * 0.8);
                ep.life = 1.5;
                scene.add(ep);
                particles.push(ep);
              }
              scene.remove(e);
              enemies.splice(j, 1);
              score += 150;
              kills++;
              upd();
            }
            break;
          }
        }
        return;
      }

      if (ammo <= 0) return;
      lastShot = now;
      ammo--;
      upd();

      // Enhanced muzzle flash
      mf.material.opacity = 1;
      mf.scale.set(1.5, 1.5, 1.5);
      setTimeout(() => {
        mf.material.opacity = 0;
        mf.scale.set(1, 1, 1);
      }, 50);

      // Weapon recoil animation
      wg.position.z = -0.45;
      wg.rotation.x = 0.08;
      recoilKick += gameInstanceRef.current.wp.recoil * 0.02; // Add camera kick
      setTimeout(() => {
        wg.position.z = -0.5;
        wg.rotation.x = 0;
      }, 80);

      // Muzzle flash particles
      for (let i = 0; i < 12; i++) {
        const fp = new THREE.Mesh(new THREE.SphereGeometry(0.05), new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
        fp.position.copy(camera.position);
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        fp.velocity = dir.clone().multiplyScalar(0.5 + Math.random() * 0.5);
        fp.velocity.x += (Math.random() - 0.5) * 0.3;
        fp.velocity.y += (Math.random() - 0.5) * 0.3;
        fp.velocity.z += (Math.random() - 0.5) * 0.3;
        fp.life = 0.3;
        scene.add(fp);
        particles.push(fp);
      }

      const pc = gameInstanceRef.current.wp.pellets || 1;
      for (let p = 0; p < pc; p++) {
        const pr = new THREE.Mesh(new THREE.SphereGeometry(0.12), new THREE.MeshBasicMaterial({ color: col }));
        pr.position.copy(camera.position);
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        if (gameInstanceRef.current.wp.spread) {
          dir.x += (Math.random() - 0.5) * gameInstanceRef.current.wp.spread;
          dir.y += (Math.random() - 0.5) * gameInstanceRef.current.wp.spread;
          dir.z += (Math.random() - 0.5) * gameInstanceRef.current.wp.spread;
          dir.normalize();
        }
        pr.velocity = dir.multiplyScalar(gameInstanceRef.current.wp.spd);
        pr.dmg = gameInstanceRef.current.wp.dmg;
        pr.splashRadius = gameInstanceRef.current.wp.splashRadius || 0;
        pr.splashDmg = gameInstanceRef.current.wp.splashDmg || 0;

        // Tracer effect - neon for cyber shotgun
        let tracerColor = col;
        if (gameInstanceRef.current.wp.splashRadius) {
          tracerColor = Math.random() > 0.5 ? 0x00ff88 : 0xff00ff;
        }
        const tracer = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5), new THREE.MeshBasicMaterial({ color: tracerColor, transparent: true, opacity: 0.7 }));
        tracer.rotation.x = Math.PI / 2;
        pr.add(tracer);

        scene.add(pr);
        projectiles.push(pr);
      }
    };

    const kd = (e) => {
      const k = e.key.toLowerCase();
      if (k in keys) keys[k] = 1;
      if (k === ' ') keys.space = 1;
      if (e.key === 'Shift') keys.shift = 1;
      if (k === 'r') {
        if (ammo === gameInstanceRef.current.wp.mag) return; // Already full
        setIsReloading(true);
        // Staged reload animation
        wg.position.z = -0.3;
        wg.rotation.x = -0.2;
        setTimeout(() => {
          wg.position.z = -0.4; // Eject mag
          wg.rotation.x = 0.1;
          setTimeout(() => {
            wg.position.z = -0.35; // Insert new mag
            wg.rotation.x = -0.1;
            setTimeout(() => {
              wg.position.z = -0.5; // Chamber round
              wg.rotation.x = 0;
              ammo = gameInstanceRef.current.wp.mag;
              upd();
              setIsReloading(false);
            }, 400);
          }, 300);
        }, 200);
      }
      if (k === '1') setCurrentWeapon('primary');
      if (k === '2') setCurrentWeapon('secondary');
      if (k === 'q') {
        // Toggle Rapid Fire mode for supported weapons
        const weaponName = currentWeapon === 'primary' ? lo.primary : lo.secondary;
        if (weaponName === 'P90' || weaponName === 'MP5' || weaponName === 'AK-47') {
          isSemiAuto = !isSemiAuto;
        }
      }
      if (k === 'escape') setInGame(false);
    };
    const ku = (e) => { const k = e.key.toLowerCase(); if (k in keys) keys[k] = 0; if (k === ' ') keys.space = 0; if (e.key === 'Shift') keys.shift = 0; };
    // Weapon idle sway and ADS positioning
    let adsLerp = 0;
    let recoilKick = 0;

    const mm = (e) => { mx += e.movementX * 0.002; my -= e.movementY * 0.002; my = Math.max(-1.5, Math.min(1.5, my)); };

    // In md/mu for ADS
    const md = (e) => {
      if (e.button === 0) { // Left mouse button
        isMouseDown = true;
        // Strict Left Click Fire
        const weaponName = currentWeapon === 'primary' ? lo.primary : lo.secondary;
        const isAuto = weaponName === 'P90' || weaponName === 'MP5' || weaponName === 'AK-47' || weaponName === 'M4A1' || weaponName === 'SCAR-H' || weaponName === 'M249 SAW';

        // Fire instantly for semi-auto or first shot of auto
        if (!isAuto || isSemiAuto) {
          fireWeapon();
        } else {
          fireWeapon(); // Instant start for auto too
        }
      }
      if (e.button === 2 && gameInstanceRef.current.wp.hasScope && !isReloading && !(keys.shift && keys.w)) {
        const equippedScope = lo.primaryScope || 'Iron Sights';
        const scopeData = scopes[equippedScope];
        setIsZoomed(true);
        camera.fov = 90 / scopeData.zoom;
        camera.updateProjectionMatrix();
        adsLerp = 1;
      }
    };
    const mu = (e) => {
      if (e.button === 0) { // Left mouse button
        isMouseDown = false;
      }
      if (e.button === 2 && gameInstanceRef.current.wp.hasScope) {
        setIsZoomed(false);
        camera.fov = 90;
        camera.updateProjectionMatrix();
        adsLerp = 0;
      }
    };
    const mw = (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        setCurrentWeapon(currentWeapon === 'primary' ? 'secondary' : 'primary');
      } else {
        setCurrentWeapon(currentWeapon === 'primary' ? 'secondary' : 'primary');
      }
    };
    const clk = () => {
      // Input strictly handled in mousedown (md) for better responsiveness
    };

    // Request pointer lock immediately
    const requestLock = () => {
      if (!document.pointerLockElement && renderer && renderer.domElement && document.contains(renderer.domElement)) {
        renderer.domElement.requestPointerLock().catch(() => {
          // Silently handle lock request failures
        });
      }
    };

    renderer.domElement.addEventListener('click', requestLock);
    setTimeout(() => requestLock(), 100);

    // Keep pointer locked during gameplay
    const handlePointerLockChange = () => {
      if (!document.pointerLockElement && inGame && renderer && renderer.domElement && document.contains(renderer.domElement)) {
        setTimeout(() => requestLock(), 50);
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);

    const animate = () => {
      if (!inGame) return;
      requestAnimationFrame(animate);

      const baseMv = 0.25;
      const mv = isZoomed && currentWeapon === 'primary' ? baseMv * scopes[lo.primaryScope].adsSpeed : baseMv;
      if (keys.space && !jump && py <= 3.1) { jump = 1; jv = 0.4; }
      if (jump || py > 3) { jv -= 0.02; py += jv; if (py <= 3) { py = 3; jump = 0; jv = 0; } }
      camera.position.y = py;

      const fwd = new THREE.Vector3();
      camera.getWorldDirection(fwd);
      fwd.y = 0;
      fwd.normalize();
      const rt = new THREE.Vector3();
      rt.crossVectors(fwd, camera.up).normalize();

      if (keys.w) camera.position.add(fwd.clone().multiplyScalar(mv));
      if (keys.s) camera.position.add(fwd.clone().multiplyScalar(-mv));
      if (keys.a) camera.position.add(rt.clone().multiplyScalar(-mv));
      if (keys.d) camera.position.add(rt.clone().multiplyScalar(mv));

      // Continuous firing for Rapid Fire mode
      const weaponName = currentWeapon === 'primary' ? lo.primary : lo.secondary;
      const isSupportedWeapon = weaponName === 'P90' || weaponName === 'MP5' || weaponName === 'AK-47';
      if (isSupportedWeapon && !isSemiAuto && isMouseDown && ammo > 0) {
        const now = Date.now();
        if (now - lastShot >= gameInstanceRef.current.wp.rate * 1000) {
          fireWeapon();
        }
      }

      // Collision detection with solid objects
      const playerRadius = 0.5;
      solidObjects.forEach(obj => {
        const dx = camera.position.x - obj.pos.x;
        const dz = camera.position.z - obj.pos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const minDist = playerRadius + Math.max(obj.size.w, obj.size.d) / 2;

        if (dist < minDist) {
          const pushX = (dx / dist) * (minDist - dist);
          const pushZ = (dz / dist) * (minDist - dist);
          camera.position.x += pushX;
          camera.position.z += pushZ;
        }
      });

      camera.position.x = Math.max(-140, Math.min(140, camera.position.x));
      camera.position.z = Math.max(-140, Math.min(140, camera.position.z));
      camera.rotation.order = 'YXZ';
      camera.rotation.y = -mx;
      camera.rotation.x = my + recoilKick;
      recoilKick *= 0.9; // Decay recoil

      // Add sway when zoomed with high-magnification scopes
      if (isZoomed && currentWeapon === 'primary') {
        const swayAmount = scopes[lo.primaryScope].sway;
        camera.rotation.y += (Math.random() - 0.5) * swayAmount * 0.01;
        camera.rotation.x += (Math.random() - 0.5) * swayAmount * 0.01;
      }

      // Weapon idle sway and ADS positioning
      if (weaponGroupRef.current) {
        const wg = weaponGroupRef.current;
        const time = Date.now() * 0.001;
        // Idle sway
        wg.rotation.y = Math.sin(time) * 0.01;
        wg.rotation.x = Math.cos(time * 0.7) * 0.005;
        // ADS lerp
        const hipPos = new THREE.Vector3(0.3, -0.2, -0.5);
        const hipRot = new THREE.Vector3(0, 0, 0);
        const adsPos = new THREE.Vector3(0.2, -0.1, -0.4);
        const adsRot = new THREE.Vector3(-0.1, 0, 0);
        wg.position.lerpVectors(hipPos, adsPos, adsLerp);
        wg.rotation.x = THREE.MathUtils.lerp(hipRot.x, adsRot.x, adsLerp);
      }

      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.position.add(p.velocity);
        p.rotation.y += 0.1;
        let hit = 0;
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          // Precise Hitbox Detection
          const dx = p.position.x - e.position.x;
          const dz = p.position.z - e.position.z;
          const dy = p.position.y - e.position.y;
          const hDist = Math.sqrt(dx * dx + dz * dz);

          // Standard: Cylindrical Hitbox (Radius 1.2 - forgiving but skill-based, Height 2.5)
          let isHit = hDist < 1.2 && dy >= -0.5 && dy <= 2.5;

          // Exception: Cyber Shotgun (Splash Radius)
          // Allows wider hit registration (Sphere 4.0) to trigger splash mechanics
          if (p.splashRadius > 0 && !isHit) {
            if (p.position.distanceTo(e.position) < 4.0) isHit = true;
          }

          if (isHit) { // Precise hit detection
            // Headshot bonus for standard weapons
            if (!p.splashRadius && dy > 1.6) e.health -= p.dmg; // Double damage effectively (applied once here, once below)

            e.health -= p.dmg;

            // Hit marker
            setHitMarker(true);
            setTimeout(() => setHitMarker(false), 200);

            // Enemy flinch
            e.position.x += (Math.random() - 0.5) * 0.5;
            e.position.z += (Math.random() - 0.5) * 0.5;
            setTimeout(() => {
              e.position.x -= (Math.random() - 0.5) * 0.5;
              e.position.z -= (Math.random() - 0.5) * 0.5;
            }, 100);

            // Check for splash damage from cyber shotgun or similar weapons
            if (p.splashRadius && p.splashRadius > 0) {
              // Neon explosion effect at impact
              for (let n = 0; n < 50; n++) {
                const expPt = new THREE.Mesh(new THREE.SphereGeometry(0.15), new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0x00ff88 : 0xff00ff }));
                expPt.position.copy(p.position);
                expPt.velocity = new THREE.Vector3((Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.2);
                expPt.life = 2;
                scene.add(expPt);
                particles.push(expPt);
              }

              // Splash damage to all nearby enemies
              for (let m = enemies.length - 1; m >= 0; m--) {
                const target = enemies[m];
                const dist = p.position.distanceTo(target.position);
                if (dist < p.splashRadius) {
                  target.health -= p.splashDmg || p.dmg;
                  // Neon splash effect for each hit
                  for (let n = 0; n < 15; n++) {
                    const splashPt = new THREE.Mesh(new THREE.SphereGeometry(0.12), new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0x00ff88 : 0xff00ff }));
                    splashPt.position.copy(target.position);
                    splashPt.position.y += Math.random() - 0.5;
                    splashPt.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.9, Math.random() * 0.7, (Math.random() - 0.5) * 0.9);
                    splashPt.life = 1.5;
                    scene.add(splashPt);
                    particles.push(splashPt);
                  }
                  if (target.health <= 0) {
                    for (let n = 0; n < 40; n++) {
                      const ep = new THREE.Mesh(new THREE.SphereGeometry(0.12), new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0x00ff88 : 0xff00ff }));
                      ep.position.copy(target.position);
                      ep.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.9, Math.random() * 0.9, (Math.random() - 0.5) * 0.9);
                      ep.life = 1.8;
                      scene.add(ep);
                      particles.push(ep);
                    }
                    scene.remove(target);
                    enemies.splice(m, 1);
                    score += 150;
                    kills++;
                  }
                }
              }
            }

            // Update health bar
            const healthBarFg = e.getObjectByName('healthBarFg');
            if (healthBarFg) {
              const healthPercent = Math.max(0, e.health / e.maxHealth);
              healthBarFg.scale.x = healthPercent;
              healthBarFg.position.x = (healthPercent - 1) * 0.5;

              // Change color based on health
              if (healthPercent > 0.6) {
                healthBarFg.material.color.setHex(0x00ff00);
              } else if (healthPercent > 0.3) {
                healthBarFg.material.color.setHex(0xffff00);
              } else {
                healthBarFg.material.color.setHex(0xff0000);
              }
            }

            // Enhanced hit effects
            for (let k = 0; k < 20; k++) {
              const pt = new THREE.Mesh(new THREE.SphereGeometry(0.08), new THREE.MeshBasicMaterial({ color: col }));
              pt.position.copy(e.position);
              pt.position.y += Math.random() - 0.5;
              pt.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.5, Math.random() * 0.4, (Math.random() - 0.5) * 0.5);
              pt.life = 1;
              scene.add(pt);
              particles.push(pt);
            }

            // Blood splash effect
            const splash = new THREE.Mesh(new THREE.SphereGeometry(0.3), new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.6 }));
            splash.position.copy(e.position);
            splash.life = 0.3;
            scene.add(splash);
            particles.push(splash);

            hit = 1;
            if (e.health <= 0) {
              // Death explosion
              for (let k = 0; k < 30; k++) {
                const ep = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0xffffff }));
                ep.position.copy(e.position);
                ep.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.6, Math.random() * 0.6, (Math.random() - 0.5) * 0.6);
                ep.life = 1.5;
                scene.add(ep);
                particles.push(ep);
              }
              scene.remove(e);
              enemies.splice(j, 1);
              score += 150;
              kills++;
              upd();
            }
            break;
          }
        }
        if (hit || p.position.length() > 100) { scene.remove(p); projectiles.splice(i, 1); }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (p.velocity) {
          p.position.add(p.velocity);
          p.velocity.y -= 0.015;
        }
        p.life -= 0.016;
        if (p.material.opacity !== undefined) p.material.opacity = Math.max(0, p.life);
        p.scale.setScalar(Math.max(0.1, p.life));
        if (p.life <= 0) { scene.remove(p); particles.splice(i, 1); }
      }

      enemies.forEach(e => {
        const targetX = camera.position.x + e.pathOffset.x;
        const targetZ = camera.position.z + e.pathOffset.z;
        const dx = targetX - e.position.x;
        const dz = targetZ - e.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 3) { e.position.x += (dx / dist) * e.spd; e.position.z += (dz / dist) * e.spd; }
        else if (Math.random() < 0.01) { health -= 5; upd(); if (health <= 0) setInGame(false); }
      });

      renderer.render(scene, camera);
    };
    animate();
    upd();

    // Store in ref to preserve state on weapon change
    gameInstanceRef.current = {
      currentWeapon,
      wp: wp,
      updateWeapon: (newWp, newWpName) => {
        // Just swap weapon group - don't reset scene
        wg.clear();
        wg.add(createWeaponModel(newWpName));
      }
    };

    // Add event listeners after game instance is set up
    document.addEventListener('keydown', kd);
    document.addEventListener('keyup', ku);
    document.addEventListener('mousemove', mm);
    document.addEventListener('mousedown', md);
    document.addEventListener('mouseup', mu);
    document.addEventListener('click', clk);
    document.addEventListener('wheel', mw, { passive: false });
    renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

    return () => {
      gameInstanceRef.current = null;
      document.removeEventListener('keydown', kd);
      document.removeEventListener('keyup', ku);
      document.removeEventListener('mousemove', mm);
      document.removeEventListener('mousedown', md);
      document.removeEventListener('mouseup', mu);
      document.removeEventListener('click', clk);
      document.removeEventListener('wheel', mw);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      if (document.pointerLockElement) document.exitPointerLock();
      if (mountRef.current && renderer.domElement.parentNode) mountRef.current.removeChild(renderer.domElement);
    };
  }, [inGame, botDifficulty, botCount, selectedLoadout, loadouts]);

  // Separate useEffect for weapon switching to avoid scene recreation
  useEffect(() => {
    if (!inGame || !gameInstanceRef.current || !weaponGroupRef.current || !cameraRef.current || !sceneRef.current) return;

    const lo = loadouts[selectedLoadout];
    const wpName = currentWeapon === 'primary' ? lo.primary : lo.secondary;
    const col = lo.skinColor;

    // Clear existing weapon models
    while (weaponGroupRef.current.children.length > 0) {
      weaponGroupRef.current.remove(weaponGroupRef.current.children[0]);
    }

    // Create weapon group
    const wg = new THREE.Group();

    // Create new weapon model
    const createWeaponModel = (name) => {
      const group = new THREE.Group();

      if (currentWeapon === 'secondary') {
        // MELEE WEAPONS
        if (name === 'Combat Knife') {
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.015), new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.98, roughness: 0.02 }));
          blade.position.set(0.32, 0.05, -0.3);
          group.add(blade);
          const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.2, 8), new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.3, roughness: 0.7 }));
          handle.position.set(0.32, -0.18, -0.3);
          group.add(handle);
        } else if (name === 'Machete') {
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.02), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.95, roughness: 0.05 }));
          blade.position.set(0.35, 0.1, -0.3);
          group.add(blade);
          const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.25, 8), new THREE.MeshStandardMaterial({ color: 0x8b4513, metalness: 0.2, roughness: 0.8 }));
          handle.position.set(0.35, -0.25, -0.3);
          group.add(handle);
        } else if (name === 'Fire Axe') {
          const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.85, 8), new THREE.MeshStandardMaterial({ color: 0x654321, metalness: 0.1, roughness: 0.9 }));
          handle.position.set(0.3, 0.05, -0.3);
          group.add(handle);
          const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 0.12), new THREE.MeshStandardMaterial({ color: 0xff6600, metalness: 0.8, roughness: 0.2 }));
          head.position.set(0.3, 0.65, -0.3);
          group.add(head);
        } else if (name === 'Warhammer') {
          const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.8, 8), new THREE.MeshStandardMaterial({ color: 0x5a4a3a, metalness: 0.15, roughness: 0.85 }));
          handle.position.set(0.3, 0, -0.3);
          group.add(handle);
          const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.38, 0.28), new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.75, roughness: 0.25 }));
          head.position.set(0.3, 0.6, -0.3);
          group.add(head);
        } else if (name === 'Crowbar') {
          const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.75, 8), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.75, roughness: 0.25 }));
          shaft.position.set(0.3, 0.02, -0.3);
          group.add(shaft);
          const claw = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.05), new THREE.MeshStandardMaterial({ color: 0x3a3a3a, metalness: 0.8, roughness: 0.2 }));
          claw.position.set(0.35, 0.5, -0.3);
          group.add(claw);
        }
      } else {
        // PRIMARY FIREARMS - Each with unique design
        if (name === 'M16A4') {
          // Cold hammer-forged steel barrel with parkerized finish
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.032, 0.5, 16), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a, // Parkerized dark gray
            metalness: 0.95,
            roughness: 0.15,
            emissive: 0x111111, // Slight heat discoloration
            emissiveIntensity: 0.1
          }));
          barrel.rotation.z = Math.PI / 2;
          barrel.position.set(0.3, -0.15, -1);
          group.add(barrel);

          // Polymer handguard with scratches and dust embedded
          const handGuard = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.4), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a, // Dark polymer
            metalness: 0.1,
            roughness: 0.8,
            emissive: 0x080808, // Dust embedded
            emissiveIntensity: 0.05
          }));
          handGuard.position.set(0.3, -0.18, -0.65);
          group.add(handGuard);

          // Upper receiver with edge wear
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 1.05), new THREE.MeshStandardMaterial({
            color: new THREE.Color(col),
            metalness: 0.85,
            roughness: 0.25,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.02
          }));
          receiver.position.set(0.3, -0.2, -0.5);
          group.add(receiver);

          // Carry handle with wear
          const carryHandle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.5), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.8,
            roughness: 0.4,
            emissive: 0x050505,
            emissiveIntensity: 0.03
          }));
          carryHandle.position.set(0.3, 0.12, -0.5);
          group.add(carryHandle);

          // Brass deflector scuffed with carbon residue
          const brassDeflector = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 0.02), new THREE.MeshStandardMaterial({
            color: 0x8b7355, // Brass color
            metalness: 0.9,
            roughness: 0.6,
            emissive: 0x2a2a2a, // Carbon residue
            emissiveIntensity: 0.1
          }));
          brassDeflector.position.set(0.35, -0.1, -0.45);
          group.add(brassDeflector);

          // Selector switch with edge wear
          const selectorSwitch = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.04), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.7,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          selectorSwitch.position.set(0.38, -0.08, -0.3);
          group.add(selectorSwitch);

          // Charging handle with wear
          const chargingHandle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.12), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.85,
            roughness: 0.5,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          chargingHandle.position.set(0.35, 0.02, -0.25);
          group.add(chargingHandle);

          // Magazine release with wear
          const magRelease = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.03, 8), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.6,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          magRelease.position.set(0.25, -0.35, -0.4);
          group.add(magRelease);

          // Magazine with feed-lip wear and spring tension realism
          const magazine = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.12), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.7,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.03
          }));
          magazine.position.set(0.3, -0.52, -0.38);
          group.add(magazine);

          // Magazine feed lips with wear
          const feedLips = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.02, 0.13), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.8,
            roughness: 0.5,
            emissive: 0x050505,
            emissiveIntensity: 0.04
          }));
          feedLips.position.set(0.3, -0.68, -0.38);
          group.add(feedLips);

          // Stock with moderate recoil wear
          const stock = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.14, 0.32), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.2,
            roughness: 0.9,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.02
          }));
          stock.position.set(0.3, -0.16, 0.15);
          group.add(stock);

          // Muzzle device with minimal heat discoloration
          const muzzleDevice = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.04, 0.08, 16), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.85,
            roughness: 0.3,
            emissive: 0x111111,
            emissiveIntensity: 0.08
          }));
          muzzleDevice.rotation.z = Math.PI / 2;
          muzzleDevice.position.set(0.3, -0.15, -1.28);
          group.add(muzzleDevice);
        } else if (name === 'AK-47') {
          // Stamped steel receiver with visible rivets and weld seams
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.23, 1.02), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a, // Blued steel worn to bare metal on edges
            metalness: 0.85,
            roughness: 0.35,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          receiver.position.set(0.3, -0.2, -0.5);
          group.add(receiver);

          // Visible rivets on receiver
          const rivet1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.02, 8), new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            metalness: 0.9,
            roughness: 0.4
          }));
          rivet1.position.set(0.35, -0.1, -0.3);
          group.add(rivet1);

          const rivet2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.02, 8), new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            metalness: 0.9,
            roughness: 0.4
          }));
          rivet2.position.set(0.25, -0.1, -0.7);
          group.add(rivet2);

          // Weld seams (rough machining)
          const weldSeam = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.005, 0.03), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.95,
            roughness: 0.6,
            emissive: 0x080808,
            emissiveIntensity: 0.05
          }));
          weldSeam.position.set(0.3, -0.08, -0.5);
          group.add(weldSeam);

          // Barrel with heavy carbon buildup near muzzle
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.036, 0.52, 16), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.95,
            roughness: 0.15,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.08
          }));
          barrel.rotation.z = Math.PI / 2;
          barrel.position.set(0.3, -0.12, -1.02);
          group.add(barrel);

          // Gas tube with carbon buildup
          const gasTube = new THREE.Mesh(new THREE.CylinderGeometry(0.023, 0.021, 0.45, 12), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.3,
            emissive: 0x1a1a1a,
            emissiveIntensity: 0.1
          }));
          gasTube.rotation.z = Math.PI / 2;
          gasTube.position.set(0.32, 0.08, -0.75);
          group.add(gasTube);

          // Curved magazine (rough machining, imperfect symmetry)
          const curvedMag = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.4, 0.14), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.7,
            roughness: 0.5,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          curvedMag.position.set(0.28, -0.5, -0.35);
          curvedMag.rotation.z = -0.25;
          group.add(curvedMag);

          // Front sight (worn)
          const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.06), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.75,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          frontSight.position.set(0.32, 0.12, -1.15);
          group.add(frontSight);

          // Rear sight (worn)
          const rearSight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.06), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.75,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          rearSight.position.set(0.32, 0.12, -0.1);
          group.add(rearSight);

          // Wooden furniture - dented, oil-soaked, chipped varnish
          const woodyStock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.4), new THREE.MeshStandardMaterial({
            color: 0x4a2a0a, // Oil-soaked wood
            metalness: 0.05,
            roughness: 0.95,
            emissive: 0x1a0a0a,
            emissiveIntensity: 0.02
          }));
          woodyStock.position.set(0.3, -0.14, 0.15);
          group.add(woodyStock);

          // Wooden handguard - chipped varnish
          const handGuard = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.12, 0.35), new THREE.MeshStandardMaterial({
            color: 0x5a3a1a,
            metalness: 0.1,
            roughness: 0.9,
            emissive: 0x2a1a0a,
            emissiveIntensity: 0.03
          }));
          handGuard.position.set(0.3, -0.18, -0.65);
          group.add(handGuard);

          // Dust cover with rough machining
          const dustCover = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.6), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.35,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          dustCover.position.set(0.3, 0.08, -0.5);
          group.add(dustCover);

          // Heavy carbon buildup near muzzle
          const carbonBuildup = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.05, 16), new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.9,
            roughness: 0.8,
            emissive: 0x1a1a1a,
            emissiveIntensity: 0.15
          }));
          carbonBuildup.rotation.z = Math.PI / 2;
          carbonBuildup.position.set(0.3, -0.12, -1.25);
          group.add(carbonBuildup);
        } else if (name === 'M249 SAW') {
          // Heavy steel receiver with overbuilt appearance
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.24, 1.08), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.88,
            roughness: 0.22,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          receiver.position.set(0.3, -0.2, -0.5);
          group.add(receiver);

          // Heavy steel barrel with heat discoloration
          const heavyBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.034, 0.55, 16), new THREE.MeshStandardMaterial({
            color: 0x3a2a1a, // Heat-discolored steel
            metalness: 0.97,
            roughness: 0.08,
            emissive: 0x2a1a0a,
            emissiveIntensity: 0.12
          }));
          heavyBarrel.rotation.z = Math.PI / 2;
          heavyBarrel.position.set(0.3, -0.14, -1.05);
          group.add(heavyBarrel);

          // Barrel shroud with scratches
          const barrelShroud = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.043, 0.5, 16), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.75,
            roughness: 0.3,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          barrelShroud.rotation.z = Math.PI / 2;
          barrelShroud.position.set(0.3, -0.14, -1.0);
          group.add(barrelShroud);

          // Large magazine with dents and wear
          const largeMag = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.2, 32), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.7,
            roughness: 0.35,
            emissive: 0x080808,
            emissiveIntensity: 0.03
          }));
          largeMag.rotation.z = Math.PI / 2;
          largeMag.position.set(0.3, -0.52, -0.28);
          group.add(largeMag);

          // Bipod with dirt-packed joints
          const bipod = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.15), new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            metalness: 0.7,
            roughness: 0.3,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.06
          }));
          bipod.position.set(0.3, -0.36, -0.8);
          group.add(bipod);

          // Dirt-packed bipod joints
          const bipodJoint1 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), new THREE.MeshStandardMaterial({
            color: 0x2a1a0a, // Dirt-packed
            metalness: 0.3,
            roughness: 0.9,
            emissive: 0x1a0a0a,
            emissiveIntensity: 0.08
          }));
          bipodJoint1.position.set(0.25, -0.36, -0.8);
          group.add(bipodJoint1);

          const bipodJoint2 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), new THREE.MeshStandardMaterial({
            color: 0x2a1a0a,
            metalness: 0.3,
            roughness: 0.9,
            emissive: 0x1a0a0a,
            emissiveIntensity: 0.08
          }));
          bipodJoint2.position.set(0.35, -0.36, -0.8);
          group.add(bipodJoint2);

          // Top handle with wear
          const topHandle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.15), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.6,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          topHandle.position.set(0.32, 0.15, -0.5);
          group.add(topHandle);

          // Stock with overbuilt mechanical stress appearance
          const stock = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.35), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.25,
            roughness: 0.85,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          stock.position.set(0.3, -0.16, 0.2);
          group.add(stock);

          // Visible belt-fed rounds
          for (let i = 0; i < 6; i++) {
            const round = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.08, 8), new THREE.MeshStandardMaterial({
              color: 0xd4af37, // Brass casing
              metalness: 0.9,
              roughness: 0.2,
              emissive: 0x2a2a0a,
              emissiveIntensity: 0.05
            }));
            round.position.set(0.3 + (i * 0.02 - 0.05), -0.45, -0.28);
            round.rotation.x = Math.PI / 2;
            group.add(round);
          }

          // Feed tray with scratches
          const feedTray = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.2), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.85,
            roughness: 0.6,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          feedTray.position.set(0.3, 0.02, -0.35);
          group.add(feedTray);
        } else if (name === 'MP5') {
          // Polymer frame with embedded dirt and scratches
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 0.85), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a, // Polymer with embedded dirt
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          receiver.position.set(0.3, -0.2, -0.45);
          group.add(receiver);

          // Threaded barrel with suppressor mounting
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.029, 0.38, 16), new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.98,
            roughness: 0.05,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          barrel.rotation.z = Math.PI / 2;
          barrel.position.set(0.3, -0.15, -0.85);
          group.add(barrel);

          // Threaded muzzle for suppressor
          const muzzleThread = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.032, 0.03, 16), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.95,
            roughness: 0.1,
            emissive: 0x080808,
            emissiveIntensity: 0.05
          }));
          muzzleThread.rotation.z = Math.PI / 2;
          muzzleThread.position.set(0.3, -0.15, -1.02);
          group.add(muzzleThread);

          // Curved magazine with follower wear
          const mag = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.32, 0.13), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.75,
            roughness: 0.35,
            emissive: 0x080808,
            emissiveIntensity: 0.03
          }));
          mag.position.set(0.3, -0.48, -0.32);
          group.add(mag);

          // Magazine follower with wear
          const magFollower = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.12), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.6,
            roughness: 0.7,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          magFollower.position.set(0.3, -0.35, -0.32);
          group.add(magFollower);

          // Folding stock with mechanical wear
          const foldingStock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.25), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          foldingStock.position.set(0.3, -0.18, 0.15);
          group.add(foldingStock);

          // Stock hinge with wear
          const stockHinge = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 8), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.5,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          stockHinge.position.set(0.3, -0.12, 0.05);
          stockHinge.rotation.x = Math.PI / 2;
          group.add(stockHinge);

          // Trigger group with carbon buildup
          const triggerGroup = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.12), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.85,
            roughness: 0.3,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.08
          }));
          triggerGroup.position.set(0.3, -0.28, -0.2);
          group.add(triggerGroup);

          // Tactical rail with mounting hardware wear
          const rail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.08), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.7,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          rail.position.set(0.3, 0.02, -0.45);
          group.add(rail);

          // Rail mounting screws with wear
          const railScrew1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.04, 6), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          railScrew1.position.set(0.25, 0.02, -0.45);
          group.add(railScrew1);

          const railScrew2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.04, 6), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          railScrew2.position.set(0.35, 0.02, -0.45);
          group.add(railScrew2);
        } else if (name === 'SCAR-H') {
          // Modular upper and lower receivers with precision machining
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.98), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          receiver.position.set(0.3, -0.2, -0.5);
          group.add(receiver);

          // Upper receiver with precision machining marks
          const upperReceiver = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.18, 0.6), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.95,
            roughness: 0.15,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          upperReceiver.position.set(0.3, -0.08, -0.5);
          group.add(upperReceiver);

          // Free-floating barrel with carbon fiber handguard
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.038, 0.48, 16), new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.98,
            roughness: 0.05,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          barrel.rotation.z = Math.PI / 2;
          barrel.position.set(0.3, -0.15, -1);
          group.add(barrel);

          // Carbon fiber handguard
          const handguard = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.35, 16), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a, // Carbon fiber texture
            metalness: 0.1,
            roughness: 0.9,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.02
          }));
          handguard.rotation.z = Math.PI / 2;
          handguard.position.set(0.3, -0.15, -0.75);
          group.add(handguard);

          // Magazine well with reinforced construction
          const magwell = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.35, 0.16), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.7,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.03
          }));
          magwell.position.set(0.3, -0.48, -0.35);
          group.add(magwell);

          // Adjustable stock with wear on adjustment mechanisms
          const adjustableStock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.4), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.3,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          adjustableStock.position.set(0.3, -0.18, 0.2);
          group.add(adjustableStock);

          // Stock adjustment lever with wear
          const stockLever = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 0.06), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.5,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          stockLever.position.set(0.3, -0.12, 0.35);
          group.add(stockLever);

          // Ambidextrous controls with selector switch wear
          const selectorSwitch = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.08), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.85,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          selectorSwitch.position.set(0.32, -0.08, -0.2);
          group.add(selectorSwitch);

          // Integrated rail system with mounting points
          const picatinnyRail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.1), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.7,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          picatinnyRail.position.set(0.3, 0.02, -0.5);
          group.add(picatinnyRail);

          // Rail mounting screws
          for (let i = 0; i < 4; i++) {
            const railScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.03, 6), new THREE.MeshStandardMaterial({
              color: 0x2a2a2a,
              metalness: 0.9,
              roughness: 0.3,
              emissive: 0x0a0a0a,
              emissiveIntensity: 0.05
            }));
            railScrew.position.set(0.3 + (i * 0.04 - 0.06), 0.02, -0.5);
            group.add(railScrew);
          }

          // Heavy-duty construction with reinforced areas
          const reinforcement = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.08, 1.0), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.95,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.05
          }));
          reinforcement.position.set(0.3, -0.04, -0.5);
          group.add(reinforcement);
        } else if (name === 'M4A1') {
          // Flat-top receiver with picatinny rail
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.21, 0.9), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          receiver.position.set(0.3, -0.2, -0.45);
          group.add(receiver);

          // Picatinny rail on top
          const picatinnyRail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.6), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.7,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          picatinnyRail.position.set(0.3, 0.02, -0.45);
          group.add(picatinnyRail);

          // Carbine-length gas system with adjustable regulator
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.031, 0.4, 16), new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.98,
            roughness: 0.05,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          barrel.rotation.z = Math.PI / 2;
          barrel.position.set(0.3, -0.15, -0.92);
          group.add(barrel);

          // Gas block with adjustable regulator
          const gasBlock = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.06, 12), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.3,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          gasBlock.rotation.z = Math.PI / 2;
          gasBlock.position.set(0.3, -0.08, -0.65);
          group.add(gasBlock);

          // Muzzle break
          const muzzleBreak = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.039, 0.07, 16), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.85,
            roughness: 0.2,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          muzzleBreak.rotation.z = Math.PI / 2;
          muzzleBreak.position.set(0.3, -0.15, -1.1);
          group.add(muzzleBreak);

          // M4-style handguards with heat shields
          const keymod = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.35), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.6,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          keymod.position.set(0.3, -0.18, -0.6);
          group.add(keymod);

          // Heat shields on handguard
          for (let i = 0; i < 3; i++) {
            const heatShield = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.02, 0.08), new THREE.MeshStandardMaterial({
              color: 0x3a3a3a,
              metalness: 0.8,
              roughness: 0.3,
              emissive: 0x0a0a0a,
              emissiveIntensity: 0.04
            }));
            heatShield.position.set(0.3, -0.12 + i * 0.04, -0.6 + (i * 0.08 - 0.08));
            group.add(heatShield);
          }

          // Collapsible stock with buffer tube wear
          const compactStock2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.13, 0.3), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.25,
            roughness: 0.85,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          compactStock2.position.set(0.3, -0.16, 0.1);
          group.add(compactStock2);

          // Buffer tube with wear
          const bufferTube = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.022, 0.25, 12), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          bufferTube.position.set(0.3, -0.16, 0.25);
          group.add(bufferTube);

          // RIS rail system with multiple mounting points
          const risRail1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.08), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.7,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          risRail1.position.set(0.3, -0.08, -0.6);
          group.add(risRail1);

          const risRail2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.08), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.7,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          risRail2.position.set(0.3, -0.28, -0.6);
          group.add(risRail2);

          // Magazine with follower wear
          const magazine2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 0.11), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.7,
            roughness: 0.35,
            emissive: 0x080808,
            emissiveIntensity: 0.03
          }));
          magazine2.position.set(0.3, -0.5, -0.32);
          group.add(magazine2);

          // Forward assist
          const forwardAssist = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.04, 8), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.05
          }));
          forwardAssist.position.set(0.32, -0.08, -0.25);
          forwardAssist.rotation.x = Math.PI / 2;
          group.add(forwardAssist);

          // Ejection port cover
          const ejectionCover = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.04), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          ejectionCover.position.set(0.35, -0.12, -0.15);
          group.add(ejectionCover);
        } else if (name === 'Cyber Shotgun') {
          // Cyberpunk shotgun with aggressive angular design
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.26, 1.1), new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.95, roughness: 0.1 }));
          receiver.position.set(0.3, -0.2, -0.55);
          group.add(receiver);

          // Neon energy coils on receiver
          const neonCoil1 = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 8, 16), new THREE.MeshBasicMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 2 }));
          neonCoil1.position.set(0.35, 0.05, -0.3);
          neonCoil1.rotation.y = Math.PI / 4;
          group.add(neonCoil1);

          const neonCoil2 = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 8, 16), new THREE.MeshBasicMaterial({ color: 0xff00ff, emissive: 0xff00ff, emissiveIntensity: 2 }));
          neonCoil2.position.set(0.35, -0.05, -0.7);
          neonCoil2.rotation.y = Math.PI / 4;
          group.add(neonCoil2);

          // Plasma-charged barrel vents (wide aggressive barrel)
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.062, 0.65, 16), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.98, roughness: 0.05 }));
          barrel.rotation.z = Math.PI / 2;
          barrel.position.set(0.3, -0.15, -1.1);
          group.add(barrel);

          // Barrel vent details (cyber vents)
          for (let i = 0; i < 4; i++) {
            const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 8), new THREE.MeshStandardMaterial({ color: 0x00ff88, metalness: 0.8, roughness: 0.2, emissive: 0x00ff88, emissiveIntensity: 0.8 }));
            vent.rotation.z = Math.PI / 2;
            vent.position.set(0.3, -0.08 + i * 0.05, -1.35);
            group.add(vent);
          }

          // Holographic ammo counter (glowing display)
          const ammoCounter = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.12), new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.7 }));
          ammoCounter.position.set(0.32, 0.12, -0.5);
          group.add(ammoCounter);

          // Sharp angular front sight
          const frontSightCyber = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.08), new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.9, roughness: 0.1 }));
          frontSightCyber.position.set(0.36, 0.1, -1.25);
          group.add(frontSightCyber);

          // Reinforced chrome stock (angular)
          const cyberStock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.4), new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.95, roughness: 0.05 }));
          cyberStock.position.set(0.3, -0.16, 0.2);
          group.add(cyberStock);

          // Exposed energy compartment
          const energyComp = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 0.3), new THREE.MeshStandardMaterial({ color: 0xff00ff, metalness: 0.7, roughness: 0.3, emissive: 0xff00ff, emissiveIntensity: 1.2 }));
          energyComp.position.set(0.3, -0.38, -0.4);
          group.add(energyComp);

          // Charging fins (industrial design)
          for (let i = 0; i < 3; i++) {
            const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.08), new THREE.MeshStandardMaterial({ color: 0x00ff88, metalness: 0.85, roughness: 0.15 }));
            fin.position.set(0.2 + i * 0.08, -0.35, -0.25);
            group.add(fin);
          }
        } else if (name === 'AWP Dragon Lore') {
          // Bullpup design with integrated scope rail
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 1.25), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          receiver.position.set(0.3, -0.2, -0.6);
          group.add(receiver);

          // Integrated scope rail
          const scopeRail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.8), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.7,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          scopeRail.position.set(0.3, 0.03, -0.6);
          group.add(scopeRail);

          // Heavy match-grade barrel with suppressor threads
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.025, 1.0, 24), new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.99,
            roughness: 0.02,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          barrel.rotation.z = Math.PI / 2;
          barrel.position.set(0.3, -0.15, -1.3);
          group.add(barrel);

          // Fluting on barrel
          for (let i = 0; i < 6; i++) {
            const flute = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.03, 0.9), new THREE.MeshStandardMaterial({
              color: 0x0a0a0a,
              metalness: 0.99,
              roughness: 0.02,
              emissive: 0x080808,
              emissiveIntensity: 0.04
            }));
            flute.position.set(0.3 + Math.cos(i * Math.PI / 3) * 0.028, -0.15, -1.3 + Math.sin(i * Math.PI / 3) * 0.028);
            flute.rotation.z = i * Math.PI / 3;
            group.add(flute);
          }

          // Suppressor threads
          const suppressorThreads = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.028, 0.05, 16), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.95,
            roughness: 0.1,
            emissive: 0x080808,
            emissiveIntensity: 0.05
          }));
          suppressorThreads.rotation.z = Math.PI / 2;
          suppressorThreads.position.set(0.3, -0.15, -1.55);
          group.add(suppressorThreads);

          // Adjustable bipod with quick-detach mounts
          const bipodLeg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.006, 0.2, 8), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          bipodLeg1.position.set(0.28, -0.35, -1.4);
          bipodLeg1.rotation.z = -0.2;
          group.add(bipodLeg1);

          const bipodLeg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.006, 0.2, 8), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          bipodLeg2.position.set(0.32, -0.35, -1.4);
          bipodLeg2.rotation.z = 0.2;
          group.add(bipodLeg2);

          // Quick-detach bipod mount
          const bipodMount = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.04, 8), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.95,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          bipodMount.position.set(0.3, -0.15, -1.2);
          group.add(bipodMount);

          // Reinforced receiver with recoil mitigation
          const reinforcement = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.08, 1.3), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.95,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.05
          }));
          reinforcement.position.set(0.3, -0.04, -0.6);
          group.add(reinforcement);

          // High-precision trigger mechanism
          const triggerMech = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.08), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.3,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          triggerMech.position.set(0.3, -0.28, -0.35);
          group.add(triggerMech);

          // Precision magazine with follower
          const magazine = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.15, 0.08), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.03
          }));
          magazine.position.set(0.3, -0.35, -0.4);
          group.add(magazine);

          // Precision magazine follower
          const magFollower = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.07), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.7,
            roughness: 0.6,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          magFollower.position.set(0.3, -0.28, -0.4);
          group.add(magFollower);

          // Scope with high magnification
          const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.5, 20), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.85,
            roughness: 0.2,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          scope.rotation.z = Math.PI / 2;
          scope.position.set(0.3, 0.08, -0.5);
          group.add(scope);

          // Scope lens
          const scopeLens = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 20), new THREE.MeshStandardMaterial({
            color: 0x1a5aaa,
            metalness: 0.95,
            roughness: 0.02,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.1
          }));
          scopeLens.rotation.z = Math.PI / 2;
          scopeLens.position.set(0.3, 0.08, -0.8);
          group.add(scopeLens);
        } else if (name === 'Benelli M4') {
          // Gas-operated semi-automatic shotgun receiver
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.95), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          receiver.position.set(0.3, -0.2, -0.48);
          group.add(receiver);

          // Smoothbore barrel
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.08, 0.5, 16), new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.97,
            roughness: 0.1,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          barrel.rotation.z = Math.PI / 2;
          barrel.position.set(0.3, -0.15, -0.95);
          group.add(barrel);

          // Pistol grip with textured surface
          const pistolGrip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.12), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.3,
            roughness: 0.9,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          pistolGrip.position.set(0.3, -0.38, -0.2);
          group.add(pistolGrip);

          // Textured grip surface
          for (let i = 0; i < 8; i++) {
            const texture = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.01, 0.08), new THREE.MeshStandardMaterial({
              color: 0x2a2a2a,
              metalness: 0.4,
              roughness: 0.95,
              emissive: 0x0a0a0a,
              emissiveIntensity: 0.03
            }));
            texture.position.set(0.3, -0.38 + (i * 0.02), -0.2);
            group.add(texture);
          }

          // Extended magazine tube
          const tubeMag = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.55, 16), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.8,
            roughness: 0.25,
            emissive: 0x080808,
            emissiveIntensity: 0.03
          }));
          tubeMag.rotation.z = Math.PI / 2;
          tubeMag.position.set(0.3, -0.32, -0.7);
          group.add(tubeMag);

          // Magazine tube cap
          const tubeCap = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.03, 16), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.85,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          tubeCap.rotation.z = Math.PI / 2;
          tubeCap.position.set(0.3, -0.32, -0.95);
          group.add(tubeCap);

          // Ghost ring sights
          const frontSight = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.08, 8), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.8,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          frontSight.position.set(0.3, -0.08, -1.0);
          group.add(frontSight);

          const rearSight = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.04), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.8,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          rearSight.position.set(0.3, -0.08, -0.2);
          group.add(rearSight);

          // Pump-action slide with wear
          const pumpSlide = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.15), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.85,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          pumpSlide.position.set(0.3, -0.08, -0.6);
          group.add(pumpSlide);

          // Slide release with wear
          const slideRelease = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.04), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.5,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          slideRelease.position.set(0.32, -0.12, -0.35);
          group.add(slideRelease);

          // Reinforced polymer stock
          const polymerStock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.4), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.2,
            roughness: 0.9,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          polymerStock.position.set(0.3, -0.18, 0.15);
          group.add(polymerStock);

          // Stock reinforcement
          const stockReinforce = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.42), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.05
          }));
          stockReinforce.position.set(0.3, -0.04, 0.15);
          group.add(stockReinforce);

          // Loading port
          const loadingPort = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.04), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.7,
            roughness: 0.6,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          loadingPort.position.set(0.3, -0.28, -0.48);
          group.add(loadingPort);
        } else if (name === 'P90') {
          // Bullpup design with polymer construction
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.19, 0.75), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a, // Polymer base
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          receiver.position.set(0.3, -0.2, -0.4);
          group.add(receiver);

          // Top-mounted magazine (horizontal)
          const topMag = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.18, 32), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.7,
            roughness: 0.35,
            emissive: 0x080808,
            emissiveIntensity: 0.03
          }));
          topMag.rotation.z = Math.PI / 2;
          topMag.position.set(0.3, 0.05, -0.4);
          group.add(topMag);

          // Magazine window (transparent)
          const magWindow = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.15), new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            metalness: 0.1,
            roughness: 0.9,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          magWindow.position.set(0.3, 0.08, -0.4);
          group.add(magWindow);

          // Integrated barrel with suppressor threads
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.027, 0.33, 16), new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.98,
            roughness: 0.05,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          barrel.rotation.z = Math.PI / 2;
          barrel.position.set(0.3, -0.15, -0.8);
          group.add(barrel);

          // Suppressor threads
          const suppressorThreads = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.032, 0.03, 16), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.95,
            roughness: 0.1,
            emissive: 0x080808,
            emissiveIntensity: 0.05
          }));
          suppressorThreads.rotation.z = Math.PI / 2;
          suppressorThreads.position.set(0.3, -0.15, -0.95);
          group.add(suppressorThreads);

          // Integrated reflex sight
          const reflexSight = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.04), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.8,
            roughness: 0.3,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          reflexSight.position.set(0.3, 0.08, -0.2);
          group.add(reflexSight);

          // Reflex sight lens
          const sightLens = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.01), new THREE.MeshStandardMaterial({
            color: 0x2a5aaa,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.1
          }));
          sightLens.position.set(0.3, 0.08, -0.18);
          group.add(sightLens);

          // Ambidextrous controls - left side
          const leftTrigger = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.04), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.85,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          leftTrigger.position.set(0.26, -0.28, -0.25);
          group.add(leftTrigger);

          // Ambidextrous controls - right side
          const rightTrigger = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.04), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.85,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          rightTrigger.position.set(0.34, -0.28, -0.25);
          group.add(rightTrigger);

          // Ergonomic pistol grip
          const pistolGrip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.1), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.3,
            roughness: 0.9,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          pistolGrip.position.set(0.3, -0.36, -0.15);
          group.add(pistolGrip);

          // Grip texture
          for (let i = 0; i < 6; i++) {
            const gripTexture = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.01, 0.08), new THREE.MeshStandardMaterial({
              color: 0x2a2a2a,
              metalness: 0.4,
              roughness: 0.95,
              emissive: 0x0a0a0a,
              emissiveIntensity: 0.03
            }));
            gripTexture.position.set(0.3, -0.36 + (i * 0.02), -0.15);
            group.add(gripTexture);
          }

          // Metal reinforcements
          const metalReinforce1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.77), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.95,
            roughness: 0.3,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          metalReinforce1.position.set(0.3, -0.08, -0.4);
          group.add(metalReinforce1);

          const metalReinforce2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.35), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.95,
            roughness: 0.3,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          metalReinforce2.position.set(0.3, -0.28, -0.4);
          group.add(metalReinforce2);

          // Forward grip
          const forwardGrip = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.15, 8), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.4,
            roughness: 0.8,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          forwardGrip.position.set(0.3, -0.25, -0.65);
          group.add(forwardGrip);
        } else if (name === 'Intervention') {
          // Bolt-action sniper rifle receiver
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.21, 1.3), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          receiver.position.set(0.3, -0.2, -0.65);
          group.add(receiver);

          // Heavy match-grade barrel
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.029, 1.05, 24), new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.99,
            roughness: 0.03,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          barrel.rotation.z = Math.PI / 2;
          barrel.position.set(0.3, -0.15, -1.35);
          group.add(barrel);

          // Barrel fluting for weight reduction
          for (let i = 0; i < 8; i++) {
            const flute = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.025, 1.05), new THREE.MeshStandardMaterial({
              color: 0x0a0a0a,
              metalness: 0.99,
              roughness: 0.03,
              emissive: 0x080808,
              emissiveIntensity: 0.04
            }));
            flute.position.set(0.3 + Math.cos(i * Math.PI / 4) * 0.032, -0.15, -1.35 + Math.sin(i * Math.PI / 4) * 0.032);
            flute.rotation.z = i * Math.PI / 4;
            group.add(flute);
          }

          // Adjustable stock with cheek rest
          const adjustableStock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.45), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.3,
            roughness: 0.9,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          adjustableStock.position.set(0.3, -0.18, 0.25);
          group.add(adjustableStock);

          // Cheek rest
          const cheekRest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.15), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.4,
            roughness: 0.8,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          cheekRest.position.set(0.3, -0.08, 0.35);
          group.add(cheekRest);

          // Stock adjustment mechanism
          const stockAdjust = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 8), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          stockAdjust.position.set(0.3, -0.12, 0.45);
          stockAdjust.rotation.x = Math.PI / 2;
          group.add(stockAdjust);

          // High-magnification scope
          const scope2 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.55, 20), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.85,
            roughness: 0.2,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          scope2.rotation.z = Math.PI / 2;
          scope2.position.set(0.3, 0.12, -0.55);
          group.add(scope2);

          // Scope lens
          const scopeLens = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 20), new THREE.MeshStandardMaterial({
            color: 0x1a5aaa,
            metalness: 0.95,
            roughness: 0.02,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.1
          }));
          scopeLens.rotation.z = Math.PI / 2;
          scopeLens.position.set(0.3, 0.12, -0.8);
          group.add(scopeLens);

          // Bipod mounting points
          const bipodMount1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.04, 8), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          bipodMount1.position.set(0.28, -0.35, -1.4);
          group.add(bipodMount1);

          const bipodMount2 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.04, 8), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          bipodMount2.position.set(0.32, -0.35, -1.4);
          group.add(bipodMount2);

          // Precision trigger mechanism
          const triggerMech = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.06), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.3,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          triggerMech.position.set(0.3, -0.28, -0.35);
          group.add(triggerMech);

          // Bolt handle
          const boltHandle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.12), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.85,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          boltHandle.position.set(0.35, -0.08, -0.45);
          boltHandle.rotation.z = Math.PI / 6;
          group.add(boltHandle);

          // Magazine
          const magazine = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.08), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.03
          }));
          magazine.position.set(0.3, -0.32, -0.45);
          group.add(magazine);

          // Scope rail
          const scopeRail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.6), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.7,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          scopeRail.position.set(0.3, 0.04, -0.65);
          group.add(scopeRail);
        } else if (name === 'Barrett M82') {
          // .50 BMG anti-materiel rifle receiver
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 1.35), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          receiver.position.set(0.3, -0.2, -0.68);
          group.add(receiver);

          // Massive recoil mitigation system
          const recoilPad = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.2), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.4,
            roughness: 0.9,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          recoilPad.position.set(0.3, -0.18, 0.45);
          group.add(recoilPad);

          // Heavy fluted barrel
          const heavyBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.035, 1.15, 24), new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.99,
            roughness: 0.02,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          heavyBarrel.rotation.z = Math.PI / 2;
          heavyBarrel.position.set(0.3, -0.15, -1.4);
          group.add(heavyBarrel);

          // Barrel fluting
          for (let i = 0; i < 12; i++) {
            const flute = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.03, 1.05), new THREE.MeshStandardMaterial({
              color: 0x0a0a0a,
              metalness: 0.99,
              roughness: 0.02,
              emissive: 0x080808,
              emissiveIntensity: 0.04
            }));
            flute.position.set(0.3 + Math.cos(i * Math.PI / 6) * 0.038, -0.15, -1.4 + Math.sin(i * Math.PI / 6) * 0.038);
            flute.rotation.z = i * Math.PI / 6;
            group.add(flute);
          }

          // Muzzle brake
          const muzzleBrake = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.048, 0.15, 16), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.15,
            emissive: 0x080808,
            emissiveIntensity: 0.05
          }));
          muzzleBrake.rotation.z = Math.PI / 2;
          muzzleBrake.position.set(0.3, -0.15, -1.8);
          group.add(muzzleBrake);

          // Bipod with quick-detach mounts
          const bipodLeg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.01, 0.25, 8), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          bipodLeg1.position.set(0.27, -0.4, -1.5);
          bipodLeg1.rotation.z = -0.3;
          group.add(bipodLeg1);

          const bipodLeg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.01, 0.25, 8), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          bipodLeg2.position.set(0.33, -0.4, -1.5);
          bipodLeg2.rotation.z = 0.3;
          group.add(bipodLeg2);

          // Quick-detach bipod mount
          const bipodMount = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 8), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.95,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          bipodMount.position.set(0.3, -0.15, -1.25);
          group.add(bipodMount);

          // High-magnification scope
          const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 20), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.85,
            roughness: 0.2,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          scope.rotation.z = Math.PI / 2;
          scope.position.set(0.3, 0.12, -0.6);
          group.add(scope);

          // Scope lens
          const scopeLens = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 20), new THREE.MeshStandardMaterial({
            color: 0x1a5aaa,
            metalness: 0.95,
            roughness: 0.02,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.1
          }));
          scopeLens.rotation.z = Math.PI / 2;
          scopeLens.position.set(0.3, 0.12, -0.9);
          group.add(scopeLens);

          // Reinforced receiver
          const reinforcement = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 1.4), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.95,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.05
          }));
          reinforcement.position.set(0.3, -0.04, -0.68);
          group.add(reinforcement);

          // Magazine
          const magazine = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.12), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.4,
            emissive: 0x080808,
            emissiveIntensity: 0.03
          }));
          magazine.position.set(0.3, -0.38, -0.45);
          group.add(magazine);

          // Bolt handle
          const boltHandle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.15), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.85,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          boltHandle.position.set(0.36, -0.08, -0.5);
          boltHandle.rotation.z = Math.PI / 4;
          group.add(boltHandle);

          // Carrying handle
          const carryHandle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.1), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          carryHandle.position.set(0.3, 0.08, -0.2);
          group.add(carryHandle);
        } else if (name === 'Steyr AUG') {
          // Bullpup assault rifle design
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.155, 0.22, 0.92), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          receiver.position.set(0.3, -0.2, -0.48);
          group.add(receiver);

          // Integrated optical sight
          const opticalSight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.06), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.8,
            roughness: 0.3,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          opticalSight.position.set(0.3, 0.08, -0.25);
          group.add(opticalSight);

          // Sight lens
          const sightLens = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.01), new THREE.MeshStandardMaterial({
            color: 0x2a5aaa,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.1
          }));
          sightLens.position.set(0.3, 0.08, -0.22);
          group.add(sightLens);

          // Barrel
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.033, 0.44, 16), new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.98,
            roughness: 0.05,
            emissive: 0x080808,
            emissiveIntensity: 0.04
          }));
          barrel.rotation.z = Math.PI / 2;
          barrel.position.set(0.3, -0.15, -0.9);
          group.add(barrel);

          // Transparent polymer magazine
          const augMag = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.34, 0.14), new THREE.MeshStandardMaterial({
            color: 0x4a4a4a, // Semi-transparent polymer
            metalness: 0.1,
            roughness: 0.9,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          augMag.position.set(0.3, -0.48, -0.35);
          group.add(augMag);

          // Magazine follower visible through transparent polymer
          const magFollower = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.02, 0.12), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.6,
            roughness: 0.7,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          magFollower.position.set(0.3, -0.35, -0.35);
          group.add(magFollower);

          // Ambidextrous controls
          const leftTrigger = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.04), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.85,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          leftTrigger.position.set(0.26, -0.28, -0.2);
          group.add(leftTrigger);

          const rightTrigger = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.04), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.85,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.05
          }));
          rightTrigger.position.set(0.34, -0.28, -0.2);
          group.add(rightTrigger);

          // Modular rail system
          const rail1 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.08), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.7,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          rail1.position.set(0.3, 0.02, -0.48);
          group.add(rail1);

          const rail2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.08), new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.7,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          rail2.position.set(0.3, -0.08, -0.48);
          group.add(rail2);

          // Folding stock
          const foldingStock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.25), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          foldingStock.position.set(0.3, -0.18, 0.2);
          group.add(foldingStock);

          // Stock hinge
          const stockHinge = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 8), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.5,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          stockHinge.position.set(0.3, -0.12, 0.05);
          stockHinge.rotation.x = Math.PI / 2;
          group.add(stockHinge);

          // Bullpup trigger mechanism
          const triggerMech = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.08), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.3,
            emissive: 0x080808,
            emissiveIntensity: 0.06
          }));
          triggerMech.position.set(0.3, -0.28, -0.15);
          group.add(triggerMech);

          // Carrying handle
          const carryHandle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.08), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.5,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.04
          }));
          carryHandle.position.set(0.3, 0.08, -0.1);
          group.add(carryHandle);

          // Forward handguard
          const handguard = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.3, 16), new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.6,
            roughness: 0.4,
            emissive: 0x0a0a0a,
            emissiveIntensity: 0.03
          }));
          handguard.rotation.z = Math.PI / 2;
          handguard.position.set(0.3, -0.15, -0.65);
          group.add(handguard);
        } else if (name === 'Vortex QS-1') {
          // Compact, high-speed sniper marksman design
          // Matte black receiver with machined details
          const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.9), new THREE.MeshStandardMaterial({
            color: 0x111111, // Matte black
            metalness: 0.6,
            roughness: 0.7
          }));
          receiver.position.set(0.3, -0.2, -0.5);
          group.add(receiver);

          // Carbon fiber accents on side
          const carbonPanel = new THREE.Mesh(new THREE.BoxGeometry(0.145, 0.08, 0.6), new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.4,
            roughness: 0.4,
          }));
          carbonPanel.position.set(0.3, -0.2, -0.5);
          group.add(carbonPanel);

          // Fluted lightweight barrel
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.7, 8), new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.9,
            roughness: 0.2
          }));
          barrel.rotation.z = Math.PI / 2;
          barrel.position.set(0.3, -0.15, -1.1);
          group.add(barrel);

          // Barrel shroud/handguard (skeletonized)
          const shroud = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.45), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.8
          }));
          shroud.position.set(0.3, -0.15, -0.8);
          group.add(shroud);

          // Ergonomic grip (textured rubber)
          const grip = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.15, 0.1), new THREE.MeshStandardMaterial({
            color: 0x050505,
            roughness: 1.0
          }));
          grip.position.set(0.3, -0.35, -0.2);
          grip.rotation.x = -0.2;
          group.add(grip);

          // Minimalist angular stock
          const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.35), new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.8
          }));
          stock.position.set(0.3, -0.18, 0.2);
          group.add(stock);

          // Cheek rest (adjustable look)
          const cheekRest = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.15, 6), new THREE.MeshStandardMaterial({
            color: 0x222222
          }));
          cheekRest.rotation.z = Math.PI / 2;
          cheekRest.position.set(0.3, -0.06, 0.25);
          group.add(cheekRest);

          // Detachable box magazine
          const mag = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.1), new THREE.MeshStandardMaterial({
            color: 0x1a1a1a
          }));
          mag.position.set(0.3, -0.35, -0.4);
          mag.rotation.x = 0.1;
          mag.name = 'magazine';
          group.add(mag);

          // Polished silver bolt
          const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12, 8), new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 1.0,
            roughness: 0.1
          }));
          bolt.position.set(0.36, -0.12, -0.3);
          bolt.rotation.z = 0.5;
          bolt.name = 'bolt';
          group.add(bolt);

          // Vortex Prism Scope
          const scopeBody = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.35, 12), new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.8,
            roughness: 0.2
          }));
          scopeBody.rotation.z = Math.PI / 2;
          scopeBody.position.set(0.3, 0.05, -0.35);
          group.add(scopeBody);

          const scopeLens = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 12), new THREE.MeshStandardMaterial({
            color: 0x001133,
            metalness: 1.0,
            roughness: 0.0,
            emissive: 0x001133,
            emissiveIntensity: 0.2
          }));
          scopeLens.rotation.z = Math.PI / 2;
          scopeLens.position.set(0.3, 0.05, -0.53);
          group.add(scopeLens);
        }
      }

      return group;
    };

    wg.add(createWeaponModel(wpName));

    const mf = new THREE.Mesh(new THREE.SphereGeometry(0.15), new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0 }));
    mf.position.set(0.3, -0.15, -1.1);
    wg.add(mf);

    wg.position.set(0.3, -0.2, -0.5);
    wg.rotation.x = 0;

    cameraRef.current.add(wg);
    weaponGroupRef.current = wg;
    sceneRef.current.add(cameraRef.current);
  }, [currentWeapon, selectedLoadout, loadouts, inGame]);

  if (inGame) {
    const wpData = currentWeapon === 'primary' ? primaryWeapons[loadouts[selectedLoadout].primary] : secondaryWeapons[loadouts[selectedLoadout].secondary];

    return (
      <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative', cursor: 'none' }}>
        <div ref={mountRef} style={{ cursor: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '40px', height: '40px', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: '20px', height: '1px', backgroundColor: '#00ff88', top: '50%', left: '50%', transform: 'translateX(-50%)', opacity: 0.8 }}></div>
          <div style={{ position: 'absolute', width: '1px', height: '20px', backgroundColor: '#00ff88', top: '50%', left: '50%', transform: 'translateY(-50%)', opacity: 0.8 }}></div>
          <div style={{ position: 'absolute', width: '6px', height: '6px', backgroundColor: '#00ff88', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', borderRadius: '50%', opacity: 0.6 }}></div>
        </div>
        <div style={{ position: 'absolute', top: 20, left: 20, color: '#0ff', fontFamily: 'monospace', fontSize: '18px', background: 'rgba(0,0,50,0.8)', padding: '15px', borderRadius: '10px', border: '2px solid #0ff' }}>
          <div>SCORE: {gameStats.score}</div>
          <div>HP: {gameStats.health}</div>
          <div>AMMO: {gameStats.ammo}</div>
          <div>KILLS: {gameStats.kills}</div>
          <div>FIRE MODE: {gameStats.firingMode}</div>
        </div>
        <div style={{ position: 'absolute', bottom: 20, left: 20, color: '#0ff', fontFamily: 'monospace', fontSize: '12px', background: 'rgba(0,0,50,0.7)', padding: '10px', borderRadius: '8px' }}>
          <div>WASD: Move | SPACE: Jump | Mouse: Aim</div>
          <div>Left Click: Fire | Right Click (Hold): Zoom Scope</div>
          <div>Mouse Wheel: Switch Weapon | R: Reload | Q: Toggle Fire Mode (SMGs)</div>
          <div style={{ marginTop: '8px', color: currentWeapon === 'primary' ? '#0f0' : '#f0f' }}>CURRENT: {currentWeapon.toUpperCase()}</div>
        </div>
        {isZoomed && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {/* Custom Scope Overlay for Vortex QS-1 */}
            {currentWeapon === 'primary' && loadouts[selectedLoadout].primary === 'Vortex QS-1' ? (
              <>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: 'radial-gradient(circle at center, transparent 30%, #000 70%)' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                  <div style={{ width: '1px', height: '60px', background: 'rgba(0, 255, 255, 0.7)', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
                  <div style={{ width: '60px', height: '1px', background: 'rgba(0, 255, 255, 0.7)', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
                  <div style={{ width: '6px', height: '6px', background: '#0ff', borderRadius: '50%', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', boxShadow: '0 0 10px #0ff' }} />
                  <div style={{ width: '400px', height: '400px', border: '1px solid rgba(0, 255, 255, 0.3)', borderRadius: '50%', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
                </div>
                <div style={{ position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)', color: '#0ff', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px', opacity: 0.8 }}>
                  VORTEX OPTICAL SYSTEM // 6x
                </div>
              </>
            ) : (
              /* Default Scope Overlay */
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <div style={{ width: '3px', height: '30px', background: '#0ff', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
                <div style={{ width: '30px', height: '3px', background: '#0ff', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
                <div style={{ width: '150px', height: '150px', border: '2px solid #0ff', borderRadius: '50%', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', boxShadow: '0 0 20px #0ff, inset 0 0 20px rgba(0,255,255,0.3)' }} />
                {[...Array(12)].map((_, i) => (
                  <div key={i} style={{ width: '2px', height: '10px', background: '#0ff', position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-80px)` }} />
                ))}
              </div>
            )}

            <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', color: '#0ff', fontFamily: 'monospace', fontSize: '14px', textShadow: '0 0 10px #0ff' }}>
              ZOOM: {currentWeapon === 'primary' ? scopes[loadouts[selectedLoadout].primaryScope].zoom : wpData.scopeZoom}x | {wpData.type}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #0a0a1a, #1a1a3a)', overflow: 'auto' }}>
      <div style={{ background: 'rgba(10,10,30,0.95)', borderBottom: '3px solid #0ff', padding: '20px 40px' }}>
        <h1 style={{ color: '#0ff', fontFamily: 'monospace', fontSize: '32px', margin: '0 0 20px 0' }}>ARMORY HUB</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['loadouts', 'gunsmith', 'bots'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '12px 25px', background: activeTab === tab ? '#0ff4' : '#1428', border: `2px solid ${activeTab === tab ? '#0ff' : '#46a'}`, borderRadius: '10px', color: activeTab === tab ? '#0ff' : '#89c', fontFamily: 'monospace', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase' }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'loadouts' && (
        <div style={{ padding: '30px' }}>
          <h2 style={{ color: '#0ff', fontFamily: 'monospace', fontSize: '24px', marginBottom: '25px' }}>LOADOUTS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {loadouts.map((lo, i) => (
              <div key={i} onClick={() => setSelectedLoadout(i)} style={{ background: selectedLoadout === i ? '#0ff1' : '#1428', border: `3px solid ${selectedLoadout === i ? lo.skinColor : '#46a'}`, borderRadius: '15px', padding: '20px', cursor: 'pointer' }}>
                <input value={lo.name} onChange={(e) => { const n = [...loadouts]; n[i].name = e.target.value; setLoadouts(n); }} style={{ background: 'transparent', border: 'none', color: '#0ff', fontFamily: 'monospace', fontSize: '18px', fontWeight: 'bold', outline: 'none', width: '100%', marginBottom: '15px' }} onClick={(e) => e.stopPropagation()} />
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ color: '#aaf', fontSize: '12px', fontFamily: 'monospace', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>PRIMARY WEAPON</label>
                  <select value={lo.primary} onChange={(e) => { const n = [...loadouts]; n[i].primary = e.target.value; setLoadouts(n); }} onClick={(e) => e.stopPropagation()} style={{ width: '100%', padding: '10px', background: '#1428', border: '2px solid #46a', borderRadius: '8px', color: '#0ff', fontFamily: 'monospace', fontSize: '14px', cursor: 'pointer' }}>
                    {Object.keys(primaryWeapons).map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ color: '#aaf', fontSize: '12px', fontFamily: 'monospace', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>SECONDARY WEAPON</label>
                  <select value={lo.secondary} onChange={(e) => { const n = [...loadouts]; n[i].secondary = e.target.value; setLoadouts(n); }} onClick={(e) => e.stopPropagation()} style={{ width: '100%', padding: '10px', background: '#1428', border: '2px solid #46a', borderRadius: '8px', color: '#0ff', fontFamily: 'monospace', fontSize: '14px', cursor: 'pointer' }}>
                    {Object.keys(secondaryWeapons).map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div style={{ background: '#0004', borderRadius: '10px', padding: '15px', border: `2px solid ${lo.skinColor}40`, marginBottom: '10px' }}>
                  <div style={{ color: lo.skinColor, fontSize: '13px', marginBottom: '5px', fontFamily: 'monospace', fontWeight: 'bold' }}>PRIMARY</div>
                  <div style={{ color: '#fff', fontSize: '16px', fontFamily: 'monospace', fontWeight: 'bold' }}>{lo.primary}</div>
                  <div style={{ color: '#aaf', fontSize: '11px', fontFamily: 'monospace', marginTop: '3px' }}>{primaryWeapons[lo.primary].type}</div>
                </div>
                <div style={{ background: '#0044', borderRadius: '10px', padding: '15px', border: `2px solid ${lo.skinColor}40` }}>
                  <div style={{ color: lo.skinColor, fontSize: '13px', marginBottom: '5px', fontFamily: 'monospace', fontWeight: 'bold' }}>SECONDARY</div>
                  <div style={{ color: '#fff', fontSize: '16px', fontFamily: 'monospace', fontWeight: 'bold' }}>{lo.secondary}</div>
                  <div style={{ color: '#aaf', fontSize: '11px', fontFamily: 'monospace', marginTop: '3px' }}>{secondaryWeapons[lo.secondary].type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'gunsmith' && (
        <div style={{ padding: '30px' }}>
          <h2 style={{ color: '#0ff', fontFamily: 'monospace', fontSize: '24px', marginBottom: '25px' }}>GUNSMITH</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
            <div style={{ background: '#1428', border: `3px solid ${loadouts[selectedLoadout].skinColor}`, borderRadius: '15px', padding: '30px' }}>
              <h3 style={{ color: loadouts[selectedLoadout].skinColor, fontSize: '24px', fontFamily: 'monospace', textAlign: 'center', margin: '0 0 20px 0' }}>{loadouts[selectedLoadout].primary}</h3>
              <div style={{ width: '100%', height: '200px', background: `linear-gradient(135deg, ${loadouts[selectedLoadout].skinColor}30, ${loadouts[selectedLoadout].skinColor}10)`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '72px' }}>🔫</div>
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <div style={{ color: '#aaf', fontSize: '14px', fontFamily: 'monospace', marginBottom: '10px' }}>CURRENT SCOPE</div>
                <div style={{ color: '#0ff', fontSize: '18px', fontFamily: 'monospace', fontWeight: 'bold' }}>{loadouts[selectedLoadout].primaryScope || 'Iron Sights'}</div>
                <div style={{ color: '#fff', fontSize: '12px', fontFamily: 'monospace', marginTop: '5px' }}>
                  {loadouts[selectedLoadout].primaryScope ? `${scopes[loadouts[selectedLoadout].primaryScope].zoom}x Zoom` : '1.0x Zoom'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#1428', border: '3px solid #f0f', borderRadius: '15px', padding: '25px' }}>
                <h4 style={{ color: '#f0f', fontFamily: 'monospace', fontSize: '18px', marginBottom: '20px' }}>SKIN</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {skinColors.map(c => (
                    <div key={c} onClick={() => { const n = [...loadouts]; n[selectedLoadout].skinColor = c; setLoadouts(n); }} style={{ height: '50px', background: c, borderRadius: '8px', cursor: 'pointer', border: loadouts[selectedLoadout].skinColor === c ? '3px solid #f0f' : '2px solid #46a' }} />
                  ))}
                </div>
              </div>
              <div style={{ background: '#1428', border: '3px solid #0ff', borderRadius: '15px', padding: '25px' }}>
                <h4 style={{ color: '#0ff', fontFamily: 'monospace', fontSize: '18px', marginBottom: '20px' }}>SCOPE</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                  {Object.entries(scopes).map(([scopeName, scopeData]) => {
                    const weaponType = primaryWeapons[loadouts[selectedLoadout].primary]?.type;
                    const isAllowed =
                      scopeData.category === 'iron' ||
                      (weaponType?.includes('Submachine') && ['low', 'medium'].includes(scopeData.category)) ||
                      (!weaponType?.includes('Submachine') && !weaponType?.includes('Shotgun'));

                    return (
                      <div
                        key={scopeName}
                        onClick={() => isAllowed && (() => { const n = [...loadouts]; n[selectedLoadout].primaryScope = scopeName; setLoadouts(n); })()}
                        style={{
                          padding: '12px',
                          background: (loadouts[selectedLoadout].primaryScope === scopeName) ? '#0ff2' : (isAllowed ? '#1428' : '#3008'),
                          border: `2px solid ${(loadouts[selectedLoadout].primaryScope === scopeName) ? '#0ff' : (isAllowed ? '#46a' : '#600')}`,
                          borderRadius: '8px',
                          color: isAllowed ? '#fff' : '#666',
                          fontFamily: 'monospace',
                          fontSize: '14px',
                          cursor: isAllowed ? 'pointer' : 'not-allowed',
                          textAlign: 'center'
                        }}
                      >
                        {scopeName} ({scopeData.zoom}x)
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bots' && (
        <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ color: '#0ff', fontFamily: 'monospace', fontSize: '24px', marginBottom: '25px' }}>BOT MATCH</h2>
          <div style={{ background: '#1428', border: '3px solid #fa0', borderRadius: '15px', padding: '30px' }}>
            <label style={{ color: '#aaf', fontSize: '12px', fontFamily: 'monospace', display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>DIFFICULTY</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {['easy', 'normal', 'hard', 'insane'].map(d => (
                <button key={d} onClick={() => setBotDifficulty(d)} style={{ flex: 1, padding: '12px', background: botDifficulty === d ? '#fa04' : '#1428', border: `2px solid ${botDifficulty === d ? '#fa0' : '#46a'}`, borderRadius: '8px', color: botDifficulty === d ? '#fa0' : '#89c', fontFamily: 'monospace', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase' }}>
                  {d}
                </button>
              ))}
            </div>
            <label style={{ color: '#aaf', fontSize: '12px', fontFamily: 'monospace', display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>BOT COUNT</label>
            <input type="number" value={botCount} onChange={(e) => setBotCount(Math.max(1, Math.min(30, parseInt(e.target.value) || 5)))} style={{ width: '100%', padding: '12px', background: '#1428', border: '2px solid #46a', borderRadius: '8px', color: '#0ff', fontFamily: 'monospace', fontSize: '14px', marginBottom: '20px' }} />
            <button onClick={() => setInGame(true)} style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #fa0, #f80)', border: 'none', borderRadius: '10px', color: '#000', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }}>START</button>
          </div>
        </div>
      )}

      {inGame && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', fontFamily: 'monospace', color: '#fff', zIndex: 10 }}>
          {/* Crosshair */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '24px', color: '#0ff' }}>+</div>

          {/* Health */}
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '5px' }}>
            HEALTH: {gameStats.health}
          </div>

          {/* Ammo */}
          <div style={{ position: 'absolute', bottom: '20px', right: '20px', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '5px' }}>
            AMMO: {gameStats.ammo}
          </div>

          {/* Hit Marker */}
          {hitMarker && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '48px', color: '#f00' }}>✕</div>}

          {/* Damage Vignette */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: `rgba(255,0,0,${damageVignette})`, pointerEvents: 'none' }}></div>
        </div>
      )}
    </div>
  );
};

export default ArmoryLoadoutHub;