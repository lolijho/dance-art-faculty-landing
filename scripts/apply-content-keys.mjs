/* One-off (riutilizzabile per future sezioni): aggiunge gli attributi
   data-content="chiave" in landing/index.html per collegare ogni testo
   al database dell'area admin.
   Uso: node scripts/apply-content-keys.mjs */

import { readFileSync, writeFileSync } from "node:fs";

const FILE = new URL("../landing/index.html", import.meta.url);

const PAIRS = [
  // ===== Ticker (due sequenze identiche) =====
  {
    find: `        <span>Open Day 14 novembre 2026</span><i></i><span>ore 11:00</span><i></i>
        <span>Prova di ammissione 30 gennaio</span><i></i><span>Open Day 19 dicembre 2026</span><i></i>
        <span>Roma · Via di Pietralata 159A</span><i></i>`,
    replace: `        <span data-content="ticker.1">Open Day 14 novembre 2026</span><i></i><span data-content="ticker.2">ore 11:00</span><i></i>
        <span data-content="ticker.3">Prova di ammissione 30 gennaio</span><i></i><span data-content="ticker.4">Open Day 19 dicembre 2026</span><i></i>
        <span data-content="ticker.5">Roma · Via di Pietralata 159A</span><i></i>`,
    count: 2,
  },

  // ===== Header =====
  {
    find: `<a class="btn btn--red header__cta" href="#prenota"><span class="cta-full">Prenota il posto</span><span class="cta-short" aria-hidden="true">Prenota</span></a>`,
    replace: `<a class="btn btn--red header__cta" href="#prenota"><span class="cta-full" data-content="header.cta_full">Prenota il posto</span><span class="cta-short" aria-hidden="true" data-content="header.cta_short">Prenota</span></a>`,
  },

  // ===== Hero =====
  {
    find: `<p class="chip chip--red reveal">A.S. 2026/27 · Scuola paritaria</p>`,
    replace: `<p class="chip chip--red reveal" data-content="hero.chip">A.S. 2026/27 · Scuola paritaria</p>`,
  },
  {
    find: `<h1 class="hero__title reveal" data-delay="1">Open Day</h1>`,
    replace: `<h1 class="hero__title reveal" data-delay="1" data-content="hero.title">Open Day</h1>`,
  },
  {
    find: `<p class="hero__sub reveal" data-delay="2">Liceo Coreutico DAF — la scuola superiore che si vive<br class="br-desk" /> dentro un centro internazionale di danza</p>`,
    replace: `<p class="hero__sub reveal" data-delay="2" data-content="hero.sub">Liceo Coreutico DAF — la scuola superiore che si vive<br class="br-desk" /> dentro un centro internazionale di danza</p>`,
  },
  {
    find: `<a class="btn btn--red btn--xl" href="#prenota">Prenota il tuo posto</a>`,
    replace: `<a class="btn btn--red btn--xl" href="#prenota" data-content="hero.cta1">Prenota il tuo posto</a>`,
  },
  {
    find: `<a class="btn btn--ghost btn--xl" href="#date">Le date</a>`,
    replace: `<a class="btn btn--ghost btn--xl" href="#date" data-content="hero.cta2">Le date</a>`,
  },
  { find: `<li>14 novembre 2026</li>`, replace: `<li data-content="hero.meta1">14 novembre 2026</li>` },
  { find: `<li>19 dicembre 2026</li>`, replace: `<li data-content="hero.meta2">19 dicembre 2026</li>` },
  { find: `<li>30 gennaio — <strong>Prova di ammissione</strong></li>`, replace: `<li data-content="hero.meta3">30 gennaio — <strong>Prova di ammissione</strong></li>` },
  { find: `<li>Ore 11:00</li>`, replace: `<li data-content="hero.meta4">Ore 11:00</li>` },

  // ===== Breadcrumb =====
  {
    find: `<p class="crumbs__note">Ingresso gratuito su prenotazione</p>`,
    replace: `<p class="crumbs__note" data-content="crumbs.note">Ingresso gratuito su prenotazione</p>`,
  },

  // ===== Le date =====
  { find: `<p class="label reveal">Le date</p>`, replace: `<p class="label reveal" data-content="date.label">Le date</p>` },
  { find: `<h2 class="h2 reveal" data-delay="1">Prenota il tuo posto</h2>`, replace: `<h2 class="h2 reveal" data-delay="1" data-content="date.title">Prenota il tuo posto</h2>` },
  {
    find: `<p class="intro reveal" data-delay="2">`,
    replace: `<p class="intro reveal" data-delay="2" data-content="date.intro">`,
  },

  // --- card 1 ---
  {
    find: `              <span class="ticket__tag">Open day conoscitivo</span>
              <p class="ticket__day">14</p>
              <p class="ticket__month">novembre 2026</p>`,
    replace: `              <span class="ticket__tag" data-content="date1.tag">Open day conoscitivo</span>
              <p class="ticket__day" data-content="date1.day">14</p>
              <p class="ticket__month" data-content="date1.month">novembre 2026</p>`,
  },
  {
    find: `<div class="ticket__body">
              <p class="ticket__hour">ore 11:00</p>
              <p class="ticket__desc">Conoscere la scuola dal dentro: lezioni simulate, spazi, docenti e studenti. Poi si rispondono alle domande di genitori e candidati.</p>
              <button class="ticket__cta" type="button" data-date-slot="1411" data-date-label="sabato 14 novembre 2026">Prenota questa data</button>
            </div>`,
    replace: `<div class="ticket__body">
              <p class="ticket__hour" data-content="date1.hour">ore 11:00</p>
              <p class="ticket__desc" data-content="date1.desc">Conoscere la scuola dal dentro: lezioni simulate, spazi, docenti e studenti. Poi si rispondono alle domande di genitori e candidati.</p>
              <button class="ticket__cta" type="button" data-date-slot="1411" data-date-label="sabato 14 novembre 2026" data-content="date1.cta">Prenota questa data</button>
            </div>`,
  },

  // --- card 2 ---
  {
    find: `              <span class="ticket__tag">Open day conoscitivo</span>
              <p class="ticket__day">19</p>
              <p class="ticket__month">dicembre 2026</p>`,
    replace: `              <span class="ticket__tag" data-content="date2.tag">Open day conoscitivo</span>
              <p class="ticket__day" data-content="date2.day">19</p>
              <p class="ticket__month" data-content="date2.month">dicembre 2026</p>`,
  },
  {
    find: `<div class="ticket__body">
              <p class="ticket__hour">ore 11:00</p>
              <p class="ticket__desc">La stessa esperienza, a dicembre: per chi vuole prepararsi con più tempo alla scelta della scuola superiore.</p>
              <button class="ticket__cta" type="button" data-date-slot="1912" data-date-label="sabato 19 dicembre 2026">Prenota questa data</button>
            </div>`,
    replace: `<div class="ticket__body">
              <p class="ticket__hour" data-content="date2.hour">ore 11:00</p>
              <p class="ticket__desc" data-content="date2.desc">La stessa esperienza, a dicembre: per chi vuole prepararsi con più tempo alla scelta della scuola superiore.</p>
              <button class="ticket__cta" type="button" data-date-slot="1912" data-date-label="sabato 19 dicembre 2026" data-content="date2.cta">Prenota questa data</button>
            </div>`,
  },

  // --- card 3 ---
  {
    find: `              <span class="ticket__tag">Open day + ammissione</span>
              <p class="ticket__day">30</p>
              <p class="ticket__month">gennaio 2026</p>`,
    replace: `              <span class="ticket__tag" data-content="date3.tag">Open day + ammissione</span>
              <p class="ticket__day" data-content="date3.day">30</p>
              <p class="ticket__month" data-content="date3.month">gennaio 2026</p>`,
  },
  {
    find: `<div class="ticket__body">
              <p class="ticket__hour">ore 11:00</p>
              <p class="ticket__desc">Oltre alla visita e alle simulazioni, puoi affrontare subito la <strong>prova di ammissione</strong> per l'a.s. 2026/27.</p>
              <button class="ticket__cta" type="button" data-date-slot="3001" data-date-label="venerdì 30 gennaio 2026">Prenota questa data</button>
            </div>`,
    replace: `<div class="ticket__body">
              <p class="ticket__hour" data-content="date3.hour">ore 11:00</p>
              <p class="ticket__desc" data-content="date3.desc">Oltre alla visita e alle simulazioni, puoi affrontare subito la <strong>prova di ammissione</strong> per l'a.s. 2026/27.</p>
              <button class="ticket__cta" type="button" data-date-slot="3001" data-date-label="venerdì 30 gennaio 2026" data-content="date3.cta">Prenota questa data</button>
            </div>`,
  },
  {
    find: `        <p class="tickets__mail reveal">
          Preferisci la mail diretta? Scrivi a
          <a href="mailto:segreteria.didattica@liceocoreuticodaf.it?subject=Prenotazione%20Open%20Day%20Liceo%20Coreutico%20DAF">segreteria.didattica@liceocoreuticodaf.it</a>
        </p>`,
    replace: `        <p class="tickets__mail reveal">
          <span data-content="date.mail">Preferisci la mail diretta? Scrivi a</span>
          <a href="mailto:segreteria.didattica@liceocoreuticodaf.it?subject=Prenotazione%20Open%20Day%20Liceo%20Coreutico%20DAF" data-content="contatti.email">segreteria.didattica@liceocoreuticodaf.it</a>
        </p>`,
  },

  // ===== Cinque motivi =====
  { find: `<p class="label">Cinque motivi</p>`, replace: `<p class="label" data-content="motivi.label">Cinque motivi</p>` },
  { find: `<h2 class="h2">Cinque buoni motivi per iscriverti al Liceo Coreutico DAF</h2>`, replace: `<h2 class="h2" data-content="motivi.title">Cinque buoni motivi per iscriverti al Liceo Coreutico DAF</h2>` },
  {
    find: `<h3>Una struttura di eccellenza</h3>
              <p>Il liceo è all'interno del DAF — Centro Internazionale per il Perfezionamento e la Formazione nella danza — una struttura di eccellenza nella formazione professionale.</p>`,
    replace: `<h3 data-content="motivi.1.title">Una struttura di eccellenza</h3>
              <p data-content="motivi.1.text">Il liceo è all'interno del DAF — Centro Internazionale per il Perfezionamento e la Formazione nella danza — una struttura di eccellenza nella formazione professionale.</p>`,
  },
  {
    find: `<h3>Ambiente moderno e completo</h3>
              <p>Tutti gli spazi e i servizi per vivere al meglio questa esperienza unica, dalla mattina alla sera.</p>`,
    replace: `<h3 data-content="motivi.2.title">Ambiente moderno e completo</h3>
              <p data-content="motivi.2.text">Tutti gli spazi e i servizi per vivere al meglio questa esperienza unica, dalla mattina alla sera.</p>`,
  },
  {
    find: `<h3>Accesso diretto al professionismo</h3>
              <p>DAF è un accesso diretto al mondo della danza professionale: compagnie, teatri, artisti di passaggio ogni stagione.</p>`,
    replace: `<h3 data-content="motivi.3.title">Accesso diretto al professionismo</h3>
              <p data-content="motivi.3.text">DAF è un accesso diretto al mondo della danza professionale: compagnie, teatri, artisti di passaggio ogni stagione.</p>`,
  },
  {
    find: `<h3>Corpo docente di altissimo livello</h3>
              <p>Docenti e maestri di rilievo, con tantissime opportunità di approfondimento e master class.</p>`,
    replace: `<h3 data-content="motivi.4.title">Corpo docente di altissimo livello</h3>
              <p data-content="motivi.4.text">Docenti e maestri di rilievo, con tantissime opportunità di approfondimento e master class.</p>`,
  },
  {
    find: `<h3>Ambiente creativo e sicuro</h3>
              <p>Un ambiente creativo e sicuro in cui crescere ed imparare, con il rigore di un metodo e la cura di una comunità.</p>`,
    replace: `<h3 data-content="motivi.5.title">Ambiente creativo e sicuro</h3>
              <p data-content="motivi.5.text">Un ambiente creativo e sicuro in cui crescere ed imparare, con il rigore di un metodo e la cura di una comunità.</p>`,
  },

  // ===== The DAF experience =====
  {
    find: `<div class="chip chip--float chip--top"><strong>Master class</strong> con coreografi ospiti delle più importanti realtà internazionali</div>`,
    replace: `<div class="chip chip--float chip--top" data-content="band.chip1"><strong>Master class</strong> con coreografi ospiti delle più importanti realtà internazionali</div>`,
  },
  {
    find: `<div class="chip chip--float chip--bottom"><span class="dot"></span> Performance e sale prove aperte delle compagnie — nella porta accanto</div>`,
    replace: `<div class="chip chip--float chip--bottom" data-content="band.chip2"><span class="dot"></span> Performance e sale prove aperte delle compagnie — nella porta accanto</div>`,
  },
  { find: `<p class="label reveal">The DAF experience</p>`, replace: `<p class="label reveal" data-content="band.label">The DAF experience</p>` },
  { find: `<h2 class="h2 reveal" data-delay="1">Una scuola nata<br /> dentro un palcoscenico.</h2>`, replace: `<h2 class="h2 reveal" data-delay="1" data-content="band.title">Una scuola nata<br /> dentro un palcoscenico.</h2>` },
  {
    find: `<p class="muted reveal" data-delay="2">
            La caratteristica`,
    replace: `<p class="muted reveal" data-delay="2" data-content="band.p1">
            La caratteristica`,
  },
  { find: `<li>Master class con coreografi ospiti internazionali</li>`, replace: `<li data-content="band.li1">Master class con coreografi ospiti internazionali</li>` },
  { find: `<li>Creazioni coreografiche dedicate, a integrazione del piano di studi</li>`, replace: `<li data-content="band.li2">Creazioni coreografiche dedicate, a integrazione del piano di studi</li>` },
  { find: `<li>Workshop e laboratori complementari al percorso liceale</li>`, replace: `<li data-content="band.li3">Workshop e laboratori complementari al percorso liceale</li>` },
  { find: `<li>Performance e sale prove aperte delle compagnie professionali — <em>realmente "nella porta accanto"</em></li>`, replace: `<li data-content="band.li4">Performance e sale prove aperte delle compagnie professionali — <em>realmente "nella porta accanto"</em></li>` },
  {
    find: `<p class="muted reveal" data-delay="4">
            Una comunità artistica`,
    replace: `<p class="muted reveal" data-delay="4" data-content="band.p2">
            Una comunità artistica`,
  },
  {
    find: `<a class="more reveal" data-delay="5" href="https://danceartsfaculty.com/liceo-coreutico/scuola/progetto-educativo/" target="_blank" rel="noopener">Progetto educativo <i>→</i></a>`,
    replace: `<a class="more reveal" data-delay="5" href="https://danceartsfaculty.com/liceo-coreutico/scuola/progetto-educativo/" target="_blank" rel="noopener" data-content="band.more">Progetto educativo <i>→</i></a>`,
  },

  // ===== Cos'è il liceo =====
  { find: `<p class="label reveal">Cos'è il liceo</p>`, replace: `<p class="label reveal" data-content="liceo.label">Cos'è il liceo</p>` },
  { find: `<h2 class="h2 reveal" data-delay="1">Il liceo che danza.</h2>`, replace: `<h2 class="h2 reveal" data-delay="1" data-content="liceo.title">Il liceo che danza.</h2>` },
  {
    find: `<p class="muted reveal" data-delay="2">
            Il Liceo Coreutico DAF è una scuola superiore`,
    replace: `<p class="muted reveal" data-delay="2" data-content="liceo.p1">
            Il Liceo Coreutico DAF è una scuola superiore`,
  },
  { find: `<span class="num__v" data-count="32">32</span><span class="num__l">ore settimanali,<br />tutti e 5 gli anni</span>`, replace: `<span class="num__v" data-count="32" data-content="liceo.num1.v">32</span><span class="num__l" data-content="liceo.num1.l">ore settimanali,<br />tutti e 5 gli anni</span>` },
  { find: `<span class="num__v" data-count="462">462</span><span class="num__l">ore di danza<br />in tutto il percorso</span>`, replace: `<span class="num__v" data-count="462" data-content="liceo.num2.v">462</span><span class="num__l" data-content="liceo.num2.l">ore di danza<br />in tutto il percorso</span>` },
  { find: `<span class="num__v">2</span><span class="num__l">indirizzi: classica<br />o contemporanea</span>`, replace: `<span class="num__v" data-content="liceo.num3.v">2</span><span class="num__l" data-content="liceo.num3.l">indirizzi: classica<br />o contemporanea</span>` },
  { find: `<span class="num__v">2009</span><span class="num__l">da quando DAF<br />forma nuovi danzatori</span>`, replace: `<span class="num__v" data-content="liceo.num4.v">2009</span><span class="num__l" data-content="liceo.num4.l">da quando DAF<br />forma nuovi danzatori</span>` },
  {
    find: `<p class="note reveal" data-delay="4">
            Al termine del secondo anno,`,
    replace: `<p class="note reveal" data-delay="4" data-content="liceo.note">
            Al termine del secondo anno,`,
  },

  // ===== FAQ =====
  { find: `<p class="label reveal">Domande frequenti</p>`, replace: `<p class="label reveal" data-content="faq.label">Domande frequenti</p>` },
  { find: `<h2 class="h2 reveal" data-delay="1">Vieni a conoscerci!</h2>`, replace: `<h2 class="h2 reveal" data-delay="1" data-content="faq.title">Vieni a conoscerci!</h2>` },
  { find: `<summary><span>Cos'è il Liceo Coreutico DAF?</span>`, replace: `<summary><span data-content="faq.q1">Cos'è il Liceo Coreutico DAF?</span>` },
  { find: `<summary><span>Perché il Liceo Coreutico DAF è diverso?</span>`, replace: `<summary><span data-content="faq.q2">Perché il Liceo Coreutico DAF è diverso?</span>` },
  { find: `<summary><span>Posso entrare a qualsiasi anno del liceo?</span>`, replace: `<summary><span data-content="faq.q3">Posso entrare a qualsiasi anno del liceo?</span>` },
  { find: `<summary><span>Che cos'è DAF?</span>`, replace: `<summary><span data-content="faq.q4">Che cos'è DAF?</span>` },
  {
    find: `<p>
                È una scuola superiore di secondo grado`,
    replace: `<p data-content="faq.a1">
                È una scuola superiore di secondo grado`,
  },
  {
    find: `<p>
                Per il luogo in cui nasce:`,
    replace: `<p data-content="faq.a2">
                Per il luogo in cui nasce:`,
  },
  {
    find: `<p>
                Sì: la selezione è aperta`,
    replace: `<p data-content="faq.a3">
                Sì: la selezione è aperta`,
  },
  {
    find: `<p>
                DAF è un Centro Internazionale`,
    replace: `<p data-content="faq.a4">
                DAF è un Centro Internazionale`,
  },

  // ===== Ammissioni =====
  { find: `<p class="label reveal">Ammissioni</p>`, replace: `<p class="label reveal" data-content="amm.label">Ammissioni</p>` },
  { find: `<h2 class="h2 reveal" data-delay="1">Vuoi cambiare scuola<br /> e passare al Coreutico?</h2>`, replace: `<h2 class="h2 reveal" data-delay="1" data-content="amm.title">Vuoi cambiare scuola<br /> e passare al Coreutico?</h2>` },
  {
    find: `<p class="muted reveal" data-delay="2">
            La selezione è aperta`,
    replace: `<p class="muted reveal" data-delay="2" data-content="amm.p1">
            La selezione è aperta`,
  },
  { find: `<a class="btn btn--red" href="#prenota">Prenota la prova di ammissione</a>`, replace: `<a class="btn btn--red" href="#prenota" data-content="amm.cta">Prenota la prova di ammissione</a>` },
  { find: `<a class="more" href="https://danceartsfaculty.com/liceo-coreutico/scuola/ammissioni/" target="_blank" rel="noopener">Pagina ammissioni <i>→</i></a>`, replace: `<a class="more" href="https://danceartsfaculty.com/liceo-coreutico/scuola/ammissioni/" target="_blank" rel="noopener" data-content="amm.more">Pagina ammissioni <i>→</i></a>` },
  { find: `<div class="chip chip--float chip--top chip--red">Anche da altre scuole, a ogni anno di corso</div>`, replace: `<div class="chip chip--float chip--top chip--red" data-content="amm.chip">Anche da altre scuole, a ogni anno di corso</div>` },

  // ===== Dove siamo =====
  { find: `<p class="label reveal">Dove siamo</p>`, replace: `<p class="label reveal" data-content="dove.label">Dove siamo</p>` },
  { find: `<h2 class="h2 reveal" data-delay="1">Vieni a trovarci</h2>`, replace: `<h2 class="h2 reveal" data-delay="1" data-content="dove.title">Vieni a trovarci</h2>` },
  {
    find: `<p class="muted reveal" data-delay="2">
            Il Liceo Coreutico DAF è a Roma,`,
    replace: `<p class="muted reveal" data-delay="2" data-content="dove.p1">
            Il Liceo Coreutico DAF è a Roma,`,
  },
  {
    find: `<strong>Dance Arts Faculty — Liceo Coreutico</strong>
            Via di Pietralata 159A, 00158 Roma`,
    replace: `<strong data-content="dove.card.title">Dance Arts Faculty — Liceo Coreutico</strong>
            <span data-content="dove.card.addr">Via di Pietralata 159A, 00158 Roma</span>`,
  },
  { find: `<a class="dove__maplink" href="https://www.google.com/maps/search/?api=1&query=Via+di+Pietralata+159A+Roma" target="_blank" rel="noopener">Apri in Google Maps ↗</a>`, replace: `<a class="dove__maplink" href="https://www.google.com/maps/search/?api=1&query=Via+di+Pietralata+159A+Roma" target="_blank" rel="noopener" data-content="dove.maplink">Apri in Google Maps ↗</a>` },

  // ===== Prenota =====
  { find: `<p class="label label--light reveal">Prenota</p>`, replace: `<p class="label label--light reveal" data-content="prenota.label">Prenota</p>` },
  { find: `<h2 class="h2 h2--light reveal" data-delay="1">Scegli la data, ti aspettiamo.</h2>`, replace: `<h2 class="h2 h2--light reveal" data-delay="1" data-content="prenota.title">Scegli la data, ti aspettiamo.</h2>` },
  {
    find: `<p class="intro intro--light reveal" data-delay="2">`,
    replace: `<p class="intro intro--light reveal" data-delay="2" data-content="prenota.intro">`,
  },
  { find: `<label for="f-nome">Nome e cognome *</label>`, replace: `<label for="f-nome" data-content="form.nome">Nome e cognome *</label>` },
  { find: `<label for="f-email">Email *</label>`, replace: `<label for="f-email" data-content="form.email">Email *</label>` },
  { find: `<label for="f-tel">Telefono <span class="opt">(opzionale)</span></label>`, replace: `<label for="f-tel" data-content="form.tel">Telefono <span class="opt">(opzionale)</span></label>` },
  { find: `<label for="f-data">Data open day *</label>`, replace: `<label for="f-data" data-content="form.data">Data open day *</label>` },
  { find: `<label for="f-anno">Anno di iscrizione</label>`, replace: `<label for="f-anno" data-content="form.anno">Anno di iscrizione</label>` },
  { find: `<label for="f-note">Note <span class="opt">(opzionale)</span></label>`, replace: `<label for="f-note" data-content="form.note">Note <span class="opt">(opzionale)</span></label>` },
  { find: `<p class="field__err" hidden>Inserisci nome e cognome.</p>`, replace: `<p class="field__err" hidden data-content="form.err.nome">Inserisci nome e cognome.</p>` },
  { find: `<p class="field__err" hidden>Inserisci un'email valida.</p>`, replace: `<p class="field__err" hidden data-content="form.err.email">Inserisci un'email valida.</p>` },
  { find: `<p class="field__err" hidden>Scegli una delle tre date.</p>`, replace: `<p class="field__err" hidden data-content="form.err.data">Scegli una delle tre date.</p>` },
  { find: `<button class="btn btn--red btn--xl" type="submit">Prenota l'open day</button>`, replace: `<button class="btn btn--red btn--xl" type="submit" data-content="form.submit">Prenota l'open day</button>` },
  { find: `<p class="form__privacy">Inviando la richiesta autorizzi la segreteria didattica a contattarti per la prenotazione.</p>`, replace: `<p class="form__privacy" data-content="form.privacy">Inviando la richiesta autorizzi la segreteria didattica a contattarti per la prenotazione.</p>` },
  { find: `<h3>La tua richiesta è pronta.</h3>`, replace: `<h3 data-content="form.done.title">La tua richiesta è pronta.</h3>` },
  {
    find: `<p>
            Ti abbiamo aperto l'email di prenotazione, già compilata con i tuoi dati:
            controlla e premi <strong>invia</strong> per completare la prenotazione.
          </p>`,
    replace: `<p data-content="form.done.p1">
            Ti abbiamo aperto l'email di prenotazione, già compilata con i tuoi dati:
            controlla e premi <strong>invia</strong> per completare la prenotazione.
          </p>`,
  },
  {
    find: `<p class="form-done__alt">
            Se il client di posta non si è aperto, scrivi direttamente a
            <a href="mailto:segreteria.didattica@liceocoreuticodaf.it">segreteria.didattica@liceocoreuticodaf.it</a>
            oppure copia l'indirizzo:
          </p>`,
    replace: `<p class="form-done__alt">
            <span data-content="form.done.alt1">Se il client di posta non si è aperto, scrivi direttamente a</span>
            <a href="mailto:segreteria.didattica@liceocoreuticodaf.it" data-content="contatti.email">segreteria.didattica@liceocoreuticodaf.it</a>
            <span data-content="form.done.alt2">oppure copia l'indirizzo:</span>
          </p>`,
  },
  { find: `<code>segreteria.didattica@liceocoreuticodaf.it</code>`, replace: `<code data-content="contatti.email">segreteria.didattica@liceocoreuticodaf.it</code>` },

  // ===== Footer =====
  { find: `<span>© DAF 2026 — Liceo Coreutico, scuola paritaria · RMSL3M5001</span>`, replace: `<span data-content="footer.bar1">© DAF 2026 — Liceo Coreutico, scuola paritaria · RMSL3M5001</span>` },
  { find: `<span>Foto: Cristiano Castaldi · Pagine &amp; Movie</span>`, replace: `<span data-content="footer.bar2">Foto: Cristiano Castaldi · Pagine &amp; Movie</span>` },

  // ===== CTA mobile =====
  { find: `<p>Open Day 2026/27 — ingresso gratuito</p>`, replace: `<p data-content="mcta.text">Open Day 2026/27 — ingresso gratuito</p>` },
  { find: `<a class="btn btn--red" href="#prenota">Prenota il posto</a>`, replace: `<a class="btn btn--red" href="#prenota" data-content="mcta.cta">Prenota il posto</a>` },
];

let html = readFileSync(FILE, "utf8");
let errors = 0;

for (const pair of PAIRS) {
  const expected = pair.count ?? 1;
  const parts = html.split(pair.find);
  const found = parts.length - 1;
  if (found !== expected) {
    console.error(`✗ attese ${expected} occorrenze, trovate ${found}: ${pair.find.slice(0, 90).replace(/\n/g, " ⏎ ")}…`);
    errors++;
    continue;
  }
  html = parts.join(pair.replace);
}

if (errors) {
  console.error(`\n${errors} snippet non applicati: nessuna modifica scritta.`);
  process.exit(1);
}

writeFileSync(FILE, html);
const keys = [...html.matchAll(/data-content="([^"]+)"/g)].map((m) => m[1]);
console.log(`✓ attributi applicati: ${keys.length} (chiavi uniche: ${new Set(keys).size})`);
