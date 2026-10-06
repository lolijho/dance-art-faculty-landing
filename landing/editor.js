/* Page builder — modifica i testi della landing direttamente in pagina.
   Caricato da script.js solo per gli admin autenticati (vedi bootstrapEditor). */
(function () {
  "use strict";

  var items = [];
  var byKey = {};
  var dirty = {};
  var editing = false;
  var fab = null;
  var bar = null;
  var toastEl = null;
  var toastTimer = null;

  function byId(id) { return document.getElementById(id); }
  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function load(cb) {
    fetch("/api/content")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (data && data.items) {
          items = data.items;
          byKey = {};
          items.forEach(function (it) { byKey[it.key] = it; });
        }
        if (cb) cb();
      })
      .catch(function () { /* senza contenuti restano i testi correnti */ });
  }

  function renderText(v) {
    return String(v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\r\n/g, "\n")
      .split("\n")
      .join("<br />");
  }

  /* Normalizza l'HTML prodotto dal browser dentro un contenteditable prima
     di salvarlo: il server rifinisce comunque con l'allowlist. */
  function normalizeRich(html) {
    return String(html)
      .replace(/&nbsp;/g, " ")
      .replace(/<span class="Apple-converted-space">([\s\S]*?)<\/span>/gi, "$1")
      .replace(/<(div|p)[^>]*>/gi, "")
      .replace(/<\/(div|p)>/gi, "<br>")
      .replace(/<b\b[^>]*>/gi, "<strong>")
      .replace(/<\/b>/gi, "</strong>");
  }

  /* ---------- UI (fab, toolbar, toast) ---------- */

  function buildUI() {
    fab = document.createElement("button");
    fab.id = "daf-fab";
    fab.type = "button";
    fab.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>' +
      "<span>Modifica testi</span>";
    fab.addEventListener("click", start);
    document.body.appendChild(fab);

    bar = document.createElement("div");
    bar.id = "daf-bar";
    bar.hidden = true;
    bar.innerHTML =
      '<span id="daf-bar-status">Clicca un testo per modificarlo</span>' +
      '<span class="daf-bar__sep" aria-hidden="true"></span>' +
      '<button type="button" id="daf-btn-cancel">Annulla</button>' +
      '<button type="button" id="daf-btn-list">Elenco testi</button>' +
      '<button type="button" id="daf-btn-exit">Termina</button>' +
      '<button type="button" id="daf-btn-logout">Esci</button>' +
      '<button type="button" id="daf-btn-save" class="daf-save">Salva</button>';
    document.body.appendChild(bar);

    toastEl = document.createElement("div");
    toastEl.id = "daf-toast";
    toastEl.hidden = true;
    document.body.appendChild(toastEl);

    byId("daf-btn-save").addEventListener("click", save);
    byId("daf-btn-cancel").addEventListener("click", revert);
    byId("daf-btn-exit").addEventListener("click", exit);
    byId("daf-btn-logout").addEventListener("click", logout);
    byId("daf-btn-list").addEventListener("click", function () {
      window.location.href = "/admin";
    });
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 2600);
  }

  function updateStatus() {
    var n = Object.keys(dirty).length;
    byId("daf-bar-status").textContent =
      n === 0
        ? "Clicca un testo per modificarlo"
        : n === 1
        ? "1 modifica non salvata"
        : n + " modifiche non salvate";
  }

  function refreshMarks() {
    qsa("[data-content]").forEach(function (node) {
      var isDirty = Object.prototype.hasOwnProperty.call(dirty, node.getAttribute("data-content"));
      node.classList.toggle("daf-dirty", isDirty);
    });
  }

  /* ---------- Modalità modifica ---------- */

  function start() {
    if (editing) return;
    editing = true;
    document.documentElement.classList.add("daf-editing");
    fab.hidden = true;
    bar.hidden = false;

    var probe = document.createElement("div");
    probe.setAttribute("contenteditable", "plaintext-only");
    var plaintextOK = probe.contentEditable === "plaintext-only";

    qsa("[data-content]").forEach(function (node) {
      var it = byKey[node.getAttribute("data-content")];
      if (!it) return;
      if (!node.dataset.dafWired) {
        node.dataset.dafWired = "1";
        node.dataset.dafType = it.type === "rich" ? "rich" : "text";
        node.addEventListener("input", onInput);
        node.addEventListener("paste", onPaste);
        node.addEventListener("keydown", onKey);
      }
      node.setAttribute(
        "contenteditable",
        node.dataset.dafType === "rich" ? "true" : plaintextOK ? "plaintext-only" : "true"
      );
      node.classList.add("daf-editable");
      node.setAttribute("title", it.label + " — " + node.getAttribute("data-content"));
    });

    document.addEventListener("click", stopLinkClicks, true);
    document.addEventListener("keydown", keyShortcuts);
    window.addEventListener("beforeunload", unloadGuard);
    refreshMarks();
    updateStatus();
  }

  function exit() {
    if (!editing) return;
    if (Object.keys(dirty).length && !window.confirm("Ci sono modifiche non salvate: uscendo le perderai. Continuare?")) {
      return;
    }
    editing = false;
    dirty = {};
    document.documentElement.classList.remove("daf-editing");
    qsa("[data-content]").forEach(function (node) {
      if (!node.dataset.dafWired) return;
      node.removeAttribute("contenteditable");
      node.removeAttribute("title");
      node.classList.remove("daf-editable", "daf-dirty");
    });
    bar.hidden = true;
    fab.hidden = false;
    document.removeEventListener("click", stopLinkClicks, true);
    document.removeEventListener("keydown", keyShortcuts);
    window.removeEventListener("beforeunload", unloadGuard);
    if (history.replaceState) history.replaceState(null, "", "/");
  }

  /* ---------- Editing ---------- */

  function onInput(e) {
    if (!editing) return;
    var node = e.currentTarget;
    var key = node.getAttribute("data-content");
    var type = node.dataset.dafType || "text";
    var value = type === "rich" ? normalizeRich(node.innerHTML) : node.innerText.replace(/\u00a0/g, " ");
    dirty[key] = value;
    if (node.hasAttribute("data-count")) {
      var n = parseInt(String(value).replace(/[^\d-]/g, ""), 10);
      if (!isNaN(n)) node.setAttribute("data-count", String(n));
    }
    syncOthers(node, key, type, value);
    refreshMarks();
    updateStatus();
  }

  /* Chiavi ripetute in pagina (ticker ×2, email ×3): aggiorna anche le altre copie */
  function syncOthers(origin, key, type, value) {
    qsa('[data-content="' + key + '"]').forEach(function (other) {
      if (other === origin) return;
      other.innerHTML = type === "rich" ? value : renderText(value);
      if (key === "contatti.email" && other.tagName === "A") {
        var href = other.getAttribute("href") || "";
        var q = href.indexOf("?");
        other.setAttribute("href", "mailto:" + value + (q !== -1 ? href.slice(q) : ""));
      }
    });
  }

  function onPaste(e) {
    if (!editing) return;
    e.preventDefault();
    var text = e.clipboardData ? e.clipboardData.getData("text/plain") : "";
    if (text) document.execCommand("insertText", false, text);
  }

  function onKey(e) {
    if (!editing) return;
    if (e.key === "Escape") {
      exit();
      return;
    }
    var node = e.currentTarget;
    if (node.dataset.dafType === "text" && e.key === "Enter" && node.getAttribute("contenteditable") !== "plaintext-only") {
      e.preventDefault();
      document.execCommand("insertText", false, "\n");
    }
  }

  function stopLinkClicks(e) {
    if (!editing) return;
    var a = e.target && e.target.closest ? e.target.closest("a") : null;
    if (a) e.preventDefault();
  }

  function keyShortcuts(e) {
    if (!editing) return;
    if ((e.metaKey || e.ctrlKey) && (e.key === "s" || e.key === "S")) {
      e.preventDefault();
      if (Object.keys(dirty).length) save();
    }
  }

  function unloadGuard(e) {
    if (editing && Object.keys(dirty).length) {
      e.preventDefault();
      e.returnValue = "";
    }
  }

  /* ---------- Salvataggio / annullamento ---------- */

  function refreshFromServer(msg) {
    load(function () {
      if (window.__dafApplyContent) window.__dafApplyContent(items);
      refreshMarks();
      updateStatus();
      if (msg) toast(msg);
    });
  }

  function save() {
    if (!Object.keys(dirty).length) {
      toast("Nessuna modifica da salvare");
      return;
    }
    var btn = byId("daf-btn-save");
    btn.disabled = true;
    fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates: dirty }),
    })
      .then(function (r) {
        if (r.ok) return { ok: true };
        if (r.status === 401) return { auth: true };
        return r
          .json()
          .then(function (b) { return { msg: (b && b.error) || "Errore di salvataggio" }; },
                 function () { return { msg: "Errore di salvataggio" }; });
      })
      .then(function (res) {
        btn.disabled = false;
        if (res && res.ok) {
          dirty = {};
          refreshFromServer("Modifiche salvate");
        } else if (res && res.auth) {
          window.location.href = "/admin";
        } else if (res && res.msg) {
          toast(res.msg);
        }
      })
      .catch(function () {
        btn.disabled = false;
        toast("Errore di rete: riprova");
      });
  }

  function revert() {
    if (!Object.keys(dirty).length) {
      toast("Nessuna modifica da annullare");
      return;
    }
    dirty = {};
    refreshFromServer("Modifiche annullate");
  }

  function logout() {
    if (Object.keys(dirty).length && !window.confirm("Ci sono modifiche non salvate: uscendo le perderai. Continuare?")) {
      return;
    }
    fetch("/api/logout", { method: "POST" }).then(
      function () { window.location.reload(); },
      function () { window.location.reload(); }
    );
  }

  /* ---------- Boot ---------- */
  load(function () {
    buildUI();
    if (window.location.search.indexOf("edit=1") !== -1) start();
  });
})();