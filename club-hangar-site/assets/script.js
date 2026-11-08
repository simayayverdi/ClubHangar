(function () {
  try {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  } catch (e) {}

  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}

  function scrollTopIfNoHash() {
    if (location.hash && location.hash.length > 1) return;
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  scrollTopIfNoHash();
  window.addEventListener("DOMContentLoaded", function () { scrollTopIfNoHash(); initHeroVideo(); });
  window.addEventListener("load", function () {
    scrollTopIfNoHash();
    setTimeout(scrollTopIfNoHash, 0);
    setTimeout(scrollTopIfNoHash, 50);
    hydrateMaps();
    initHeroVideo();
    setTimeout(function () {
      document.documentElement.classList.add("smooth-scroll");
    }, 100);
    initReveal();
    initCounters();
  });
  window.addEventListener("pageshow", function (ev) {
    scrollTopIfNoHash();
    if (ev.persisted) scrollTopIfNoHash();
  });

  function hydrateMaps() {
    document.querySelectorAll("iframe[data-src]").forEach(function (frame) {
      if (frame.getAttribute("src") && frame.getAttribute("src") !== "about:blank") return;
      var src = frame.getAttribute("data-src");
      if (!src) return;
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (!entry.isIntersecting) return;
              frame.setAttribute("src", src);
              frame.removeAttribute("data-src");
              io.disconnect();
            });
          },
          { rootMargin: "200px 0px", threshold: 0.01 }
        );
        io.observe(frame);
      } else {
        frame.setAttribute("src", src);
        frame.removeAttribute("data-src");
      }
    });
  }


  function initHeroVideo() {
    var v = document.getElementById("hero-video");
    if (!v) return;
    if (reduceMotion) {
      try { v.pause(); } catch (e) {}
      v.removeAttribute("autoplay");
      v.classList.add("is-static");
      return;
    }
    var mobile = false;
    try { mobile = window.matchMedia("(max-width: 767px)").matches; } catch (e) {}
    var base = mobile ? "assets/video/hero-mobile" : "assets/video/hero-desktop";
    while (v.firstChild) v.removeChild(v.firstChild);
    var webm = document.createElement("source");
    webm.src = base + ".webm";
    webm.type = "video/webm";
    var mp4 = document.createElement("source");
    mp4.src = base + ".mp4";
    mp4.type = "video/mp4";
    v.appendChild(webm);
    v.appendChild(mp4);
    v.setAttribute("autoplay", "");
    v.muted = true;
    v.playsInline = true;
    try { v.load(); } catch (e) {}
    var playPromise = v.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  function initReveal() {
    var els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    els.forEach(function (el, i) {
      el.style.setProperty("--d", (i % 6) * 60 + "ms");
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach(function (el) { io.observe(el); });
  }

  function formatNum(n, decimals) {
    if (decimals > 0) return n.toFixed(decimals).replace(".", ",");
    return String(Math.round(n));
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count") || "0");
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) {
      el.textContent = prefix + formatNum(target, decimals) + suffix;
      return;
    }
    var start = performance.now();
    var dur = 1200;
    function frame(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      var val = target * eased;
      el.textContent = prefix + formatNum(val, decimals) + suffix;
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + formatNum(target, decimals) + suffix;
    }
    requestAnimationFrame(frame);
  }

  function initCounters() {
    var nums = document.querySelectorAll(".stat-num[data-count]");
    if (!nums.length) return;
    if (!("IntersectionObserver" in window)) {
      nums.forEach(animateCount);
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    nums.forEach(function (el) { io.observe(el); });
  }

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("ana-menu");
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Menüyü aç");
      });
    });
  }
})();
