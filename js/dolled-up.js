// Dolled Up case study: hero dress swap and the little closet game.
(function () {
  "use strict";
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- hero dress swap ---------------- */
  var hero = document.querySelector("[data-du-hero]");
  var heroImgs = hero ? Array.prototype.slice.call(hero.querySelectorAll("img")) : [];
  var swatches = hero ? Array.prototype.slice.call(hero.querySelectorAll(".du-swatch")) : [];
  var heroIdx = 0;
  function showHero(i) {
    if (!heroImgs.length) return;
    heroIdx = (i + heroImgs.length) % heroImgs.length;
    heroImgs.forEach(function (im, k) { im.classList.toggle("on", k === heroIdx); });
    swatches.forEach(function (sw, k) { sw.setAttribute("aria-pressed", k === heroIdx ? "true" : "false"); });
  }
  if (hero) {
    hero.addEventListener("click", function (e) {
      if (e.target.closest(".du-swatch")) return;
      showHero(heroIdx + 1);
    });
    hero.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); showHero(heroIdx + 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); showHero(heroIdx + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); showHero(heroIdx - 1); }
    });
    swatches.forEach(function (sw, k) {
      sw.addEventListener("click", function (e) { e.stopPropagation(); showHero(k); });
    });
    showHero(0);
  }

  /* ---------------- closet game ---------------- */
  var root = document.querySelector("[data-du-game]");
  if (!root) return;
  var canvas = root.querySelector("canvas");
  var ctx = canvas.getContext("2d");
  var startBtn = root.querySelector(".du-start");
  var chipEls = Array.prototype.slice.call(root.querySelectorAll(".du-chip"));
  var resetBtn = root.querySelector(".du-reset");
  var elOutfit = root.querySelector("[data-du-outfit]");
  var elHair = root.querySelector("[data-du-hair]");
  var elPose = root.querySelector("[data-du-pose]");
  var elPets = root.querySelector("[data-du-pets]");
  var elMakeup = root.querySelector("[data-du-makeup]"), elJewel = root.querySelector("[data-du-jewel]");
  var makeupWrap = root.querySelector("[data-du-makeupopts]"), jewelWrap = root.querySelector("[data-du-jewelopts]"), makeupOpts = [], jewelOpts = [];
  var hairWrap = root.querySelector("[data-du-hairopts]"), poseWrap = root.querySelector("[data-du-poseopts]");
  var hairOpts = [], poseOpts = [];
  var W = 720, H = 405, K = canvas.width / W;
  var SKIN = "#f8dcc8";

  /* ---- content ---- */
  var OUTFITS = [
    { name: "Sparkle", c: "#2a86c4", dress: true, top: { s: "strap", col: "#2a86c4" }, skirt: { col: "#2a86c4", len: 26, flare: 6, sparkle: true }, shoes: "#cfe3f0" },
    { name: "Navy & Gold", c: "#232a5c", dress: true, top: { s: "strapless", col: "#232a5c" }, skirt: { col: "#232a5c", len: 24, flare: 8, trim: "#e6b84c" }, sash: "#e6b84c", shoes: "#232a5c" },
    { name: "Cream Gown", c: "#f3e6b0", dress: true, top: { s: "offshoulder", col: "#f3e6b0" }, skirt: { col: "#f3e6b0", len: 36, flare: 16 }, shoes: "#f3e6b0" },
    { name: "Plaid & Denim", c: "#e98aa6", top: { s: "crop", col: "#ec7f86", plaid: true }, pants: { col: "#1d2b50", type: "long", wide: true }, shoes: "#f1eef6" },
    { name: "Cap & Tank", c: "#f08fc0", top: { s: "tank", col: "#f08fc0", print: true }, pants: { col: "#25262c", type: "long" }, shoes: "#25262c" },
    { name: "Mock-neck & Shorts", c: "#5a0f12", top: { s: "mock", col: "#5a0f12" }, pants: { col: "#1c1c20", type: "short" }, socks: "#1c1c20", shoes: "#1c1c20" },
    { name: "Orange Tube", c: "#f58540", top: { s: "tube", col: "#f58540" }, pants: { col: "#1d2b50", type: "long", wide: true }, shoes: "#f1eef6" },
    { name: "Cozy Sweater", c: "#f1e9d6", top: { s: "sweater", col: "#f4ecd8" }, pants: { col: "#f0ede6", type: "long", wide: true }, shoes: "#f4ecd8" },
    { name: "Plaid Halter", c: "#2f2f36", ic: "#3a3a42", dress: true, top: { s: "halter", col: "#f4f2ee", checks: true }, skirt: { col: "#f4f2ee", len: 28, flare: 9, checks: true }, shoes: "#2f2f36" },
    { name: "Pink Sundress", c: "#f6b8d6", dress: true, top: { s: "strap", col: "#f6b8d6" }, skirt: { col: "#f6b8d6", len: 30, flare: 9 }, shoes: "#f6b8d6" }
  ];
  var STARTER = { name: "Starter", top: { s: "tank", col: "#ffffff" }, pants: { col: "#8aa4d8", type: "long" }, shoes: "#e9879f" };
  var RACKS = [{ x: 128, items: [0, 1] }, { x: 212, items: [2, 9] }, { x: 296, items: [8, 7] }, { x: 380, items: [3, 6] }, { x: 464, items: [4, 5] }];
  var HAIRS = [
    { n: "Long & Straight", c: "#5b3a22" }, { n: "Copper Pixie", c: "#b4562b" }, { n: "Bob & Buns", c: "#2c2433" }, { n: "Bubble Braid", c: "#5b3a22" },
    { n: "Honey Waves", c: "#d9a85a" }, { n: "Snapback", c: "#5b3a22" }, { n: "Pink Twin Tails", c: "#ee86b6" }, { n: "High Pony", c: "#2c2433" },
    { n: "Curly Puff", c: "#3b2316" }, { n: "Bow & Blonde", c: "#e8c47c" }, { n: "Side Braids", c: "#8c3a21" }, { n: "Messy Bun", c: "#6b4630" },
    { n: "Lavender Bob", c: "#a58ae0" }, { n: "Mermaid Buns", c: "#5fa8e8" }
  ];
  var POSES = ["", "Strut", "Pose", "Macarena", "Peace", "Wave", "Blow Kiss", "Curtsy", "Cheer", "Groove"];
  var MAKEUPS = [
    { n: "Bare" },
    { n: "Natural Glow", lip: "#e98aa6", blush: "rgba(255,160,150,.55)", gloss: true },
    { n: "Pink Pop", lip: "#ff5a9d", shadow: "#ffb6d9", blush: "rgba(255,120,170,.6)", lash: true, gloss: true },
    { n: "Berry Glam", lip: "#a01d55", shadow: "#8a5aa8", blush: "rgba(208,100,140,.55)", liner: true, lash: true },
    { n: "Sunset Shimmer", lip: "#ff7a4d", shadow: "#ffae52", blush: "rgba(255,150,110,.6)", lash: true, glitter: true },
    { n: "Star Glitter", lip: "#ff9fcf", shadow: "#8fd0ff", blush: "rgba(255,140,190,.55)", liner: true, glitter: true, stars: true, gloss: true },
    { n: "Y2K Frost", lip: "#e3b8ff", shadow: "#c3b0ff", blush: "rgba(200,160,255,.5)", lash: true, gems: true, gloss: true }
  ];
  var JEWELS = [
    { n: "None" }, { n: "Pearls", neck: "pearls", ears: "pearl" }, { n: "Star Pendant", neck: "star", ears: "star" }, { n: "Heart Locket", neck: "heart", ears: "stud" },
    { n: "Gold Hoops", neck: "chain", ears: "hoop" }, { n: "Charm Bracelet", wrist: true, ears: "stud" }, { n: "Pop-star Set", neck: "layers", ears: "hoop", wrist: true }, { n: "Tiara & Choker", neck: "choker", ears: "stud", head: "tiara" }
  ];
  var WALL = 172, MINY = 214, MAXY = 388, MINX = 26, MAXX = 694;
  var MIR = { x: 574, y: 16, w: 98, h: 134 }, GLASS = { x: 586, y: 28, w: 74, h: 110 }, RUG = { x: 623, y: 338 };
  var drumMode, drumArm, drumAlt, drumTom, drumHits, player, worn, hair, makeup, jewel, guitar, strumT, chordI, phone, phoneLabel, poseIdx, poseT0, kissFired, tried, cat_, parts, keys, active, visible, done, doneAt, last, clock, label, catLabel, mirA, singing, singT, singGap, singN, singNote;

  function reset() {
    player = { x: 332, y: 352, walk: 0, moving: false, dir: 0, pet: 0, petDir: 1, wamp: 0, hx: 1 };
    drumMode = false; drumArm = { L: { n: "snare", t: 0 }, R: { n: "tomB", t: 0 } }; drumAlt = false; drumTom = false; drumHits = 0; KIT.fx = { hat: 0, snare: 0, tomA: 0, tomB: 0, ftom: 0, crash: 0, kick: 0 };
    worn = -1; hair = 0; makeup = 0; jewel = 0; guitar = false; strumT = 0; chordI = 0; phone = { ring: 0, rt: 0, unread: false, msg: 0, next: 12 }; phoneLabel = { t: 0, text: "" }; poseIdx = 0; poseT0 = 0; kissFired = false; tried = {}; parts = []; keys = {}; done = false; doneAt = 0; clock = 0; mirA = 0; singing = false; singT = 0; singGap = 0; singN = 0; singNote = 0;
    label = { t: 0, text: "" }; catLabel = { t: 0, text: "" };
    cat_ = { x: 520, y: 372, tx: 520, ty: 372, wait: 1, face: 1, pet: 0, hop: 0, hv: 0, pets: 0, walking: false, meowT: 0, meowNext: 6 };
    syncUI();
  }
  function triedCount() { return Object.keys(tried).length; }
  function syncUI() {
    chipEls.forEach(function (c, i) { c.classList.toggle("done", !!tried[i]); c.classList.toggle("on", worn === i); });
    if (elOutfit) elOutfit.textContent = worn >= 0 ? OUTFITS[worn].name : "Starter";
    if (elHair) elHair.textContent = HAIRS[hair].n;
    if (elPets) elPets.textContent = cat_ ? cat_.pets : 0;
    if (elMakeup) elMakeup.textContent = MAKEUPS[makeup].n;
    if (elJewel) elJewel.textContent = JEWELS[jewel].n;
    makeupOpts.forEach(function (b, i) { if (b) b.classList.toggle("on", makeup === i); });
    jewelOpts.forEach(function (b, i) { if (b) b.classList.toggle("on", jewel === i); });
    hairOpts.forEach(function (b, i) { if (b) b.classList.toggle("on", hair === i); });
    poseOpts.forEach(function (b, i) { if (b) b.classList.toggle("on", poseIdx === i); });
    if (elPose) elPose.textContent = poseIdx ? POSES[poseIdx] : "None";
    if (resetBtn) resetBtn.hidden = !done;
  }
  function pulse(k) { var el = root.querySelector('[data-tile="' + k + '"]'); if (!el) return; el.classList.remove("hit"); void el.offsetWidth; el.classList.add("hit"); }
  function say(text) { label.text = text; label.t = 1.5; }

  /* ---- tiny drawing helpers ---- */
  function R(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
  function poly(p, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(p[0], p[1]); for (var i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]); ctx.closePath(); ctx.fill(); }
  function ell(x, y, rx, ry, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 6.2832); ctx.fill(); }
  function drawStar(x, y, r, c) {
    ctx.fillStyle = c; ctx.beginPath();
    for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill();
  }
  function limb(x1, y1, t1, l1, t2, l2, col, w) {
    var ex = x1 + Math.sin(t1) * l1, ey = y1 + Math.cos(t1) * l1, hx = ex + Math.sin(t2) * l2, hy = ey + Math.cos(t2) * l2;
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
    return [hx, hy];
  }
  function line(x1, y1, x2, y2, col, w) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
  function plaidFill(x0, y0, x1, y1) {
    ctx.lineWidth = 1.3; ctx.strokeStyle = "rgba(55,65,120,.6)";
    var x, y;
    for (x = x0 + 1; x < x1; x += 5) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); }
    for (y = y0 + 1; y < y1; y += 5) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); }
    ctx.lineWidth = 1.1; ctx.strokeStyle = "rgba(255,255,255,.8)";
    for (x = x0 + 3.5; x < x1; x += 5) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); }
    for (y = y0 + 3.5; y < y1; y += 5) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); }
  }
  function checksFill(x0, y0, x1, y1) {
    ctx.fillStyle = "#25252b";
    for (var xi = 0, x = x0; x < x1; x += 6, xi++) for (var yi = 0, y = y0; y < y1; y += 6, yi++) if ((xi + yi) % 2 === 0) ctx.fillRect(x, y, 6, 6);
  }

  /* ---- hair ---- */
  function lighten(hex, a) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return "rgb(" + Math.round(r + (255 - r) * a) + "," + Math.round(g + (255 - g) * a) + "," + Math.round(b + (255 - b) * a) + ")";
  }
  HAIRS.forEach(function (h) { h.hl = lighten(h.c, 0.28); });
  function hdome(c, hl) {
    ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, -80, 11.5, 10.5, 0, Math.PI, 0); ctx.fill(); R(-11.5, -80, 23, 3, c);
    ctx.strokeStyle = hl; ctx.lineWidth = 1.3; ctx.lineCap = "round"; ctx.beginPath(); ctx.ellipse(0, -80, 8.2, 7.6, 0, Math.PI * 1.12, Math.PI * 1.42); ctx.stroke();
  }
  function hbangs(c) { R(-10.5, -82, 21, 6, c); for (var i = 0; i < 5; i++) ell(-8.4 + i * 4.2, -76, 2.3, 2, c); }
  function hairBack(h, c) {
    var i, s, sw;
    if (h === 0 || h === 5) poly([-12, -84, 12, -84, 14, -40, -14, -40], c);
    else if (h === 9) poly([-12, -84, 12, -84, 15, -44, -15, -44], c);
    else if (h === 13) { poly([-12, -84, 12, -84, 14, -46, -14, -46], c); ell(-9, -94, 5.4, 5.2, c); ell(9, -94, 5.4, 5.2, c); ell(-9, -90.2, 3.2, 1.2, "#ffffff"); ell(9, -90.2, 3.2, 1.2, "#ffffff"); }
    else if (h === 2) { poly([-12, -84, 12, -84, 13, -64, -13, -64], c); ell(-8, -91, 4.6, 4.6, c); ell(8, -91, 4.6, 4.6, c); }
    else if (h === 3) { for (i = 0; i < 5; i++) { var rr = 4.8 - i * 0.35; ell(-13, -82 + i * 8.5, rr, rr, c); ell(13, -82 + i * 8.5, rr, rr, c); } ell(-13, -86, 2, 2, "#e9609a"); ell(13, -86, 2, 2, "#e9609a"); }
    else if (h === 4) { poly([-12, -84, 12, -84, 13, -64, -13, -64], c); ell(-9, -63, 4.6, 4.6, c); ell(0, -62, 4.6, 4.6, c); ell(9, -63, 4.6, 4.6, c); }
    else if (h === 6) {
      for (s = -1; s <= 1; s += 2) {
        sw = Math.sin(clock * 3 + s) * 1.8;
        ctx.strokeStyle = c; ctx.lineCap = "round"; ctx.lineWidth = 6.4; ctx.beginPath(); ctx.moveTo(s * 11, -82); ctx.quadraticCurveTo(s * 21, -74, s * 19, -64); ctx.stroke();
        ctx.lineWidth = 4.2; ctx.beginPath(); ctx.moveTo(s * 19, -64); ctx.quadraticCurveTo(s * (21 + sw * 0.4), -56, s * (17 + sw), -47); ctx.stroke();
        ell(s * 11.5, -81, 2.6, 2.2, "#fff4a8");
      }
    }
    else if (h === 7) {
      sw = Math.sin(clock * 2.6) * 2.5;
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-2, -90); ctx.bezierCurveTo(10, -105, 27 + sw, -90, 19 + sw * 1.4, -58); ctx.bezierCurveTo(14 + sw, -76, 5, -82, 2, -86); ctx.closePath(); ctx.fill();
    }
    else if (h === 8) {
      ell(0, -84, 16, 14, c);
      for (i = 0; i < 12; i++) { var a = i * Math.PI / 6; ell(Math.cos(a) * 15.5, -84 + Math.sin(a) * 13.5, 5.6, 5.6, c); }
    }
    else if (h === 10) {
      for (s = -1; s <= 1; s += 2) {
        sw = Math.sin(clock * 2.4 + s) * 0.7;
        for (i = 0; i < 6; i++) ell(s * (13 + (i % 2 ? 0.9 : -0.9)) + sw * i * 0.3, -76 + i * 6.2, 3.5 - i * 0.2, 3.9, c);
        ell(s * 13 + sw * 2, -43, 2.4, 2.4, "#e9609a");
      }
    }
    else if (h === 11) { ell(0, -97, 6.6, 6, c); ell(0, -91.5, 4.6, 1.5, "#e9609a"); }
    else if (h === 12) poly([-12.5, -84, 12.5, -84, 13.5, -61, -13.5, -61], c);
  }
  function hairFront(h, c, hl) {
    hdome(c, hl);
    if (h === 0 || h === 5 || h === 9 || h === 13) { hbangs(c); var ln = h === 13 ? 24 : 26; R(-12.5, -80, 3.6, ln, c); R(8.9, -80, 3.6, ln, c); line(-11, -74, -11.5, -56, hl, 1); }
    else if (h === 2 || h === 3) { hbangs(c); R(-12.5, -80, 3.6, 14, c); R(8.9, -80, 3.6, 14, c); }
    else if (h === 6) { hbangs(c); R(-12.5, -80, 3.6, 8, c); R(8.9, -80, 3.6, 8, c); }
    else if (h === 10) { hbangs(c); R(-12.5, -80, 3.6, 10, c); R(8.9, -80, 3.6, 10, c); }
    else if (h === 1) { poly([-9, -84, -13, -93, -4, -87], c); poly([3, -87, 7, -95, 10, -85], c); poly([-11, -81, 5, -87, 11, -79, 11, -76, -1, -79, -9, -73], c); R(-12, -80, 3, 8, c); R(9, -80, 3, 8, c); }
    else if (h === 4) { poly([-11, -79, -2, -88, 1, -79], c); poly([1, -79, 3, -88, 11, -79], c); R(-12.5, -80, 3.6, 16, c); R(8.9, -80, 3.6, 16, c); }
    else if (h === 7) { poly([-11, -81, -2, -88, 8, -85, 11, -79, 11, -76, 3, -80, -8, -76], c); R(-12, -80, 3, 7, c); R(9, -80, 3, 7, c); ell(2.2, -90.2, 3, 1.9, "#e9609a"); }
    else if (h === 8) { ell(-8.4, -83, 3.7, 3.3, c); ell(-3.2, -86, 3.7, 3.5, c); ell(3.2, -86, 3.7, 3.5, c); ell(8.4, -83, 3.7, 3.3, c); ell(-11, -78, 2.6, 3, c); ell(11, -78, 2.6, 3, c); }
    else if (h === 11) { poly([-11, -80, -2, -88, 4, -85, 11, -78, 11, -76, 2, -80, -9, -74], c); R(-12, -80, 3, 8, c); R(9, -80, 3, 8, c); line(-12, -79, -13.5, -64, c, 1.7); line(12, -79, 13.5, -66, c, 1.7); }
    else if (h === 12) { R(-11, -82, 22, 6.4, c); line(-10.5, -75.8, 10.5, -75.8, hl, 0.8); R(-13, -80, 3.8, 19, c); R(9.2, -80, 3.8, 19, c); }
    if (h === 9) { poly([8.5, -88, 1.5, -93, 1.5, -83], "#e84a6a"); poly([8.5, -88, 15.5, -93, 15.5, -83], "#e84a6a"); ell(8.5, -88, 2.2, 2.2, "#c7304f"); }
    if (h === 5) { ctx.fillStyle = "#7a0a5a"; ctx.beginPath(); ctx.ellipse(0, -84, 11.5, 8, 0, Math.PI, 0); ctx.fill(); R(-11.5, -84, 23, 3, "#7a0a5a"); poly([3, -85, 21, -83, 20, -79, 3, -81], "#8e1068"); }
  }

  /* ---- outfit pieces ---- */
  /* body silhouette: half-width by height (feet = 0, head centre = -75), smoothed so the waist reads as a gentle hourglass */
  var BODYPTS = [[-64, 3.4], [-61, 6.2], [-58.5, 8.2], [-54, 8.1], [-50, 7.1], [-46.5, 6.0], [-43.5, 5.5], [-40, 6.1], [-36, 7.6], [-32, 8.5], [-30, 8.5]];
  var BODYTAB = (function () {
    var tab = [], y, i, raw = [];
    for (y = -64; y <= -30.01; y += 0.5) {
      for (i = 0; i < BODYPTS.length - 1; i++) if (y <= BODYPTS[i + 1][0]) break;
      var a = BODYPTS[Math.min(i, BODYPTS.length - 2)], b = BODYPTS[Math.min(i, BODYPTS.length - 2) + 1], t = Math.max(0, Math.min(1, (y - a[0]) / (b[0] - a[0])));
      raw.push(a[1] + (b[1] - a[1]) * t);
    }
    for (i = 0; i < raw.length; i++) { var s = 0, n = 0; for (var k = -4; k <= 4; k++) { if (raw[i + k] !== undefined) { s += raw[i + k]; n++; } } tab.push(s / n); }
    return tab;
  })();
  function wAt(y) { var f = (Math.max(-64, Math.min(-30, y)) + 64) * 2, i = Math.floor(f), t = f - i; return BODYTAB[i] + ((BODYTAB[i + 1] !== undefined ? BODYTAB[i + 1] : BODYTAB[i]) - BODYTAB[i]) * t; }
  function bodyShape(y0, y1, ex, ex1) {
    var pts = [], k, y, e, steps = Math.max(2, Math.ceil((y1 - y0) / 1.5)); ex = ex || 0; if (ex1 === undefined) ex1 = ex;
    for (k = 0; k <= steps; k++) { y = y0 + (y1 - y0) * k / steps; e = ex + (ex1 - ex) * k / steps; pts.push(-(wAt(y) + e), y); }
    for (k = steps; k >= 0; k--) { y = y0 + (y1 - y0) * k / steps; e = ex + (ex1 - ex) * k / steps; pts.push(wAt(y) + e, y); }
    return pts;
  }
  function clipPts(pts) { ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (var q = 2; q < pts.length; q += 2) ctx.lineTo(pts[q], pts[q + 1]); ctx.closePath(); }
  function shadeBody(pts, hi, lo) {
    ctx.save(); clipPts(pts); ctx.clip();
    var gg = ctx.createLinearGradient(-10, 0, 10, 0); gg.addColorStop(0, "rgba(255,255,255," + hi + ")"); gg.addColorStop(.5, "rgba(255,255,255,0)"); gg.addColorStop(1, "rgba(30,20,60," + lo + ")");
    ctx.fillStyle = gg; ctx.fillRect(-16, -70, 32, 42);
    ctx.restore();
  }
  function skinTorso(o) {
    var pts = bodyShape(-62, -30);
    poly(pts, SKIN); shadeBody(pts, 0.1, 0.14);
    ctx.save(); clipPts(pts); ctx.clip();
    ell(-5.6, -44, 1.2, 5, "rgba(200,140,120,.13)"); ell(5.6, -44, 1.2, 5, "rgba(200,140,120,.18)");
    if (o.top.s === "crop") ell(0, -44.4, 0.55, 0.8, "rgba(190,125,105,.75)");
    ctx.restore();
  }
  function skirtDraw(o, sk) {
    var sp = o.skirt, hy = -38 + sp.len - (sk.flare ? 3 : 0), hw = 7 + sp.flare + sk.flare, sw = sk.sway * 0.8, tw = wAt(-42) + 0.35;
    ctx.save();
    ctx.beginPath(); ctx.moveTo(-tw, -42); ctx.lineTo(tw, -42); ctx.quadraticCurveTo(8.4, -35, hw + sw, hy); ctx.quadraticCurveTo(sw, hy + 4, -hw + sw, hy); ctx.quadraticCurveTo(-8.4, -35, -tw, -42); ctx.closePath();
    ctx.fillStyle = sp.col; ctx.fill(); ctx.clip();
    if (sp.checks) checksFill(-hw - 4, -43, hw + 4, hy + 6);
    var sg2 = ctx.createLinearGradient(-hw, 0, hw, 0); sg2.addColorStop(0, "rgba(255,255,255,.14)"); sg2.addColorStop(.5, "rgba(255,255,255,0)"); sg2.addColorStop(1, "rgba(30,20,60,.2)"); ctx.fillStyle = sg2; ctx.fillRect(-hw - 4, -44, hw * 2 + 8, hy + 52);
    for (var fk = -2; fk <= 2; fk++) line(fk * 2.2, -41, fk * (hw / 2.2) + sw, hy, "rgba(30,20,60,.08)", 0.9);
    if (sp.sparkle) { ctx.fillStyle = "#b6e6ff"; for (var i = 0; i < 14; i++) ctx.fillRect(-14 + (i * 7) % 28, -36 + (i * 11) % 24, 2, 2); }
    ctx.restore();
    if (sp.trim) line(-hw + sw + 1, hy + 1, hw + sw - 1, hy + 1, sp.trim, 1.6);
  }
  function torsoDraw(o) {
    var t = o.top, c = t.col, s = t.s, i;
    var fill = function (pts) {
      poly(pts, c); shadeBody(pts, 0.16, 0.22);
      if (t.plaid || t.checks) { ctx.save(); clipPts(pts); ctx.clip(); if (t.plaid) plaidFill(-14, -66, 14, -36); else checksFill(-14, -66, 14, -36); ctx.restore(); }
    };
    if (s === "strap") { fill(bodyShape(-56.5, -42)); R(-6, -61, 2, 5.5, c); R(4, -61, 2, 5.5, c); }
    else if (s === "tank") { fill(bodyShape(-57, -40.5)); R(-6.6, -61.5, 2.6, 5, c); R(4, -61.5, 2.6, 5, c); if (t.print) { ell(0, -50, 3.4, 3.6, "#f4b09a"); R(-3, -48, 6, 1.2, "#e8836e"); R(-3, -50.5, 6, 1.2, "#e8836e"); poly([-3, -53, -2, -56, -0.5, -53], "#f4b09a"); poly([0.5, -53, 2, -56, 3, -53], "#f4b09a"); } }
    else if (s === "strapless") fill(bodyShape(-56, -42));
    else if (s === "tube") fill(bodyShape(-56, -41));
    else if (s === "offshoulder") { fill(bodyShape(-56, -42)); R(-12, -59, 6, 3.4, c); R(6, -59, 6, 3.4, c); poly(bodyShape(-56.4, -54.4), "#fff4cf"); }
    else if (s === "crop") fill(bodyShape(-59, -47));
    else if (s === "mock") { fill(bodyShape(-60, -40.5)); R(-3.5, -66, 7, 7, c); }
    else if (s === "sweater") {
      fill(bodyShape(-60, -41.5, 2.2, 3.4)); R(-4.8, -67, 9.6, 8, c); poly(bodyShape(-44.6, -41.5, 3.2, 3.6), "#e0d3b8");
      ctx.strokeStyle = "rgba(190,170,130,.55)"; ctx.lineWidth = 1; for (i = -7; i <= 7; i += 3.5) { ctx.beginPath(); ctx.moveTo(i, -58); ctx.lineTo(i, -45); ctx.stroke(); }
    }
    else if (s === "halter") { fill(bodyShape(-56, -42)); poly([-8, -56, -2, -56, -3.2, -65], c); poly([8, -56, 2, -56, 3.2, -65], c); }
    if (o.sash) poly(bodyShape(-46, -42, 0.3), o.sash);
  }
  function legPts(i, sk) {
    var sg = i ? 1 : -1, hx = sg * 3.5 * (sk.hs == null ? 1 : sk.hs), a = i ? sk.lR : sk.lL, k = (i ? sk.kR : sk.kL) || 0, h = sk.gh == null ? 1 : sk.gh, sgn = sk.gs || 1;
    var kx = hx + Math.sin(a) * 17, ky = -34 + Math.cos(a) * 17, b = a - k * sgn * h, L = 17 * (1 - (1 - h) * (1 - Math.cos(k)));
    return { sg: sg, hx: hx, a: a, kx: kx, ky: ky, b: b, ex: kx + Math.sin(b) * L, ey: ky + Math.cos(b) * L };
  }
  function legsAndBottoms(o, sk) {
    var i, q;
    for (i = 0; i < 2; i++) {
      q = legPts(i, sk);
      ctx.strokeStyle = SKIN; ctx.lineWidth = 5.2; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); ctx.moveTo(q.hx, -34); ctx.lineTo(q.kx, q.ky); ctx.lineTo(q.ex, q.ey); ctx.stroke();
      if (o.socks) line(q.ex, q.ey, q.ex - Math.sin(q.b) * 22, q.ey - Math.cos(q.b) * 22, o.socks, 6);
    }
    if (o.pants) {
      var pc = o.pants.col;
      for (i = 0; i < 2; i++) {
        q = legPts(i, sk);
        if (o.pants.type === "short") line(q.hx, -34, q.hx + Math.sin(q.a) * 13, -34 + Math.cos(q.a) * 13, pc, 8.4);
        else {
          ctx.strokeStyle = pc; ctx.lineWidth = o.pants.wide ? 9.4 : 7.4; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath();
          ctx.moveTo(q.hx, -34); ctx.lineTo(q.kx + (o.pants.wide ? q.sg * 0.8 : 0), q.ky); ctx.lineTo(q.ex + (o.pants.wide ? q.sg * 1.5 : 0), q.ey); ctx.stroke();
        }
      }
      var wb = bodyShape(-41.8, -30, 0.5); poly(wb, pc); shadeBody(wb, 0.1, 0.18);
      line(-(wAt(-41.4) + 0.4), -41.4, wAt(-41.4) + 0.4, -41.4, "rgba(0,0,0,.2)", 0.8);
    }
    for (i = 0; i < 2; i++) {
      q = legPts(i, sk);
      ell(q.ex + q.sg * 1.4, q.ey - 1, 4.6, 2.7, o.shoes); ell(q.ex + q.sg * 1.4 - 1, q.ey - 1.9, 1.8, 0.8, "rgba(255,255,255,.35)");
    }
  }
  function armsDraw(o, sk) {
    var t = o.top, sweater = t.s === "sweater", short = t.s === "crop", jw = JEWELS[jewel].wrist;
    [[-1, sk.aL], [1, sk.aR]].forEach(function (p) {
      var sx = p[0] * 9, a = p[1], h = limb(sx, -58, a[0], 12, a[1], 11, SKIN, 4.4);
      if (sweater) { limb(sx, -58, a[0], 12, a[1], 9.5, t.col, 7.4); }
      else if (short) { line(sx, -58, sx + Math.sin(a[0]) * 6, -58 + Math.cos(a[0]) * 6, t.col, 6); }
      if (sk.sticks) { var sa = p[0] * 0.28; line(h[0] - Math.sin(sa) * 2, h[1] - Math.cos(sa) * 2, h[0] + Math.sin(sa) * 9.5, h[1] + Math.cos(sa) * 9.5, "#f6dfb0", 1.5); ell(h[0] + Math.sin(sa) * 9.8, h[1] + Math.cos(sa) * 9.8, 1.3, 1.3, "#ffffff"); }
      ell(h[0], h[1], 2.8, 2.8, SKIN);
      if (jw) {
        var ex = sx + Math.sin(a[0]) * 12, ey = -58 + Math.cos(a[0]) * 12, dx = h[0] - ex, dy = h[1] - ey, dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
        var wx = h[0] - dx * 3.4, wy = h[1] - dy * 3.4, px = -dy, py = dx;
        line(wx - px * 2.5, wy - py * 2.5, wx + px * 2.5, wy + py * 2.5, "#f2c94c", 1.5); line(wx - dx * 1.7 - px * 2.4, wy - dy * 1.7 - py * 2.4, wx - dx * 1.7 + px * 2.4, wy - dy * 1.7 + py * 2.4, "#fff3c4", 1.1);
        heart(wx + px * 1.2, wy + py * 1.2 + 2.6, 1.1, "#ff7fb7");
      }
      if (sk.peace && p[0] === 1) { var fa = a[1]; [-0.3, 0.3].forEach(function (d) { line(h[0], h[1], h[0] + Math.sin(fa + d) * 5.2, h[1] + Math.cos(fa + d) * 5.2, SKIN, 1.7); }); }
    });
  }
  /* ---- jewelry ---- */
  var GOLD = "#f2c94c";
  function qpt(tt, cy) { var u = 1 - tt; return [-3.4 * u * u + 3.4 * tt * tt, -63.2 * u * u + 2 * u * tt * cy - 63.2 * tt * tt]; }
  function neckChain(cy, col, w) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-3.4, -63.2); ctx.quadraticCurveTo(0, cy, 3.4, -63.2); ctx.stroke(); }
  function neckJewel(j) {
    var n = j.neck, i, p;
    if (!n) return;
    if (n === "pearls") { for (i = 0; i <= 10; i++) { p = qpt(i / 10, -51); ell(p[0], p[1], 1, 1, "#fffaf0"); ell(p[0] - 0.3, p[1] - 0.3, 0.3, 0.3, "#ffffff"); } }
    else if (n === "star") { neckChain(-52, GOLD, 0.7); p = qpt(0.5, -52); drawStar(p[0], p[1] + 1.4, 2.2, GOLD); ell(p[0], p[1] + 1.5, 0.5, 0.5, "#fff7c9"); }
    else if (n === "heart") { neckChain(-52, GOLD, 0.7); p = qpt(0.5, -52); heart(p[0], p[1] + 1.5, 1.9, "#ff7fb7"); ell(p[0] - 0.6, p[1] + 0.8, 0.4, 0.4, "#fff"); }
    else if (n === "layers") { neckChain(-52, GOLD, 0.6); neckChain(-46.5, "#fff3c4", 0.6); p = qpt(0.5, -46.5); drawStar(p[0], p[1] + 1.2, 2, GOLD); p = qpt(0.5, -52); ell(p[0], p[1] + 0.8, 0.9, 0.9, "#ff9fcf"); }
    else if (n === "chain") neckChain(-53, GOLD, 0.6);
    else if (n === "choker") { ctx.strokeStyle = "#d6336c"; ctx.lineWidth = 1.5; ctx.lineCap = "round"; ctx.beginPath(); ctx.ellipse(0, -64.6, 3.6, 1.5, 0, 0.05, Math.PI - 0.05); ctx.stroke(); drawStar(0, -62.6, 1.5, GOLD); }
  }
  function earJewel(j) {
    var e = j.ears, s;
    if (!e) return;
    for (s = -1; s <= 1; s += 2) {
      if (e === "pearl") { ell(s * 10.2, -72.2, 1, 1, "#fffaf0"); ell(s * 10.2, -70.3, 1.1, 1.1, "#fffaf0"); }
      else if (e === "hoop") { ctx.strokeStyle = GOLD; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(s * 10.4, -70.2, 2.6, 0, 6.3); ctx.stroke(); }
      else if (e === "star") drawStar(s * 10.3, -71, 1.7, GOLD);
      else if (e === "stud") ell(s * 10.1, -72.4, 0.95, 0.95, "#cfeaff");
    }
  }
  function headJewel(j) {
    if (j.head !== "tiara") return;
    poly([-9.2, -83.2, -8, -89.5, -4.6, -85.5, -2.4, -91.8, 0, -87.4, 2.4, -91.8, 4.6, -85.5, 8, -89.5, 9.2, -83.2, 7, -82.2, -7, -82.2], GOLD);
    ctx.strokeStyle = "#c99a2e"; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(-8.4, -82.8); ctx.lineTo(8.4, -82.8); ctx.stroke();
    [[-8, -89.5], [0, -87.4], [8, -89.5]].forEach(function (g) { ell(g[0], g[1], 0.9, 0.9, "#ff7fb7"); });
    [[-2.4, -91.8], [2.4, -91.8]].forEach(function (g) { ell(g[0], g[1], 0.9, 0.9, "#cfeaff"); });
  }

  /* ---- person (rendered to a sprite so it gets a sticker outline) ---- */
  var SPW = 110, SPH = 150, SPOX = 55, SPOY = 130, OUTLINE = "#43306b";
  var spr = document.createElement("canvas"), sil = document.createElement("canvas");
  spr.width = sil.width = Math.round(SPW * K); spr.height = sil.height = Math.round(SPH * K);
  var sprC = spr.getContext("2d"), silC = sil.getContext("2d");

  function faceDraw(sk) {
    var mk = MAKEUPS[makeup], blink = (clock % 4.3) < 0.13, s, ex, i;
    ell(-10, -74, 1.9, 2.5, SKIN); ell(10, -74, 1.9, 2.5, SKIN);
    ell(0, -75, 10, 11, SKIN);
    var bl = mk.blush || "rgba(240,130,150,.5)";
    ell(-6.5, -71, 2.2, 1.35, bl); ell(6.5, -71, 2.2, 1.35, bl);
    for (s = -1; s <= 1; s += 2) {
      ex = s * 4;
      if (blink) { line(ex - 2, -74, ex + 2, -74, "#3a2a40", 1.1); if (mk.shadow) ell(ex, -75.4, 2.6, 1, mk.shadow); }
      else {
        ell(ex, -74, 2.2, 2.9, "#ffffff"); ell(ex, -73.8, 1.7, 2.5, "#2f9ac2"); ell(ex, -73.6, 1, 1.6, "#17384f"); ell(ex - 0.6, -74.9, 0.6, 0.7, "#ffffff");
        if (mk.shadow) { ctx.globalAlpha = 0.85; ell(ex, -77, 2.9, 1.5, mk.shadow); ctx.globalAlpha = 1; }
        line(ex - 2.4, -76.4, ex + 2.3, -76.4, "#3a2a40", mk.lash ? 1.5 : 1);
        if (mk.liner) line(ex + s * 2.2, -76.4, ex + s * 3.8, -77.9, "#3a2a40", 1.1);
        else if (mk.lash) line(ex + s * 2.2, -76.4, ex + s * 3.3, -77.5, "#3a2a40", 0.9);
      }
    }
    ell(0, -70.8, 0.7, 0.5, "#e2b39e");
    if (mk.lip) ell(0, -68.5, 2.7, 1.35, mk.lip);
    ctx.strokeStyle = mk.lip ? "rgba(120,20,60,.55)" : "#d9667f"; ctx.lineWidth = 1; ctx.lineCap = "round";
    if (sk.kiss) ell(0, -68.3, 1.5, 1.2, mk.lip || "#e9609a");
    else if (sk.sing > 0.12) { var so = sk.sing; ell(0, -68.2 + so * 0.5, 2.1 + so * 0.5, 0.7 + so * 2.1, "#8a2146"); ell(0, -66.9 + so * 0.9, 1.3 + so * 0.3, 0.5 + so * 0.7, "#f08aa6"); if (so > 0.4) R(-1.3, -69.2, 2.6, 0.7, "#fff"); }
    else if (sk.smile === 2) { ctx.fillStyle = "#bd3f5e"; ctx.beginPath(); ctx.moveTo(-2.5, -69.2); ctx.quadraticCurveTo(0, -64.6, 2.5, -69.2); ctx.closePath(); ctx.fill(); R(-1.4, -69, 2.8, 0.9, "#fff"); }
    else { ctx.beginPath(); ctx.moveTo(-1.9, -68.8); ctx.quadraticCurveTo(0, -67.1, 1.9, -68.8); ctx.stroke(); }
    if (mk.gloss && !sk.kiss && !(sk.sing > 0.12)) ell(-0.8, -69, 0.9, 0.35, "rgba(255,255,255,.8)");
    if (mk.glitter) for (i = 0; i < 5; i++) { var tw = 0.5 + 0.5 * Math.sin(clock * 4 + i * 1.7); ctx.globalAlpha = 0.45 + 0.55 * tw; sparkle([-5.6, 5.4, -7.2, 7, 0][i], [-77.4, -77.2, -72.6, -73, -69.6][i], 0.9 + tw * 0.5, "#fff3b0"); }
    ctx.globalAlpha = 1;
    if (mk.stars) { drawStar(-7.7, -70, 1.6, "#f6d365"); drawStar(7.4, -78.6, 1.3, "#f6d365"); }
    if (mk.gems) { ell(-5.3, -70, 0.55, 0.55, "#cfeaff"); ell(-6.7, -71.2, 0.5, 0.5, "#cfeaff"); ell(5.3, -70, 0.55, 0.55, "#cfeaff"); ell(6.7, -71.2, 0.5, 0.5, "#cfeaff"); }
  }
  function drawGuitarShape() {
    R(-1.5, -37, 3, 28, "#8d5c3d"); R(-1.5, -37, 3, 28, "rgba(0,0,0,.08)");
    for (var f = 0; f < 6; f++) R(-1.5, -33 + f * 4.2, 3, 0.5, "#e9d9b8");
    R(-2.7, -43, 5.4, 7, "#6e4630"); ell(-3.4, -41.5, 0.8, 0.8, "#f2c94c"); ell(-3.4, -38.2, 0.8, 0.8, "#f2c94c"); ell(3.4, -41.5, 0.8, 0.8, "#f2c94c"); ell(3.4, -38.2, 0.8, 0.8, "#f2c94c");
    ell(0, 4, 9.4, 8.6, "#f291bd"); ell(0, -5.5, 7.2, 6.2, "#f291bd"); ell(0, 4, 7, 6.4, "#f7a9c9"); ell(-3.2, 1, 2.2, 3.4, "rgba(255,255,255,.2)");
    ell(0, -0.6, 3, 3, "#3b2340"); ctx.strokeStyle = "#f2c94c"; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.arc(0, -0.6, 3.3, 0, 6.3); ctx.stroke();
    R(-4.2, 8.8, 8.4, 1.5, "#6e4630"); drawStar(4.6, 5.2, 1.9, "#f2c94c");
    for (var k = -1; k <= 1; k += 2) line(k * 0.55, -36, k * 0.55, 9.4, "rgba(255,255,255,.55)", 0.28);
  }
  function drawMic(sk) {
    var a = sk.aR, ex = 9 + Math.sin(a[0]) * 12, ey = -58 + Math.cos(a[0]) * 12, hx = ex + Math.sin(a[1]) * 11, hy = ey + Math.cos(a[1]) * 11;
    line(hx, hy, hx - 1.3, hy - 4.6, "#3a3350", 2.1);
    ell(hx - 1.9, hy - 6.4, 2.3, 2.5, "#e9e4f5"); ell(hx - 1.9, hy - 6.4, 2.3, 2.5, "rgba(140,120,190,.35)"); ell(hx - 2.5, hy - 7.2, 0.8, 0.8, "rgba(255,255,255,.8)");
    line(hx - 3.4, hy - 5.4, hx - 0.4, hy - 5.4, "#ff7fb7", 0.9);
    ell(hx, hy, 2.8, 2.8, SKIN);
  }
  function drawBody(sk, o, hi) {
    var hd = HAIRS[hi], jw = JEWELS[jewel];
    if (sk.sit) ctx.save();
    ctx.translate(sk.sway, sk.bob);
    if (sk.sit) { ctx.translate(0, 8); ctx.beginPath(); ctx.rect(-70, -150, 140, 126); ctx.clip(); }
    ctx.translate(0, -34); ctx.rotate(sk.lean); ctx.translate(0, 34);
    ctx.save(); ctx.translate(sk.hair || 0, 0); hairBack(hi, hd.c); ctx.restore();
    legsAndBottoms(o, sk);
    skinTorso(o);
    if (o.dress) skirtDraw(o, sk);
    torsoDraw(o);
    R(-3, -67, 6, 8, SKIN);
    neckJewel(jw);
    if (sk.guitar) { ctx.save(); ctx.translate(5, -39 + sk.strum * 0.6); ctx.rotate(-0.95 + sk.strum * 0.02); ctx.scale(0.8, 0.8); drawGuitarShape(); ctx.restore(); }
    armsDraw(o, sk);
    faceDraw(sk);
    if (sk.mic) drawMic(sk);
    hairFront(hi, hd.c, hd.hl);
    headJewel(jw);
    earJewel(jw);
    if (sk.sit) ctx.restore();
  }
  function person(x, y, sc, sk, o, hi, shadow) {
    if (shadow !== false) ell(x, y, 17 * sc, 5 * sc, "rgba(40,20,80,.22)");
    var main = ctx;
    ctx = sprC; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, spr.width, spr.height);
    ctx.setTransform(K, 0, 0, K, SPOX * K, SPOY * K);
    drawBody(sk, o, hi);
    silC.globalCompositeOperation = "copy"; silC.drawImage(spr, 0, 0);
    silC.globalCompositeOperation = "source-in"; silC.fillStyle = OUTLINE; silC.fillRect(0, 0, sil.width, sil.height);
    silC.globalCompositeOperation = "source-over";
    ctx = main;
    var dw = SPW * sc, dh = SPH * sc, dx = x - SPOX * sc, dy = y - SPOY * sc, r = 1.05 * Math.max(sc, 0.9);
    for (var k = 0; k < 8; k++) { var a = k * Math.PI / 4; ctx.drawImage(sil, dx + Math.cos(a) * r, dy + Math.sin(a) * r, dw, dh); }
    ctx.drawImage(spr, dx, dy, dw, dh);
  }

  /* ---- animation ---- */
  var MAC = [
    [-0.12, -0.08, 1.45, 1.5], [-1.45, -1.5, 1.45, 1.5], [-1.45, -1.5, 0.5, -1.77], [-0.5, 1.77, 0.5, -1.77],
    [-0.5, 1.77, 1.9, -2.3], [-1.9, 2.3, 1.9, -2.3], [-0.9, 0.72, 0.9, -0.72], [-0.9, 0.72, 0.9, -0.72]
  ];
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ik(sx, tx, ty, bend) {
    var dx = tx - sx, dy = ty + 58, d = Math.max(4, Math.min(Math.hypot(dx, dy), 22.8)), base = Math.atan2(dx, dy);
    var A = Math.acos(Math.max(-1, Math.min(1, (144 + d * d - 121) / (24 * d)))), a1 = base + bend * A;
    var ex = sx + Math.sin(a1) * 12, ey = -58 + Math.cos(a1) * 12;
    return [a1, Math.atan2(tx - ex, ty - ey)];
  }
  var SING_LEN = 1.65;
  function skel() {
    var t = clock, tp = clock - poseT0, ph, u, s = { lL: 0, lR: 0, aL: [-0.12, -0.08], aR: [0.12, 0.08], sway: 0, bob: 0, lean: 0, flare: 0, smile: 1, kiss: false, peace: false };
    if (player.pet > 0 && !player.moving) {
      var d = player.petDir;
      s.lean = 0.2 * d; s.bob = 2.5; s.smile = 2; s.lL = 0.12; s.lR = -0.12;
      var arm = ik(d * 9, d * (21 + 3 * Math.sin(t * 10)), -37, -d);
      if (d > 0) s.aR = arm; else s.aL = arm;
    } else if (poseIdx === 1) {
      ph = tp * 6; s.lL = 0.4 * Math.sin(ph); s.lR = -s.lL; s.sway = 3 * Math.sin(ph); s.bob = -Math.abs(Math.sin(ph)) * 1.6;
      s.aL = [-0.9, 0.72]; s.aR = [0.9, -0.72]; s.lean = 0.03 * Math.sin(ph);
    } else if (poseIdx === 2) {
      s.lL = 0.05; s.lR = -0.28; s.aL = [-2.2, 2.07]; s.aR = [0.9, -0.72]; s.lean = -0.05; s.sway = 2; s.bob = Math.sin(t * 2) * 0.4;
    } else if (poseIdx === 3) {
      var bt = tp / 0.45, i = Math.floor(bt) % 8, f = bt - Math.floor(bt), e = f * f * (3 - 2 * f), A = MAC[i], B = MAC[(i + 1) % 8];
      s.aL = [lerp(A[0], B[0], e), lerp(A[1], B[1], e)]; s.aR = [lerp(A[2], B[2], e), lerp(A[3], B[3], e)];
      s.bob = -Math.abs(Math.sin(tp * 7)) * 1.8; s.lL = 0.12 * Math.sin(tp * 7); s.lR = -s.lL; s.smile = 2;
      if (i >= 6) s.sway = 4 * Math.sin(tp * 14);
    } else if (poseIdx === 4) {
      s.aL = [-0.9, 0.72]; s.aR = ik(9, 19, -83, 1); s.peace = true; s.lean = 0.06; s.sway = 2; s.lL = 0.04; s.lR = -0.22; s.smile = 2; s.bob = Math.sin(tp * 2.4) * 0.5;
    } else if (poseIdx === 5) {
      s.aR = [2.55, 2.9 + 0.5 * Math.sin(tp * 9)]; s.smile = 2; s.bob = Math.sin(tp * 3) * 0.6; s.lean = 0.03; s.lL = 0.05; s.lR = -0.05;
    } else if (poseIdx === 6) {
      u = tp % 2.2; s.aL = [-0.9, 0.72]; s.lL = 0.04; s.lR = -0.2; s.lean = 0.03; s.sway = 1.5;
      var tx, ty;
      if (u < 0.5) { f = u / 0.5; tx = lerp(15, 1.5, f); ty = lerp(-48, -67.5, f); s.kiss = true; }
      else if (u < 1.0) { tx = 1.5; ty = -67.5; s.kiss = true; }
      else if (u < 1.4) { f = (u - 1.0) / 0.4; tx = lerp(1.5, 25, f); ty = lerp(-67.5, -74, f); s.kiss = f < 0.3; }
      else { f = Math.min(1, (u - 1.4) / 0.6); tx = lerp(25, 15, f); ty = lerp(-74, -48, f); }
      s.aR = ik(9, tx, ty, 1); s.smile = u > 1.0 ? 2 : 1;
    } else if (poseIdx === 7) {
      u = (Math.sin(tp * 2.4) + 1) / 2; s.bob = 3.2 * u; s.lL = -0.12 * u; s.lR = -0.34 * u; s.lean = 0.07 * u * Math.sin(tp * 0.8 + 1); s.flare = 3 * u;
      s.aL = ik(-9, -16, -41, -1); s.aR = ik(9, 16, -41, 1); s.smile = 2;
    } else if (poseIdx === 8) {
      var j = Math.abs(Math.sin(tp * 5.5)); s.bob = -10 * j; s.lL = 0.28 * j; s.lR = -0.28 * j; s.smile = 2;
      s.aL = [-2.55 - 0.12 * Math.sin(tp * 11), -2.95]; s.aR = [2.55 + 0.12 * Math.sin(tp * 11), 2.95];
    } else if (poseIdx === 9) {
      var gg = Math.sin(tp * 4);
      s.sway = 5 * gg; s.bob = -Math.abs(gg) * 2.2; s.lean = 0.08 * gg; s.lL = 0.25 * gg; s.lR = -0.25 * gg; s.smile = 2;
      s.aL = [-2.05 + 0.6 * Math.sin(tp * 4 + 1), -2.45 + 0.6 * gg]; s.aR = [2.05 + 0.6 * Math.sin(tp * 4 + 2.2), 2.45 + 0.6 * Math.sin(tp * 4 + 0.6)];
    } else if (player.wamp > 0.03) {
      var wa = player.wamp, hz = player.hx, sn = Math.sin(ph = player.walk * 11.5), cs = Math.cos(ph), sgn = player.dir < 0 ? -1 : 1;
      // legs: swing + knee bend + foot lift (a leg bends while it swings through)
      var amp = (0.12 + 0.34 * hz) * wa;
      s.lL = amp * sn; s.lR = -amp * sn; s.kL = wa * (0.25 + 0.75 * hz) * 0.95 * Math.max(0, cs); s.kR = wa * (0.25 + 0.75 * hz) * 0.95 * Math.max(0, -cs); s.gh = hz; s.gs = sgn; s.hs = 1 - 0.8 * hz;
      // arms swing opposite to the legs with a soft elbow bend
      var sw = 0.38 * wa * (0.45 + 0.55 * hz) * sn, sw2 = 0.16 * wa * (1 - hz) * sn;
      s.aL = [-0.14 - sw - sw2, -0.14 - sw * 0.8 + 0.16 * wa + 0.3 * wa * Math.max(0, sn)]; s.aR = [0.14 + sw + sw2, 0.14 + sw * 0.8 - 0.16 * wa - 0.3 * wa * Math.max(0, -sn)];
      // body: bounce lowest at double support, hip sway, shoulder counter-roll, lean into travel
      s.bob = (1.5 * Math.abs(sn) - 1.1) * wa; s.sway = (1.7 * (1 - 0.55 * hz)) * Math.sin(ph) * wa; s.lean = (0.045 * sgn * hz + 0.03 * Math.sin(ph + 0.6) * (1 - hz)) * wa;
      s.hair = -sgn * 1.4 * hz * wa + 1.1 * Math.sin(ph - 0.9) * wa; s.flare = 0.7 * Math.abs(sn) * wa;
    } else { s.bob = Math.sin(t * 2) * 0.5; }
    if (singing) {
      s.sing = singT > 0 ? ((SING_LEN - singT) < 0.9 ? 0.3 + 0.7 * Math.abs(Math.sin(clock * 10.5)) : 0.72 + 0.18 * Math.sin(clock * 5.4)) : 0.05;
      if (poseIdx === 0) { s.sway += 1.3 * Math.sin(clock * 2.6); s.lean += 0.025 * Math.sin(clock * 2.6 + 1); }
      if (!guitar && !drumMode && poseIdx === 0 && !(player.pet > 0 && !player.moving)) { s.aR = ik(9, 6.5, -63, 1); s.mic = true; }
    }
    if (guitar) {
      s.guitar = true; s.strum = strumT > 0 ? Math.sin(strumT * 38) * Math.min(1, strumT * 3.5) * 3 : 0;
      s.aL = ik(-9, -11.5, -51.5, -1); s.aR = ik(9, 7.5, -37 + s.strum, 1); if (strumT > 0) s.smile = 2;
    }
    if (drumMode) {
      var kk = KIT.fx.kick > 0 ? KIT.fx.kick / 0.2 : 0, arms = [];
      s.sit = true; s.sticks = true; s.smile = 2; s.lL = 0; s.lR = 0; s.kL = 0; s.kR = 0; s.bob = kk * 1.5 + Math.sin(clock * 4) * 0.3; s.lean = 0.025 * Math.sin(clock * 3.2); s.sway = 0;
      ["L", "R"].forEach(function (sd) {
        var h = drumArm[sd], z = DR[h.n], e = Math.max(0, Math.min(1, h.t / 0.2)), rest = sd === "L" ? [-19, -32] : [19, -33], sg = sd === "L" ? -1 : 1, tx = lerp(rest[0], z.hx, e), ty = lerp(rest[1], z.hy, e), as = sg * 0.28;
        arms.push(ik(sg * 9, tx - Math.sin(as) * 9, ty - Math.cos(as) * 9 - 6, sg));
      });
      s.aL = arms[0]; s.aR = arms[1];
    }
    return s;
  }
  function outfitNow() { return worn >= 0 ? OUTFITS[worn] : STARTER; }

  /* ---- scene ---- */
  var STARS = [[104, 36, 8], [180, 64, 9], [470, 38, 8], [700, 40, 11], [696, 100, 6], [20, 48, 9]];
  var LIGHT_COL = ["#ffd86b", "#ff8fc0", "#8fd0ff", "#c3b0ff"];
  function mkCanvas(w, h) { var c = document.createElement("canvas"); c.width = Math.round(w); c.height = Math.round(h); return c; }
  var bg = mkCanvas(W * K, H * K), vig = mkCanvas(W * K, H * K), glows = [];
  function initSprites() {
    LIGHT_COL.forEach(function (col) {
      var c = mkCanvas(48, 48), x = c.getContext("2d"), g = x.createRadialGradient(24, 24, 0, 24, 24, 24);
      g.addColorStop(0, col); g.addColorStop(0.25, col); g.addColorStop(1, "rgba(255,255,255,0)"); x.globalAlpha = 0.9; x.fillStyle = g; x.fillRect(0, 0, 48, 48); glows.push(c);
    });
    var vx = vig.getContext("2d"), vg = vx.createRadialGradient(W * K / 2, H * K / 2, H * K * 0.46, W * K / 2, H * K / 2, W * K * 0.62);
    vg.addColorStop(0, "rgba(25,12,60,0)"); vg.addColorStop(1, "rgba(25,12,60,.34)"); vx.fillStyle = vg; vx.fillRect(0, 0, vig.width, vig.height);
  }
  function renderBG() {
    var main = ctx, i, x, y, r, g;
    ctx = bg.getContext("2d"); ctx.setTransform(K, 0, 0, K, 0, 0);
    g = ctx.createLinearGradient(0, 0, 0, WALL); g.addColorStop(0, "#1b2a66"); g.addColorStop(1, "#3b5cab"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, WALL);
    ctx.fillStyle = "rgba(255,255,255,.07)";
    for (y = 12, r = 0; y < WALL - 8; y += 22, r++) for (x = (r % 2) * 11 + 6; x < W; x += 22) { ctx.beginPath(); ctx.moveTo(x, y - 3.2); ctx.lineTo(x + 1.5, y); ctx.lineTo(x, y + 3.2); ctx.lineTo(x - 1.5, y); ctx.closePath(); ctx.fill(); }
    g = ctx.createRadialGradient(296, 86, 10, 296, 86, 300); g.addColorStop(0, "rgba(255,225,245,.20)"); g.addColorStop(1, "rgba(255,225,245,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, WALL);
    g = ctx.createLinearGradient(0, 0, 0, 26); g.addColorStop(0, "rgba(10,10,40,.38)"); g.addColorStop(1, "rgba(10,10,40,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 26);
    R(0, WALL - 20, W, 20, "rgba(18,26,80,.33)"); R(0, WALL - 20, W, 1.2, "rgba(230,201,107,.55)");
    R(0, WALL - 4, W, 4, "#2c428c");
    // mirror glow + frame
    g = ctx.createRadialGradient(623, 83, 20, 623, 83, 120); g.addColorStop(0, "rgba(190,215,255,.38)"); g.addColorStop(1, "rgba(190,215,255,0)"); ctx.fillStyle = g; ctx.fillRect(480, 0, 280, WALL);
    R(MIR.x - 2.5, MIR.y - 2.5, MIR.w + 5, MIR.h + 5, "#e6c96b"); R(MIR.x, MIR.y, MIR.w, MIR.h, "#34559e"); R(MIR.x + 2, MIR.y + 2, MIR.w - 4, MIR.h - 4, "#3f64b4");
    g = ctx.createLinearGradient(GLASS.x, GLASS.y, GLASS.x + GLASS.w, GLASS.y + GLASS.h); g.addColorStop(0, "#b9d0f5"); g.addColorStop(1, "#7fa3e0"); ctx.fillStyle = g; ctx.fillRect(GLASS.x, GLASS.y, GLASS.w, GLASS.h);
    R(GLASS.x, GLASS.y, GLASS.w, 1.5, "rgba(30,50,120,.35)"); R(GLASS.x, GLASS.y, 1.5, GLASS.h, "rgba(30,50,120,.25)");
    // floor
    g = ctx.createLinearGradient(0, WALL, 0, H); g.addColorStop(0, "#9884d4"); g.addColorStop(1, "#bcaaec"); ctx.fillStyle = g; ctx.fillRect(0, WALL, W, H - WALL);
    y = WALL + 3;
    for (i = 0; y < H; i++) {
      var rh = 10 + i * 1.5;
      ctx.fillStyle = i % 2 ? "rgba(255,255,255,.04)" : "rgba(60,30,120,.04)"; ctx.fillRect(0, y, W, rh);
      R(0, y, W, 0.8, "rgba(70,40,130,.16)");
      for (x = (i * 53) % 130; x < W; x += 130) R(x, y, 0.8, rh, "rgba(70,40,130,.11)");
      y += rh;
    }
    R(0, WALL, W, 3, "#e6c96b"); R(0, WALL + 3, W, 4, "rgba(40,20,90,.20)");
    g = ctx.createRadialGradient(623, 250, 10, 623, 250, 130); g.addColorStop(0, "rgba(255,255,255,.16)"); g.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = g; ctx.fillRect(480, WALL, 240, H - WALL);
    // rug
    furSeed = 11; fur(ellPts(RUG.x, RUG.y, 80, 19), RUG.x, RUG.y, FUR_PURPLE, { shadow: true });
    fur(ellPts(RUG.x, RUG.y, 60, 12.8), RUG.x, RUG.y, FUR_WHITE);
    drawStar(RUG.x, RUG.y, 6.5, "#f6d365"); drawStar(RUG.x, RUG.y, 3.4, "#fff7d0");
    renderDecor();
    // racks (static parts)
    RACKS.forEach(function (rk) {
      ell(rk.x, 207, 28, 6.5, "rgba(40,20,80,.28)"); ell(rk.x, 214, 36, 8, "rgba(255,255,255,.08)");
      R(rk.x - 2, 78, 4, 125, "#cfd6ee"); R(rk.x - 2, 78, 1.4, 125, "rgba(255,255,255,.7)"); R(rk.x + 1, 78, 1, 125, "rgba(80,90,150,.3)");
      R(rk.x - 31, 79, 62, 3.4, "#eef1ff"); R(rk.x - 31, 81.4, 62, 1.2, "rgba(80,90,150,.3)");
      ell(rk.x - 31, 80.7, 3, 3, "#e6c96b"); ell(rk.x + 31, 80.7, 3, 3, "#e6c96b"); ell(rk.x, 77, 3.2, 3.2, "#e6c96b");
      R(rk.x - 16, 201, 32, 3, "#bcc4e4"); ell(rk.x - 14, 205, 3, 3, "#7f78ab"); ell(rk.x + 14, 205, 3, 3, "#7f78ab");
    });
    ctx = main;
  }

  function heart(x, y, s, c) {
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x, y + s * 0.9);
    ctx.bezierCurveTo(x - s * 1.4, y - s * 0.1, x - s * 0.7, y - s * 1.1, x, y - s * 0.4);
    ctx.bezierCurveTo(x + s * 0.7, y - s * 1.1, x + s * 1.4, y - s * 0.1, x, y + s * 0.9); ctx.fill();
  }
  function sparkle(x, y, r, c) {
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill();
  }
  function icon(o, x, y, t) {
    ctx.save(); ctx.translate(x, y); ctx.translate(0, 5); ctx.rotate(Math.sin(t * 1.4 + x) * 0.02); ctx.translate(0, -5);
    ctx.strokeStyle = "#cfd6ee"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-6, 11); ctx.lineTo(0, 5); ctx.lineTo(6, 11); ctx.stroke(); line(0, 5, 0, 1.5, "#cfd6ee", 1.2);
    var c = o.ic || o.c, tt = 11;
    if (o.dress) { poly([-5, tt, 5, tt, 4, tt + 11, -4, tt + 11], c); poly([-4, tt + 11, 4, tt + 11, 7 + o.skirt.flare * 0.45, tt + 11 + o.skirt.len * 0.6, -7 - o.skirt.flare * 0.45, tt + 11 + o.skirt.len * 0.6], c); if (o.sash) R(-5, tt + 8, 10, 2.4, o.sash); }
    else { poly([-6, tt, 6, tt, 5, tt + 12, -5, tt + 12], o.top.col); if (o.top.s === "sweater") R(-6, tt, 12, 2, "#e0d3b8"); var pl = o.pants.type === "short" ? 8 : 20; poly([-5, tt + 12, -0.6, tt + 12, -1.2, tt + 12 + pl, -5.4, tt + 12 + pl], o.pants.col); poly([0.6, tt + 12, 5, tt + 12, 5.4, tt + 12 + pl, 1.2, tt + 12 + pl], o.pants.col); }
    ctx.restore();
  }
  function drawCat(c, t) {
    var S = 1.25, purr = c.pet > 0, blink = (t % 5) < 0.12, mw = c.meowT > 0 ? Math.sin(Math.PI * (1 - c.meowT / 0.6)) : 0;
    ell(c.x, c.y + 2, 13 * S, 3.6, "rgba(40,20,80,.24)");
    ctx.save(); ctx.translate(c.x + (purr ? Math.sin(t * 70) * 0.35 : 0), c.y - c.hop); ctx.scale(c.face * S, S);
    var wag = Math.sin(t * (purr ? 9 : 4)) * 3, ph = t * 14, C1 = "#2b2a36", C2 = "#403f52";
    ctx.strokeStyle = C1; ctx.lineWidth = 3.2; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-9, -8);
    if (purr) ctx.bezierCurveTo(-15, -14, -12 + wag, -22, -13 + wag, -28); else ctx.bezierCurveTo(-16, -10 + wag * 0.4, -19, -16 + wag, -15, -21 + wag);
    ctx.stroke();
    [[-7, 0], [-3, Math.PI], [5, Math.PI], [9, 0]].forEach(function (l) {
      var xx = l[0] + (c.walking ? Math.sin(ph + l[1]) * 3 : 0); line(l[0], -6, xx, -0.6, C1, 3.2); ell(xx + 0.5, -0.3, 2.4, 1.4, "#f4f0f6");
    });
    ell(0, -9, 10.8, 6.4, C1); ell(1, -6.4, 7.4, 2.7, C2);
    line(5.2, -11, 8.6, -8.2, "#e9609a", 2); ell(7.5, -7.4, 1.5, 1.5, "#f6d365");
    ctx.save(); ctx.translate(9.5, -11); ctx.rotate(-0.24 * mw); ctx.translate(-9.5, 11);
    ell(9.5, -14, 6.3, 5.7, C1);
    poly([5, -17, 6.4, -24.5, 10.4, -18.2], C1); poly([10, -18.2, 13.8, -24.6, 15, -16.4], C1);
    poly([6.4, -18.2, 7, -22.2, 9.2, -18.6], "#ff9fbd"); poly([11.2, -18.6, 13.2, -22.2, 13.8, -17.4], "#ff9fbd");
    if (purr || blink) { ctx.strokeStyle = "#f6d365"; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.arc(12.4, -13.6, 1.7, Math.PI, 0); ctx.stroke(); ctx.beginPath(); ctx.arc(7.4, -13.6, 1.5, Math.PI, 0); ctx.stroke(); }
    else { ell(12.4, -14.6, 1.9, 2.2, "#f6d365"); ell(12.5, -14.6, 0.7, 1.9, "#15141b"); ell(11.9, -15.4, 0.5, 0.5, "#fff"); ell(7.6, -14.6, 1.6, 2, "#f6d365"); ell(7.7, -14.6, 0.6, 1.7, "#15141b"); }
    ell(14.8, -11.6, 0.9, 0.7, "#ff8fb0");
    if (mw > 0.05) { ell(14.4, -9.4, 1.5 * mw + 0.3, 1.9 * mw + 0.2, "#7a1f3d"); ell(14.4, -8.8, 0.9 * mw, 0.7 * mw, "#ff8fb0"); }
    line(14.2, -11, 20, -12.4, "rgba(255,255,255,.65)", 0.5); line(14.2, -10.2, 20, -9.6, "rgba(255,255,255,.65)", 0.5);
    ctx.restore();
    ctx.restore();
  }
  function bubble(x, y, text) {
    ctx.font = "bold 11px 'Plus Jakarta Sans', system-ui, sans-serif";
    var w = ctx.measureText(text).width + 16, h = 20, bx = Math.max(w / 2 + 2, Math.min(W - w / 2 - 2, x));
    ctx.fillStyle = "rgba(255,255,255,.96)";
    ctx.beginPath(); (ctx.roundRect ? ctx.roundRect(bx - w / 2, y - h, w, h, 10) : ctx.rect(bx - w / 2, y - h, w, h)); ctx.fill();
    poly([x - 4, y, x + 4, y, x, y + 5], "rgba(255,255,255,.96)");
    ctx.fillStyle = "#34323e"; ctx.textAlign = "center"; ctx.fillText(text, bx, y - 6);
  }
  function drawLights(t) {
    var k, j, u, x, y, n = 0, p;
    ctx.strokeStyle = "rgba(255,236,190,.4)"; ctx.lineWidth = 0.9;
    for (k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(k * 180, 2); ctx.quadraticCurveTo(k * 180 + 90, 30, k * 180 + 180, 2); ctx.stroke(); }
    for (k = 0; k < 4; k++) for (j = 1; j <= 5; j++, n++) {
      u = j / 6; x = k * 180 * (1 - u) * (1 - u) + 2 * (1 - u) * u * (k * 180 + 90) + u * u * (k * 180 + 180); x = k * 180 + u * 180; y = (1 - u) * (1 - u) * 2 + 2 * (1 - u) * u * 30 + u * u * 2;
      p = 0.55 + 0.45 * Math.sin(t * 2 + n * 1.3);
      ctx.globalAlpha = 0.35 + 0.5 * p; ctx.drawImage(glows[n % 4], x - 8, y - 7, 16, 16); ctx.globalAlpha = 1;
      ell(x, y + 1.2, 1.7, 2.3, LIGHT_COL[n % 4]);
    }
  }
  var logoImg = new Image(), logoOK = false;
  logoImg.onload = function () { logoOK = true; };
  logoImg.src = "../assets/dolled-up/dolled-up-wordmark-sm.png";
  function drawLogoSign(t) {
    if (!logoOK) return;
    var w = 124, h = w * logoImg.naturalHeight / logoImg.naturalWidth, cx = 296, top = 21;
    line(cx - 42, 14, cx - 42, top + 8, "rgba(255,236,190,.6)", 0.9); line(cx + 42, 14, cx + 42, top + 8, "rgba(255,236,190,.6)", 0.9);
    ctx.save(); ctx.translate(cx, top); ctx.rotate(Math.sin(t * 1.3) * 0.01);
    var g = ctx.createRadialGradient(0, h / 2, 4, 0, h / 2, w * 0.72); g.addColorStop(0, "rgba(255,190,235," + (0.34 + 0.08 * Math.sin(t * 2)) + ")"); g.addColorStop(1, "rgba(255,190,235,0)");
    ctx.fillStyle = g; ctx.fillRect(-w, -20, w * 2, h + 40);
    ctx.drawImage(logoImg, -w / 2, 0, w, h);
    ctx.restore();
  }
  function drawAmbient(t) {
    for (var i = 0; i < 18; i++) {
      var sp = 6 + (i * 7) % 9, x = (i * 97 + Math.sin(t * 0.6 + i) * 10) % W, y = H + 10 - ((t * sp + i * 41) % (H + 20)), tw = 0.5 + 0.5 * Math.sin(t * 2.4 + i * 2);
      ctx.globalAlpha = 0.12 + 0.34 * tw; sparkle(x, y, 1.6 + (i % 3) * 0.7, "#fff");
    }
    ctx.globalAlpha = 1;
  }

  /* ---- decor: rugs, props, plants, wall pieces ---- */
  function rpath(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); }
  function note(x, y, c) { ell(x, y, 1.9, 1.4, c); line(x + 1.7, y, x + 1.7, y - 6.5, c, 0.9); }
  function bakeSprite(pw, ph, fn) {
    var t = mkCanvas(pw * K, ph * K), f = mkCanvas(pw * K, ph * K), s2 = mkCanvas(pw * K, ph * K), main = ctx, fc = f.getContext("2d"), sx = s2.getContext("2d");
    ctx = t.getContext("2d"); ctx.setTransform(K, 0, 0, K, pw / 2 * K, (ph - 6) * K); fn(); ctx = main;
    sx.drawImage(t, 0, 0); sx.globalCompositeOperation = "source-in"; sx.fillStyle = OUTLINE; sx.fillRect(0, 0, s2.width, s2.height);
    for (var k = 0; k < 8; k++) { var an = k * Math.PI / 4; fc.drawImage(s2, Math.cos(an) * 1.05 * K, Math.sin(an) * 1.05 * K); }
    fc.drawImage(t, 0, 0);
    return { img: f, pw: pw, ph: ph };
  }
  function blit(sp, x, y) { ctx.drawImage(sp.img, x - sp.pw / 2, y - (sp.ph - 6), sp.pw, sp.ph); }

  function drawSideTable() {
    line(-9, -20, -12.5, 0, "#e0b040", 1.7); line(9, -20, 12.5, 0, "#e0b040", 1.7); line(0, -20, 0, -1, "#cfa23a", 1.4);
    ell(0, -8, 11.5, 3, "#f2c7de"); ell(0, -7.4, 11.5, 3, "#e7a9c9");
    ell(0, -21.4, 16, 5, "#e7a9c9"); ell(0, -22.6, 16, 5, "#fff4fa"); ell(0, -22.9, 13.8, 3.7, "#fff9fc");
  }
  function drawGuitarStand() {
    line(0, -20, -12, 0, "#cfa23a", 1.7); line(0, -20, 12, 0, "#cfa23a", 1.7); line(0, -20, 0, -2.5, "#b98f31", 1.4);
    rrect(-9, -11.5, 18, 3, 1.5, "#7a4a6a"); line(0, -20, 0, -33, "#cfa23a", 1.9); rrect(-6, -35.5, 12, 3.2, 1.6, "#7a4a6a");
  }
  function drawMicStand() {
    ell(0, -1, 10, 2.8, "#b98f31"); ell(0, -2, 10, 2.8, "#e0b040"); line(0, -3, 0, -48, "#d8d0e8", 1.7); line(0, -3, 0, -48, "rgba(255,255,255,.5)", 0.5);
    line(0, -48, 6, -54, "#d8d0e8", 1.5);
    ctx.save(); ctx.translate(8, -57); ctx.rotate(0.6); ell(0, 0, 3.4, 4.7, "#f291bd"); ell(0, -1, 2.7, 3, "#ffc2de");
    for (var k = 0; k < 5; k++) ell(-1.4 + (k % 2) * 2.8, -2.4 + k * 1.2, 0.35, 0.35, "rgba(120,30,80,.6)"); R(-1.6, 3.8, 3.2, 3.4, "#d8d0e8");
    ctx.restore();
    ctx.strokeStyle = "#f291bd"; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(1, -6); ctx.quadraticCurveTo(14, -3, 8, 1); ctx.stroke();
  }
  var PROPS = [
    { x: 300, y: 324, hw: 13, pw: 48, ph: 42, draw: drawSideTable },
    { x: 406, y: 336, hw: 10, pw: 44, ph: 52, draw: drawGuitarStand },
    { x: 362, y: 336, hw: 8, pw: 34, ph: 72, draw: drawMicStand }
  ];
  function bakeProps() { PROPS.forEach(function (p) { p.sp = bakeSprite(p.pw, p.ph, p.draw); }); bakeKit(); }

  /* ---- drum kit ---- */
  var KIT = { x: 566, y: 292, hw: 38, fx: {} };
  var DR = {
    hat: { x: -30, y: -31, rx: 11, ry: 8, hx: -30, hy: -33, key: "A" }, snare: { x: -19, y: -23, rx: 11, ry: 7, hx: -19, hy: -26, key: "S" },
    tomA: { x: -7.5, y: -36, rx: 9, ry: 7, hx: -7.5, hy: -37.5, key: "W" }, tomB: { x: 7.5, y: -36, rx: 9, ry: 7, hx: 7.5, hy: -37.5, key: "W" },
    ftom: { x: 22, y: -20, rx: 12, ry: 10, hx: 22, hy: -25, key: "D" }, crash: { x: 30, y: -48, rx: 14, ry: 7, hx: 30, hy: -48, key: "E" }, kick: { x: 0, y: -15, rx: 15, ry: 15, hx: 0, hy: -15, key: "SPC" }
  };
  var DORDER = ["crash", "hat", "tomA", "tomB", "snare", "ftom", "kick"], HANDOF = { hat: "L", snare: "alt", tomA: "L", tomB: "R", ftom: "R", crash: "R" };
  var DDUR = { hat: 0.25, snare: 0.22, tomA: 0.22, tomB: 0.22, ftom: 0.22, crash: 0.9, kick: 0.2 };
  function drawKitBack() {
    var G = "#cfa23a";
    line(-30, -30, -30, -3, G, 1.3); line(-30, -10, -37, -1, G, 1.1); line(-30, -10, -23, -1, G, 1.1); line(-30, -10, -30, -1, G, 1.1); rrect(-35, -3, 10, 2, 1, "#b98f31");
    line(30, -46, 30, -3, G, 1.3); line(30, -12, 38, -1, G, 1.1); line(30, -12, 22, -1, G, 1.1); line(30, -12, 30, -1, G, 1.1);
  }
  function drawHead(x, y, rx, ry, c) { ell(x, y, rx, ry, c); ctx.strokeStyle = "#e0b040"; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 6.2832); ctx.stroke(); }
  function drawTom(x, top, w, h, col) {
    rrect(x - w / 2, top, w, h, 1.6, col); R(x - w / 2, top + 1.2, w, 0.9, "#e0b040"); R(x - w / 2, top + h - 2, w, 0.9, "#e0b040");
    ell(x - w * 0.18, top + h * 0.5, 0.7, 0.7, "#fff4fa"); ell(x + w * 0.18, top + h * 0.5, 0.7, 0.7, "#fff4fa"); drawHead(x, top, w / 2, 2.5, "#fff6fb");
  }
  function drawKitFront() {
    var G = "#cfa23a", i;
    [15.5, 22, 28.5].forEach(function (x) { line(x, -13, x + (x - 22) * 0.2, -1, G, 1.3); });
    drawTom(22, -25, 18, 12, "#f291bd"); heart(22, -17.5, 2.4, "#fff4fa");
    line(-19, -17, -27, -2, G, 1.2); line(-19, -17, -11, -2, G, 1.2); line(-19, -17, -19, -2, G, 1.2);
    rrect(-27, -24, 16, 7, 1.8, "#fff0f8"); R(-27, -22.8, 16, 0.9, "#ff7fb7"); R(-27, -18.8, 16, 0.9, "#ff7fb7"); drawHead(-19, -24, 8, 2.8, "#ffffff");
    ell(0, -15, 15.4, 15.4, "#e0b040"); ell(0, -15, 14, 14, "#f291bd"); ell(0, -15, 12.2, 12.2, "#fff6fb");
    for (i = 0; i < 10; i++) ell(Math.cos(i * 0.628) * 14.6, -15 + Math.sin(i * 0.628) * 14.6, 0.9, 0.9, "#fff1b8");
    heart(0, -14.5, 5.4, "#ff7fb7"); drawStar(0, -15.5, 2.2, "#fff4c4"); rrect(-3, -2.4, 6, 2, 1, "#b98f31");
    line(-7.5, -30, 7.5, -30, G, 1.3); line(0, -30, 0, -34.5, G, 1.3);
    drawTom(-7.5, -37, 13, 7, "#f291bd"); drawTom(7.5, -37, 13, 7, "#f291bd");
  }
  function drawHatCym() { ell(0, 1.3, 8.6, 2.1, "#b98f31"); ell(0, 0.3, 8.6, 2.1, "#e8c24f"); ell(0, -0.3, 8.6, 2.1, "#f6d672"); ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.ellipse(0, -0.3, 5.5, 1.2, 0, 3.4, 5.9); ctx.stroke(); ell(0, -0.6, 1.2, 0.55, "#b98f31"); }
  function drawCrashCym() {
    ell(0, 0.9, 12, 3.3, "#b98f31"); ell(0, 0, 12, 3.3, "#f0c93e"); ell(0, -0.4, 12, 3, "#f8de7a");
    ctx.strokeStyle = "rgba(190,140,30,.55)"; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.ellipse(0, -0.2, 8.5, 2.1, 0, 0, 6.2832); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, -0.2, 5, 1.3, 0, 0, 6.2832); ctx.stroke();
    ell(0, -0.5, 2.8, 1.2, "#e0a92c"); ctx.strokeStyle = "rgba(255,255,255,.65)"; ctx.beginPath(); ctx.ellipse(0, -0.4, 9.4, 2.4, 0, 3.5, 5.7); ctx.stroke();
  }
  function bakeKit() { KIT.back = bakeSprite(100, 60, drawKitBack); KIT.front = bakeSprite(100, 60, drawKitFront); KIT.hatS = bakeSprite(26, 14, drawHatCym); KIT.crashS = bakeSprite(34, 14, drawCrashCym); }
  function cym(sp, x, y, r) { ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.drawImage(sp.img, -sp.pw / 2, -(sp.ph - 6), sp.pw, sp.ph); ctx.restore(); }
  function keycap(x, y, txt, w) {
    w = w || 10; rrect(x - w / 2, y - 5, w, 10, 3, "rgba(255,255,255,.95)"); ctx.font = "bold 7px 'Plus Jakarta Sans', system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "#43306b"; ctx.fillText(txt, x, y + 2.4);
  }
  function drawKit(t) {
    var fx = KIT.fx, k = KIT.x, y = KIT.y, n, e;
    ell(k, y + 1, 46, 5.5, "rgba(40,20,80,.26)");
    blit(KIT.back, k, y);
    e = fx.hat > 0 ? fx.hat / DDUR.hat : 0; cym(KIT.hatS, k - 30, y - 32 + e * 0.8, Math.sin(t * 70) * 0.07 * e);
    e = fx.crash > 0 ? fx.crash / DDUR.crash : 0; cym(KIT.crashS, k + 30, y - 48, Math.sin(t * 38) * 0.2 * e * e + Math.sin(t * 61) * 0.05 * e);
    if (drumMode) person(k, y - 2, 1, skel(), outfitNow(), hair, false);
    blit(KIT.front, k, y);
    ["snare", "tomA", "tomB", "ftom", "kick"].forEach(function (nm) {
      e = fx[nm] > 0 ? fx[nm] / DDUR[nm] : 0; if (!e) return; var d = DR[nm];
      ctx.globalAlpha = Math.min(1, e) * 0.6; if (nm === "kick") { ell(k, y - 15, 12.2, 12.2, "#fff"); ctx.globalAlpha = e; ctx.strokeStyle = "#ff7fb7"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(k, y - 15, 15.5 + (1 - e) * 7, 0, 6.2832); ctx.stroke(); }
      else { var hy = nm === "ftom" ? -25 : nm === "snare" ? -24 : -37, hrx = nm === "ftom" ? 9 : nm === "snare" ? 8 : 6.5; ell(k + d.x, y + hy, hrx, 3.2, "#fff"); }
      ctx.globalAlpha = 1;
    });
    if (drumMode) {
      ctx.save(); ctx.globalAlpha = 0.95;
      keycap(k - 30, y - 41, "A"); keycap(k - 19, y - 24, "S"); keycap(k - 7.5, y - 37, "W"); keycap(k + 7.5, y - 37, "W"); keycap(k + 22, y - 25, "D"); keycap(k + 30, y - 57, "E"); keycap(k, y - 15, "SPACE", 22);
      ctx.restore(); ctx.textAlign = "left";
    }
  }
  function nearKit() { return !drumMode && Math.hypot(player.x - KIT.x, (player.y - (KIT.y + 14)) * 1.4) < 46; }
  function drumAt(lx, ly) { for (var i = 0; i < DORDER.length; i++) { var d = DR[DORDER[i]], ex = (lx - (KIT.x + d.x)) / (d.rx + 3), ey = (ly - (KIT.y + d.y)) / (d.ry + 3); if (ex * ex + ey * ey < 1) return DORDER[i]; } return null; }
  function enterDrums() { drumMode = true; guitar = false; poseIdx = 0; player.pet = 0; player.x = KIT.x; player.y = KIT.y - 2; keys = {}; say("Drum solo! ♪"); burst(KIT.x, KIT.y - 30, 14, ["#f6d365", "#fff", "#ff9fcf"], true); playSfx("sparkle"); syncUI(); }
  function leaveDrums() { if (!drumMode) return; drumMode = false; keys = {}; player.x = KIT.x; player.y = KIT.y + 22; say("Nice set ♡"); syncUI(); }
  function drumHit(n) {
    var d = DR[n], sd; KIT.fx[n] = DDUR[n]; drumHits++;
    if (n !== "kick") { sd = HANDOF[n]; if (sd === "alt") { sd = drumAlt ? "L" : "R"; drumAlt = !drumAlt; } drumArm[sd] = { n: n, t: 0.2 }; }
    playSfx(n);
    burst(KIT.x + d.x, KIT.y + d.y, n === "crash" ? 10 : n === "kick" ? 5 : 4, n === "crash" ? ["#f6d365", "#fff", "#fff4c4"] : ["#ff9fcf", "#fff", "#f6d365"], true);
    if (drumHits % 3 === 0) parts.push({ x: KIT.x + d.x, y: KIT.y + d.y - 6, vx: (Math.random() - 0.5) * 30, vy: -30, l: 1.5, note: true, c: ["#ff7fb7", "#f6d365", "#8fd0ff"][drumHits % 9 / 3 | 0] });
    if (drumHits % 40 === 0) say("You rock! ★");
  }
  var DKEY = { a: "hat", arrowleft: "hat", s: "snare", arrowdown: "snare", d: "ftom", arrowright: "ftom", e: "crash", enter: "crash", " ": "kick" };
  function drumTomPick() { drumTom = !drumTom; return drumTom ? "tomA" : "tomB"; }

  /* plants */
  function leaf(len, wid, c1, c2, vein) {
    var g = ctx.createLinearGradient(-wid, 0, wid, -len * 0.5); g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-wid * 1.05, -len * 0.12, -wid * 1.1, -len * 0.78, 0, -len); ctx.bezierCurveTo(wid * 1.1, -len * 0.78, wid * 1.05, -len * 0.12, 0, 0); ctx.fill();
    ctx.strokeStyle = vein; ctx.lineWidth = 0.7; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(0, -1); ctx.lineTo(0, -len * 0.92); ctx.stroke();
    ctx.lineWidth = 0.5; ctx.beginPath();
    for (var k = 1; k <= 3; k++) { var yy = -len * (0.16 + k * 0.2); ctx.moveTo(0, yy); ctx.lineTo(-wid * 0.62, yy - len * 0.1); ctx.moveTo(0, yy); ctx.lineTo(wid * 0.62, yy - len * 0.1); }
    ctx.stroke();
    ell(-wid * 0.36, -len * 0.55, wid * 0.13, len * 0.2, "rgba(255,255,255,.24)");
  }
  function leafFan(x, y, t, n, spread, len, wid, c1, c2, seed) {
    var order = [], i;
    for (i = 0; i < n; i++) order.push(i);
    order.sort(function (a, b) { return Math.abs(b - (n - 1) / 2) - Math.abs(a - (n - 1) / 2); });
    order.forEach(function (i) {
      var a = (n > 1 ? -spread + 2 * spread * i / (n - 1) : 0) + Math.sin(t * 1.15 + i * 1.7 + seed) * 0.035;
      var sl = len * (0.5 + ((i * 7 + seed) % 3) * 0.15), ll = len * (0.78 + ((i * 5 + seed) % 2) * 0.16);
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); line(0, 0, 0, -sl, "#2a7a5e", 1.3);
      ctx.translate(0, -sl); ctx.rotate((i % 2 ? 1 : -1) * 0.14); leaf(ll, wid, c1, c2, "rgba(215,255,228,.55)"); ctx.restore();
    });
  }
  function potRound(x, y, w, h, c, rim) {
    ell(x, y + 1, w * 0.62, 3, "rgba(40,20,80,.28)");
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x - w / 2, y - h); ctx.lineTo(x + w / 2, y - h); ctx.quadraticCurveTo(x + w / 2 - 1, y, x + w / 2 - w * 0.2, y); ctx.lineTo(x - w / 2 + w * 0.2, y); ctx.quadraticCurveTo(x - w / 2 + 1, y, x - w / 2, y - h); ctx.fill();
    ell(x + w * 0.28, y - h * 0.45, w * 0.1, h * 0.38, "rgba(60,30,110,.14)"); ell(x - w * 0.26, y - h * 0.5, w * 0.07, h * 0.3, "rgba(255,255,255,.34)");
    rrect(x - w / 2 - 1.2, y - h - 1.4, w + 2.4, 3.6, 1.8, rim);
  }
  function plantMonstera(x, y, t) {
    line(x - 8, y - 12, x - 12.5, y, "#e0b040", 1.6); line(x + 8, y - 12, x + 12.5, y, "#e0b040", 1.6); line(x, y - 12, x, y, "#cfa23a", 1.4);
    potRound(x, y - 12, 21, 16, "#c9b0e8", "#f6d672");
    leafFan(x, y - 27, t, 9, 1.2, 44, 16, "#1c6552", "#52b88a", 1); leafFan(x, y - 27, t, 5, 0.75, 31, 11.5, "#25805f", "#72cf9f", 2);
  }
  function plantPalm(x, y, t) {
    potRound(x, y, 20, 17, "#e2926a", "#f4b08a"); R(x - 9, y - 11, 18, 2, "rgba(255,255,255,.55)");
    var base = y - 17, i, a, h = 58, u, k;
    for (i = 0; i < 8; i++) {
      a = -1.2 + i * 0.343 + Math.sin(t * 1.1 + i) * 0.03;
      var tx = x + Math.sin(a) * h * 0.95, ty = base - Math.cos(a) * h * 0.55 + (Math.abs(a) > 0.55 ? 12 : 0), cx = x + Math.sin(a) * h * 0.45, cy = base - Math.cos(a) * h * 0.98;
      ctx.strokeStyle = "#2b7a58"; ctx.lineWidth = 1.5; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x, base); ctx.quadraticCurveTo(cx, cy, tx, ty); ctx.stroke();
      for (u = 0.22; u < 1; u += 0.09) {
        var px = (1 - u) * (1 - u) * x + 2 * (1 - u) * u * cx + u * u * tx, py = (1 - u) * (1 - u) * base + 2 * (1 - u) * u * cy + u * u * ty;
        var dx = 2 * (1 - u) * (cx - x) + 2 * u * (tx - cx), dy = 2 * (1 - u) * (cy - base) + 2 * u * (ty - cy), dl = Math.hypot(dx, dy) || 1, nx = -dy / dl, ny = dx / dl, ln = 3.2 + (1 - u) * 7;
        ctx.strokeStyle = i % 2 ? "#3aa072" : "#2f8f66"; ctx.lineWidth = 1.7;
        for (k = -1; k <= 1; k += 2) { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + (nx * k * 0.85 + dx / dl * 0.5) * ln, py + (ny * k * 0.85 + dy / dl * 0.5) * ln + 1.5); ctx.stroke(); }
      }
    }
  }
  function plantFlowers(x, y, t) {
    potRound(x, y, 19, 13, "#fff0f7", "#f6b8d6"); R(x - 8.5, y - 8, 17, 2, "#f6b8d6");
    leafFan(x, y - 12, t, 6, 0.95, 17, 6.5, "#1f7a58", "#58bf8c", 3);
    [[-7, -27, "#ff8fc0"], [0, -33, "#ffb3d6"], [7, -28, "#ff7fb7"], [-2.5, -22.5, "#ffc9e2"], [4.5, -21, "#ff9fcf"]].forEach(function (f, i) {
      var sw = Math.sin(t * 1.3 + i) * 0.7, fx = x + f[0] + sw, fy = y + f[1];
      line(x + f[0] * 0.3, y - 12, fx, fy + 3, "#2a7a5e", 0.9);
      for (var p = 0; p < 6; p++) { var an = p * 1.047 + i; ell(fx + Math.cos(an) * 2.6, fy + Math.sin(an) * 2.6, 2.1, 2.1, f[2]); }
      ell(fx, fy, 1.8, 1.8, "#fff1a8");
    });
  }
  function plantFig(x, y, t, sc) {
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    potRound(0, 0, 24, 19, "#f6b8d6", "#f6d672"); R(-11, -12, 22, 2.2, "#fff4fa");
    var sway = Math.sin(t * 0.9) * 1.2;
    ctx.strokeStyle = "#8a5a3c"; ctx.lineWidth = 2.4; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(0, -19); ctx.quadraticCurveTo(sway * 0.5, -50, sway, -92); ctx.stroke();
    for (var i = 0; i < 9; i++) {
      var ly = -34 - i * 6.8, side = i % 2 ? 1 : -1, tx = sway * (-ly / 92);
      ctx.save(); ctx.translate(tx, ly); ctx.rotate(side * (1.05 - i * 0.07) + Math.sin(t * 1.1 + i) * 0.035);
      leaf(25, 13, "#1f7a50", "#62c382", "rgba(215,255,228,.55)"); ctx.restore();
    }
    ctx.save(); ctx.translate(sway, -92); leaf(20, 10, "#25885a", "#6fd28e", "rgba(215,255,228,.55)"); ctx.restore();
    ctx.restore();
  }
  function plantPothos(x, y, t) {
    line(x - 7, y, x - 5, y + 14, "rgba(255,236,190,.6)", 0.7); line(x + 7, y, x + 5, y + 14, "rgba(255,236,190,.6)", 0.7);
    potRound(x, y + 25, 15, 11, "#f6b8d6", "#f6d672");
    leafFan(x, y + 14, t, 5, 0.9, 12, 5.2, "#1f7a58", "#58bf8c", 4);
    for (var v = 0; v < 5; v++) {
      var len = 30 + v * 9, sw = Math.sin(t * 1.0 + v * 1.3) * 2.4, off = -6 + v * 3, u, px, py;
      ctx.strokeStyle = "#2f8f5f"; ctx.lineWidth = 1; ctx.lineCap = "round"; ctx.beginPath();
      for (u = 0; u <= 1.001; u += 0.1) { px = x + off + Math.sin(u * 3 + v) * 3 + sw * u; py = y + 24 + u * len; if (u === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
      ctx.stroke();
      for (u = 0.2; u <= 1.001; u += 0.18) { px = x + off + Math.sin(u * 3 + v) * 3 + sw * u; py = y + 24 + u * len; heart(px + (v % 2 ? 1.6 : -1.6), py, 2.3, (u * 10 | 0) % 2 ? "#3fae73" : "#62c987"); }
    }
  }
  var PLANTS = [
    { kind: "monstera", x: 44, y: 200 }, { kind: "palm", x: 64, y: 344, hw: 10 }, { kind: "flowers", x: 518, y: 332, hw: 9 }, { kind: "fig", x: 704, y: 286, sc: 0.78, hw: 10 }
  ];
  function drawPlant(p, t) {
    if (p.kind === "monstera") plantMonstera(p.x, p.y, t); else if (p.kind === "palm") plantPalm(p.x, p.y, t);
    else if (p.kind === "flowers") plantFlowers(p.x, p.y, t); else if (p.kind === "fig") plantFig(p.x, p.y, t, p.sc || 1);
  }

  /* disco ball, hanging plants */
  function drawDisco(t) {
    var cx = 430, cy = 40, r = 12.5, i, k;
    line(cx, 0, cx, cy - r, "rgba(255,236,190,.65)", 0.9);
    ctx.save(); ctx.translate(cx, cy);
    var g = ctx.createRadialGradient(-4, -4, 2, 0, 0, r); g.addColorStop(0, "#ffffff"); g.addColorStop(0.5, "#c8d0ee"); g.addColorStop(1, "#6d78ac");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.3); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.3); ctx.clip(); ctx.strokeStyle = "rgba(60,70,130,.4)"; ctx.lineWidth = 0.5;
    for (i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(-r, i * 4.6); ctx.lineTo(r, i * 4.6); ctx.stroke(); }
    for (k = 0; k < 6; k++) { ctx.beginPath(); ctx.ellipse(0, 0, Math.abs(Math.sin(t * 0.6 + k * Math.PI / 6)) * r, r, 0, 0, 6.3); ctx.stroke(); }
    for (k = 0; k < 9; k++) { var a = t * 1.1 + k * 0.9, tw = 0.5 + 0.5 * Math.sin(t * 5 + k * 2); ctx.globalAlpha = 0.3 + 0.7 * tw; sparkle(Math.sin(a) * r * 0.8, ((k * 37) % 100 / 100 - 0.5) * r * 1.6, 1.2 + tw * 1.3, "#fff"); }
    ctx.globalAlpha = 1; ctx.restore(); ctx.restore();
    for (i = 0; i < 12; i++) {
      var sx = 360 + Math.sin(t * 0.28 + i * 1.9) * 340, sy = 50 + ((i * 53) % 320) + Math.cos(t * 0.23 + i) * 12;
      ctx.globalAlpha = 0.12 + 0.05 * Math.sin(t * 2 + i); ctx.drawImage(glows[i % 4], sx - 11, sy - 11, 22, 22);
    }
    ctx.globalAlpha = 1;
  }

  /* static wall + floor decor, painted once into the background */
  function goldRecord(cx, cy, r, c1, c2) {
    var s = r * 2 + 8; rpath(cx - s / 2, cy - s / 2, s, s, 3); ctx.fillStyle = "#3a2a58"; ctx.fill(); ctx.strokeStyle = "#f6d365"; ctx.lineWidth = 1.4; ctx.stroke();
    ell(cx, cy, r, r, c2); ell(cx, cy, r * 0.96, r * 0.96, c1);
    ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 0.4;
    for (var k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(cx, cy, r * (0.5 + k * 0.15), 0, 6.3); ctx.stroke(); }
    ell(cx, cy, r * 0.36, r * 0.36, "#f291bd"); drawStar(cx, cy, r * 0.24, "#fff4c4"); ell(cx, cy, 1, 1, "#3a2a58");
    ctx.strokeStyle = "rgba(255,255,255,.4)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, r * 0.82, 3.6, 4.5); ctx.stroke();
  }
  function posterArt(x, y, w, h) {
    rpath(x, y, w, h, 3); var g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, "#ff8fc7"); g.addColorStop(1, "#8a5ad8"); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.3; ctx.stroke();
    var g2 = ctx.createRadialGradient(x + w / 2, y + h * 0.45, 2, x + w / 2, y + h * 0.45, w * 0.7); g2.addColorStop(0, "rgba(255,255,255,.55)"); g2.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = g2; ctx.fillRect(x, y, w, h);
    drawStar(x + w / 2, y + h * 0.42, w * 0.34, "#ffe27a"); drawStar(x + w / 2, y + h * 0.42, w * 0.16, "#fff6c9");
    note(x + 7, y + h - 9, "#fff"); note(x + w - 9, y + h - 12, "#fff"); sparkle(x + w - 7, y + 8, 2.4, "#fff"); sparkle(x + 7, y + 12, 1.8, "#fff");
  }
  /* ---- furry rugs ---- */
  var furSeed = 7;
  function frnd() { furSeed = (furSeed * 16807) % 2147483647; return furSeed / 2147483647; }
  function ellPts(cx, cy, rx, ry) { return function (n) { var p = [], i, a; for (i = 0; i < n; i++) { a = i / n * 6.2832; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; }; }
  function sqPts(cx, cy, rx, ry, e) { return function (n) { var p = [], i, a, c, s2; for (i = 0; i < n; i++) { a = i / n * 6.2832; c = Math.cos(a); s2 = Math.sin(a); p.push([cx + (c < 0 ? -1 : 1) * Math.pow(Math.abs(c), 2 / e) * rx, cy + (s2 < 0 ? -1 : 1) * Math.pow(Math.abs(s2), 2 / e) * ry]); } return p; }; }
  function heartPts(cx, cy, hw, hh) { return function (n) { var p = [], i, t; for (i = 0; i < n; i++) { t = i / n * 6.2832; p.push([cx + hw * Math.pow(Math.sin(t), 3), cy - hh * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17]); } return p; }; }
  function starPts(cx, cy, r) { return function (n) { var p = [], i, a, rr; for (i = 0; i < n; i++) { a = i / n * 6.2832 - 1.5708; var seg = (i / n * 10) % 1, k = Math.floor(i / n * 10); var r1 = k % 2 ? r * 0.45 : r, r2 = k % 2 ? r : r * 0.45; rr = r1 + (r2 - r1) * seg; p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return p; }; }
  function perim(p) { var L = 0, i; for (i = 0; i < p.length; i++) L += Math.hypot(p[(i + 1) % p.length][0] - p[i][0], p[(i + 1) % p.length][1] - p[i][1]); return L; }
  function area(p) { var A = 0, i, q; for (i = 0; i < p.length; i++) { q = p[(i + 1) % p.length]; A += p[i][0] * q[1] - q[0] * p[i][1]; } return Math.abs(A) / 2; }
  function fur(gen, cx, cy, c, o) {
    o = o || {};
    var pts = gen(200), n = Math.min(900, Math.max(60, Math.ceil(perim(pts) / 1.7))), i, k, p, nx, ny, d, L, a;
    pts = gen(n);
    ctx.save(); ctx.lineCap = "round";
    if (o.shadow) { ctx.fillStyle = "rgba(60,30,120,.26)"; ctx.beginPath(); pts.forEach(function (q, j) { var x = q[0] + (q[0] - cx) * 0.012, y = q[1] + 3 + (q[1] - cy) * 0.05; j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.fill(); }
    // fuzzy fringe: two passes of little tufts around the edge
    for (k = 0; k < 2; k++) {
      ctx.strokeStyle = k ? c.m : c.d; ctx.lineWidth = k ? 1.1 : 1.6; ctx.beginPath();
      for (i = 0; i < n; i++) {
        p = pts[i]; nx = p[0] - cx; ny = p[1] - cy; d = Math.hypot(nx, ny) || 1; nx /= d; ny /= d;
        a = (frnd() - 0.5) * 0.9; var cs = Math.cos(a), sn = Math.sin(a), tx = nx * cs - ny * sn, ty = nx * sn + ny * cs; L = (k ? 0.9 : 1.4) + frnd() * (k ? 1.3 : 1.2);
        ctx.moveTo(p[0] - nx * 1.2, p[1] - ny * 1.2); ctx.lineTo(p[0] + tx * L, p[1] + ty * L);
      }
      ctx.stroke();
    }
    ctx.fillStyle = c.base; ctx.beginPath(); pts.forEach(function (q, j) { j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.clip();
    var minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9; pts.forEach(function (q) { minx = Math.min(minx, q[0]); maxx = Math.max(maxx, q[0]); miny = Math.min(miny, q[1]); maxy = Math.max(maxy, q[1]); });
    var cnt = Math.min(26000, Math.ceil(area(pts) / (o.dens || 0.9))), cols = [c.d, c.m, c.l, c.l, c.m, c.hi || c.l], paths = cols.map(function () { return []; }), j;
    for (i = 0; i < cnt; i++) {
      var x = minx + frnd() * (maxx - minx), y = miny + frnd() * (maxy - miny), an = 1.57 + (frnd() - 0.5) * 2.4 + (frnd() < 0.25 ? 3.14 : 0), ln = 0.8 + frnd() * 1.3, ci = Math.floor(frnd() * 6);
      paths[ci].push(x, y, x + Math.cos(an) * ln, y + Math.sin(an) * ln * 0.8);
    }
    for (j = 0; j < 6; j++) { ctx.strokeStyle = cols[j]; ctx.lineWidth = j === 0 ? 0.7 : 0.6; ctx.beginPath(); for (i = 0; i < paths[j].length; i += 4) { ctx.moveTo(paths[j][i], paths[j][i + 1]); ctx.lineTo(paths[j][i + 2], paths[j][i + 3]); } ctx.stroke(); }
    // soft depth: darker rim, lighter middle
    var g = ctx.createRadialGradient(cx, cy - (maxy - miny) * 0.15, 2, cx, cy, Math.max(maxx - minx, (maxy - miny) * 2) * 0.55);
    g.addColorStop(0, "rgba(255,255,255,.16)"); g.addColorStop(0.7, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(50,20,110,.16)");
    ctx.fillStyle = g; ctx.fillRect(minx, miny, maxx - minx, maxy - miny);
    ctx.restore(); ctx.restore();
  }
  var FUR_PURPLE = { base: "#9565e0", d: "#7447c4", m: "#8758d6", l: "#b08af2", hi: "#cbb0ff" };
  var FUR_LILAC = { base: "#c0a0f6", d: "#9c7ae0", m: "#b08eee", l: "#dccbff", hi: "#eee4ff" };
  var FUR_WHITE = { base: "#faf7ff", d: "#ddd2f3", m: "#efe9fb", l: "#ffffff", hi: "#ffffff" };
  function renderDecor() {
    var i, k, g, x, y;
    // lounge rug (white shag with a lilac ring)
    furSeed = 21; fur(ellPts(196, 330, 118, 28), 196, 330, FUR_WHITE, { shadow: true });
    fur(ellPts(196, 330, 84, 18.5), 196, 330, FUR_LILAC);
    fur(ellPts(196, 330, 58, 11.5), 196, 330, FUR_WHITE);
    fur(starPts(196, 330, 13), 196, 330, FUR_PURPLE, { dens: 0.7 });
    // runway
    var rx = 104, ry = 243, rw = 420, rh = 19;
    furSeed = 31; fur(sqPts(rx + rw / 2, ry + rh / 2, rw / 2, rh / 2, 3.2), rx + rw / 2, ry + rh / 2, FUR_PURPLE, { shadow: true });
    fur(sqPts(rx + rw / 2, ry + rh / 2, rw / 2 - 5, rh / 2 - 4, 3.2), rx + rw / 2, ry + rh / 2, FUR_LILAC);
    for (x = rx + 34; x < rx + rw - 20; x += 46) drawStar(x, ry + rh / 2, 3.1, "#fff4c4");
    // heart rug on the stage corner (purple shag, white heart inside)
    furSeed = 41; fur(heartPts(385, 343, 58, 26), 385, 343, FUR_PURPLE, { shadow: true });
    fur(heartPts(385, 342, 40, 18), 385, 342, FUR_WHITE);
    drawStar(385, 342, 9, "#f6d365"); drawStar(385, 342, 4.6, "#fff7d0");
    // gold records + poster
    goldRecord(505, 46, 13, "#f6d365", "#d9a62e"); goldRecord(545, 46, 13, "#e8ecf8", "#aeb7d6");
    posterArt(516, 92, 34, 46);
    // wig on a stand
    var wx = 533, wb = 205;
    ell(wx, wb + 1, 11, 3, "rgba(40,20,80,.28)"); line(wx, wb, wx, 164, "#d8c07a", 2); ell(wx, wb - 1, 8, 2.4, "#e0b040");
    ell(wx, 152, 8, 10, "#f4dcc8");
    ctx.fillStyle = "#f2d27a"; ctx.beginPath(); ctx.moveTo(wx - 10.5, 150); ctx.bezierCurveTo(wx - 12, 136, wx + 12, 136, wx + 10.5, 150); ctx.bezierCurveTo(wx + 14, 164, wx + 8, 177, wx + 7, 178); ctx.lineTo(wx - 7, 178); ctx.bezierCurveTo(wx - 8, 177, wx - 14, 164, wx - 10.5, 150); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(wx - 6, 142); ctx.quadraticCurveTo(wx - 11, 158, wx - 7.5, 172); ctx.stroke();
    ctx.strokeStyle = "#d9b24f"; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(wx + 6, 142); ctx.quadraticCurveTo(wx + 11, 158, wx + 7.5, 172); ctx.stroke();
    ell(wx, 148.5, 8.5, 5.4, "#f2d27a"); poly([wx - 8, 147, wx, 143, wx + 8, 147, wx + 5, 151, wx - 5, 151], "#f7de8e");
    ell(wx - 3.2, 153, 3, 2.1, "#ff7fb7"); ell(wx + 3.2, 153, 3, 2.1, "#ff7fb7"); ell(wx - 3.2, 153, 2.1, 1.3, "#ffd3e8"); ell(wx + 3.2, 153, 2.1, 1.3, "#ffd3e8"); line(wx - 0.4, 153, wx + 0.4, 153, "#ff7fb7", 0.7);
    // makeup vanity
    var vx = 600, vb = 205;
    ell(vx, vb + 2, 37, 5, "rgba(40,20,80,.28)");
    line(vx - 28, 190, vx - 30, vb, "#e0b040", 1.8); line(vx + 28, 190, vx + 30, vb, "#e0b040", 1.8);
    rrect(vx - 30, 187, 60, 7, 2.5, "#f2c7de"); rrect(vx - 32, 181, 64, 6.5, 3, "#fff4fa"); R(vx - 31, 186, 62, 1.2, "#f6d672");
    [["#ff3f7f", -25], ["#c4559f", -20], ["#ff8a4d", -15]].forEach(function (l) { rrect(vx + l[1], 170, 4, 11, 1, "#f6d672"); rrect(vx + l[1] + 0.4, 164.5, 3.2, 6, 1.2, l[0]); });
    rrect(vx - 8, 175.5, 15, 5.5, 2.2, "#f6d672"); ell(vx - 4, 178, 2.4, 1.6, "#ff9fcf"); ell(vx + 1, 178, 2.4, 1.6, "#8fd0ff"); ell(vx + 5.5, 178, 2.1, 1.6, "#c3b0ff");
    rrect(vx + 11, 171, 7, 10, 2.5, "#ffd0e6"); for (k = 0; k < 4; k++) line(vx + 12 + k * 1.5, 171, vx + 11 + k * 2, 164 + (k % 2) * 2, k % 2 ? "#c4559f" : "#8a5a3c", 1);
    rrect(vx + 21, 169.5, 6.5, 11.5, 2.4, "#bfe6ff"); rrect(vx + 22.5, 165.5, 3.5, 4.5, 1, "#f6d672"); ell(vx + 23.7, 175, 1.2, 2, "rgba(255,255,255,.7)");
    rrect(vx + 28, 174, 4, 7, 1.5, "#e2926a"); line(vx + 30, 174, vx + 30, 168, "#3fae73", 2.4); ell(vx + 30, 167.5, 1, 1, "#ff8fc0");
    // jewelry cabinet
    var jx = 684, jb = 205, x0 = jx - 21, y0 = jb - 62;
    ell(jx, jb + 1, 25, 4, "rgba(40,20,80,.28)");
    rpath(x0, y0, 42, 62, 3); ctx.fillStyle = "#f6d672"; ctx.fill();
    rpath(x0 + 3, y0 + 3, 36, 52, 2); g = ctx.createLinearGradient(0, y0, 0, y0 + 55); g.addColorStop(0, "#2d2564"); g.addColorStop(1, "#47388a"); ctx.fillStyle = g; ctx.fill();
    R(x0 + 3, y0 + 21, 36, 1.8, "#f6d672"); R(x0 + 3, y0 + 38, 36, 1.8, "#f6d672"); R(x0 + 4, y0 + 57, 5, 5, "#e0b040"); R(x0 + 33, y0 + 57, 5, 5, "#e0b040");
    poly([jx - 15, y0 + 21, jx - 11.5, y0 + 13, jx - 6.5, y0 + 13, jx - 3, y0 + 21], "#e66fa3"); ell(jx - 9, y0 + 11, 2.8, 3.2, "#f4dcc8");
    for (k = 0; k < 7; k++) ell(jx - 14 + k * 1.9, y0 + 16.2 + Math.sin(k / 6 * Math.PI) * 2.6, 0.9, 0.9, "#fffaf0");
    poly([jx + 4, y0 + 20, jx + 3, y0 + 14, jx + 6, y0 + 16, jx + 9, y0 + 12, jx + 12, y0 + 16, jx + 15, y0 + 14, jx + 14, y0 + 20], "#f2c94c"); ell(jx + 9, y0 + 16.5, 0.9, 0.9, "#ff7fb7");
    for (k = 0; k < 3; k++) { ctx.strokeStyle = "#f2c94c"; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(jx - 14 + k * 6.2, y0 + 31, 2.7, 0, 6.3); ctx.stroke(); }
    rrect(jx + 6, y0 + 30, 11, 7, 1.5, "#ff7fb7"); ell(jx + 11.5, y0 + 29.5, 2, 2, "#cfeaff");
    for (k = 0; k < 3; k++) { ell(jx - 12 + k * 7.5, y0 + 50, 3.6, 1.2, "#e0b040"); ell(jx - 12 + k * 7.5, y0 + 48.5, 3.6, 1.2, "#f2c94c"); ell(jx - 12 + k * 7.5, y0 + 47, 3.6, 1.2, "#fff3c4"); }
    heart(jx + 13, y0 + 49, 3.2, "#ff7fb7");
    ctx.fillStyle = "rgba(255,255,255,.1)"; ctx.beginPath(); ctx.moveTo(x0 + 4, y0 + 4); ctx.lineTo(x0 + 18, y0 + 4); ctx.lineTo(x0 + 8, y0 + 54); ctx.lineTo(x0 + 4, y0 + 54); ctx.fill();
  }

  /* ---- sofas ---- */
  function rrect(x, y, w, h, r, c) {
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.fill();
  }
  function drawSofaShape(w, h, pil) {
    ctx.save(); ctx.scale(w / 84, h / 42);
    [[-35, -8, -40, 0], [35, -8, 40, 0], [-27, -10, -29, -3], [27, -10, 29, -3]].forEach(function (l) { line(l[0], l[1], l[2], l[3], "#e0b040", 1.9); });
    line(-38, -7, 38, -7, "#f6d672", 1.7);
    ell(0, -24, 43, 19, "#9a7cc4"); ell(0, -23, 37.5, 14.5, "#b69ad8");
    rrect(-42, -19.5, 84, 13, 6, "#c6acea"); rrect(-42, -10, 84, 3, 1.5, "rgba(70,40,120,.18)");
    rrect(-35, -27.5, 70, 10, 5, "#c4559f"); rrect(-31, -26.6, 62, 2.6, 1.3, "rgba(255,255,255,.38)"); rrect(-35, -20.2, 70, 2.2, 1.1, "rgba(90,10,70,.3)");
    if (pil) { ctx.save(); ctx.translate(-23, -31); ctx.rotate(-0.18); heart(0, 1, 7.2, "#ff8fc0"); heart(0, 0, 5.4, "#ffb3d6"); sparkle(-1.6, -2, 1.6, "#fff"); ctx.restore(); ctx.save(); ctx.translate(24, -31.5); ctx.rotate(0.2); drawStar(0, 0, 8, "#e8b73f"); drawStar(0, 0.4, 6, "#f6d365"); ctx.restore(); }
    ell(-42.5, -17, 7.5, 12.5, "#b99fd9"); ell(42.5, -17, 7.5, 12.5, "#b99fd9"); ell(-44, -25, 4.5, 2.6, "rgba(255,255,255,.3)"); ell(44, -25, 4.5, 2.6, "rgba(255,255,255,.3)");
    ctx.restore();
  }
  var SOFAS = [{ x: 150, y: 308, w: 98, h: 43, pil: true }, { x: 246, y: 314, w: 50, h: 40 }, { x: 468, y: 322, w: 50, h: 40 }];
  function bakeSofas() {
    SOFAS.forEach(function (sf) {
      var pw = sf.w + 24, ph = sf.h + 24, t = mkCanvas(pw * K, ph * K), f = mkCanvas(pw * K, ph * K), tc = t.getContext("2d"), fc = f.getContext("2d"), main = ctx;
      ctx = tc; ctx.setTransform(K, 0, 0, K, pw / 2 * K, (ph - 8) * K); drawSofaShape(sf.w, sf.h, sf.pil);
      var s2 = mkCanvas(pw * K, ph * K), sx = s2.getContext("2d"); sx.drawImage(t, 0, 0); sx.globalCompositeOperation = "source-in"; sx.fillStyle = OUTLINE; sx.fillRect(0, 0, s2.width, s2.height);
      for (var k = 0; k < 8; k++) { var an = k * Math.PI / 4; fc.drawImage(s2, Math.cos(an) * 1.05 * K, Math.sin(an) * 1.05 * K); }
      fc.drawImage(t, 0, 0); ctx = main; sf.img = f; sf.pw = pw; sf.ph = ph;
    });
  }
  function drawSofa(sf) { ell(sf.x, sf.y + 1, sf.w * 0.56, 5, "rgba(40,20,80,.26)"); ctx.drawImage(sf.img, sf.x - sf.pw / 2, sf.y - (sf.ph - 8), sf.pw, sf.ph); }
  function solid(x, y, pad) {
    var i, b; pad = pad || 0;
    for (i = 0; i < SOFAS.length; i++) { b = SOFAS[i]; if (Math.abs(x - b.x) < b.w / 2 + 2 + pad && y > b.y - 9 - pad && y < b.y + 4 + pad) return true; }
    for (i = 0; i < PROPS.length; i++) { b = PROPS[i]; if (Math.abs(x - b.x) < b.hw + 2 + pad && y > b.y - 6 - pad && y < b.y + 4 + pad) return true; }
    if (Math.abs(x - KIT.x) < KIT.hw + 2 + pad && y > KIT.y - 24 - pad && y < KIT.y + 4 + pad) return true;
    for (i = 0; i < PLANTS.length; i++) { b = PLANTS[i]; if (b.hw && Math.abs(x - b.x) < b.hw + 2 + pad && y > b.y - 6 - pad && y < b.y + 4 + pad) return true; }
    return false;
  }
  function drawPhone(t) {
    var ringing = phone.ring > 0, x = PHONE.x, y = PHONE.y - 22.5;
    ctx.save(); ctx.translate(x + (ringing ? Math.sin(t * 55) * 0.8 : 0), y); ctx.rotate(ringing ? Math.sin(t * 42) * 0.07 : -0.1);
    rrect(-6.5, -5, 13, 8, 2.2, "#ff7fb7"); rrect(-6.5, -5, 13, 3.6, 2, "#ff9fcf");
    for (var k = 0; k < 6; k++) ell(-3.6 + (k % 3) * 3.6, -1 + Math.floor(k / 3) * 2.2, 0.55, 0.55, "#fff4fa");
    if (ringing) {
      ctx.save(); ctx.translate(0, -5); ctx.rotate(-0.5); rrect(-6, -9.5, 12, 9.5, 2.2, "#ff7fb7"); rrect(-4.6, -8.3, 9.2, 6.6, 1.4, "#c8f1ff"); heart(0, -5, 1.8, "#ff5a9d"); ctx.restore();
    } else { rrect(-4.8, -4.4, 9.6, 2.8, 1.2, "#ffe6f3"); ell(0, -3, 0.9, 0.9, "#ff7fb7"); }
    sparkle(5, -5.5, 1.1, "#fff"); sparkle(-5, 2, 0.8, "#fff");
    ctx.restore();
    if (ringing) {
      for (var i = 0; i < 2; i++) { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 12 + i * 2); ctx.strokeStyle = "#ff7fb7"; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(x, y - 6, 10 + i * 4.5, -2.3, -0.85); ctx.stroke(); }
      ctx.globalAlpha = 1;
    } else if (phone.unread) { ell(x + 6, y - 9, 3.2, 3.2, "#ff3f7f"); heart(x + 6, y - 9.3, 1.4, "#fff"); }
  }
  function nearCat() { return Math.hypot(player.x - cat_.x, (player.y - cat_.y) * 1.5) < 42; }
  var PHONE = { x: 300, y: 324 }, STAND = { x: 406, y: 336 };
  var PMSGS = ["Soundcheck at five! ♡", "12 new fan notes ★", "Wear the sparkle one!", "Cat says: mrrp. (feed me)", "Your encore awaits ♡", "Don't forget your guitar pick!"];
  function nearPhone() { return Math.hypot(player.x - PHONE.x, (player.y - PHONE.y) * 1.4) < 40; }
  function nearStand() { return !guitar && Math.hypot(player.x - STAND.x, (player.y - STAND.y) * 1.4) < 46; }
  function nearInfo() {
    var r = -1, best = 54;
    RACKS.forEach(function (rk, i) { var d = Math.hypot(player.x - rk.x, (player.y - 214) * 1.4); if (d < best) { best = d; r = i; } });
    var free = r < 0, mk = free && Math.hypot(player.x - 600, (player.y - 214) * 1.4) < 54;
    var jw = free && !mk && Math.hypot(player.x - 684, (player.y - 214) * 1.4) < 54, rest = free && !mk && !jw;
    var c = rest && nearCat(), g = rest && !c && nearStand(), dr = rest && !c && !g && nearKit(), ph = rest && !c && !g && !dr && nearPhone();
    return { rack: r, makeup: mk, jewel: jw, cat: c, guitar: g, drums: dr, phone: ph, mirror: rest && !c && !g && !dr && !ph && Math.abs(player.x - RUG.x) < 84 && player.y > 296 };
  }
  function nextInRack(r) { var rk = RACKS[r], i = rk.items.indexOf(worn); return rk.items[(i + 1) % rk.items.length]; }

  function draw() {
    var t = clock, i, tw;
    ctx.setTransform(K, 0, 0, K, 0, 0);
    ctx.drawImage(bg, 0, 0, W, H);
    STARS.forEach(function (s, k) { drawStar(s[0], s[1] + Math.sin(t * 1.2 + k) * 1.2, s[2] * (0.94 + 0.06 * Math.sin(t * 2 + k)), "#f6d365"); });
    drawLights(t); drawLogoSign(t); drawDisco(t); plantPothos(62, 14, t); plantPothos(392, 14, t + 2);
    // mirror reflection
    ctx.save(); ctx.beginPath(); ctx.rect(GLASS.x, GLASS.y, GLASS.w, GLASS.h); ctx.clip();
    if (mirA > 0.01) {
      var rx = 623 + Math.max(-12, Math.min(12, (player.x - RUG.x) * 0.2));
      ctx.globalAlpha = mirA;
      ell(rx, 137, 22, 5, "rgba(255,255,255,.28)");
      var dmSave = drumMode; drumMode = false; var skM = skel(); drumMode = dmSave;
      person(rx, 136, 0.82, skM, outfitNow(), hair, false);
      ctx.globalAlpha = 1;
    }
    var sx = GLASS.x - 30 + ((t * 16) % 150);
    ctx.fillStyle = "rgba(255,255,255,.16)"; ctx.beginPath(); ctx.moveTo(sx, GLASS.y); ctx.lineTo(sx + 12, GLASS.y); ctx.lineTo(sx - 28, GLASS.y + GLASS.h); ctx.lineTo(sx - 40, GLASS.y + GLASS.h); ctx.fill();
    ctx.restore();
    for (i = 0; i < 8; i++) { tw = (Math.sin(t * 3 + i) + 1) / 2; drawStar(MIR.x + 6 + i * 12.3, MIR.y + 7, 3.4 + tw * 0.8, "#fff"); drawStar(MIR.x + 6 + i * 12.3, MIR.y + MIR.h - 7, 3.4 + (1 - tw) * 0.8, "#fff"); }
    for (i = 0; i < 9; i++) { drawStar(MIR.x + 6, MIR.y + 20 + i * 12, 3.2, "#fff"); drawStar(MIR.x + MIR.w - 6, MIR.y + 20 + i * 12, 3.2, "#fff"); }
    RACKS.forEach(function (r) { r.items.forEach(function (idx, k) { icon(OUTFITS[idx], r.x + (k ? 14 : -14), 83, t); }); });
    var things = [];
    SOFAS.forEach(function (sf) { things.push({ y: sf.y, f: function () { drawSofa(sf); } }); });
    PROPS.forEach(function (p, pi) {
      things.push({ y: p.y, f: function () {
        ell(p.x, p.y + 1, p.hw * 1.5, 3.2, "rgba(40,20,80,.26)"); blit(p.sp, p.x, p.y);
        if (pi === 0) drawPhone(t);
        if (pi === 1 && !guitar) { ctx.save(); ctx.translate(p.x, p.y - 14); ctx.rotate(0.08); ctx.scale(0.62, 0.62); drawGuitarShape(); ctx.restore(); }
      } });
    });
    PLANTS.forEach(function (p) { things.push({ y: p.y, f: function () { drawPlant(p, t); } }); });
    things.push({ y: KIT.y, f: function () { drawKit(t); } });
    things.push({ y: cat_.y, f: function () { drawCat(cat_, t); } });
    if (!drumMode) things.push({ y: player.y, f: function () { person(player.x, player.y, 1, skel(), outfitNow(), hair); } });
    things.sort(function (a, b) { return a.y - b.y; });
    things.forEach(function (o) { o.f(); });
    drawAmbient(t);
    ctx.drawImage(vig, 0, 0, W, H);
    var np = nearInfo();
    if (drumMode) { if (label.t <= 0) bubble(KIT.x, KIT.y - 82, "Tap a drum or use the keys · Q leave"); }
    else if (guitar) { if (label.t <= 0) bubble(player.x, player.y - 118, "E strum · Space put down"); }
    else if (np.rack >= 0) bubble(RACKS[np.rack].x, 64, "E · " + OUTFITS[nextInRack(np.rack)].name);
    else if (np.makeup) bubble(600, 160, "E · " + MAKEUPS[(makeup + 1) % MAKEUPS.length].n);
    else if (np.jewel) bubble(684, 138, "E · " + JEWELS[(jewel + 1) % JEWELS.length].n);
    else if (np.cat && catLabel.t <= 0) bubble(cat_.x, cat_.y - 40, "E · pet");
    else if (np.guitar) bubble(STAND.x, STAND.y - 52, "E · play guitar");
    else if (np.drums) bubble(KIT.x, KIT.y - 66, "E · play drums");
    else if (np.phone) bubble(PHONE.x, PHONE.y - 36, phone.unread ? "E · read text" : "E · check phone");
    else if (np.mirror) bubble(RUG.x, 164, "E · new hair");
    if (phoneLabel.t > 0) { ctx.globalAlpha = Math.min(1, phoneLabel.t * 2); bubble(PHONE.x, PHONE.y - 36, phoneLabel.text); ctx.globalAlpha = 1; }
    else if (phone.unread && !np.phone) bubble(PHONE.x, PHONE.y - 36, "New text ♡");
    if (label.t > 0) { ctx.globalAlpha = Math.min(1, label.t * 2); bubble(drumMode ? KIT.x : player.x, drumMode ? KIT.y - 82 : player.y - 118, label.text); ctx.globalAlpha = 1; }
    if (catLabel.t > 0) { ctx.globalAlpha = Math.min(1, catLabel.t * 2); bubble(cat_.x, cat_.y - 40 - cat_.hop, catLabel.text); ctx.globalAlpha = 1; }
    parts.forEach(function (p) {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.l));
      if (p.h) heart(p.x, p.y, p.sz || 4, p.c); else if (p.note) note(p.x, p.y, p.c); else if (p.s) drawStar(p.x, p.y, p.s, p.c); else ctx.fillRect(p.x, p.y, 4, 4);
      ctx.fillStyle = p.c;
    });
    ctx.globalAlpha = 1;
    if (done) {
      var el = clock - doneAt, a = Math.min(1, el * 1.5) * (el < 4.5 ? 1 : Math.max(0, 1 - (el - 4.5)));
      if (a > 0) {
        ctx.globalAlpha = a; ctx.fillStyle = "rgba(36,28,70,.78)";
        ctx.beginPath(); (ctx.roundRect ? ctx.roundRect(150, 70, 420, 84, 18) : ctx.rect(150, 70, 420, 84)); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "600 26px 'Red Hat Display', Georgia, serif"; ctx.fillText("Wardrobe complete", W / 2 - 8, 108); heart(W / 2 + 112, 101, 6, "#ff9fcf");
        ctx.font = "600 12px 'Plus Jakarta Sans', system-ui, sans-serif"; ctx.fillStyle = "#f3d9ea"; ctx.fillText("All 10 looks tried. Now work the runway with Space.", W / 2, 132);
        ctx.globalAlpha = 1;
      }
    }
  }

  /* ---- logic ---- */
  function burst(x, y, n, colors, star) {
    for (var i = 0; i < n; i++) { var a = Math.random() * 6.283, v = 40 + Math.random() * 120; parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, l: 1, c: colors[i % colors.length], s: star && i % 2 ? 4 + Math.random() * 3 : 0 }); }
  }
  function hearts(x, y, n) {
    for (var i = 0; i < n; i++) parts.push({ x: x + (Math.random() - 0.5) * 16, y: y + Math.random() * 6, vx: (Math.random() - 0.5) * 34, vy: -34 - Math.random() * 34, l: 1.9, h: true, sz: 3 + Math.random() * 2.6, c: ["#ff7fb7", "#ff9fcf", "#f25c9a", "#ffc2de"][i % 4] });
  }
  function wear(i) {
    worn = i; tried[i] = true; say(OUTFITS[i].name); pulse("outfit");
    burst(player.x, player.y - 50, 20, ["#f6d365", "#fff", "#f4a6d0"], true);
    if (!done && triedCount() === OUTFITS.length) {
      done = true; doneAt = clock;
      for (var k = 0; k < 90; k++) parts.push({ x: Math.random() * W, y: -10 - Math.random() * 120, vx: (Math.random() - .5) * 40, vy: 40 + Math.random() * 80, l: 3, c: ["#f6d365", "#e98aa6", "#2a86c4", "#fff", "#b9a6ff"][k % 5], s: 0 });
    }
    syncUI();
  }
  function setHair(i) { hair = (i + HAIRS.length) % HAIRS.length; say(HAIRS[hair].n); pulse("hair"); burst(player.x, player.y - 82, 14, ["#fff", "#f6d365", "#bcd4ff"], true); syncUI(); }
  function setPose(i) {
    poseIdx = (i + POSES.length) % POSES.length; poseT0 = clock; kissFired = false; player.pet = 0; say(poseIdx ? POSES[poseIdx] : "Pose off"); if (poseIdx) pulse("pose");
    if (poseIdx === 2 || poseIdx === 4) burst(player.x + 14, player.y - 82, 8, ["#fff", "#f6d365"], true);
    if (poseIdx === 8) burst(player.x, player.y - 60, 24, ["#f6d365", "#ff9fcf", "#8fd0ff", "#fff"], true);
    syncUI();
  }
  var PURRS = ["Mrrp!", "Purrr…", "Meow ♡", "prrrrr", "Mrow!"];
  function petCat() {
    var c = cat_; c.pet = 2.1; c.wait = 2.6; c.tx = c.x; c.ty = c.y; c.walking = false; c.pets++; pulse("pets");
    c.face = player.x >= c.x ? 1 : -1; player.petDir = c.face; player.pet = 0.95;
    hearts(c.x + c.face * 8, c.y - 26, 4);
    catLabel.text = c.pets % 5 === 0 ? "Best friends ♡" : PURRS[c.pets % PURRS.length]; catLabel.t = 1.4;
    if (c.pets % 5 === 0) { c.hv = -150; hearts(c.x, c.y - 26, 12); }
    syncUI();
  }
  var CHORDN = ["C", "G", "Am", "F"], MEOWS = ["Meow!", "Mrow?", "Mew~", "Meeow!", "Mrrow ♡"];
  function playSfx(name, arg) { if (active && !muted && Music.supported) Music.sfx(name, arg); }
  function setMakeup(i) {
    makeup = (i + MAKEUPS.length) % MAKEUPS.length; say(MAKEUPS[makeup].n); pulse("makeup");
    burst(player.x, player.y - 76, 14, ["#ffb3d9", "#fff", "#f6d365", "#d9a6ff"], true); playSfx("sparkle"); syncUI();
  }
  function setJewel(i) {
    jewel = (i + JEWELS.length) % JEWELS.length; say(JEWELS[jewel].n); pulse("jewel");
    burst(player.x, player.y - 56, 14, ["#f6d365", "#fff", "#ffe9a8", "#bfe3ff"], true); playSfx("sparkle"); syncUI();
  }
  function pickGuitar() { guitar = true; poseIdx = 0; player.pet = 0; say("Guitar time ♪"); burst(STAND.x, STAND.y - 30, 10, ["#f6d365", "#fff", "#ff9fcf"], true); playSfx("sparkle"); syncUI(); }
  function dropGuitar() { guitar = false; strumT = 0; say("Guitar back on its stand"); syncUI(); }
  function startPhrase() {
    var c = Music.supported && Music.isOn() ? Music.chordNow() : -1;
    if (c < 0) c = singN % 4;
    singN++; singT = SING_LEN; singGap = 0.3; singNote = 0;
    playSfx("sing", c + 4 * (singN % 4));
  }
  function startSing() { singing = true; singGap = 0; singT = 0; if (!guitar && !drumMode && poseIdx !== 0) { poseIdx = 0; } say("Singing ♪ · V to stop"); burst(player.x + 6, player.y - 70, 8, ["#ff9fcf", "#f6d365", "#fff"], true); syncUI(); }
  function stopSing() { singing = false; singT = 0; say("Mic down"); syncUI(); }
  function toggleSing() { if (!active) return; if (singing) stopSing(); else startSing(); }
  function strum() {
    var c = Music.supported && Music.isOn() ? Music.chordNow() : -1;
    if (c < 0) { chordI = (chordI + 1) % 4; c = chordI; } else chordI = c;
    strumT = 0.5; playSfx("strum", c);
    for (var i = 0; i < 3; i++) parts.push({ x: player.x - 6 + i * 6, y: player.y - 70, vx: (Math.random() - 0.5) * 40, vy: -30 - Math.random() * 30, l: 1.7, note: true, c: ["#ff7fb7", "#f6d365", "#8fd0ff"][i] });
    say(CHORDN[c] + " ♪");
  }
  function checkPhone() {
    var m = PMSGS[phone.msg % PMSGS.length]; phone.msg++; phone.ring = 0; phone.unread = false; phone.next = clock + 20 + Math.random() * 15;
    phoneLabel.text = m; phoneLabel.t = 3; playSfx("chime"); hearts(PHONE.x, PHONE.y - 30, 5);
  }
  function doMeow() {
    var c = cat_; c.meowT = 0.6; catLabel.text = MEOWS[Math.floor(Math.random() * MEOWS.length)]; catLabel.t = 1.3; c.meowNext = clock + 8 + Math.random() * 10;
    playSfx("meow", Math.random());
  }
  function act() {
    if (!active) return;
    if (drumMode) { drumHit("crash"); return; }
    if (guitar) { strum(); return; }
    var np = nearInfo();
    if (np.rack >= 0) { wear(nextInRack(np.rack)); return; }
    if (np.makeup) { setMakeup(makeup + 1); return; }
    if (np.jewel) { setJewel(jewel + 1); return; }
    if (np.cat) { petCat(); return; }
    if (np.guitar) { pickGuitar(); return; }
    if (np.drums) { enterDrums(); return; }
    if (np.phone) { checkPhone(); return; }
    if (np.mirror) setHair(hair + 1);
  }
  function cyclePose(dir) { if (!active) return; if (drumMode) { drumHit("kick"); return; } if (guitar) { dropGuitar(); return; } setPose(poseIdx + (dir || 1)); }
  function step(dt) {
    clock += dt;
    var dx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0), dy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
    if (drumMode) { dx = 0; dy = 0; }
    for (var fk in KIT.fx) if (KIT.fx[fk] > 0) KIT.fx[fk] -= dt;
    drumArm.L.t -= dt; drumArm.R.t -= dt;
    player.moving = !!(dx || dy);
    player.wamp += ((player.moving ? 1 : 0) - player.wamp) * Math.min(1, dt * (player.moving ? 12 : 16));
    if (player.moving) player.hx += ((dx ? 1 : 0.15) - player.hx) * Math.min(1, dt * 10);
    if (player.wamp > 0.03) player.walk += dt * (0.25 + 0.75 * player.wamp);
    if (!player.moving && player.wamp <= 0.03) player.wamp = 0;
    if (player.moving) {
      var m = Math.hypot(dx, dy), nx = Math.max(MINX, Math.min(MAXX, player.x + dx / m * 132 * dt)), ny = Math.max(MINY, Math.min(MAXY, player.y + dy / m * 132 * dt));
      if (solid(nx, player.y)) nx = player.x;
      if (solid(nx, ny)) ny = player.y;
      player.x = nx; player.y = ny;
      if (dx) player.dir = dx; player.pet = 0;
      if (poseIdx > 1) { poseIdx = 0; syncUI(); }
    }
    if (player.pet > 0) player.pet -= dt;
    if (poseIdx === 6) {
      var uu = (clock - poseT0) % 2.2;
      if (uu > 1.2 && !kissFired) { kissFired = true; hearts(player.x + 26, player.y - 70, 5); }
      if (uu < 0.5) kissFired = false;
    }
    var mt = (!drumMode && Math.abs(player.x - RUG.x) < 84 && player.y > 296) ? 1 : 0;
    mirA += (mt - mirA) * Math.min(1, dt * 9); if (Math.abs(mt - mirA) < 0.02) mirA = mt;
    if (singing) {
      if (singT > 0) {
        singT -= dt; singNote -= dt;
        if (singNote <= 0) { singNote = 0.27; parts.push({ x: player.x + 7, y: player.y - (drumMode ? 56 : 68), vx: 8 + Math.random() * 26, vy: -26 - Math.random() * 26, l: 1.7, note: true, c: ["#ff7fb7", "#f6d365", "#8fd0ff", "#c3b0ff"][Math.floor(Math.random() * 4)] }); }
      } else { singGap -= dt; if (singGap <= 0) startPhrase(); }
    }
    if (label.t > 0) label.t -= dt;
    if (catLabel.t > 0) catLabel.t -= dt;
    if (strumT > 0) strumT -= dt;
    if (phoneLabel.t > 0) phoneLabel.t -= dt;
    if (!phone.unread && clock >= phone.next && phoneLabel.t <= 0) { phone.unread = true; phone.ring = 3; phone.rt = 0; playSfx("ring"); }
    if (phone.ring > 0) { phone.ring -= dt; phone.rt += dt; if (phone.rt >= 1.5 && phone.ring > 0.4) { phone.rt = 0; playSfx("ring"); } }
    var c = cat_; c.wait -= dt;
    if (c.meowT > 0) c.meowT -= dt;
    if (c.pet <= 0 && c.meowT <= 0 && clock >= c.meowNext) doMeow();
    if (c.pet > 0) c.pet -= dt;
    c.hv += 520 * dt; c.hop = Math.max(0, c.hop - c.hv * dt); if (c.hop === 0 && c.hv > 0) c.hv = 0;
    var dxc = c.tx - c.x, dyc = c.ty - c.y, dc = Math.hypot(dxc, dyc);
    if (c.pet <= 0 && dc > 2) { c.x += dxc / dc * 38 * dt; c.y += dyc / dc * 38 * dt; c.face = dxc >= 0 ? 1 : -1; c.walking = true; }
    else {
      c.walking = false;
      if (c.pet <= 0 && nearCat()) c.face = player.x >= c.x ? 1 : -1;
      if (c.pet <= 0 && c.wait <= 0) {
        for (var tries = 0; tries < 10; tries++) {
          if (Math.random() < 0.35) { c.tx = Math.max(40, Math.min(680, player.x + (Math.random() - 0.5) * 80)); c.ty = Math.max(300, Math.min(388, player.y + 16 + Math.random() * 12)); }
          else { c.tx = 50 + Math.random() * 620; c.ty = 300 + Math.random() * 88; }
          if (!solid(c.tx, c.ty, 10)) break;
        }
        c.wait = 1.5 + Math.random() * 3;
      }
    }
    for (var i = parts.length - 1; i >= 0; i--) { var p = parts[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.h || p.note ? -14 : 160) * dt; p.l -= dt * (p.l > 1.2 ? 0.35 : (p.h || p.note ? 0.55 : 1.1)); if (p.l <= 0 || p.y > H + 10) parts.splice(i, 1); }
  }
  function loop(ts) {
    requestAnimationFrame(loop);
    if (!visible) { last = ts; return; }
    var dt = Math.min(0.05, (ts - (last || ts)) / 1000); last = ts;
    step(dt);
    draw();
  }

  /* ---- music: an original upbeat loop, synthesised live with Web Audio ---- */
  var Music = (function () {
    var AC = window.AudioContext || window.webkitAudioContext;
    var BPM = 124, STEP = 60 / BPM / 4, LOOK = 0.14, VOL = 0.75;
    var CH = [[60, 64, 67], [59, 62, 67], [57, 60, 64], [57, 60, 65]], ROOT = [36, 43, 45, 41];
    var BASSP = [[0, 0], [3, 0], [6, 12], [8, 0], [11, 0], [14, 7]];
    var MEL = [
      [[0, 79, 2], [3, 79, 1], [4, 81, 2], [6, 79, 2], [8, 76, 4]],
      [[0, 74, 2], [3, 74, 1], [4, 76, 2], [6, 74, 2], [8, 71, 4]],
      [[0, 72, 2], [3, 76, 1], [4, 81, 2], [6, 79, 2], [8, 76, 2], [10, 72, 2]],
      [[0, 77, 2], [3, 81, 1], [4, 84, 2], [6, 81, 2], [8, 79, 4], [12, 81, 2], [14, 79, 2]],
      [[0, 84, 2], [3, 83, 1], [4, 81, 2], [6, 79, 2], [8, 79, 4]],
      [[0, 79, 2], [3, 77, 1], [4, 76, 2], [6, 74, 2], [8, 74, 4]],
      [[0, 76, 2], [3, 79, 1], [4, 81, 2], [6, 84, 2], [8, 81, 4]],
      [[0, 81, 2], [3, 79, 1], [4, 77, 2], [6, 76, 2], [8, 77, 2], [10, 79, 2], [12, 81, 4]]
    ];
    function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
    var noiseBuf = null;
    function noise(a) {
      if (noiseBuf && noiseBuf.sampleRate === a.sampleRate) return noiseBuf;
      var b = a.createBuffer(1, a.sampleRate, a.sampleRate), d = b.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return (noiseBuf = b);
    }
    function tone(a, out, type, f, t, dur, g, o) {
      o = o || {};
      var os = a.createOscillator(), ga = a.createGain(), node = os;
      os.type = type; os.frequency.setValueAtTime(f, t);
      if (o.slide) os.frequency.exponentialRampToValueAtTime(o.slide, t + dur * 0.5);
      if (o.vib) { var lf = a.createOscillator(), lg = a.createGain(); lf.frequency.value = 5.5; lg.gain.value = f * 0.006; lf.connect(lg); lg.connect(os.frequency); lf.start(t + 0.12); lf.stop(t + dur + 0.1); }
      if (o.lp) { var fl = a.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = o.lp; os.connect(fl); node = fl; }
      node.connect(ga); ga.connect(out);
      var atk = o.atk || 0.008;
      ga.gain.setValueAtTime(0.0001, t); ga.gain.linearRampToValueAtTime(g, t + atk); ga.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      os.start(t); os.stop(t + dur + 0.05);
    }
    function hit(a, out, t, dur, g, type, freq) {
      var s = a.createBufferSource(), fl = a.createBiquadFilter(), ga = a.createGain();
      s.buffer = noise(a); fl.type = type; fl.frequency.value = freq; fl.Q.value = type === "bandpass" ? 0.9 : 0.5;
      s.connect(fl); fl.connect(ga); ga.connect(out);
      ga.gain.setValueAtTime(g, t); ga.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
    }
    function sched(a, out, n, t) {
      var s = n % 16, bar = Math.floor(n / 16) % 8, ch = bar % 4, i, e;
      if (s % 4 === 0) tone(a, out, "sine", 150, t, 0.2, 0.95, { slide: 45 });
      if (s === 4 || s === 12 || (bar === 7 && s >= 13)) { hit(a, out, t, 0.13, 0.34, "bandpass", 1700); hit(a, out, t + 0.012, 0.05, 0.2, "bandpass", 3000); }
      if (s % 4 === 2) hit(a, out, t, 0.13, 0.13, "highpass", 7000);
      else if (s % 2 === 1) hit(a, out, t, 0.035, 0.06, "highpass", 8500);
      for (i = 0; i < BASSP.length; i++) if (BASSP[i][0] === s) tone(a, out, "sawtooth", mtof(ROOT[ch] + BASSP[i][1]), t, STEP * 1.7, 0.3, { lp: 520 });
      if (s === 0) CH[ch].forEach(function (m) { tone(a, out, "triangle", mtof(m), t, STEP * 15.5, 0.05, { lp: 1900, atk: 0.1 }); });
      if (s % 2 === 0) { var k = (s / 2) % 4; tone(a, out, "square", mtof(CH[ch][k % 3] + 12 + (k === 3 ? 12 : 0)), t, STEP * 1.8, 0.04, { lp: 3600 }); }
      var m = MEL[bar];
      for (i = 0; i < m.length; i++) { e = m[i]; if (e[0] === s) { tone(a, out, "triangle", mtof(e[1]), t, e[2] * STEP * 0.96, 0.13, { vib: e[2] > 2, atk: 0.012 }); tone(a, out, "sawtooth", mtof(e[1]), t, e[2] * STEP * 0.9, 0.035, { lp: 2600 }); } }
    }
    /* --- little sound effects: meow, guitar strum, phone, sparkle --- */
    var CHS = [[48, 52, 55, 60, 64], [43, 47, 50, 55, 59, 67], [45, 52, 57, 60, 64], [41, 48, 53, 57, 60, 65]];
    function pluck(a, out, m, t, g) {
      var f = mtof(m);
      tone(a, out, "sawtooth", f, t, 1.3, g, { lp: 2300, atk: 0.003 });
      tone(a, out, "triangle", f * 2, t, 0.55, g * 0.5, { atk: 0.002 });
      tone(a, out, "sine", f * 0.5, t, 0.8, g * 0.35, { atk: 0.004 });
    }
    /* sung voice: a buzzy source shaped by three vowel formants, with a slow vibrato */
    var SINGT = [[60, 64, 67, 72], [59, 62, 67, 71], [57, 60, 64, 69], [60, 65, 69, 72]], SINGP = [[0, 1, 2, 1], [1, 2, 1, 0], [2, 1, 3, 2], [0, 2, 1, 3]], SINGL = [0.3, 0.3, 0.3, 0.75];
    function vox(a, out, m, t, d) {
      var f = mtof(m), o = a.createOscillator(), o2 = a.createOscillator(), lf = a.createOscillator(), lg = a.createGain(), src = a.createGain(), env = a.createGain(), lp = a.createBiquadFilter(), i, fm = [[800, 7, 3.2], [1200, 9, 1.8], [2700, 10, 0.9]], end = t + d + 0.07;
      o.type = "sawtooth"; o2.type = "sawtooth"; o.frequency.value = f; o2.frequency.value = f; o2.detune.value = 8;
      lf.frequency.value = 5.3; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.011, t + Math.max(0.2, d * 0.8)); lf.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
      src.gain.value = 0.5; o.connect(src); o2.connect(src);
      lp.type = "lowpass"; lp.frequency.value = 5200; env.connect(lp); lp.connect(out);
      for (i = 0; i < 3; i++) {
        var bp = a.createBiquadFilter(), fg = a.createGain(); bp.type = "bandpass"; bp.Q.value = fm[i][1]; fg.gain.value = fm[i][2];
        bp.frequency.setValueAtTime(fm[i][0] * 0.5, t); bp.frequency.linearRampToValueAtTime(fm[i][0], t + 0.08);
        src.connect(bp); bp.connect(fg); fg.connect(env);
      }
      env.gain.setValueAtTime(0.0001, t); env.gain.linearRampToValueAtTime(0.34, t + 0.045); env.gain.setValueAtTime(0.3, Math.max(t + 0.06, end - 0.12)); env.gain.exponentialRampToValueAtTime(0.0001, end);
      o.start(t); o2.start(t); lf.start(t); o.stop(end + 0.02); o2.stop(end + 0.02); lf.stop(end + 0.02);
    }
    function sfxVoice(a, out, name, arg, t) {
      var i;
      if (name === "meow") {
        var p = 0.85 + (arg || 0) * 0.35, os = a.createOscillator(), o2 = a.createOscillator(), bp = a.createBiquadFilter(), ga = a.createGain(), lf = a.createOscillator(), lg = a.createGain();
        os.type = "sawtooth"; o2.type = "square";
        [os, o2].forEach(function (o, j) { var k = j ? 1.005 : 1; o.frequency.setValueAtTime(430 * p * k, t); o.frequency.linearRampToValueAtTime(760 * p * k, t + 0.13); o.frequency.exponentialRampToValueAtTime(430 * p * k, t + 0.52); });
        lf.frequency.value = 7; lg.gain.value = 12; lf.connect(lg); lg.connect(os.frequency);
        bp.type = "bandpass"; bp.Q.value = 3.2; bp.frequency.setValueAtTime(800, t); bp.frequency.linearRampToValueAtTime(1900, t + 0.16); bp.frequency.exponentialRampToValueAtTime(950, t + 0.52);
        var mix = a.createGain(); mix.gain.value = 0.6; os.connect(bp); o2.connect(mix); mix.connect(bp); bp.connect(ga); ga.connect(out);
        ga.gain.setValueAtTime(0.0001, t); ga.gain.linearRampToValueAtTime(0.5, t + 0.07); ga.gain.setValueAtTime(0.42, t + 0.3); ga.gain.exponentialRampToValueAtTime(0.0001, t + 0.56);
        os.start(t); o2.start(t); lf.start(t); os.stop(t + 0.6); o2.stop(t + 0.6); lf.stop(t + 0.6);
      } else if (name === "strum") {
        var ch = CHS[((arg | 0) % 4 + 4) % 4]; for (i = 0; i < ch.length; i++) pluck(a, out, ch[i], t + i * 0.028, 0.2);
      } else if (name === "sing") {
        var sc = (arg | 0) % 4, tones = SINGT[sc], pat = SINGP[Math.floor((arg | 0) / 4) % 4], tt = t;
        for (i = 0; i < pat.length; i++) { vox(a, out, tones[pat[i]], tt, SINGL[i]); tt += SINGL[i]; }
      } else if (name === "ring") {
        var arp = [84, 88, 91, 88, 84, 88, 91, 96]; for (i = 0; i < arp.length; i++) tone(a, out, "square", mtof(arp[i]), t + i * 0.075, 0.07, 0.1, { lp: 4200 });
      } else if (name === "chime") {
        tone(a, out, "sine", mtof(88), t, 0.5, 0.3); tone(a, out, "sine", mtof(95), t + 0.09, 0.8, 0.28); tone(a, out, "sine", mtof(100), t + 0.2, 0.9, 0.16);
      } else if (name === "kick") {
        tone(a, out, "sine", 160, t, 0.28, 1.0, { slide: 42 }); hit(a, out, t, 0.02, 0.35, "bandpass", 3000);
      } else if (name === "snare") {
        hit(a, out, t, 0.18, 0.55, "bandpass", 1900); hit(a, out, t, 0.09, 0.28, "highpass", 5200); tone(a, out, "triangle", 200, t, 0.11, 0.4, { slide: 150 });
      } else if (name === "hat") {
        hit(a, out, t, 0.055, 0.34, "highpass", 8200); hit(a, out, t, 0.04, 0.2, "bandpass", 11000);
      } else if (name === "tomA" || name === "tomB" || name === "ftom") {
        var f0 = name === "tomA" ? 230 : name === "tomB" ? 180 : 125; tone(a, out, "sine", f0, t, 0.34, 0.85, { slide: f0 * 0.58 }); hit(a, out, t, 0.03, 0.22, "bandpass", 2400);
      } else if (name === "crash") {
        hit(a, out, t, 1.1, 0.4, "highpass", 3600); hit(a, out, t, 0.7, 0.28, "bandpass", 6500); hit(a, out, t, 0.25, 0.3, "highpass", 9000);
      } else if (name === "sparkle") {
        for (i = 0; i < 6; i++) tone(a, out, "sine", mtof(88 + [0, 4, 7, 12, 7, 16][i]), t + i * 0.055, 0.35, 0.16);
      }
    }
    var a = null, master = null, sfxG = null, timer = 0, nextT = 0, n = 0, on = false, suspendT = 0;
    function init() {
      if (a || !AC) return !!a;
      a = new AC(); master = a.createGain(); master.gain.value = 0; sfxG = a.createGain(); sfxG.gain.value = 0.9;
      var cmp = a.createDynamicsCompressor(); cmp.threshold.value = -16; cmp.ratio.value = 4; master.connect(cmp); sfxG.connect(cmp); cmp.connect(a.destination);
      return true;
    }
    function sfx(name, arg) {
      if (!AC || !init()) return;
      if (a.state === "suspended") a.resume();
      sfxVoice(a, sfxG, name, arg, a.currentTime + 0.01);
    }
    function chordNow() {
      if (!a || !on) return -1;
      var cur = n - (nextT - a.currentTime) / STEP; return ((Math.floor(cur / 16) % 8) + 8) % 4;
    }
    function renderSfx(name, arg, seconds) {
      var OA = window.OfflineAudioContext || window.webkitOfflineAudioContext, oa = new OA(1, Math.round(44100 * seconds), 44100), g = oa.createGain();
      g.gain.value = 0.9; g.connect(oa.destination); sfxVoice(oa, g, name, arg, 0.01);
      return oa.startRendering().then(function (buf) { var d = buf.getChannelData(0), pk = 0; for (var j = 0; j < d.length; j++) { var v = Math.abs(d[j]); if (v > pk) pk = v; } return { peak: pk }; });
    }
    function tick() { while (nextT < a.currentTime + LOOK) { sched(a, master, n, nextT); nextT += STEP; n++; } }
    function start() {
      if (!AC || !init() || on) return;
      clearTimeout(suspendT); if (a.state === "suspended") a.resume();
      on = true; nextT = a.currentTime + 0.1;
      master.gain.cancelScheduledValues(a.currentTime); master.gain.setTargetAtTime(VOL, a.currentTime, 0.2);
      timer = setInterval(tick, 25);
    }
    function stop() {
      if (!on) return; on = false; clearInterval(timer);
      master.gain.cancelScheduledValues(a.currentTime); master.gain.setTargetAtTime(0, a.currentTime, 0.12);
      suspendT = setTimeout(function () { if (!on && a.state === "running") a.suspend(); }, 700);
    }
    function render(seconds) {
      var OA = window.OfflineAudioContext || window.webkitOfflineAudioContext, oa = new OA(2, Math.round(44100 * seconds), 44100), g = oa.createGain(), cmp = oa.createDynamicsCompressor();
      cmp.threshold.value = -16; cmp.ratio.value = 4; g.gain.value = VOL; g.connect(cmp); cmp.connect(oa.destination);
      for (var i = 0; i * STEP < seconds - 0.3; i++) sched(oa, g, i, i * STEP);
      return oa.startRendering().then(function (buf) {
        var d = buf.getChannelData(0), pk = 0, sum = 0; for (var j = 0; j < d.length; j++) { var v = Math.abs(d[j]); if (v > pk) pk = v; sum += d[j] * d[j]; }
        return { peak: pk, rms: Math.sqrt(sum / d.length), seconds: buf.duration };
      });
    }
    return { supported: !!AC, start: start, stop: stop, render: render, sfx: sfx, chordNow: chordNow, renderSfx: renderSfx, isOn: function () { return on; } };
  })();

  /* ---- input ---- */
  var KEYMAP = { w: "up", arrowup: "up", s: "down", arrowdown: "down", a: "left", arrowleft: "left", d: "right", arrowright: "right" };
  var muteBtn = root.querySelector(".du-mute"), muted = false, pageVisible = true;
  try { muted = localStorage.getItem("duMuted") === "1"; } catch (e) {}
  function syncMusic() {
    if (!Music.supported) return;
    if (active && visible && pageVisible && !muted) Music.start(); else Music.stop();
    if (muteBtn) { muteBtn.setAttribute("aria-pressed", muted ? "false" : "true"); muteBtn.textContent = muted ? "♪ Music off" : "♪ Music on"; muteBtn.classList.toggle("on", !muted); }
  }
  function toggleMute() { muted = !muted; try { localStorage.setItem("duMuted", muted ? "1" : "0"); } catch (e) {} syncMusic(); }
  if (muteBtn) { if (!Music.supported) muteBtn.hidden = true; muteBtn.addEventListener("click", function () { toggleMute(); refocus(); }); }
  document.addEventListener("visibilitychange", function () { pageVisible = !document.hidden; syncMusic(); });
  function setActive(on) { active = on; startBtn.hidden = on; if (!on) { keys = {}; leaveDrums(); singing = false; singT = 0; } syncMusic(); }
  function refocus() { canvas.focus({ preventScroll: true }); }
  canvas.addEventListener("keydown", function (e) {
    var k = e.key.toLowerCase();
    if (k === "escape") { canvas.blur(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (drumMode && k !== "m") {
      if (k === "v") { if (!e.repeat) toggleSing(); e.preventDefault(); return; }
      if (k === "q" || k === "g") { if (!e.repeat) leaveDrums(); e.preventDefault(); return; }
      var dn = (k === "w" || k === "arrowup") ? drumTomPick() : DKEY[k];
      if (dn) { if (!e.repeat) drumHit(dn); e.preventDefault(); }
      return;
    }
    if (KEYMAP[k]) { keys[KEYMAP[k]] = true; e.preventDefault(); }
    else if (k === "e" || k === "enter") { if (!e.repeat) act(); e.preventDefault(); }
    else if (k === " ") { if (!e.repeat) cyclePose(e.shiftKey ? -1 : 1); e.preventDefault(); }
    else if (k === "m") { if (!e.repeat) toggleMute(); e.preventDefault(); }
    else if (k === "v") { if (!e.repeat) toggleSing(); e.preventDefault(); }
    else if (k === "g") { if (!e.repeat) { if (guitar) dropGuitar(); else if (nearStand()) pickGuitar(); } e.preventDefault(); }
  });
  canvas.addEventListener("keyup", function (e) { var k = KEYMAP[e.key.toLowerCase()]; if (k) keys[k] = false; });
  canvas.addEventListener("blur", function (e) { if (e.relatedTarget && root.contains(e.relatedTarget)) return; setActive(false); });
  canvas.addEventListener("pointerdown", function (e) {
    if (!active) { setActive(true); refocus(); return; }
    if (drumMode) {
      var r = canvas.getBoundingClientRect(), dn = drumAt((e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H);
      if (dn) drumHit(dn); else leaveDrums();
      e.preventDefault();
    }
  });
  startBtn.addEventListener("click", function () { setActive(true); refocus(); });
  if (resetBtn) resetBtn.addEventListener("click", function () { reset(); refocus(); });
  chipEls.forEach(function (c, i) { c.addEventListener("click", function () { wear(i); refocus(); }); });
  function buildOpts(wrap, names, startAt, onPick, store) {
    if (!wrap) return;
    names.forEach(function (n, i) {
      if (i < startAt) return;
      var b = document.createElement("button"); b.type = "button"; b.className = "du-opt"; b.textContent = n || "Off";
      b.addEventListener("click", function () { onPick(i); refocus(); }); wrap.appendChild(b); store[i] = b;
    });
  }
  buildOpts(hairWrap, HAIRS.map(function (h) { return h.n; }), 0, setHair, hairOpts);
  buildOpts(poseWrap, POSES, 0, setPose, poseOpts);
  buildOpts(makeupWrap, MAKEUPS.map(function (m) { return m.n; }), 0, setMakeup, makeupOpts);
  buildOpts(jewelWrap, JEWELS.map(function (m) { return m.n; }), 0, setJewel, jewelOpts);

  root.querySelectorAll("[data-pad]").forEach(function (b) {
    var d = b.getAttribute("data-pad");
    function on(e) {
      e.preventDefault(); if (!active) setActive(true);
      if (drumMode && d === "sing") { toggleSing(); return; }
      if (drumMode) { drumHit({ left: "hat", up: drumTomPick(), down: "snare", right: "ftom", act: "crash", pose: "kick" }[d]); return; }
      if (d === "act") act(); else if (d === "pose") cyclePose(1); else if (d === "sing") toggleSing(); else keys[d] = true; }
    function off() { if (d !== "act" && d !== "pose" && d !== "sing") keys[d] = false; }
    b.addEventListener("pointerdown", on);
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) { b.addEventListener(ev, off); });
  });

  if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; syncMusic(); }, { threshold: 0.05 }).observe(canvas);
  else visible = true;

  (function () { var tot = { outfit: OUTFITS.length, hair: HAIRS.length, makeup: MAKEUPS.length - 1, jewel: JEWELS.length - 1, pose: POSES.length - 1 };
    root.querySelectorAll("[data-du-total]").forEach(function (el) { el.textContent = tot[el.getAttribute("data-du-total")]; }); })();
  initSprites(); bakeSofas(); bakeProps(); reset(); renderBG(); setActive(false); visible = false; last = 0;
  requestAnimationFrame(loop);
  root.__du = {
    state: function () { return { player: player, worn: worn, hair: hair, pose: poseIdx, tried: Object.keys(tried).length, done: done, active: active, pets: cat_.pets, cat: { x: cat_.x, y: cat_.y, pet: cat_.pet }, hairs: HAIRS.length, poses: POSES.length }; },
    teleport: function (x, y) { player.x = x; player.y = y; },
    music: Music,
    state2: function () { return { mirA: mirA, singing: singing, singT: singT, makeup: makeup, jewel: jewel, guitar: guitar, strumT: strumT, phone: phone, meowT: cat_.meowT, meowNext: cat_.meowNext, clock: clock, near: nearInfo() }; },
    forceMeow: function () { doMeow(); },
    teleportCat: function (x, y) { cat_.x = cat_.tx = x; cat_.y = cat_.ty = y; cat_.wait = 99; }
  };
})();
