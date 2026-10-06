/* Open Day Liceo Coreutico DAF — landing per campagne ads */

(function () {
  "use strict";

  var EMAIL = "segreteria.didattica@liceocoreuticodaf.it";

  /* Hook di debug: ?static=1 disattiva animazioni e hero full-height
     (utile per screenshot di verifica e stampa) */
  if (window.location.search.indexOf("static=1") !== -1) {
    document.documentElement.classList.add("static");
  }

  /* ---------- Contenuti dal backend (fallback: HTML statico) ---------- */

  /* Applica gli item di /api/content alla pagina: usata al load e dal page builder */
  function applyContentItems(items) {
    var byHtml = {};
    var byVal = {};
    items.forEach(function (it) {
      byHtml[it.key] = it.html;
      byVal[it.key] = it.value;
    });

    if (byVal["meta.title"]) document.title = byVal["meta.title"];
    var metaDesc = document.querySelector('meta[name="description"]');
    if (byVal["meta.description"] && metaDesc) metaDesc.setAttribute("content", byVal["meta.description"]);
    if (byVal["contatti.email"]) EMAIL = byVal["contatti.email"];

    var nodes = document.querySelectorAll("[data-content]");
    Array.prototype.forEach.call(nodes, function (node) {
      var key = node.getAttribute("data-content");
      var html = byHtml[key];
      if (typeof html !== "string") return;
      if (node.hasAttribute("data-count")) {
        var n = parseInt(String(byVal[key] == null ? "" : byVal[key]).replace(/[^\d-]/g, ""), 10);
        if (!isNaN(n)) node.setAttribute("data-count", String(n));
      }
      node.innerHTML = html;
      if (node.tagName === "A") {
        var href = node.getAttribute("href") || "";
        if (href.indexOf("mailto:") === 0) {
          node.setAttribute(
            "href",
            "mailto:" + EMAIL + (href.indexOf("?") !== -1 ? href.slice(href.indexOf("?")) : "")
          );
        }
      }
    });
  }

  function applyContent() {
    fetch("/api/content")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !data.items) return;
        applyContentItems(data.items);
      })
      .catch(function () {
        /* Backend assente o DB non raggiungibile: restano i testi statici */
      });
  }
  applyContent();
  window.__dafApplyContent = applyContentItems;

  /* ---------- Page builder: disponibile solo se l'admin è in sessione ---------- */
  function injectAsset(kind, src) {
    var el;
    if (kind === "link") {
      el = document.createElement("link");
      el.rel = "stylesheet";
      el.href = src;
      document.head.appendChild(el);
    } else {
      el = document.createElement("script");
      el.src = src;
      el.defer = true;
      document.head.appendChild(el);
    }
  }

  function bootstrapEditor() {
    var wantsEdit = window.location.search.indexOf("edit=1") !== -1;
    fetch("/api/me")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (me) {
        if (me && me.authed) {
          injectAsset("link", "editor.css");
          injectAsset("script", "editor.js");
        } else if (wantsEdit) {
          window.location.replace("/admin");
        }
      })
      .catch(function () {});
  }
  bootstrapEditor();

  /* ---------- Header: stato scroll ---------- */
  var header = document.getElementById("header");
  function onScrollHeader() {
    header.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Parallax soft sulle immagini ---------- */
  var parallax = document.querySelectorAll("[data-parallax-soft] img");
  if (parallax.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var updateParallax = function () {
      var vh = window.innerHeight;
      parallax.forEach(function (img) {
        var r = img.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var p = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.transform = "translateY(" + (p * -14).toFixed(1) + "px) scale(1.04)";
      });
    };
    window.addEventListener("scroll", updateParallax, { passive: true });
    window.addEventListener("resize", updateParallax, { passive: true });
  }

  /* ---------- Count-up numeri ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target)) return;
    var dur = 900;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("it-IT");
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var ioCount = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            animateCount(e.target);
            ioCount.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) { ioCount.observe(el); });
  }

  /* ---------- Accordion: una risposta aperta alla volta ---------- */
  var accs = document.querySelectorAll(".acc");
  accs.forEach(function (acc) {
    acc.addEventListener("toggle", function () {
      if (!acc.open) return;
      accs.forEach(function (other) {
        if (other !== acc) other.open = false;
      });
    });
  });

  /* ---------- Card data -> prefill form ---------- */
  var selectData = document.getElementById("f-data");
  document.querySelectorAll("[data-date-slot]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var slot = btn.getAttribute("data-date-slot");
      if (selectData) selectData.value = slot;
      var form = document.getElementById("form-prenota");
      if (form) {
        form.scrollIntoView({ behavior: "smooth", block: "start" });
        var nome = document.getElementById("f-nome");
        if (nome) setTimeout(function () { nome.focus({ preventScroll: true }); }, 600);
      }
    });
  });

  /* ---------- Cattura parametri campagna (UTM) ---------- */
  function campaignParams() {
    try {
      var saved = sessionStorage.getItem("daf_utm");
      if (saved) return JSON.parse(saved);
      var sp = new URLSearchParams(window.location.search);
      var keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "msclkid"];
      var found = {};
      keys.forEach(function (k) {
        var v = sp.get(k);
        if (v) found[k] = v;
      });
      sessionStorage.setItem("daf_utm", JSON.stringify(found));
      return found;
    } catch (err) {
      return {};
    }
  }

  function campaignLine() {
    var utm = campaignParams();
    var parts = Object.keys(utm).map(function (k) { return k + "=" + utm[k]; });
    var ref = document.referrer ? document.referrer.slice(0, 80) : "";
    if (ref) parts.push("referrer=" + ref);
    return parts.length ? "\nProvenienza campagna: " + parts.join(" · ") : "";
  }

  /* ---------- Form -> mailto precompilata ---------- */
  var form = document.getElementById("form-prenota");
  var done = document.getElementById("form-done");

  function setInvalid(field, invalid) {
    field.classList.toggle("invalid", invalid);
    var err = field.querySelector(".field__err");
    if (err) err.hidden = !invalid;
  }

  function labelForSlot(slot) {
    var opt = selectData.querySelector('option[value="' + slot + '"]');
    return opt ? opt.textContent : slot;
  }

  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var nome = document.getElementById("f-nome");
      var email = document.getElementById("f-email");
      var tel = document.getElementById("f-tel");
      var anno = document.getElementById("f-anno");
      var note = document.getElementById("f-note");

      var ok = true;
      var reMail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

      var badNome = nome.value.trim().length < 3;
      setInvalid(nome.closest(".field"), badNome);
      if (badNome) ok = false;

      var badMail = !reMail.test(email.value.trim());
      setInvalid(email.closest(".field"), badMail);
      if (badMail) ok = false;

      var badData = !selectData.value;
      setInvalid(selectData.closest(".field"), badData);
      if (badData) ok = false;

      if (!ok) {
        var firstBad = form.querySelector(".field.invalid input, .field.invalid select");
        if (firstBad) firstBad.focus();
        return;
      }

      var body =
        "Buongiorno, vorrei prenotare un posto per l'Open Day del Liceo Coreutico DAF.\n\n" +
        "Data selezionata: " + labelForSlot(selectData.value) + "\n" +
        "Nome e cognome: " + nome.value.trim() + "\n" +
        "Email: " + email.value.trim() + "\n" +
        "Telefono: " + (tel.value.trim() || "-") + "\n" +
        "Anno di iscrizione: " + (anno.value || "Da decidere") + "\n" +
        "Note: " + (note.value.trim() || "-") + campaignLine() + "\n";

      var subject = "Prenotazione Open Day — " + nome.value.trim() + " — " + selectData.value;
      var href = "mailto:" + EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      window.location.href = href;

      form.hidden = true;
      done.hidden = false;
      done.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    form.addEventListener("input", function (ev) {
      var field = ev.target.closest(".field");
      if (field && field.classList.contains("invalid")) {
        setInvalid(field, false);
      }
    });
  }

  /* ---------- Copia email ---------- */
  var copyBtn = document.getElementById("copy-mail");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var copied = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(EMAIL).then(function () { flash(); });
        copied = true;
      }
      if (!copied) {
        var ta = document.createElement("textarea");
        ta.value = EMAIL;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); flash(); } catch (e) {}
        document.body.removeChild(ta);
      }
      function flash() {
        var old = copyBtn.textContent;
        copyBtn.textContent = "Copiata ✓";
        setTimeout(function () { copyBtn.textContent = old; }, 1600);
      }
    });
  }

  /* ---------- Sticky CTA mobile ---------- */
  var mcta = document.getElementById("mcta");
  var hero = document.querySelector(".hero");
  var prenota = document.getElementById("prenota");
  if (mcta && hero && prenota && "IntersectionObserver" in window) {
    var heroOut = false;
    var formOut = true;
    function updateMcta() {
      mcta.classList.toggle("show", heroOut && formOut);
    }
    new IntersectionObserver(
      function (entries) { heroOut = !entries[0].isIntersecting; updateMcta(); },
      { threshold: 0.15 }
    ).observe(hero);
    new IntersectionObserver(
      function (entries) { formOut = !entries[0].isIntersecting; updateMcta(); },
      { threshold: 0.05 }
    ).observe(prenota);
  }
})();