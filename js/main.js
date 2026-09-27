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
    chars.forEach(function (ch) {
      var span = document.createElement("span");
      span.className = "char";
      span.textContent = ch;
      span.dataset.isSpace = ch === " " ? "1" : "0";
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

  /* ---------- Hero: keep .hero-art tall enough for the card ----------
     The card is absolutely positioned and centered inside .hero-art via
     width: min(275px, 78%), so its actual rendered size depends on
     .hero-art's own width. A fixed CSS min-height can't track that (a
     percentage height resolves against the parent, not this element's
     own width), so this computes it directly from the card's max size
     at the current layout, padded for the float animation's rotation +
     bob (id-card-float, css/style.css) so the card can never poke out
     of .hero-art at any point in the cycle — on any breakpoint, stacked
     or side-by-side. */
  (function sizeHeroArt() {
    var heroArt = document.querySelector(".hero-art");
    if (!heroArt) return;
    var reduceMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function apply() {
      var artWidth = heroArt.getBoundingClientRect().width;
      if (!artWidth) return;
      var cardWidth = Math.min(275, 0.78 * artWidth);
      var cardHeight = cardWidth * (402 / 275);
      // Reduced motion drops the bob and settles at a static -4deg tilt
      // (see the prefers-reduced-motion override on .id-card-wrap).
      var angle = reduceMotion ? 4 : 5;
      var bobPad = reduceMotion ? 0 : 16;
      var rotationPad = cardWidth * Math.sin(angle * Math.PI / 180);
      heroArt.style.minHeight = Math.round(cardHeight + 2 * rotationPad + 2 * bobPad) + "px";
    }

    apply();
    var resizeRaf = null;
    window.addEventListener("resize", function () {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(apply);
    });
  })();

  (function initCardTilt() {
    var heroArt = document.querySelector(".hero-art");
    var card = document.getElementById("idCard");
    if (!heroArt || !card) return;
    var sheen = card.querySelector(".sheen");
    var reduceMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var canHover = !reduceMotion && window.matchMedia &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHover) return;

    var raf = null;
    function onMove(e) {
      var rect = heroArt.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      var rotateY = x * 16;
      var rotateX = -y * 16;
      card.classList.add("hovering");
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        card.style.transform = "rotateX(" + rotateX.toFixed(2) + "deg) rotateY(" + rotateY.toFixed(2) + "deg)";
        if (sheen) sheen.style.backgroundPosition = ((x + 0.5) * 100) + "% " + ((y + 0.5) * 100) + "%";
      });
    }
    function onLeave() {
      card.classList.remove("hovering");
      if (raf) cancelAnimationFrame(raf);
      card.style.transform = "";
    }
    heroArt.addEventListener("mousemove", onMove);
    heroArt.addEventListener("mouseleave", onLeave);
  })();

  /* ---------- Hero: Designer ID card flip (front <-> Design Philosophy) ----------
     Click/tap the front face to flip to a short design-philosophy panel on
     the back. A dedicated back button (not a click on the back face itself)
     flips it back to front. */
  (function initCardFlip() {
    var flipEl = document.getElementById("idCardFlip");
    var front = document.getElementById("idCardFront");
    var backBtn = document.getElementById("philBackBtn");
    var hint = document.getElementById("idCardHint");
    if (!flipEl || !front) return;

    var canHover = window.matchMedia &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (hint) hint.textContent = canHover ? "Click to flip" : "Tap to flip";

    function flipToBack() {
      flipEl.classList.add("flipped");
      front.setAttribute("aria-label", "Flip card back to front");
      if (hint) hint.style.opacity = "0";
    }
    function flipToFront() {
      flipEl.classList.remove("flipped");
      front.setAttribute("aria-label", "Flip card: read design philosophy");
      if (hint) hint.style.opacity = "1";
    }

    front.addEventListener("click", function () {
      if (!flipEl.classList.contains("flipped")) flipToBack();
    });
    front.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && !flipEl.classList.contains("flipped")) {
        e.preventDefault();
        flipToBack();
      }
    });
    if (backBtn) {
      backBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        flipToFront();
      });
    }
  })();

  /* ---------- Hero: Designer ID card "Loves" typed rotation ----------
     Types each phrase into the Loves field, holds, then backspaces before
     typing the next — an ambient detail, so it runs regardless of hover
     support (unlike the tilt, which needs a real pointer to mean anything). */
  (function initLovesTypewriter() {
    var targets = document.querySelectorAll("[data-loves-typed]");
    if (!targets.length) return;
    var reduceMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var LOVES = ["Illustration, games, anime", "Ghibli, cats, tea", "Human-centered design", "Solving real problems", "Listening first", "Details that matter", "Uncovering insights", "Meaningful experiences", "Designing with intention"];
    if (reduceMotion) {
      targets.forEach(function (el) { el.textContent = LOVES[0]; });
      return;
    }
    var loveIdx = 0, charIdx = 0, phase = "typing";
    function tick() {
      var text = LOVES[loveIdx];
      var delay;
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
      setTimeout(tick, delay);
    }
    setTimeout(tick, 1200);
  })();
})();
