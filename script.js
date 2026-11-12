(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------------- */
  var navToggle = document.getElementById("navToggle");
  var primaryNav = document.getElementById("primaryNav");

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = primaryNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    primaryNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        primaryNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------------------------------------------------
     Glassmorphism nav — frosted background once the page has
     scrolled a little; transparent again back at the top.
  --------------------------------------------------------- */
  var navFloat = document.querySelector(".nav-float");
  if (navFloat) {
    var navTicking = false;
    var updateNavGlass = function () {
      navFloat.classList.toggle("is-scrolled", window.scrollY > 80);
      navTicking = false;
    };
    window.addEventListener("scroll", function () {
      if (!navTicking) { requestAnimationFrame(updateNavGlass); navTicking = true; }
    }, { passive: true });
    updateNavGlass();
  }

  /* ---------------------------------------------------------
     Directional image reveals — About slides in from the left,
     Innovation Question from the right. Replays on re-entry.
  --------------------------------------------------------- */
  var slideImages = document.querySelectorAll(".slide-image");
  if (!reduceMotion && "IntersectionObserver" in window && slideImages.length) {
    var slideObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("in-view", entry.isIntersecting);
      });
    }, { threshold: 0.25 });
    slideImages.forEach(function (img) { slideObserver.observe(img); });
  } else {
    slideImages.forEach(function (img) { img.classList.add("in-view"); });
  }

  /* ---------------------------------------------------------
     Glowing circle behind the hero logo — brightens and grows
     as the page scrolls through the hero, and eases back down
     on scroll up.
  --------------------------------------------------------- */
  var heroGlow = document.getElementById("heroGlow");
  var heroEl = document.getElementById("top");
  if (heroGlow && heroEl) {
    var glowTicking = false;
    var updateHeroGlow = function () {
      var heroHeight = heroEl.clientHeight || window.innerHeight;
      var p = Math.min(Math.max(window.scrollY / (heroHeight * 0.85), 0), 1);
      heroGlow.style.opacity = (0.3 + p * 0.55).toFixed(3);
      heroGlow.style.transform = "translate(-50%, -50%) scale(" + (1 + p * 0.3).toFixed(3) + ")";
      glowTicking = false;
    };
    window.addEventListener("scroll", function () {
      if (!glowTicking) { requestAnimationFrame(updateHeroGlow); glowTicking = true; }
    }, { passive: true });
    updateHeroGlow();
  }

  /* =========================================================
     3D CLOUDS — SETTINGS YOU CAN EDIT
     Change the numbers below, save, and refresh the page.
     ========================================================= */
  var CLOUD_CONFIG = {
    // When the clouds have fully moved away.
    // 0.2 = once 20% of the About image is on screen.
    endAtImagePercent: 0.7,

    // How the clouds follow your scroll.
    // Lower = slower and floatier (try 1.5). Higher = snappier (try 5).
    slideSmoothness: 1.2,

    // How many separate clouds make up the group.
    cloudCountDesktop: 22,
    cloudCountMobile: 12,

    // Shape of the group: 0 = flat line of clouds,
    // 1 = edges clearly higher than the middle (V shape).
    vShapeLift: 1.85,

    // Hover: how close the cursor has to be (bigger = reacts from further away)
    // and how far a cloud 9oves away from it.
    hoverRadius: 2.6,
    hoverPush: 3.9,
    hoverSmoothness: 4,   // how quickly clouds react to the cursor

    // Look
    lumpiness: 0.075,       // bumps on each puff, 0 = perfectly round
    shadeColor: 0x9a8ddc,   // colour of the shaded undersides (hex, like CSS #9a8ddc)
    shadeStrength: .91,    // overall soft light, higher = brighter
    sunStrength: 0.35,       // highlight on the tops, higher = more contrast
    hazeOpacity: 0.7       // faint mist around the cloud edges, 0 = none
  };

  initClouds();

  function initClouds() {
    var C = CLOUD_CONFIG;
    var canvas = document.getElementById("cloudCanvas");
    var aboutSection = document.getElementById("about-section");
    if (!canvas) return;
    if (!window.THREE) { canvas.style.display = "none"; return; }

    var THREE = window.THREE;
    // Pages without the About section (e.g. the years page) have no About image.
    var aboutImage = aboutSection ? (aboutSection.querySelector(".slide-image") || aboutSection) : null;
    var isSmall = window.innerWidth <= 760 ||
      window.matchMedia("(pointer: coarse)").matches;
    var canHover = !reduceMotion &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    } catch (err) {
      canvas.style.display = "none"; // no WebGL — page works fine without clouds
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall ? 1.25 : 2));
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 30);

    // Sky light from above with a lavender bounce from below:
    // white tops, gently shaded undersides.
    scene.add(new THREE.HemisphereLight(0xffffff, C.shadeColor, C.shadeStrength));
    var sun = new THREE.DirectionalLight(0xffffff, C.sunStrength);
    sun.position.set(6, 11, 10);
    scene.add(sun);

    var material = new THREE.MeshLambertMaterial({ color: 0xffffff });

    /* Lumpy sphere variants. Displacement is a smooth function of
       position, so duplicate seam/pole vertices move identically and
       the surface never cracks. */
    function lumpyGeometry(seed) {
      var geo = new THREE.SphereGeometry(1, 32, 24);
      var pos = geo.attributes.position;
      var v = new THREE.Vector3();
      for (var i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        var n1 = Math.sin(v.x * 3.1 + seed) * Math.sin(v.y * 2.7 + seed * 1.7) * Math.sin(v.z * 3.3 + seed * 0.6);
        var n2 = Math.sin(v.x * 6.3 + v.y * 5.1 + seed * 2.1);
        var k = 1 + n1 * C.lumpiness + n2 * C.lumpiness * 0.3;
        pos.setXYZ(i, v.x * k, v.y * k, v.z * k);
      }
      geo.computeBoundingBox();
      geo.computeBoundingSphere();
      return geo;
    }
    var variants = [lumpyGeometry(0.3), lumpyGeometry(1.9), lumpyGeometry(3.7), lumpyGeometry(5.2)];

    // Soft white haze sprite, sits behind each cloud and only shows
    // around its outline.
    function makeMistTexture() {
      var c = document.createElement("canvas");
      c.width = c.height = 128;
      var g = c.getContext("2d");
      var grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.45, "rgba(255,255,255,0.55)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    }
    var mistMaterial = new THREE.SpriteMaterial({
      map: makeMistTexture(), transparent: true, opacity: C.hazeOpacity, depthWrite: false
    });

    // Seeded random so the clouds keep the same shapes across resizes.
    function seededRandom(seed) {
      return function () {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    /* One cloud: a central puff, side puffs, bumps on top and bumps
       underneath, so it reads as a cloud from every edge. */
    var PUFF_LAYOUT = [
      [0, 0, 0, 1.0],
      [-1.0, -0.12, 0.15, 0.78],
      [1.0, -0.12, -0.1, 0.78],
      [-0.45, 0.5, -0.05, 0.72],
      [0.5, 0.45, 0.1, 0.68],
      [-0.55, -0.45, 0.2, 0.6],
      [0.55, -0.48, -0.15, 0.6]
    ];
    function buildCloud(rand, size) {
      var g = new THREE.Group();
      var puffs = PUFF_LAYOUT.slice();
      if (rand() > 0.4) puffs.push([rand() > 0.5 ? -1.6 : 1.6, -0.3, 0, 0.55]);
      puffs.forEach(function (p) {
        var r = p[3] * size * (0.88 + rand() * 0.24);
        var mesh = new THREE.Mesh(variants[Math.floor(rand() * variants.length)], material);
        mesh.position.set(
          (p[0] + (rand() - 0.5) * 0.25) * size,
          (p[1] + (rand() - 0.5) * 0.2) * size,
          (p[2] + (rand() - 0.5) * 0.3) * size);
        mesh.scale.set(r * (1 + rand() * 0.12), r * (0.88 + rand() * 0.12), r);
        mesh.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
        g.add(mesh);
      });
      if (C.hazeOpacity > 0) {
        var mist = new THREE.Sprite(mistMaterial);
        mist.position.set(0, 0, -0.9 * size);
        mist.scale.set(4.8 * size, 3.3 * size, 1);
        g.add(mist);
      }
      return g;
    }

    var bank = new THREE.Group();
    scene.add(bank);
    var clouds = [];
    var viewW = 1, viewH = 1, unit = 1;

    /* Lay the clouds out across the full width in two interleaved
       layers (a higher, larger back row and a lower front row).
       "lift" grows toward the screen edges, giving the V shape. Each
       cloud leaves toward its nearest side, at its own pace, so the
       group breaks up naturally instead of moving as two walls. */
    function layout() {
      var w = canvas.clientWidth || window.innerWidth;
      var h = canvas.clientHeight || window.innerHeight * 0.9;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      viewH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      viewW = viewH * camera.aspect;
      unit = Math.min(viewW / (camera.aspect < 1 ? 9 : 14), viewH / 12);
      // Narrow screens: flatter V so the raised edges stay clear of the text
      var liftScale = (camera.aspect < 1 ? 0.35 : 1) * C.vShapeLift;

      while (bank.children.length) bank.remove(bank.children[0]);
      clouds = [];

      var rand = seededRandom(2026);
      var count = isSmall ? C.cloudCountMobile : C.cloudCountDesktop;
      var left = -(viewW / 2 + unit * 0.5);
      var right = viewW / 2 + unit * 0.5;

      for (var i = 0; i < count; i++) {
        var back = i % 2 === 0;
        var x = left + (right - left) * ((i + 0.5) / count) + (rand() - 0.5) * unit * 0.6;
        var t = Math.min(Math.abs(x) / (viewW / 2), 1);
        var lift = Math.pow(t, 1.35) * liftScale;
        var size = unit * (1 + lift * 1.2 + rand() * 0.3) * (back ? 1.1 : 0.95);
        var y = -0.30 * viewH + size * 1.25 + (back ? 0.02 * viewH : 0) +
          (rand() - 0.5) * unit * 0.1;
        var z = back ? -unit * 1.2 : unit * 0.6;

        var group = buildCloud(rand, size);
        group.position.set(x, y, z);
        bank.add(group);

        clouds.push({
          group: group, baseX: x, baseY: y, z: z, size: size,
          side: Math.abs(x) < unit * 0.1 ? (i % 2 ? 1 : -1) : (x < 0 ? -1 : 1),
          speed: 1 + rand() * 0.6,           // some leave a little earlier
          rise: (rand() - 0.2) * unit * 0.35, // slight float up/down as they go
          phase: rand() * Math.PI * 2,        // idle drift offset
          off: 0, pushX: 0, pushY: 0
        });
      }

      // Distance each cloud must travel to be completely off-screen
      scene.updateMatrixWorld(true);
      var edge = (viewW / 2) * 1.15;
      clouds.forEach(function (c) {
        var box = new THREE.Box3().setFromObject(c.group);
        c.off = c.side < 0 ? -(box.max.x + edge) : (-box.min.x + edge);
        c.off += c.side * C.hoverPush * unit; // margin for hover movement
      });
    }

    /* Scroll position at which the chosen share of the About image
       is on screen (default 20%). The clouds are fully gone there. */
    var span = 1;
    function measureSpan() {
      if (!aboutImage) {
        // No About image on this page: the clouds are gone once the footer is revealed.
        var maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        span = Math.max(maxScroll * 0.85, 1);
        return;
      }
      var r = aboutImage.getBoundingClientRect();
      var imgTop = r.top + window.scrollY;
      span = Math.max(imgTop + r.height * C.endAtImagePercent - window.innerHeight, 1);
    }

    function scrollTarget() {
      return Math.min(Math.max(window.scrollY / span, 0), 1);
    }

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Cursor position, converted into the clouds' coordinate space
    var pointer = { clientX: 0, clientY: 0, has: false, active: false, x: 0, y: 0 };
    if (canHover) {
      window.addEventListener("pointermove", function (ev) {
        if (ev.pointerType && ev.pointerType !== "mouse") return;
        pointer.clientX = ev.clientX;
        pointer.clientY = ev.clientY;
        pointer.has = true;
      }, { passive: true });
      document.addEventListener("mouseleave", function () { pointer.has = false; });
    }
    function updatePointer() {
      if (!pointer.has) { pointer.active = false; return; }
      var r = canvas.getBoundingClientRect();
      var nx = (pointer.clientX - r.left) / r.width;
      var ny = (pointer.clientY - r.top) / r.height;
      pointer.active = nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1;
      pointer.x = (nx * 2 - 1) * viewW / 2;
      pointer.y = -(ny * 2 - 1) * viewH / 2;
    }

    function place(p, time, dt) {
      var hoverK = 1 - Math.exp(-dt * C.hoverSmoothness);
      clouds.forEach(function (c) {
        var e = easeInOutCubic(Math.min(p * c.speed, 1));
        var driftX = reduceMotion ? 0 : Math.sin(time * 0.2 + c.phase) * unit * 0.08;
        var bob = reduceMotion ? 0 : Math.sin(time * 0.45 + c.phase) * unit * 0.06;
        var x = c.baseX + c.off * e + driftX;
        var y = c.baseY + c.rise * e + bob;

        if (canHover) {
          // Push away from the cursor, strongest when it's right on the cloud
          var tx = 0, ty = 0;
          if (pointer.active) {
            var dx = x - pointer.x, dy = y - pointer.y;
            var d = Math.sqrt(dx * dx + dy * dy);
            var R = C.hoverRadius * c.size;
            if (d < R) {
              if (d < 0.001) { dx = 0; dy = 1; d = 1; }
              var s = Math.pow(1 - Math.min(d / R, 1), 2) * C.hoverPush * unit;
              tx = (dx / d) * s;
              ty = (dy / d) * s * 0.6;
            }
          }
          c.pushX += (tx - c.pushX) * hoverK;
          c.pushY += (ty - c.pushY) * hoverK;
          x += c.pushX;
          y += c.pushY;
        }
        c.group.position.set(x, y, c.z);
      });
    }

    layout();
    measureSpan();
    // The About image may finish loading after this runs; re-measure then.
    if (aboutImage && aboutImage.tagName === "IMG" && !aboutImage.complete) {
      aboutImage.addEventListener("load", measureSpan);
    }
    window.addEventListener("load", measureSpan);

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        layout();
        measureSpan();
        if (reduceMotion) { place(scrollTarget(), 0, 0); renderer.render(scene, camera); }
      }, 150);
    });

    if (reduceMotion) {
      // No continuous loop, drift or hover: snap into place on scroll.
      var rmTicking = false;
      var renderStatic = function () {
        place(scrollTarget(), 0, 0);
        renderer.render(scene, camera);
        rmTicking = false;
      };
      window.addEventListener("scroll", function () {
        if (!rmTicking) { requestAnimationFrame(renderStatic); rmTicking = true; }
      }, { passive: true });
      renderStatic();
      return;
    }

    /* Damped follow: the clouds ease toward where the scroll says
       they should be instead of tracking it exactly, so they glide.
       Frame-rate independent, so speed is the same on every screen. */
    var progress = scrollTarget();
    var restingOffscreen = false;
    var lastTime = performance.now();

    (function loop(now) {
      requestAnimationFrame(loop);
      now = now || performance.now();
      var dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      var target = scrollTarget();
      progress += (target - progress) * (1 - Math.exp(-dt * C.slideSmoothness));
      if (Math.abs(target - progress) < 0.001) progress = target;

      // Fully gone and settled: draw one last frame, then pause
      // rendering until the user scrolls back up.
      if (progress >= 1 && target >= 1) {
        if (!restingOffscreen) {
          place(1, now / 1000, dt);
          renderer.render(scene, camera);
          restingOffscreen = true;
        }
        return;
      }
      restingOffscreen = false;

      updatePointer();
      place(progress, now / 1000, dt);
      renderer.render(scene, camera);
    })();
  }

  /* =========================================================
     LAUNCH ROCKET — SETTINGS YOU CAN EDIT
     One rocket flies from behind the clouds (bottom-left), past
     the logo and text, and out the top, leaving a gold trail.
     ========================================================= */
  var ROCKET_CONFIG = {
    sizeDesktop: 90,          // rocket height in pixels on desktop
    sizeMobile: 60,           // rocket height in pixels on phones
    duration: 5,              // seconds for the whole flight (higher = slower)
    startDelay: 0.5,          // seconds to wait before it launches

    // Flight path inside the header: [left-to-right, top-to-bottom],
    // 0 = left/top edge, 1 = right/bottom edge. Below 0 or above 1 is off-screen.
    // Start point, two bend points, end point.
    path: [[0.05, 1.02], [0.28, 0.55], [0.70, 0.55], [0.74, -0.25]],

    // Gold trail
    trailColors: ["242,183,5", "247,203,62", "227,169,0", "255,217,90"], // r,g,b
    trailPuffsPerSecond: 90,  // more = thicker trail
    trailLife: 1.8,           // seconds each puff lasts (higher = longer trail)
    trailSize: 14,            // starting puff size in pixels (they swell as they fade)
    trailOpacity: 0.55,       // how strong the trail is, 0 to 1

    // Rocket colours
    bodyColor: "#262B86",
    finColor: "#F2B705",
    windowColor: "#F8F7F4"
  };

  initLaunchRocket();

  function initLaunchRocket() {
    var R = ROCKET_CONFIG;
    var canvas = document.getElementById("launchCanvas");
    var hero = document.getElementById("top");
    if (!canvas || !hero || reduceMotion) return;
    var ctx = canvas.getContext("2d");
    if (!ctx || typeof Path2D === "undefined") return;

    var isSmall = window.innerWidth <= 760 ||
      window.matchMedia("(pointer: coarse)").matches;
    var size = isSmall ? R.sizeMobile : R.sizeDesktop;
    var puffRate = R.trailPuffsPerSecond * (isSmall ? 0.7 : 1);
    var puffSize = R.trailSize * (isSmall ? 0.75 : 1);

    // Rocket drawn from the same shapes as the old small rockets
    // (40 x 40 design box, nose pointing up).
    var bodyPath = new Path2D("M20 4 C27 10 29 20 26 30 L14 30 C11 20 13 10 20 4 Z");
    var finLeft = new Path2D("M14 26 L5 34 L15 31 Z");
    var finRight = new Path2D("M26 26 L35 34 L25 31 Z");
    var nozzleY = 31;                 // where the exhaust comes out, in the design box
    var designCenterY = 19;
    var scale = size / 34;            // the design is ~34 units tall

    // Pre-rendered soft puff for each trail colour (cheaper than
    // building a gradient for every puff on every frame).
    var puffSprites = R.trailColors.map(function (rgb) {
      var c = document.createElement("canvas");
      c.width = c.height = 64;
      var g = c.getContext("2d");
      var grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(" + rgb + ",1)");
      grad.addColorStop(0.45, "rgba(" + rgb + ",0.55)");
      grad.addColorStop(1, "rgba(" + rgb + ",0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
      return c;
    });

    var W = 1, H = 1, dpr = 1;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth || hero.clientWidth;
      H = canvas.clientHeight || hero.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    // Position and direction along the curved path (cubic Bezier).
    function pathAt(t) {
      var p = R.path;
      var x0 = p[0][0] * W, y0 = p[0][1] * H, x1 = p[1][0] * W, y1 = p[1][1] * H;
      var x2 = p[2][0] * W, y2 = p[2][1] * H, x3 = p[3][0] * W, y3 = p[3][1] * H;
      var u = 1 - t;
      return {
        x: u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
        y: u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3,
        dx: 3 * u * u * (x1 - x0) + 6 * u * t * (x2 - x1) + 3 * t * t * (x3 - x2),
        dy: 3 * u * u * (y1 - y0) + 6 * u * t * (y2 - y1) + 3 * t * t * (y3 - y2)
      };
    }

    // Starts gently behind the clouds, then speeds up like a launch.
    function launchEase(t) { return 0.5 * t + 0.5 * t * t; }

    var puffs = [];
    var flight = { active: false, time: 0, wait: 0, emitCarry: 0 };
    var running = false, lastNow = 0;

    function emitPuffs(dt, pos, angle) {
      // Nozzle position: behind the rocket's centre along its heading.
      var back = (nozzleY - designCenterY) * scale;
      var nx = pos.x - Math.sin(angle) * back;
      var ny = pos.y + Math.cos(angle) * back;
      // Exhaust direction (opposite to travel).
      var ex = -Math.sin(angle), ey = Math.cos(angle);

      flight.emitCarry += puffRate * dt;
      while (flight.emitCarry >= 1) {
        flight.emitCarry -= 1;
        var sparkle = Math.random() < 0.08;
        var speed = 30 + Math.random() * 50;
        var spread = (Math.random() - 0.5) * 0.9;
        puffs.push({
          x: nx + (Math.random() - 0.5) * size * 0.12,
          y: ny + (Math.random() - 0.5) * size * 0.12,
          vx: (ex + ey * spread) * speed,
          vy: (ey - ex * spread) * speed,
          age: 0,
          life: sparkle ? R.trailLife * 0.45 : R.trailLife * (0.7 + Math.random() * 0.5),
          size: sparkle ? 2 + Math.random() * 2 : puffSize * (0.7 + Math.random() * 0.6),
          sprite: puffSprites[Math.floor(Math.random() * puffSprites.length)],
          sparkle: sparkle
        });
      }
    }

    function drawRocket(pos, angle, time) {
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(angle);
      ctx.scale(scale, scale);
      ctx.translate(-20, -designCenterY);

      // Flickering flame at the nozzle
      var flick = 0.75 + Math.sin(time * 40) * 0.15 + Math.random() * 0.1;
      var flame = ctx.createRadialGradient(20, nozzleY + 2, 0, 20, nozzleY + 2, 7 * flick);
      flame.addColorStop(0, "rgba(255,248,220,0.95)");
      flame.addColorStop(0.5, "rgba(247,203,62,0.7)");
      flame.addColorStop(1, "rgba(242,183,5,0)");
      ctx.fillStyle = flame;
      ctx.beginPath();
      ctx.arc(20, nozzleY + 2, 7 * flick, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = R.finColor;
      ctx.fill(finLeft);
      ctx.fill(finRight);
      ctx.fillStyle = R.bodyColor;
      ctx.fill(bodyPath);
      ctx.fillStyle = R.windowColor;
      ctx.beginPath();
      ctx.arc(20, 16, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function frame(now) {
      var dt = lastNow ? Math.min((now - lastNow) / 1000, 0.05) : 0.016;
      lastNow = now;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // Advance the flight
      var pos = null, angle = 0;
      if (flight.active) {
        if (flight.wait > 0) {
          flight.wait -= dt;
        } else {
          flight.time += dt;
          var t = flight.time / R.duration;
          if (t >= 1) {
            flight.active = false;
          } else {
            pos = pathAt(launchEase(t));
            angle = Math.atan2(pos.dy, pos.dx) + Math.PI / 2; // design points up
            emitPuffs(dt, pos, angle);
          }
        }
      }

      // Trail: puffs drift, slow down, swell and fade
      for (var i = puffs.length - 1; i >= 0; i--) {
        var p = puffs[i];
        p.age += dt;
        var k = p.age / p.life;
        if (k >= 1) { puffs.splice(i, 1); continue; }
        var drag = Math.exp(-dt * 2.2);
        p.vx *= drag;
        p.vy *= drag;
        p.x += p.vx * dt;
        p.y += p.vy * dt - 6 * dt; // a slight upward drift, like warm exhaust
        var s = p.sparkle ? p.size : p.size * (1 + k * 1.6);
        ctx.globalAlpha = (p.sparkle ? 0.9 : R.trailOpacity) * Math.pow(1 - k, 1.6);
        ctx.drawImage(p.sprite, p.x - s, p.y - s, s * 2, s * 2);
      }
      ctx.globalAlpha = 1;

      if (pos) drawRocket(pos, angle, now / 1000);

      // Keep going while the rocket flies or the trail is still fading;
      // then stop drawing entirely until the next launch.
      if (flight.active || puffs.length) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, W, H);
        running = false;
      }
    }

    function launch(delay) {
      flight.active = true;
      flight.time = 0;
      flight.wait = delay;
      flight.emitCarry = 0;
      if (!running) {
        running = true;
        lastNow = 0;
        requestAnimationFrame(frame);
      }
    }

    // Launch on page load, and again whenever the user scrolls back up
    // to the header after leaving it.
    launch(R.startDelay);
    if ("IntersectionObserver" in window) {
      var leftHero = false;
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            leftHero = true;
          } else if (leftHero && !flight.active) {
            leftHero = false;
            puffs.length = 0;
            launch(0.3);
          }
        });
      }, { threshold: 0.5 }).observe(hero);
    }
  }
})();