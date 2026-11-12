(function () {
  "use strict";

  /* =========================================================
     ROBOT — SETTINGS YOU CAN EDIT
     Change the numbers below, save, and refresh the page.
     ========================================================= */
  var ROBOT_CONFIG = {
    // Robot height compared with the header logo's height (0.7 = 70%).
    sizeVsLogo: 0.7,

    // 1) HEADER: sits on the bottom-right clouds, waving.
    headerX: 0.84,                 // across the screen: 0 = left edge, 1 = right edge
    headerSeatAboveBottomVh: 20,   // seat height above the bottom of the header (% of screen height)

    // 2) ABOUT IMAGE: lies down in the upper-left, hands behind its head.
    aboutX: 0.12,                  // across the image: 0 = left edge, 1 = right edge
    aboutY: 0.20,                  // down the image: 0 = top, 1 = bottom (where its back rests)

    // 3) INNOVATION QUESTION IMAGE: stands bottom-right, reading the text.
    questionX: 0.925,
    questionY: 0.95,

    // 4) FOOTER: sits at the bottom-right.
    footerRightInset: 0.07,        // distance from the right edge (fraction of screen width)

    // 5) PINNED MODE (the category pages): the robot stays in the bottom-right corner of the
    //    screen, sitting and waving, instead of travelling. A page turns this on with
    //    data-robot-mode="pinned" on its <body> tag.
    pinnedRightPx: 96,             // distance from the right edge of the screen (pixels)
    pinnedBottomPx: 10,            // how far its seat is above the bottom edge (pixels)

    // When it gets to each spot, as you scroll.
    // 0.35 = the spot is 35% of the way down the screen when the robot arrives.
    arriveAboutAt: 0.35,
    arriveQuestionAt: 0.85,
    holdScreens: 0.10,             // how long it stays put at each spot (in screen heights of scrolling)

    // How the robot is turned (degrees). Positive = turns toward the right of the screen.
    lyingTurn: 25,                 // while lying down
    readingTurn: -25,              // body turn while reading
    walkTurn: 70,                  // while walking or running (turns toward where it is heading)
    headTurnYaw: -40,              // reading: head turns left (negative) or right (positive)
    headTurnPitch: -26,            // reading: head looks up (negative) or down (positive)

    // Colours (hex, like CSS #262B86 but written 0x262B86)
    bodyColor: 0x262B86,           // main body - blue
    accentColor: 0xF2B705,         // feet, hands, joints - gold
    eyeColor: 0x10143A             // eyes and visor - dark blue
  };

  /* ---------------------------------------------------------
     Guards: skip entirely (the page works without the robot)
     if the visitor prefers reduced motion or 3D isn't available.
  --------------------------------------------------------- */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var canvas = document.getElementById("robotCanvas");
  if (!canvas || !window.THREE || !THREE.GLTFLoader || !window.NEXTGEN_ROBOT_GLB) return;

  var CFG = ROBOT_CONFIG;
  // A page can move the header seat to suit its own clouds, with attributes on <body>:
  //   data-robot-seat-vh="26"  data-robot-seat-vh-mobile="14"   (see years.html)
  (function () {
    var d = document.body.dataset;
    var v = window.innerWidth <= 760 && d.robotSeatVhMobile ? d.robotSeatVhMobile : d.robotSeatVh;
    if (v !== undefined && !isNaN(parseFloat(v))) CFG.headerSeatAboveBottomVh = parseFloat(v);
  })();

  /* ---------------------------------------------------------
     Hooks for the chat widget (chat-widget.js)
       NextGenRobot.dock({ x, seatY })   sit on top of the chat panel (screen pixels); dock(null) goes back
       NextGenRobot.setMood(name)         "wave" | "think" | "yes" | "no": how it reacts while docked
       NextGenRobot.onMove = function (rect, visible) {}   called every frame with the robot's area on screen
     A "nextgen-robot-ready" event fires on the page once the robot is drawn.
     If this file stops early (reduced motion, no 3D), none of this exists and the widget uses its own button.
  --------------------------------------------------------- */
  var API = window.NextGenRobot = window.NextGenRobot || {};
  API.ready = false;
  API.mood = "wave";
  API.dockTarget = null;
  var dockArrived = false, returning = false;
  API.setMood = function (name) { API.mood = name || "wave"; };
  API.dock = function (target) {
    if (target) {
      if (!API.dockTarget) dockArrived = false;   // starting to dock: hop over first
      API.dockTarget = { x: target.x, seatY: target.seatY };
    } else if (API.dockTarget) {
      API.dockTarget = null; dockArrived = false; returning = true;   // go back to where the page route says it should be
    }
  };

  /* Facts about the model (measured from the file) */
  var MODEL_H = 4.46;   // standing height in model units
  var SEAT_H = 0.82;    // how far the seat is above the feet when sitting
  var BOX = { left: -6, right: 6, top: 9.8, bottom: -1.0 }; // drawing area around the robot, model units
  var LYING = {"Body":{"q":[-0.5,0.5,0.5,0.5],"t":[0.00783,0.0155,0.00308]},"UpperArm.R":{"q":[0.50384,0.65696,-0.36533,0.42554]},"UpperArm.L":{"q":[0.38029,-0.49479,0.50804,0.59368]},"LowerArm.R":{"q":[-0.51126,0.0192,0.78969,-0.33858]},"LowerArm.L":{"q":[0.42231,-0.19123,0.83772,0.28863]},"UpperLeg.R":{"q":[0.99035,0.02315,0.13482,0.02204]},"UpperLeg.L":{"q":[0.99567,0.01771,-0.0873,0.02661]},"LowerLeg.R":{"q":[0.03825,-0.00891,0.0309,0.99875]},"LowerLeg.L":{"q":[0.04776,-0.00336,0.01166,0.99878]},"Foot.R":{"q":[0.05569,-0.72466,0.07659,0.68256],"t":[0.02223,0.01361,0.00929]},"Foot.L":{"q":[0.06456,-0.69062,0.07075,0.71685],"t":[0.02223,0.01361,-0.00345]},"Head":{"q":[-0.03092,-0.00286,-0.00128,0.99952]}};

  /* =========================================================
     SCHEDULE — works out, for any scroll position, whether the
     robot is resting at a spot or travelling to the next one.
     ========================================================= */
  function buildSchedule(settle, vh, maxScroll, holdScreens) {
    var n = settle.length, s = settle.slice();
    s[0] = 0;
    s[n - 1] = Math.max(maxScroll, 1);
    var gapMin = Math.min(0.25 * vh, s[n - 1] / (n * 1.5));
    var i;
    for (i = n - 2; i >= 1; i--) s[i] = Math.min(s[i], s[i + 1] - gapMin);
    for (i = 1; i < n - 1; i++) s[i] = Math.max(s[i], s[i - 1] + gapMin);
    for (i = 1; i < n; i++) {
      if (s[i] - s[i - 1] < 1) { // page too short: space the spots evenly instead
        for (var k = 0; k < n; k++) s[k] = s[n - 1] * k / (n - 1);
        break;
      }
    }
    var a = [], d = [];
    for (i = 0; i < n; i++) {
      var prev = i > 0 ? s[i] - s[i - 1] : Infinity;
      var next = i < n - 1 ? s[i + 1] - s[i] : Infinity;
      var h = i === n - 1
        ? Math.min(0.03 * vh, 0.32 * prev)   // last spot: arrive just before the end of the page
        : Math.min(holdScreens * vh, 0.32 * Math.min(prev, next));
      a.push(i === 0 ? -Infinity : s[i] - h);
      d.push(i === n - 1 ? Infinity : s[i] + h);
    }
    return { s: s, a: a, d: d, n: n };
  }

  function evaluate(sch, y) {
    if (y <= sch.d[0]) return { kind: "hold", i: 0 };
    for (var i = 0; i < sch.n - 1; i++) {
      if (y < sch.a[i + 1]) {
        var span = sch.a[i + 1] - sch.d[i];
        return { kind: "travel", from: i, to: i + 1, u: span > 0 ? Math.min(Math.max((y - sch.d[i]) / span, 0), 1) : 1 };
      }
      if (y <= sch.d[i + 1]) return { kind: "hold", i: i + 1 };
    }
    return { kind: "hold", i: sch.n - 1 };
  }

  // What the robot does while resting at each spot
  var HOLD_STATE = { header: "sitWave", about: "lie", question: "read", footer: "sit" };
  // While travelling between two spots: [from-fraction, to-fraction, state]
  var TRAVEL_STATE = {
    "header>about":    [[0, 0.14, "jump"], [0.14, 1, "walk"]],     // hops off the clouds, then walks
    "about>question":  [[0, 0.12, "jump"], [0.12, 1, "run"]],      // jumps up, then runs
    "question>footer": [[0, 0.45, "run"], [0.45, 0.8, "jump"], [0.8, 1, "sit"]],  // runs, jumps, then sits down
    // Pages with only a header and a footer spot (e.g. the years page)
    "header>footer":   [[0, 0.14, "jump"], [0.14, 0.6, "run"], [0.6, 0.82, "jump"], [0.82, 1, "sit"]]
  };
  function travelState(fromId, toId, u) {
    var list = TRAVEL_STATE[fromId + ">" + toId] || [];
    for (var i = 0; i < list.length; i++) if (u >= list[i][0] && u <= list[i][1]) return list[i][2];
    return "walk";
  }

  /* =========================================================
     LAYOUT — where each spot is on the page (in page pixels)
     ========================================================= */
  var layout = null;

  function pictureRect(section) {
    var img = section && section.querySelector(".slide-image");
    if (!img) return null;
    var sr = section.getBoundingClientRect();
    var nw = img.naturalWidth || 16, nh = img.naturalHeight || 9;
    var ew = img.offsetWidth, eh = img.offsetHeight;
    if (!ew || !eh) return null;
    var k = Math.min(ew / nw, eh / nh), w = nw * k, h = nh * k;
    return {
      x: sr.left + window.scrollX + img.offsetLeft + (ew - w) / 2,
      y: sr.top + window.scrollY + img.offsetTop + (eh - h) / 2,
      w: w, h: h
    };
  }

  function measure() {
    var vw = window.innerWidth, vh = window.innerHeight, sy = window.scrollY;
    // The big header logo sets the robot's size. Pages with a smaller logo (hero-logo--compact)
    // use the same size the home page logo would have, so the robot looks the same everywhere.
    var logo = document.querySelector(".hero-logo:not(.hero-logo--compact)");
    var hero = document.getElementById("top");
    var about = document.getElementById("about-section");
    var question = document.getElementById("innovation-question");
    var footBottom = document.querySelector(".footer-bottom");
    var pinned = document.body.dataset.robotMode === "pinned";
    if (!pinned && (!hero || !footBottom)) return;

    var ratio = logo && logo.naturalWidth && logo.naturalHeight ? logo.naturalWidth / logo.naturalHeight : 3.063;
    var logoW = logo ? logo.offsetWidth : Math.min(560, vw * 0.8);
    var px = Math.max((logoW / ratio) * CFG.sizeVsLogo, 24);   // robot height in pixels
    var unit = px / MODEL_H;                                   // pixels per model unit
    var docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);

    if (pinned) {
      layout = {
        unit: unit, pinned: true, stops: [], vh: vh, sched: null,
        pinX: vw - Math.min(CFG.pinnedRightPx, vw * 0.22),
        pinY: vh - CFG.pinnedBottomPx + SEAT_H * unit,         // where its feet are, measured on screen
        key: [vw, vh, docH, Math.round(px)].join(",")
      };
      return;
    }

    var heroBottom = hero.getBoundingClientRect().bottom + sy;
    var footTop = footBottom.getBoundingClientRect().top + sy;

    var stops = [
      { id: "header", settle: 0, x: CFG.headerX * vw,
        y: heroBottom - (CFG.headerSeatAboveBottomVh / 100) * vh + SEAT_H * unit }
    ];
    if (about && question) {
      var picA = pictureRect(about), picB = pictureRect(question);
      if (!picA || !picB) return;
      var yA = picA.y + picA.h * CFG.aboutY, yB = picB.y + picB.h * CFG.questionY;
      stops.push({ id: "about", x: picA.x + picA.w * CFG.aboutX, y: yA, settle: yA - CFG.arriveAboutAt * vh });
      stops.push({ id: "question", x: picB.x + picB.w * CFG.questionX, y: yB, settle: yB - CFG.arriveQuestionAt * vh });
    }
    stops.push({ id: "footer", settle: 0, x: vw * (1 - CFG.footerRightInset), y: footTop + SEAT_H * unit - 2 });

    layout = {
      unit: unit, stops: stops, vh: vh,
      sched: buildSchedule(stops.map(function (s) { return s.settle; }), vh, docH - vh, CFG.holdScreens),
      key: [vw, vh, docH, Math.round(px)].join(",")
    };
  }

  /* =========================================================
     3D SCENE
     ========================================================= */
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  } catch (err) { return; }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.OrthographicCamera(BOX.left, BOX.right, BOX.top, BOX.bottom, 0.1, 100);
  camera.position.set(0, 0, 30);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xaab2e6, 0.7));
  var key = new THREE.DirectionalLight(0xffffff, 0.45);
  key.position.set(4, 8, 10);
  scene.add(key);

  var holder = new THREE.Group();   // moved/turned as a whole
  scene.add(holder);

  var mixer = null, ACTION = {}, W = {}, curState = "", headBone = null;
  var headW = 0, headQ = new THREE.Quaternion(), headDelta = new THREE.Quaternion().setFromEuler(new THREE.Euler(CFG.headTurnPitch * Math.PI / 180, CFG.headTurnYaw * Math.PI / 180, 0, "YXZ"));
  var tmpQ = new THREE.Quaternion();

  function base64ToBuffer(b64) {
    var bin = atob(b64), n = bin.length, bytes = new Uint8Array(n);
    for (var i = 0; i < n; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  }
  function baseName(name) { return name.replace(/_\d+$/, ""); }
  function sanitize(name) { return name.replace(/\s/g, "_").replace(/[\[\]\.:\/]/g, ""); }

  function build(gltf) {
    var model = gltf.scene;
    var bones = {};
    model.traverse(function (o) {
      if (o.isMesh || o.isSkinnedMesh) {
        o.frustumCulled = false; // posed far from the rest pose; never let it be culled
        var m = o.material;
        if (m) {
          m.metalness = 0.05; m.roughness = 0.75;
          if (m.name === "Main") m.color.setHex(CFG.bodyColor);
          else if (m.name === "Grey") m.color.setHex(CFG.accentColor);
          else if (m.name === "Black") m.color.setHex(CFG.eyeColor);
        }
      }
      if (o.isBone) bones[baseName(o.name)] = o;
    });
    holder.add(model);
    headBone = bones["Head"] || null;

    var clips = {};
    gltf.animations.forEach(function (c) { clips[c.name] = c; });
    function need() { for (var i = 0; i < arguments.length; i++) if (!clips[arguments[i]]) return false; return true; }
    if (!need("Sitting", "Wave", "Idle", "Walking", "Running", "Jump")) return;

    function trackBase(t) { return baseName(t.name.slice(0, t.name.lastIndexOf("."))); }
    function subClip(src, name, keep) {
      return new THREE.AnimationClip(name, src.duration,
        src.tracks.filter(keep).map(function (t) { return t.clone(); }));
    }
    var RIGHT_ARM = ["ShoulderR", "UpperArmR", "LowerArmR", "IndexR", "Index2R", "Middle1R", "Middle2R", "Ring1R", "Ring2R", "ThumbR", "Thumb2R"];

    // The pose for lying down on its back with hands behind its head
    var lyingTracks = [];
    Object.keys(LYING).forEach(function (nm) {
      var b = bones[sanitize(nm)];
      if (!b) return;
      var d = LYING[nm];
      lyingTracks.push(new THREE.QuaternionKeyframeTrack(b.name + ".quaternion", [0, 1], d.q.concat(d.q)));
      if (d.t) lyingTracks.push(new THREE.VectorKeyframeTrack(b.name + ".position", [0, 1], d.t.concat(d.t)));
    });

    mixer = new THREE.AnimationMixer(model);
    function add(name, clip, once) {
      var a = mixer.clipAction(clip);
      a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
      a.clampWhenFinished = true;
      a.setEffectiveWeight(0);
      a.play();
      ACTION[name] = a; W[name] = 0;
    }
    add("sit", clips["Sitting"], true);
    // Sitting without the right forearm, so the wave arm can take over
    add("sitBase", subClip(clips["Sitting"], "SitBase", function (t) { return trackBase(t) !== "LowerArmR"; }), true);
    // Only the right arm of the Wave clip, played on top of the seated body
    add("wave", subClip(clips["Wave"], "WaveArm", function (t) { return RIGHT_ARM.indexOf(trackBase(t)) !== -1; }), false);
    add("lying", new THREE.AnimationClip("Lying", 1, lyingTracks), false);
    add("idle", clips["Idle"], false);
    add("walk", clips["Walking"], false);
    add("run", clips["Running"], false);
    add("jump", clips["Jump"], false);

    // Chat reactions, played on the seated robot. Each uses only the parts of its clip that do not
    // fight the sitting pose. Skipped (and the robot just waves) if the model lacks the clip.
    add("sitNoHead", subClip(clips["Sitting"], "SitNoHead", function (t) { return trackBase(t) !== "Head"; }), true);
    add("sitCore", subClip(clips["Sitting"], "SitCore", function (t) { var b = trackBase(t); return b !== "Head" && b !== "LowerArmR"; }), true);
    if (clips["ThumbsUp"]) {
      var THUMBS = ["UpperArmR", "LowerArmR", "IndexR", "Middle1R", "Ring1R", "ThumbR", "Thumb2R", "Head"];
      add("thumbs", subClip(clips["ThumbsUp"], "ThumbsArm", function (t) { return THUMBS.indexOf(trackBase(t)) !== -1; }), true);
    }
    if (clips["No"]) add("shake", subClip(clips["No"], "HeadShake", function (t) { return trackBase(t) === "Head"; }), true);

    ready = true;
    API.ready = true;
    try { document.dispatchEvent(new CustomEvent("nextgen-robot-ready")); } catch (err) { /* very old browsers */ }
  }

  var STATE_WEIGHTS = {
    sitWave: { sitBase: 1, wave: 1 },
    sit: { sit: 1 },
    lie: { lying: 1 },
    idle: { idle: 1 },
    read: { idle: 1 },
    walk: { walk: 1 },
    run: { run: 1 },
    jump: { jump: 1 },
    // while docked on the chat panel
    chatThink: { sit: 1 },
    chatYes: { sitCore: 1, thumbs: 1 },
    chatNo: { sitNoHead: 1, shake: 1 }
  };
  var MOOD_STATE = { wave: "sitWave", think: "chatThink", yes: "chatYes", no: "chatNo" };
  var HEAD_TURN = { read: 1, chatThink: 1 };   // states in which the head turns up and to the side
  function moodState(name) {
    var st = MOOD_STATE[name] || "sitWave";
    return Object.keys(STATE_WEIGHTS[st]).every(function (a) { return ACTION[a]; }) ? st : "sitWave";
  }
  var YAW_DEG = { sitWave: 0, sit: 0, idle: 0, lie: CFG.lyingTurn, read: CFG.readingTurn };

  function setState(name, snap) {
    if (name === curState) return;
    var target = STATE_WEIGHTS[name];
    Object.keys(ACTION).forEach(function (k) {
      // Restart an action's clip when it comes back in, so sitting down / jumping begin from the start
      if (target[k] && (snap || W[k] < 0.02)) ACTION[k].reset().play();
      if (snap) W[k] = target[k] || 0;
    });
    curState = name;
  }

  /* =========================================================
     FRAME LOOP
     ========================================================= */
  var ready = false;
  var pos = null;                 // smoothed page position of the robot
  var vel = { x: 0, y: 0 };
  var yaw = 0, faceSign = 1;
  var lastNow = 0, lastCss = "";
  var sizeKey = "";

  function wrapPI(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }
  function smooth(u) { return u * u * (3 - 2 * u); }

  function frame(now) {
    requestAnimationFrame(frame);
    if (!ready || !layout) return;
    var dt = lastNow ? Math.min((now - lastNow) / 1000, 0.05) : 0.016;
    lastNow = now;
    if (dt <= 0) return;

    var L = layout, sy = window.scrollY;
    var docked = !!API.dockTarget;
    var ev = (L.pinned || docked) ? null : evaluate(L.sched, sy);

    // Where the robot should be (page pixels)
    var tx, ty, state;
    if (docked) {
      // sitting on top of the chat panel, which is fixed to the screen
      tx = API.dockTarget.x; ty = sy + API.dockTarget.seatY + SEAT_H * L.unit;
    } else if (L.pinned) {
      tx = L.pinX; ty = sy + L.pinY; state = "sitWave";   // fixed to the screen
    } else if (ev.kind === "hold") {
      tx = L.stops[ev.i].x; ty = L.stops[ev.i].y; state = HOLD_STATE[L.stops[ev.i].id];
    } else {
      var e = smooth(ev.u), A = L.stops[ev.from], B = L.stops[ev.to];
      tx = A.x + (B.x - A.x) * e; ty = A.y + (B.y - A.y) * e;
      state = travelState(L.stops[ev.from].id, L.stops[ev.to].id, ev.u);
    }
    var first = !pos;
    if (first) pos = { x: tx, y: ty };
    var dist = Math.sqrt((tx - pos.x) * (tx - pos.x) + (ty - pos.y) * (ty - pos.y));
    var hopping = false;
    if (docked) {
      if (dockArrived && dist > 60) dockArrived = false;   // the panel moved a long way: hop again
      if (!dockArrived && dist < 20) dockArrived = true;
      hopping = !dockArrived;
      state = hopping ? "jump" : moodState(API.mood);
    } else if (returning) {                                 // leaving the panel: hop back to the page route
      if (dist < 24) returning = false; else { hopping = true; state = "jump"; }
    }
    var snap = (docked && dockArrived) || (L.pinned && !hopping);   // fixed to the screen: no lag behind scrolling
    var k = snap ? 1 : 1 - Math.exp(-dt * (hopping ? 5 : 7));
    var nx = pos.x + (tx - pos.x) * k, ny = pos.y + (ty - pos.y) * k;
    vel.x += ((nx - pos.x) / dt - vel.x) * 0.25;
    vel.y += ((ny - pos.y) / dt - vel.y) * 0.25;
    pos.x = nx; pos.y = ny;
    var speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
    var moving = speed > 20;

    var routeTravel = !!(ev && ev.kind === "travel");
    if (routeTravel && !moving && !hopping) state = "idle";   // only walks while the page is actually moving
    setState(state, first);

    // Turn: toward the direction of travel while moving, otherwise a pose-specific angle
    var yawDeg;
    if ((routeTravel || hopping) && moving) {
      if (Math.abs(vel.x) > 10) faceSign = vel.x > 0 ? 1 : -1;
      yawDeg = faceSign * CFG.walkTurn;
    } else yawDeg = YAW_DEG[state] || 0;
    var yawT = yawDeg * Math.PI / 180;
    yaw = first ? yawT : yaw + wrapPI(yawT - yaw) * (1 - Math.exp(-dt * 8));
    holder.rotation.y = yaw;

    // Blend the actions toward this state
    var fade = 1 - Math.exp(-dt * (state === "lie" ? 6 : 9));
    var target = STATE_WEIGHTS[curState];
    Object.keys(ACTION).forEach(function (name) {
      var t = target[name] || 0;
      W[name] += (t - W[name]) * fade;
      if (Math.abs(t - W[name]) < 0.003) W[name] = t;
      ACTION[name].setEffectiveWeight(W[name]);
    });
    mixer.update(dt);

    // Reading: turn the head up and to the side, after the animation has been applied
    headW += ((HEAD_TURN[curState] ? 1 : 0) - headW) * (1 - Math.exp(-dt * 5));
    if (headBone && headW > 0.003) {
      tmpQ.set(0, 0, 0, 1).slerp(headDelta, headW);
      headBone.quaternion.premultiply(tmpQ);
    }

    // Size and place the canvas around the robot
    var u = L.unit;
    var cssW = (BOX.right - BOX.left) * u, cssH = (BOX.top - BOX.bottom) * u;
    var sk = Math.round(cssW) + "x" + Math.round(cssH);
    if (sk !== sizeKey) {
      sizeKey = sk;
      renderer.setSize(Math.round(cssW), Math.round(cssH), false);
      canvas.style.width = Math.round(cssW) + "px";
      canvas.style.height = Math.round(cssH) + "px";
    }
    var left = pos.x - window.scrollX - (-BOX.left) * u;
    var top = pos.y - sy - BOX.top * u;
    var onScreen = left < window.innerWidth && left + cssW > 0 && top < window.innerHeight && top + cssH > 0;
    canvas.style.visibility = onScreen ? "visible" : "hidden";
    if (typeof API.onMove === "function") {       // the chat widget places its invisible click area over the robot
      var area = { left: pos.x - window.scrollX - 1.9 * u, top: pos.y - sy - 4.7 * u, width: 3.8 * u, height: 5.0 * u };
      var inView = area.left + area.width > 0 && area.left < window.innerWidth && area.top + area.height > 0 && area.top < window.innerHeight;
      API.onMove(area, onScreen && inView);
    }
    if (!onScreen) return;       // nothing to draw while it's off-screen
    var css = "translate3d(" + left.toFixed(1) + "px," + top.toFixed(1) + "px,0)";
    if (css !== lastCss) { canvas.style.transform = css; lastCss = css; }
    renderer.render(scene, camera);
  }

  /* =========================================================
     START
     ========================================================= */
  var parserDone = false;
  try {
    new THREE.GLTFLoader().parse(base64ToBuffer(window.NEXTGEN_ROBOT_GLB), "", function (gltf) {
      parserDone = true;
      build(gltf);
    }, function () { canvas.style.display = "none"; });
  } catch (err) { canvas.style.display = "none"; return; }

  measure();
  var recheck = function () { measure(); };
  window.addEventListener("resize", recheck);
  window.addEventListener("orientationchange", recheck);
  window.addEventListener("load", recheck);
  Array.prototype.forEach.call(document.querySelectorAll(".slide-image, .hero-logo"), function (img) {
    if (!img.complete) img.addEventListener("load", recheck);
  });
  setInterval(function () { // pick up any layout change (fonts, images, text wrapping) that has no event
    var vw = window.innerWidth, vh = window.innerHeight;
    var docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    if (!layout || layout.key.indexOf([vw, vh, docH].join(",")) !== 0) measure();
  }, 600);
  requestAnimationFrame(frame);
})();