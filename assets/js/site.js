(function () {
  "use strict";
  var d = document, de = d.documentElement;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // Attribute translations: data-alt-km/en -> alt, data-aria-km/en -> aria-label, data-title-km/en -> title
  function applyAttrs() {
    var lang = de.getAttribute("data-lang") === "en" ? "en" : "km";
    [["alt", "alt"], ["aria", "aria-label"], ["title", "title"]].forEach(function (p) {
      d.querySelectorAll("[data-" + p[0] + "-" + lang + "]").forEach(function (el) {
        el.setAttribute(p[1], el.getAttribute("data-" + p[0] + "-" + lang));
      });
    });
  }
  applyAttrs();

  // Language toggle
  var lb = d.getElementById("lang-toggle");
  if (lb) lb.addEventListener("click", function () {
    var next = de.getAttribute("data-lang") === "km" ? "en" : "km";
    de.setAttribute("data-lang", next); de.setAttribute("lang", next);
    store("kk-lang", next); applyAttrs();
  });

  // Theme toggle (dark <-> light); the head script already set data-theme
  var tb = d.getElementById("theme-toggle");
  if (tb) tb.addEventListener("click", function () {
    var next = de.getAttribute("data-theme") === "light" ? "dark" : "light";
    de.setAttribute("data-theme", next); store("kk-theme", next);
    var m = d.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", next === "light" ? "#FFFBF3" : "#0F0F10");
  });

  // Mobile menu
  var nav = d.querySelector(".nav"), mb = d.getElementById("menu-toggle");
  if (mb && nav) {
    mb.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      mb.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest(".nav__panel a")) { nav.classList.remove("open"); mb.setAttribute("aria-expanded", "false"); }
    });
  }

  // reveal on scroll
  var els = d.querySelectorAll(".rv");
  if ("IntersectionObserver" in window && !reduce && !/[?&]still\b/.test(location.search)) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("in"); });
  }

  // nav border when scrolled
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      if (nav) nav.classList.toggle("is-stuck", (window.scrollY || 0) > 8);
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // Phone videos: poster only under reduced motion; below-the-fold clips play only while visible
  var vids = d.querySelectorAll(".phone video");
  function play(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  if (reduce) {
    vids.forEach(function (v) { v.removeAttribute("autoplay"); v.pause(); v.load(); });
  } else if ("IntersectionObserver" in window) {
    var vo = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) play(e.target); else e.target.pause(); });
    }, { threshold: 0.25 });
    vids.forEach(function (v) { vo.observe(v); });
  } else {
    vids.forEach(function (v) { if (v.hasAttribute("autoplay")) play(v); });
  }
})();
