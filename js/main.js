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
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Process arc diagram animation (case study "Process" diagrams) ---------- */
  document.querySelectorAll("[data-process-arc]").forEach(function (diagram) {
    var nodes = Array.prototype.slice.call(diagram.querySelectorAll(".pad-node"));
    var arcs = Array.prototype.slice.call(diagram.querySelectorAll(".pad-arc, .pad-line"));
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function arcsAfter(step) {
      return arcs.filter(function (a) { return +a.dataset.arc === step; });
    }
    function revealArc(arc) {
      arc.classList.add("in");
      if (!reduced) {
        setTimeout(function () { arc.classList.add("flow"); }, 700);
      }
    }
    function revealNode(node) {
      node.classList.add("in");
      arcsAfter(+node.dataset.step).forEach(revealArc);
    }
    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { revealNode(entry.target); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.4, rootMargin: "0px 0px -10% 0px" });
      nodes.forEach(function (n) { obs.observe(n); });
    } else {
      nodes.forEach(revealNode);
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

  /* ---------- Hero chroma text reveal + cursor halo ---------- */
  (function heroChroma() {
    var heroText = document.getElementById("heroText");
    if (!heroText) return;
    var heroSection = heroText.closest(".hero");

    var PALETTES = {
      light: [
        { t: 0,    c: "#e8b84b" },
        { t: 0.35, c: "#ef8b5c" },
        { t: 0.65, c: "#e23f74" },
        { t: 1,    c: "#8f6fd8" }
      ],
      dark: [
        { t: 0,    c: "#ff9a66" },
        { t: 0.35, c: "#c988ff" },
        { t: 0.65, c: "#7c8cff" },
        { t: 1,    c: "#e8ecff" }
      ]
    };

    function hexToRgb(hex) {
      var v = hex.replace("#", "");
      return [parseInt(v.substr(0, 2), 16), parseInt(v.substr(2, 2), 16), parseInt(v.substr(4, 2), 16)];
    }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function colorAt(stops, t) {
      t = Math.max(0, Math.min(1, t));
      for (var i = 0; i < stops.length - 1; i++) {
        var a = stops[i], b = stops[i + 1];
        if (t >= a.t && t <= b.t) {
          var lt = (t - a.t) / (b.t - a.t || 1);
          var ca = hexToRgb(a.c), cb = hexToRgb(b.c);
          return "rgb(" + Math.round(lerp(ca[0], cb[0], lt)) + "," + Math.round(lerp(ca[1], cb[1], lt)) + "," + Math.round(lerp(ca[2], cb[2], lt)) + ")";
        }
      }
      return stops[stops.length - 1].c;
    }

    var text = heroText.textContent;
    heroText.textContent = "";
    heroText.classList.add("chroma-text");
    var chars = text.split("");
    var colorable = chars.filter(function (c) { return c !== " "; }).length;
    var spans = [];
    var colorIdx = 0;
    chars.forEach(function (ch) {
      var span = document.createElement("span");
      span.className = "char";
      span.textContent = ch === " " ? " " : ch;
      span.dataset.isSpace = ch === " " ? "1" : "0";
      span.dataset.t = ch !== " " ? (colorable > 1 ? colorIdx / (colorable - 1) : 0) : 0;
      if (ch !== " ") colorIdx++;
      heroText.appendChild(span);
      spans.push(span);
    });

    function restColor() {
      var v = getComputedStyle(document.documentElement).getPropertyValue("--ink-faint");
      return v ? v.trim() : "#94929f";
    }
    function applyPalette() {
      var stops = currentIsDark() ? PALETTES.dark : PALETTES.light;
      spans.forEach(function (span) {
        if (span.dataset.isSpace !== "1") span.dataset.chroma = colorAt(stops, parseFloat(span.dataset.t));
      });
    }
    applyPalette();

    function play() {
      applyPalette();
      var rest = restColor();
      // Cap the total stagger so longer headlines don't take proportionally
      // longer to finish revealing; short text keeps the original 50ms feel.
      var stepMs = Math.min(50, 900 / spans.length);
      spans.forEach(function (span, i) {
        span.className = "char";
        span.style.color = "";
        void span.offsetWidth;
        span.style.animationDelay = (i * stepMs / 1000) + "s";
        span.classList.add("animate");
        if (span.dataset.chroma) span.style.color = span.dataset.chroma;
      });
      clearTimeout(play._t);
      play._t = setTimeout(function () {
        spans.forEach(function (span) {
          span.classList.remove("animate");
          span.classList.add("settled");
          span.style.color = rest;
        });
      }, spans.length * stepMs + 1350);
    }

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var canHover = !reduceMotion && heroSection && window.matchMedia &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (canHover) {
      var glow = document.createElement("div");
      glow.className = "hero-glow";
      heroSection.appendChild(glow);

      var mouse = { x: 0, y: 0, active: false };
      var glowPos = { x: 0, y: 0 };

      heroSection.addEventListener("mousemove", function (e) {
        var r = heroSection.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
        mouse.active = true;
      });
      heroSection.addEventListener("mouseleave", function () { mouse.active = false; });

      (function tick() {
        glowPos.x = lerp(glowPos.x, mouse.x, 0.32);
        glowPos.y = lerp(glowPos.y, mouse.y, 0.32);
        var w = heroSection.clientWidth || 1;
        var stops = currentIsDark() ? PALETTES.dark : PALETTES.light;
        var color = colorAt(stops, glowPos.x / w);
        glow.style.background = "radial-gradient(circle, " + color + " 0%, " + color + "55 40%, transparent 72%)";
        glow.style.transform = "translate(" + (glowPos.x - 70) + "px," + (glowPos.y - 70) + "px)";
        glow.style.opacity = mouse.active ? "0.6" : "0";
        requestAnimationFrame(tick);
      })();

      heroText.addEventListener("mousemove", function (e) {
        var rest = restColor();
        spans.forEach(function (span) {
          if (!span.classList.contains("settled")) return;
          var r = span.getBoundingClientRect();
          var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          var dist = Math.hypot(e.clientX - cx, e.clientY - cy);
          span.style.color = (dist < 60 && span.dataset.chroma) ? span.dataset.chroma : rest;
        });
      });
      heroText.addEventListener("mouseleave", function () {
        var rest = restColor();
        spans.forEach(function (span) {
          if (span.classList.contains("settled")) span.style.color = rest;
        });
      });
    }

    function onThemeChange() {
      applyPalette();
      var rest = restColor();
      spans.forEach(function (span) {
        if (span.classList.contains("settled")) span.style.color = rest;
      });
    }
    new MutationObserver(onThemeChange).observe(document.documentElement, {
      attributes: true, attributeFilter: ["data-theme"]
    });
    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", onThemeChange);
    }

    if (reduceMotion) {
      applyPalette();
      spans.forEach(function (span) {
        span.classList.add("settled");
        span.style.color = restColor();
      });
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
})();
