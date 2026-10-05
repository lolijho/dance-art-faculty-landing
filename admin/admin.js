/* Admin testi — editor della landing Open Day DAF */
(function () {
  "use strict";

  var state = { items: [], dirty: {} };

  function $(id) { return document.getElementById(id); }

  function fetchJson(url, opts) {
    return fetch(url, opts).then(function (res) {
      return res
        .json()
        .catch(function () { return {}; })
        .then(function (body) {
          if (!res.ok) {
            var err = new Error(body.error || "Errore " + res.status);
            err.status = res.status;
            throw err;
          }
          return body;
        });
    });
  }

  function headersJson() { return { "Content-Type": "application/json" }; }

  /* ---------- Boot ---------- */
  fetchJson("/api/me")
    .then(function (me) { if (me.authed) enterEditor(); else showLogin(); })
    .catch(showLogin);

  function showLogin() {
    $("login").hidden = false;
    $("editor").hidden = true;
    $("savebar").hidden = true;
    $("logout").hidden = true;
    $("password").focus();
  }

  $("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var err = $("login-err");
    err.hidden = true;
    fetchJson("/api/login", {
      method: "POST",
      headers: headersJson(),
      body: JSON.stringify({ password: $("password").value }),
    })
      .then(function () { enterEditor(); })
      .catch(function (ex) { err.textContent = ex.message; err.hidden = false; });
  });

  $("logout").addEventListener("click", function () {
    fetchJson("/api/logout", { method: "POST" }).then(showLogin, showLogin);
  });

  function enterEditor() {
    $("login").hidden = true;
    $("editor").hidden = false;
    $("logout").hidden = false;
    load();
  }

  /* ---------- Caricamento e render ---------- */
  function load() {
    fetchJson("/api/content")
      .then(function (data) {
        state.items = (data && data.items) || [];
        state.dirty = {};
        render();
        updateBar();
      })
      .catch(function (ex) { alert("Impossibile caricare i contenuti: " + ex.message); });
  }

  function render() {
    var groups = [];
    var bySection = {};
    state.items.forEach(function (it) {
      if (!bySection[it.section]) {
        bySection[it.section] = [];
        groups.push({ label: it.section, items: bySection[it.section] });
      }
      bySection[it.section].push(it);
    });

    var root = $("sections");
    root.textContent = "";

    groups.forEach(function (g) {
      var card = document.createElement("section");
      card.className = "card";
      var h = document.createElement("h2");
      h.textContent = g.label;
      card.appendChild(h);
      g.items.forEach(function (it) { card.appendChild(buildField(it)); });
      root.appendChild(card);
    });
  }

  function buildField(it) {
    var wrap = document.createElement("div");
    wrap.className = "field";

    var head = document.createElement("div");
    head.className = "field__head";

    var lab = document.createElement("label");
    lab.setAttribute("for", "k-" + it.key);
    lab.appendChild(document.createTextNode(it.label));
    var code = document.createElement("code");
    code.textContent = it.key;
    lab.appendChild(code);

    var reset = document.createElement("button");
    reset.type = "button";
    reset.className = "reset";
    reset.title = "Ripristina il testo di default";
    reset.textContent = "↺ Ripristina";
    reset.addEventListener("click", function () {
      ta.value = it.def;
      markDirty(it, ta.value);
      autoGrow(ta);
    });

    head.appendChild(lab);
    head.appendChild(reset);

    var ta = document.createElement("textarea");
    ta.id = "k-" + it.key;
    ta.rows = it.value.length > 180 ? 5 : 3;
    ta.value = it.value;
    ta.addEventListener("input", function () {
      markDirty(it, ta.value);
      autoGrow(ta);
    });

    refreshChanged(ta, it);
    wrap.appendChild(head);
    wrap.appendChild(ta);
    return wrap;
  }

  function markDirty(it, value) {
    state.dirty[it.key] = value;
    var ta = $("k-" + it.key);
    refreshChanged(ta, it);
    updateBar();
  }

  function refreshChanged(ta, it) {
    if (!ta) return;
    ta.classList.toggle("changed", ta.value !== it.def);
  }

  function autoGrow(ta) {
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + 2 + "px";
  }

  function updateBar() {
    var n = Object.keys(state.dirty).length;
    $("savebar").hidden = n === 0;
    $("savebar-msg").textContent = n === 1 ? "1 modifica non salvata" : n + " modifiche non salvate";
    $("status").textContent = n === 0 ? "Tutto salvato — il sito mostra questi testi." : "Hai " + n + " modifiche da salvare.";
  }

  /* ---------- Salvataggio ---------- */
  $("save").addEventListener("click", function () {
    var btn = $("save");
    var payload = {};
    Object.keys(state.dirty).forEach(function (key) { payload[key] = state.dirty[key]; });
    btn.disabled = true;
    btn.textContent = "Salvo…";
    fetchJson("/api/content", { method: "PUT", headers: headersJson(), body: JSON.stringify({ updates: payload }) })
      .then(function () {
        state.dirty = {};
        toast("Modifiche salvate ✓");
        load();
      })
      .catch(function (ex) {
        if (ex.status === 401) {
          showLogin();
          $("login-err").textContent = "Sessione scaduta: accedi di nuovo.";
          $("login-err").hidden = false;
        } else {
          toast(ex.message);
        }
      })
      .then(function () {
        btn.disabled = false;
        btn.textContent = "Salva modifiche";
      });
  });

  var toastTimer = null;
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }
})();
