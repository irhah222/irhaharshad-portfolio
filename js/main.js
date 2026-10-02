// Irhah Arshad Siddiqui — shared site behavior

(function () {
  "use strict";

  /* ---------- Theme (light/dark) ---------- */
  var THEME_KEY = "irhah-theme";
  function getStoredTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  function setStoredTheme(v) {
    try { localStorage.setItem(THEME_KEY, v); } catch (e) {}
  }
  function applyTheme(theme) {
    if (theme === "dark" || theme === "light") {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }
  function currentIsDark() {
    var attr = document.documentElement.getAttribute("data-theme");
    if (attr === "dark") return true;
    if (attr === "light") return false;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  (function initTheme() {
    var stored = getStoredTheme();
    applyTheme(stored);
  })();

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-theme-toggle]");
    if (!btn) return;
    var next = currentIsDark() ? "light" : "dark";
    applyTheme(next);
    setStoredTheme(next);
  });

  /* ---------- Mobile nav ---------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-hamburger]");
    if (!btn) return;
    var menu = document.querySelector(".mobile-menu");
    if (!menu) return;
    var open = menu.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  /* ---------- Scroll reveal ---------- */
  var revealTargets = document.querySelectorAll(
    ".reveal, .project-card, .stat-tile, .rf-stat, .rf-card"
  );
  if ("IntersectionObserver" in window && revealTargets.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = (i % 8) * 60;
            setTimeout(function () { el.classList.add("in"); }, delay);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Process arc diagram animation (case study "Process" diagrams) ---------- */
  document.querySelectorAll("[data-process-arc]").forEach(function (diagram) {
    var nodes = Array.prototype.slice.call(diagram.querySelectorAll(".pad-node"));
    var arcs = Array.prototype.slice.call(diagram.querySelectorAll(".pad-arc, .pad-line"));
    nodes.sort(function (a, b) { return (+a.dataset.step) - (+b.dataset.step); });
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var stepMs = reduced ? 0 : 300;
    function arcsAfter(step) {
      return arcs.filter(function (a) { return +a.dataset.arc === step; });
    }
    function revealArc(arc) {
      arc.classList.add("in");
      if (!reduced) {
        setTimeout(function () { arc.classList.add("flow"); }, 1100);
      }
    }
    function play() {
      var t = 0;
      nodes.forEach(function (node, i) {
        (function (node, delay) { setTimeout(function () { node.classList.add("in"); }, delay); })(node, t);
        arcsAfter(i + 1).forEach(function (arc) {
          (function (arc, delay) { setTimeout(function () { revealArc(arc); }, delay); })(arc, t + stepMs * 0.5);
        });
        t += stepMs * 1.7;
      });
    }
    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { play(); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.25 });
      obs.observe(diagram);
    } else {
      nodes.forEach(function (n) { n.classList.add("in"); });
      arcs.forEach(function (a) { a.classList.add("in"); if (!reduced) a.classList.add("flow"); });
    }
  });

  /* ---------- Category filter tabs (homepage) ---------- */
  document.addEventListener("click", function (e) {
    var tab = e.target.closest("[data-filter]");
    if (!tab) return;
    var filter = tab.getAttribute("data-filter");
    document.querySelectorAll("[data-filter]").forEach(function (t) {
      t.classList.toggle("active", t === tab);
    });
    document.querySelectorAll("[data-category]").forEach(function (card) {
      var cats = (card.getAttribute("data-category") || "").split(",");
      var show = filter === "all" || cats.indexOf(filter) !== -1;
      card.style.display = show ? "" : "none";
    });
  });

  /* ---------- Section rail (scrollspy + smooth scroll) ---------- */
  var rail = document.querySelector(".section-rail");
  if (rail) {
    var dots = Array.prototype.slice.call(rail.querySelectorAll(".dot"));
    var sections = dots
      .map(function (dot) {
        var id = dot.getAttribute("data-target");
        return id ? document.getElementById(id) : null;
      })
      .filter(Boolean);

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var id = dot.getAttribute("data-target");
        var target = id && document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    if ("IntersectionObserver" in window && sections.length) {
      var spy = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var id = entry.target.id;
              dots.forEach(function (dot) {
                dot.classList.toggle("active", dot.getAttribute("data-target") === id);
              });
            }
          });
        },
        { threshold: 0.5 }
      );
      sections.forEach(function (s) { spy.observe(s); });
    }
  }

  /* ---------- Hero text reveal ---------- */
  (function heroChroma() {
    var heroText = document.getElementById("heroText");
    if (!heroText) return;

    var text = heroText.textContent;
    // Only the substring named in data-name-bold (e.g. the person's name)
    // should render bold; everything else in this line stays regular
    // weight. Recorded as inline styles on the per-char spans below since
    // play() resets each span's className on every (re)play.
    var boldTarget = heroText.getAttribute("data-name-bold") || "";
    var boldStart = boldTarget ? text.indexOf(boldTarget) : -1;
    var boldEnd = boldStart > -1 ? boldStart + boldTarget.length : -1;
    heroText.textContent = "";
    heroText.classList.add("chroma-text");
    var chars = text.split("");
    var spans = [];
    // Each letter is its own inline-block span (for the per-char blur
    // reveal), which would otherwise let the browser break a line between
    // any two letters, not just at spaces. Grouping each run of non-space
    // characters into a nowrap "word" wrapper keeps wraps at real word
    // boundaries while the individual letters still animate independently.
    var wordWrap = null;
    chars.forEach(function (ch, i) {
      var span = document.createElement("span");
      span.className = "char";
      span.textContent = ch;
      span.dataset.isSpace = ch === " " ? "1" : "0";
      if (boldStart > -1 && i >= boldStart && i < boldEnd) {
        span.style.fontWeight = "700";
      }
      if (ch === " ") {
        wordWrap = null;
        heroText.appendChild(span);
      } else {
        if (!wordWrap) {
          wordWrap = document.createElement("span");
          wordWrap.className = "word";
          heroText.appendChild(wordWrap);
        }
        wordWrap.appendChild(span);
      }
      spans.push(span);
    });

    function play() {
      // Cap the total stagger so longer headlines don't take proportionally
      // longer to finish revealing; short text keeps the original 50ms feel.
      var stepMs = Math.min(50, 900 / spans.length);
      spans.forEach(function (span, i) {
        span.className = "char";
        void span.offsetWidth;
        span.style.animationDelay = (i * stepMs / 1000) + "s";
        span.classList.add("animate");
      });
      clearTimeout(play._t);
      play._t = setTimeout(function () {
        spans.forEach(function (span) {
          span.classList.remove("animate");
          span.classList.add("settled");
        });
      }, spans.length * stepMs + 1350);
    }

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      spans.forEach(function (span) { span.classList.add("settled"); });
    } else {
      setTimeout(play, 150);
    }
  })();

  /* ---------- Image zoom / lightbox (sitewide) ----------
     Any content image (inside <main>, not part of a link) becomes
     click/keyboard-zoomable into a full-screen overlay. Nav logos and
     linked thumbnails (project cards, "next project") are left alone
     so their click still navigates. */
  (function initLightbox() {
    var candidates = Array.prototype.slice.call(document.querySelectorAll("main img"));
    var images = candidates.filter(function (img) { return !img.closest("a"); });
    if (!images.length) return;

    images.forEach(function (img) {
      img.classList.add("zoomable");
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      var alt = img.getAttribute("alt");
      img.setAttribute("aria-label", alt ? "Zoom in: " + alt : "Zoom in on image");
    });

    var overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Zoomed image");
    overlay.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="Close zoomed image">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      "</button>" +
      '<img class="lightbox-img" alt="">';
    document.body.appendChild(overlay);
    var lightboxImg = overlay.querySelector(".lightbox-img");
    var closeBtn = overlay.querySelector(".lightbox-close");
    var lastFocused = null;

    function openLightbox(img) {
      lastFocused = document.activeElement;
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.getAttribute("alt") || "";
      overlay.classList.add("open");
      document.documentElement.classList.add("lightbox-locked");
      closeBtn.focus();
    }
    function closeLightbox() {
      if (!overlay.classList.contains("open")) return;
      overlay.classList.remove("open");
      document.documentElement.classList.remove("lightbox-locked");
      lightboxImg.src = "";
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }

    images.forEach(function (img) {
      img.addEventListener("click", function () { openLightbox(img); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(img);
        }
      });
    });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || e.target === lightboxImg) closeLightbox();
    });
    closeBtn.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
    });
  })();

  /* ---------- Marbled-wave gradient (shared) ----------
     Ported from the hero redesign lab (Claude artifact preview). Draws a
     soft, colour-shifting marbled-wave field: hard-edged shapes on the
     canvas, with all the softness coming from a CSS blur on the element's
     wrapper, not a pre-blurred gradient. Colors/pattern/motion are fixed
     to what was approved in the lab: cream/peach/blush, "marbled waves",
     "wave" motion, speed 1.4x, movement 2.5x. Used both for the small
     blurred orb in the hero (#heroGlow) and, full-viewport, as the
     Playground page's moving background (#pageGradient) -- same palette
     and motion in both places, just a different canvas size/wrapper. */
  function initMarbledGradient(canvasId) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var reduceMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W, H;
    function size() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    size();
    var resizeRaf = null;
    window.addEventListener("resize", function () {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(size);
    });

    function hexToHsl(hex) {
      var r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h, s, l = (max + min) / 2;
      if (max === min) { h = 0; s = 0; }
      else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h *= 60;
      }
      return { h: h, s: s * 100, l: l * 100 };
    }

    var hslB = hexToHsl("#f4e7d2"); // cream
    var hslS = hexToHsl("#f3b393"); // peach
    var hslA = hexToHsl("#ecc4d8"); // blush
    var SLOTS = {
      white: { h: hslB.h, s: Math.min(hslB.s, 30), l: Math.max(hslB.l, 90) },
      second: { h: hslS.h, s: hslS.s, l: hslS.l },
      accent: { h: hslA.h, s: hslA.s, l: hslA.l },
      accentSoft: { h: hslA.h, s: Math.max(hslA.s - 15, 0), l: Math.min(hslA.l + 8, 95) }
    };
    var WAVE_BAND_DEFS = [
      { colorSlot: "white", angle: -0.30, offX: 0.10, offY: -0.18, thick: 0.62, waveAmp: 0.16, alpha: 0.85 },
      { colorSlot: "accent", angle: -0.42, offX: -0.20, offY: 0.08, thick: 0.50, waveAmp: 0.30, alpha: 0.92, boost: true },
      { colorSlot: "second", angle: -0.18, offX: 0.22, offY: -0.02, thick: 0.46, waveAmp: 0.18, alpha: 0.85 },
      { colorSlot: "accentSoft", angle: 0.12, offX: 0.05, offY: 0.34, thick: 0.55, waveAmp: 0.14, alpha: 0.7 }
    ];
    var waveBands = WAVE_BAND_DEFS.map(function (b, i) {
      var c = SLOTS[b.colorSlot];
      var hue = c.h, sat = c.s, light = c.l;
      if (b.boost) { sat = Math.min(sat + 30, 95); light = Math.max(light - 22, 32); }
      return {
        offX: b.offX, offY: b.offY, thick: b.thick, alpha: b.alpha,
        hue: hue, sat: sat, light: light,
        waveAmp: b.waveAmp,
        waveFreq: 1.1 + Math.random() * 0.6,
        wavePhase: i * 1.9 + Math.random() * 0.5,
        angle: b.angle,
        thickAmp: 0.05 + Math.random() * 0.05,
        thickFreq: 0.03 + Math.random() * 0.03,
        thickPhase: Math.random() * Math.PI * 2,
        hueAmp: 6 + Math.random() * 8,
        hueFreq: (2 * Math.PI) / (24 + Math.random() * 16),
        huePhase: Math.random() * Math.PI * 2
      };
    });

    var SPARKLES = [
      { bx: 0.18, by: 0.58, phase: 0.4, freq: 0.09 },
      { bx: 0.80, by: 0.86, phase: 2.8, freq: 0.07 }
    ];

    var WAVE_FREQ = 0.5;
    // speed = how fast time passes for the animation; movement = amplitude
    // of everything time drives. Fixed to the values approved in the lab;
    // reduced-motion freezes both at 0, same as the rest of the site.
    var speedMult = reduceMotion ? 0 : 1.4;
    var moveMult = reduceMotion ? 0 : 2.5;

    function drawWaveBand(b, t) {
      var m = Math.max(W, H);
      var reach = m * 0.85;
      var cx = (0.5 + b.offX) * W, cy = (0.5 + b.offY) * H;
      // "wave" motion: all bands ride one shared traveling ripple rather
      // than drifting independently.
      var waveT = t * WAVE_FREQ * 0.7;

      var thick = (b.thick + b.thickAmp * moveMult * Math.sin(t * b.thickFreq + b.thickPhase)) * m;
      var hue = b.hue + b.hueAmp * moveMult * Math.sin(t * b.hueFreq + b.huePhase);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(b.angle);
      var steps = 20;
      var top = [], bot = [];
      for (var i = 0; i <= steps; i++) {
        var lx = -reach + (2 * reach) * (i / steps);
        var centerY = b.waveAmp * moveMult * m * Math.sin(lx * 0.006 * b.waveFreq + b.wavePhase + waveT);
        top.push([lx, centerY - thick / 2]);
        bot.push([lx, centerY + thick / 2]);
      }
      ctx.beginPath();
      ctx.moveTo(top[0][0], top[0][1]);
      for (i = 1; i < top.length; i++) { ctx.lineTo(top[i][0], top[i][1]); }
      for (i = bot.length - 1; i >= 0; i--) { ctx.lineTo(bot[i][0], bot[i][1]); }
      ctx.closePath();
      ctx.fillStyle = "hsla(" + hue + "," + b.sat + "%," + b.light + "%," + b.alpha + ")";
      ctx.fill();
      ctx.restore();
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      // soft cream wash first so there's no gap between bands
      var w0 = waveBands[0];
      var washLight = w0 ? Math.min(Math.max(w0.light, 86), 94) : 90;
      var washSat = w0 ? Math.min(w0.sat, 35) : 20;
      ctx.fillStyle = w0 ? "hsl(" + w0.hue + "," + washSat + "%," + washLight + "%)" : "#f6f0e4";
      ctx.fillRect(0, 0, W, H);

      for (var i = 0; i < waveBands.length; i++) { drawWaveBand(waveBands[i], t); }

      var m = Math.max(W, H);
      for (var j = 0; j < SPARKLES.length; j++) {
        var sp = SPARKLES[j];
        var tw = 0.35 + 0.3 * Math.sin(t * sp.freq * moveMult + sp.phase);
        var gx = sp.bx * W, gy = sp.by * H, gr = m * 0.045;
        var glint = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
        glint.addColorStop(0, "rgba(255,255,255," + tw.toFixed(2) + ")");
        glint.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = glint;
        ctx.fillRect(gx - gr, gy - gr, gr * 2, gr * 2);
      }
    }

    // Elapsed time is accumulated ourselves (scaled by speedMult each
    // frame) rather than feeding the raw rAF timestamp straight in.
    var elapsed = 0, lastTs = null;
    (function loop(ts) {
      if (lastTs !== null) { elapsed += ((ts - lastTs) / 1000) * speedMult; }
      lastTs = ts;
      draw(elapsed);
      requestAnimationFrame(loop);
    })(performance.now());
  }
  initMarbledGradient("heroGlow");
  initMarbledGradient("pageGradient");

  /* ---------- Playground: starfield ----------
     Twinkling stars + an occasional slow shooting star, drawn on a
     fixed full-viewport canvas that sits behind the Playground page's
     content (see .space-stars / body.space-page in the CSS). Self-
     contained: does nothing on pages without #spaceStars. */
  (function initSpaceStars() {
    var canvas = document.getElementById("spaceStars");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var reduceMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W, H, stars;

    function makeStars() {
      var count = Math.round((W * H) / 9000);
      count = Math.max(70, Math.min(count, 220));
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.3 + 0.35,
          base: Math.random() * 0.5 + 0.35,
          amp: Math.random() * 0.4,
          freq: 0.25 + Math.random() * 0.6,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    function size() {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      makeStars();
    }
    size();
    var resizeRaf = null;
    window.addEventListener("resize", function () {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(size);
    });

    // A single shooting star at a time, spawned rarely and only when
    // motion is allowed.
    var shooter = null;
    function maybeSpawnShooter() {
      if (reduceMotion || shooter) return;
      if (Math.random() < 0.0025) {
        var sx = W * 0.15 + Math.random() * W * 0.6;
        var sy = Math.random() * H * 0.25;
        var ang = Math.PI * 0.22 + Math.random() * 0.15;
        shooter = {
          x: sx, y: sy,
          vx: Math.cos(ang) * 620, vy: Math.sin(ang) * 620,
          life: 0, maxLife: 0.9 + Math.random() * 0.3
        };
      }
    }

    function draw(t, dt) {
      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var o = reduceMotion ? s.base : s.base + s.amp * Math.sin(t * s.freq + s.phase);
        o = Math.max(0, Math.min(1, o));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255," + o.toFixed(2) + ")";
        ctx.fill();
      }

      maybeSpawnShooter();
      if (shooter) {
        shooter.life += dt;
        shooter.x += shooter.vx * dt;
        shooter.y += shooter.vy * dt;
        var p = shooter.life / shooter.maxLife;
        if (p >= 1 || shooter.x > W + 60 || shooter.y > H + 60) {
          shooter = null;
        } else {
          var fade = p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85;
          var tailX = shooter.x - shooter.vx * 0.09;
          var tailY = shooter.y - shooter.vy * 0.09;
          var grad = ctx.createLinearGradient(tailX, tailY, shooter.x, shooter.y);
          grad.addColorStop(0, "rgba(255,255,255,0)");
          grad.addColorStop(1, "rgba(255,255,255," + (0.9 * fade).toFixed(2) + ")");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.6;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(shooter.x, shooter.y);
          ctx.stroke();
        }
      }
    }

    var elapsed = 0, lastTs = null;
    (function loop(ts) {
      var dt = lastTs !== null ? (ts - lastTs) / 1000 : 0;
      elapsed += dt;
      lastTs = ts;
      draw(elapsed, dt);
      requestAnimationFrame(loop);
    })(performance.now());
  })();

  /* ---------- Project card hover video (How Do We Love?) ----------
     The cubot thumbnail swaps in a looping motion clip on hover; play
     only while hovered so it never runs unseen, and skip it entirely
     under reduced motion. */
  (function initThumbHoverVideo() {
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    document.querySelectorAll(".thumb-hover-video").forEach(function (thumb) {
      var video = thumb.querySelector(".hover-video");
      var card = thumb.closest(".project-card");
      if (!video || !card) return;
      card.addEventListener("mouseenter", function () {
        video.currentTime = 0;
        video.play().catch(function () {});
      });
      card.addEventListener("mouseleave", function () {
        video.pause();
        video.currentTime = 0;
      });
    });
  })();

  /* ---------- Glass cursor ----------
     A single soft, frosted circle that trails the real pointer. Added
     once here (rather than per-page markup) so it applies site-wide.
     Skipped on touch devices, where there is no hover pointer to track. */
  (function initGlassCursor() {
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;

    var dot = document.createElement("div");
    dot.className = "glass-cursor";
    dot.innerHTML =
      '<svg class="cursor-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
    document.body.appendChild(dot);

    var targetX = window.innerWidth / 2, targetY = window.innerHeight / 2;
    var curX = targetX, curY = targetY;
    var visible = false;

    window.addEventListener("mousemove", function (e) {
      targetX = e.clientX; targetY = e.clientY;
      if (!visible) { visible = true; dot.style.opacity = "1"; }
    }, { passive: true });
    document.addEventListener("mouseleave", function () {
      visible = false; dot.style.opacity = "0";
    });

    function frame() {
      curX += (targetX - curX) * 0.18;
      curY += (targetY - curY) * 0.18;
      dot.style.transform = "translate(" + curX + "px, " + curY + "px) translate(-50%, -50%)";
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    // Open into a ghost ring while hovering a project card, paired with a
    // fixed corner badge on the thumbnail itself (injected below) — the
    // ring follows the pointer, the badge marks the card whether or not
    // the pointer has reached it yet.
    document.querySelectorAll(".project-card").forEach(function (card) {
      var thumb = card.querySelector(".thumb");
      if (thumb && !thumb.querySelector(".thumb-badge")) {
        var badge = document.createElement("span");
        badge.className = "thumb-badge";
        badge.setAttribute("aria-hidden", "true");
        badge.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
        thumb.appendChild(badge);
      }
      card.addEventListener("mouseenter", function () { dot.classList.add("is-project"); });
      card.addEventListener("mouseleave", function () { dot.classList.remove("is-project"); });
    });
  })();

  /* ---------- Designer ID card (About page) ----------
     Illustrated lanyard card: injects the shared SVG artwork, types out
     the rotating "Loves:" field, tilts + sheens toward the cursor on
     hover, and flips to a back face on click/tap. Self-contained so it
     only does anything on pages that actually have a [data-id-card]. */
  (function initIdCard() {
    var cards = document.querySelectorAll("[data-id-card]");
    if (!cards.length) return;

    var CARD_SVG_INNER = '<rect width="275" height="402" rx="43" fill="#F8E8FF"/>' +
      '<rect x="15.5" y="65.5" width="244" height="202" rx="24.5" fill="white" stroke="#4C0F4B"/>' +
      '<rect x="14.5" y="278.5" width="244" height="99" rx="24.5" fill="white" stroke="#4C0F4B"/>' +
      '<path d="M186.218 75C184.016 76.6759 179.01 79.146 176.443 80.7732C169.885 84.9303 162.174 90.1607 156.749 95.7226C167.335 91.7945 178.631 92.7131 188.717 97.5753C198.747 102.411 209.188 110.995 215.803 119.907C221.486 128.238 223.824 137.806 224.664 147.685C225.049 152.229 224.351 156.696 224.751 160.941C225.448 168.343 228.653 178.09 237 179.368C229.37 181.743 226.238 180.053 218.647 178.912C219.241 179.485 219.966 180.151 220.484 180.779C228.758 190.815 221.416 205.277 214.983 214.118C214.805 210.883 214.671 207.641 212.472 205.03C211.517 209.797 208.27 214.94 204.088 217.309C195.77 222.021 182.08 228.523 186.944 240.795C180.857 237.572 175.634 234.492 174.01 227.387C171.025 230.893 169.304 233.869 169.636 238.728C169.787 240.931 170.284 241.548 171.232 243.352C165.492 240.037 162.524 236.55 162.444 229.747C160.065 230.996 156.976 232.658 154.523 233.634C144.396 237.665 132.183 239.26 121.36 237.868C118.826 237.542 114.186 237.023 111.811 236.287C111.474 236.182 111.141 236.063 110.813 235.931C113.614 239.305 113.221 241.839 111.626 245.661C109.693 240.092 106.731 238.133 100.993 238.043C100.217 243.51 99.3337 247.72 94.559 251.307C92.8195 252.599 90.8586 253.562 88.7725 254.151C87.6702 254.472 86.8826 254.563 85.8239 255.065C87.096 250.269 88.8292 246.08 85.8211 241.514C86.0534 246.573 85.6364 251.447 82.0802 255.36C79.5035 258.197 77.8734 258.3 74.9842 259.977C77.8375 253.68 77.4784 245.671 72.1896 240.761C71.3667 239.997 70.1163 239.41 69.266 238.646C66.7692 235.908 66.4724 232.966 66.6111 229.616C61.3917 234.817 61.7331 240.012 64.657 246.267C51.858 239.243 49.5572 230.051 48.6192 216.382C45.9073 219.801 41.9618 224.868 37 222.409V222.238C37.8223 222.2 38.3115 222.154 38.9496 221.596C47.4964 214.117 46.7432 200.196 46.5697 189.792C46.4464 182.403 44.562 176.508 45.63 168.89C47.5977 154.854 54.662 143.997 64.2894 133.982C58.1672 134.758 53.9674 136.873 50.073 141.807C49.7727 142.187 49.2382 143.053 48.8658 143.18C49.3049 141.636 52.8064 135.861 53.7413 134.362C62.3076 120.618 73.6879 107.824 88.0248 99.9542C102.697 91.9008 118.917 90.3364 134.942 95.1225C136.78 95.6711 138.304 96.1824 140.116 96.7882C133.955 88.7957 126.948 83.8518 117.537 80.1857C132.782 80.0006 142.211 83.5815 146.113 98.7066C146.209 99.08 146.472 99.1983 146.774 99.3621C147.598 98.8472 149.08 95.7453 149.71 94.702C156.881 82.8235 170.076 76.7679 183.494 75.3416C184.379 75.2475 185.342 75.1539 186.218 75ZM120.481 168.515C123.863 160.936 126.595 153.563 125.363 145.115C125.132 143.532 123.658 138.617 122.636 137.655C122.039 138.658 121.926 140.245 121.465 141.333C116.328 153.463 103.435 159.828 92.0443 164.93C90.7361 165.516 89.4201 166.483 88.2018 167.232C81.8289 171.342 77.1979 177.531 74.3565 184.497C73.1579 187.431 72.5134 190.561 71.5123 193.583C71.4294 194.04 71.3751 194.312 71.2358 194.755L71.0196 194.904C69.9628 194.067 67.8956 192.334 66.7968 191.753C66.1261 191.868 66.2629 192.401 65.8877 192.532C65.7468 192.581 61.6972 190.072 60.329 189.531C61.4448 191.838 63.3262 195.72 65.1815 197.416C57.5259 202.452 68.682 201.975 69.4069 203.86L69.1806 204.776C68.5127 205.125 66.4242 204.538 65.6552 204.278C61.3044 202.806 59.1534 200.9 62.4483 196.95C61.1341 194.909 58.4365 191.324 58.7261 188.917C59.0062 186.587 62.8518 188.679 63.8918 189.09L64.0514 188.967C63.4772 187.924 62.8302 187.435 62.1432 186.494C60.8898 184.776 59.6904 182.592 58.9372 180.602C58.5635 179.616 58.7381 178.071 58.0655 177.384C57.3358 177.414 55.9607 178.456 55.5247 179.029C49.0243 187.558 55.3479 200.746 62.1425 207.021C65.6712 210.28 70.62 211.64 75.0478 211.58C75.4113 211.621 75.9387 211.697 76.2901 211.694C77.6936 213.821 79.4694 216.509 81.2539 218.267C103.399 240.086 144.929 242.855 168.253 221.46C179.911 210.765 183.368 198.938 183.836 184.014C182.603 182.502 180.882 180.884 179.527 179.286C173.687 172.401 168.555 163.631 167.291 154.586C166.964 152.247 167.09 147.267 167.278 144.879C162.394 147.581 157.499 152.418 160.316 158.522L160.183 158.751C158.681 158.964 155.791 157.599 154.536 156.695C147.721 151.784 144.394 140.426 142.99 132.527C140.993 149.785 135.979 159.847 120.481 168.515ZM194.778 163.419C191.396 164.519 188.94 166.922 187.322 170.025C184.065 176.273 185.963 182.49 185.653 189.124C185.563 191.05 185.42 193.022 185.227 194.945C185.073 196.486 184.652 198.314 184.646 199.828C185.702 200.004 188.891 198.703 189.841 198.131C196.042 194.454 198.817 189.734 200.692 182.832C202.172 177.383 202.175 171.883 199.22 166.912C198.198 165.194 196.827 163.695 194.778 163.419Z" fill="#4C0F4B"/>' +
      '<path d="M149.694 160.51L149.819 160.499C162.099 159.555 170.132 171.356 172.078 182.151C172.469 184.315 172.586 186.607 172.742 188.804C174.381 186.543 174.861 185.604 175.998 183.103C175.8 185.009 175.709 186.924 174.422 188.459C174.048 188.905 172.74 190.543 172.934 191.07C176.003 189.372 178.219 185.494 179.331 182.251C179.156 185.419 178.086 189.129 175.77 191.388C175.212 191.932 173.576 193.031 173.488 193.726C174.944 194.48 178.413 192.501 179.723 191.762C177.337 194.474 175.836 195.191 172.312 195.52C171.527 198.014 171.266 199.731 170.257 202.357C168.968 205.004 167.617 207.904 165.665 210.007C150.942 225.869 133.552 211.148 131.257 193.943C129.392 179.951 134.651 162.876 149.694 160.51ZM162.588 210.566C166.485 206.48 167.825 204.26 169.528 198.839C163.027 205.509 154.517 205.598 147.964 198.933C140.431 191.271 138.837 178.749 142.166 168.818C142.452 167.966 143.865 165.16 143.753 164.593L143.623 164.465C130.49 173.799 129.541 194.276 138.322 206.898C143.623 214.518 152.873 217.848 160.817 212.027C161.441 211.577 162.049 211.137 162.588 210.566ZM156.849 181.431C154.928 182.34 150.144 185.196 150.852 187.71C152.868 189.826 157.078 185.667 158.538 184.212C158.656 184.095 158.773 183.976 158.889 183.858C160.039 186.102 162.677 190.608 165.622 190.221C166.732 187.07 163.619 183.885 161.368 181.983C163.187 180.805 168.185 177.915 167.444 175.362C165.488 173.495 161.461 177.21 160.09 178.704C159.846 178.971 159.608 179.244 159.377 179.523C158.041 177.184 155.854 173.021 152.759 173.067C152.235 173.969 152.041 174.275 152.339 175.345C152.955 177.552 155.249 179.844 156.849 181.431Z" fill="#4C0F4B"/>' +
      '<path d="M96.8941 165.257C100.146 165.008 102.519 165.058 105.551 166.446C111.076 168.976 114.729 174.001 116.754 179.531C119.58 187.249 119.348 196.147 115.822 203.615C113.683 208.142 109.801 212.481 104.865 214.142C101.082 215.374 96.9575 215.108 93.3725 213.4C89.6247 211.582 85.2276 207.207 83.9021 203.322C82.983 202.354 80.2365 203.038 78.7609 202.45C77.1185 201.796 75.9376 200.788 74.5586 199.739C75.5208 200.049 76.5079 200.549 77.5214 200.835C79.2176 201.314 81.0518 201.541 82.8008 201.786C79.8399 200.237 77.4346 198.46 76.0829 195.345C75.5698 194.163 74.907 192.931 74.7183 191.656L74.8595 191.512C75.515 192.065 76.2293 193.57 76.7971 194.296C78.2108 196.103 80.4867 197.942 82.4951 199.025C81.9746 198.292 81.2275 197.63 80.6074 196.961C78.6223 194.818 78.5161 193.43 78.0192 190.733C79.3009 192.973 79.4498 193.947 81.3884 195.776C81.2765 195.237 81.1727 194.696 81.0766 194.153C79.2317 183.356 84.3415 167.307 96.8941 165.257ZM86.9495 174.194C83.3014 179.2 81.7026 187.614 82.6464 193.717C84.0917 203.062 90.9218 214.728 102.181 213.023C104.268 212.707 106.652 211.652 108.234 210.226C109.38 209.4 111.808 207.227 112.268 205.987L112.115 205.751C111.306 206.032 110.763 206.498 109.914 206.787C94.832 211.936 85.5568 194.857 85.9771 182.354C86.0162 181.195 87.1205 174.543 86.9495 174.194ZM102.711 185.228C100.703 186.472 96.1078 189.053 96.4631 191.688C98.2853 194.192 103.35 189.137 104.742 187.817C105.839 189.77 109.08 195.389 111.957 193.699C112.744 190.961 109.004 187.55 107.205 185.785C109.309 184.94 113.792 182.215 113.435 179.664C111.686 176.986 106.612 181.839 105.315 183.351C103.62 180.492 101.915 177.249 98.1717 177.262C98.1362 177.577 98.051 178.223 98.0651 178.533C98.1715 180.901 100.98 183.799 102.711 185.228Z" fill="#4C0F4B"/>' +
      '<path d="M130.42 212.089C130.496 212.095 130.763 212.193 130.852 212.223C130.998 212.748 130.755 213.225 130.546 213.692C129.325 216.416 126.156 217.256 123.331 216.541C122.014 216.208 121.207 215.806 120.004 215.223C119.253 214.717 118.481 214.12 117.751 213.579C121.803 214.501 123.274 215.204 127.183 213.287C127.948 212.912 129.58 212.297 130.42 212.089Z" fill="#4C0F4B" fill-opacity="0.980392"/>' +
      '<path d="M192.223 169.857C196.265 169.385 193.787 177.057 193.035 179.093L193.16 179.151C199.172 181.999 193.002 187.453 189.599 188.615L189.322 188.426C188.991 187.733 188.752 187.266 189.485 186.749C190.43 186.081 191.299 185.539 192.188 184.779C195.322 182.095 194.129 181.271 190.85 180.395C191.335 178.957 193.054 173.383 192.487 172.185L192.157 172.118C191.144 172.615 189.635 174.802 188.871 175.812L187.235 175.132C188.85 173.497 189.883 170.79 192.223 169.857Z" fill="#4C0F4B" fill-opacity="0.976471"/>' +
      '<path d="M71.7417 198.745C71.7779 198.228 71.8032 197.699 71.8327 197.18L72.0635 197.066C72.5395 203.122 73.6645 206.798 76.4365 212.089C76.1007 212.092 75.5967 212.016 75.2492 211.975C75.235 211.717 73.668 207.93 73.4413 207.292C72.3721 204.278 71.8474 201.942 71.7417 198.745Z" fill="#4C0F4B" fill-opacity="0.898039"/>' +
      '<path d="M70.8027 195.54L71.0947 195.395C71.2828 194.962 71.3563 194.696 71.4682 194.249C71.6228 195.297 71.6793 196.257 71.7417 197.306L71.4155 197.417C71.3738 197.924 71.338 198.439 71.2868 198.944C71.075 198.167 71.0018 196.531 70.8027 195.54Z" fill="#4C0F4B" fill-opacity="0.694118"/>' +
      '<rect x="42.5" y="17.5" width="214" height="37" rx="18.5" fill="white" stroke="#4C0F4B"/>' +
      '<circle cx="39" cy="37" r="36.5" fill="#F8E8FF" stroke="#4C0F4B"/>' +
      '<path d="M34.2447 14.6353C35.7415 10.0287 42.2585 10.0287 43.7553 14.6353L46.1844 22.1115C46.8538 24.1716 48.7736 25.5664 50.9397 25.5664H58.8007C63.6443 25.5664 65.6582 31.7644 61.7396 34.6115L55.38 39.232C53.6275 40.5052 52.8942 42.7621 53.5636 44.8222L55.9928 52.2984C57.4895 56.9049 52.2171 60.7355 48.2986 57.8885L41.9389 53.268C40.1865 51.9948 37.8135 51.9948 36.0611 53.268L29.7014 57.8885C25.7829 60.7356 20.5105 56.9049 22.0072 52.2984L24.4364 44.8222C25.1058 42.7621 24.3725 40.5052 22.62 39.232L16.2604 34.6115C12.3418 31.7644 14.3557 25.5664 19.1993 25.5664H27.0603C29.2264 25.5664 31.1462 24.1716 31.8156 22.1115L34.2447 14.6353Z" fill="#4C0F4B"/>';

    document.querySelectorAll("[data-card-svg]").forEach(function (svg) {
      svg.innerHTML = CARD_SVG_INNER;
    });

    document.querySelectorAll("[data-fields]").forEach(function (fieldsEl) {
      fieldsEl.innerHTML =
        '<p class="field-line"><span class="field-label">Role:</span> UX Designer</p>' +
        '<p class="field-line"><span class="field-label">Status:</span> Open to opportunities</p>' +
        '<p class="field-line"><span class="field-label">Loves:</span> <span data-loves-typed></span><span class="caret"></span></p>';
    });

    var LOVES = ["Illustration, games, anime", "Studio Ghibli, cats, tea", "Designing for humans", "Solving human problems", "Listening before designing", "Details that matter", "Uncovering human insight", "Meaningful experiences", "Designing with intention"];
    var loveIdx = 0, charIdx = 0, phase = "typing";
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function tickTypewriter() {
      var text = LOVES[loveIdx];
      var targets = document.querySelectorAll("[data-loves-typed]");
      var delay;
      if (reduceMotion) {
        targets.forEach(function (el) { el.textContent = text; });
        return;
      }
      if (phase === "typing") {
        charIdx++;
        targets.forEach(function (el) { el.textContent = text.slice(0, charIdx); });
        if (charIdx >= text.length) { phase = "holding"; delay = 1500; }
        else { delay = 42; }
      } else if (phase === "holding") {
        phase = "erasing"; delay = 20;
      } else {
        charIdx--;
        targets.forEach(function (el) { el.textContent = text.slice(0, charIdx); });
        if (charIdx <= 0) { loveIdx = (loveIdx + 1) % LOVES.length; phase = "typing"; delay = 350; }
        else { delay = 24; }
      }
      setTimeout(tickTypewriter, delay);
    }
    tickTypewriter();

    // Tilt + sheen toward the cursor (skipped on touch, which has no hover).
    if (!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches)) {
      cards.forEach(function (card) {
        var stage = card.closest(".id-card-stage");
        var sheen = card.querySelector(".id-card-sheen");
        if (!stage) return;
        var raf = null;
        stage.addEventListener("mousemove", function (e) {
          var r = stage.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - 0.5;
          var y = (e.clientY - r.top) / r.height - 0.5;
          var rotateY = x * 16, rotateX = -y * 16;
          card.classList.add("hovering");
          if (raf) cancelAnimationFrame(raf);
          raf = requestAnimationFrame(function () {
            card.style.transform = "rotateX(" + rotateX.toFixed(2) + "deg) rotateY(" + rotateY.toFixed(2) + "deg)";
            if (sheen) sheen.style.backgroundPosition = ((x + 0.5) * 100) + "% " + ((y + 0.5) * 100) + "%";
          });
        });
        stage.addEventListener("mouseleave", function () {
          card.classList.remove("hovering");
          if (raf) cancelAnimationFrame(raf);
          card.style.transform = "";
        });
      });
    }

    // Click/tap to flip.
    document.querySelectorAll("[data-flip]").forEach(function (flip) {
      flip.addEventListener("click", function () {
        flip.classList.toggle("flipped");
      });
    });
  })();
})();
