/* Testi di default della landing — unica fonte di verità per l'area admin
   e per GET /api/content. Ogni chiave corrisponde a un attributo
   data-content="..." in landing/index.html (meta.title/description e
   contatti.email vengono applicati in modo speciale da landing/script.js).
   Per aggiungere testi editabili: nuova chiave qui + attributo nell'HTML
   (verifica con: node scripts/verify-content.mjs). */

const SECTIONS = [
  {
    id: "pagina",
    label: "Pagina (titolo e descrizione)",
    keys: [
      { key: "meta.title", label: "Titolo pagina (tab browser / Google)", def: "Open Day Liceo Coreutico DAF 2026/27 — Prenota il tuo posto | Dance Arts Faculty" },
      { key: "meta.description", label: "Descrizione pagina (snippet Google)", def: "Open Day conoscitivi con simulazioni didattiche il 14 novembre e il 19 dicembre 2026, Open Day con Prova di Ammissione il 30 gennaio, ore 11:00. Liceo Coreutico DAF, scuola paritaria a Roma — Via di Pietralata 159A. Prenota il tuo posto." },
    ],
  },
  {
    id: "contatti",
    label: "Contatti",
    keys: [
      { key: "contatti.email", label: "Email segreteria (usata in tutta la pagina e nel form)", def: "segreteria.didattica@liceocoreuticodaf.it" },
    ],
  },
  {
    id: "ticker",
    label: "Ticker scorrevole",
    keys: [
      { key: "ticker.1", label: "Frase 1", def: "Open Day 14 novembre 2026" },
      { key: "ticker.2", label: "Frase 2", def: "ore 11:00" },
      { key: "ticker.3", label: "Frase 3", def: "Prova di ammissione 30 gennaio" },
      { key: "ticker.4", label: "Frase 4", def: "Open Day 19 dicembre 2026" },
      { key: "ticker.5", label: "Frase 5", def: "Roma · Via di Pietralata 159A" },
    ],
  },
  {
    id: "header",
    label: "Header",
    keys: [
      { key: "header.cta_full", label: "Bottone (desktop)", def: "Prenota il posto" },
      { key: "header.cta_short", label: "Bottone (mobile)", def: "Prenota" },
    ],
  },
  {
    id: "hero",
    label: "Hero",
    keys: [
      { key: "hero.chip", label: "Badge sopra il titolo", def: "A.S. 2026/27 · Scuola paritaria" },
      { key: "hero.title", label: "Titolo", def: "Open Day" },
      { key: "hero.sub", label: "Sottotitolo", def: "Liceo Coreutico DAF — la scuola superiore che si vive<br class=\"br-desk\" /> dentro un centro internazionale di danza" },
      { key: "hero.cta1", label: "Bottone 1", def: "Prenota il tuo posto" },
      { key: "hero.cta2", label: "Bottone 2", def: "Le date" },
      { key: "hero.meta1", label: "Info 1", def: "14 novembre 2026" },
      { key: "hero.meta2", label: "Info 2", def: "19 dicembre 2026" },
      { key: "hero.meta3", label: "Info 3", def: "30 gennaio — <strong>Prova di ammissione</strong>" },
      { key: "hero.meta4", label: "Info 4", def: "Ore 11:00" },
    ],
  },
  {
    id: "crumbs",
    label: "Breadcrumb",
    keys: [
      { key: "crumbs.note", label: "Nota a destra del percorso", def: "Ingresso gratuito su prenotazione" },
    ],
  },
  {
    id: "date",
    label: "Le date",
    keys: [
      { key: "date.label", label: "Etichetta sezione", def: "Le date" },
      { key: "date.title", label: "Titolo sezione", def: "Prenota il tuo posto" },
      { key: "date.intro", label: "Introduzione", def: "<strong>Open day conoscitivi con simulazioni didattiche</strong> — 14 novembre e 19 dicembre 2026, ore 11:00.<br /><strong>Open day e Prova di Ammissione a.s. 2026/27</strong> — 30 gennaio 2026, ore 11:00." },
      { key: "date1.tag", label: "Card 1 — etichetta", def: "Open day conoscitivo" },
      { key: "date1.day", label: "Card 1 — giorno", def: "14" },
      { key: "date1.month", label: "Card 1 — mese", def: "novembre 2026" },
      { key: "date1.hour", label: "Card 1 — ora", def: "ore 11:00" },
      { key: "date1.desc", label: "Card 1 — descrizione", def: "Conoscere la scuola dal dentro: lezioni simulate, spazi, docenti e studenti. Poi si rispondono alle domande di genitori e candidati." },
      { key: "date1.cta", label: "Card 1 — bottone", def: "Prenota questa data" },
      { key: "date2.tag", label: "Card 2 — etichetta", def: "Open day conoscitivo" },
      { key: "date2.day", label: "Card 2 — giorno", def: "19" },
      { key: "date2.month", label: "Card 2 — mese", def: "dicembre 2026" },
      { key: "date2.hour", label: "Card 2 — ora", def: "ore 11:00" },
      { key: "date2.desc", label: "Card 2 — descrizione", def: "La stessa esperienza, a dicembre: per chi vuole prepararsi con più tempo alla scelta della scuola superiore." },
      { key: "date2.cta", label: "Card 2 — bottone", def: "Prenota questa data" },
      { key: "date3.tag", label: "Card 3 — etichetta", def: "Open day + ammissione" },
      { key: "date3.day", label: "Card 3 — giorno", def: "30" },
      { key: "date3.month", label: "Card 3 — mese", def: "gennaio 2026" },
      { key: "date3.hour", label: "Card 3 — ora", def: "ore 11:00" },
      { key: "date3.desc", label: "Card 3 — descrizione", def: "Oltre alla visita e alle simulazioni, puoi affrontare subito la <strong>prova di ammissione</strong> per l'a.s. 2026/27." },
      { key: "date3.cta", label: "Card 3 — bottone", def: "Prenota questa data" },
      { key: "date.mail", label: "Frase sotto le card (prima dell'email)", def: "Preferisci la mail diretta? Scrivi a" },
    ],
  },
  {
    id: "motivi",
    label: "Cinque motivi",
    keys: [
      { key: "motivi.label", label: "Etichetta sezione", def: "Cinque motivi" },
      { key: "motivi.title", label: "Titolo sezione", def: "Cinque buoni motivi per iscriverti al Liceo Coreutico DAF" },
      { key: "motivi.1.title", label: "Motivo 1 — titolo", def: "Una struttura di eccellenza" },
      { key: "motivi.1.text", label: "Motivo 1 — testo", def: "Il liceo è all'interno del DAF — Centro Internazionale per il Perfezionamento e la Formazione nella danza — una struttura di eccellenza nella formazione professionale." },
      { key: "motivi.2.title", label: "Motivo 2 — titolo", def: "Ambiente moderno e completo" },
      { key: "motivi.2.text", label: "Motivo 2 — testo", def: "Tutti gli spazi e i servizi per vivere al meglio questa esperienza unica, dalla mattina alla sera." },
      { key: "motivi.3.title", label: "Motivo 3 — titolo", def: "Accesso diretto al professionismo" },
      { key: "motivi.3.text", label: "Motivo 3 — testo", def: "DAF è un accesso diretto al mondo della danza professionale: compagnie, teatri, artisti di passaggio ogni stagione." },
      { key: "motivi.4.title", label: "Motivo 4 — titolo", def: "Corpo docente di altissimo livello" },
      { key: "motivi.4.text", label: "Motivo 4 — testo", def: "Docenti e maestri di rilievo, con tantissime opportunità di approfondimento e master class." },
      { key: "motivi.5.title", label: "Motivo 5 — titolo", def: "Ambiente creativo e sicuro" },
      { key: "motivi.5.text", label: "Motivo 5 — testo", def: "Un ambiente creativo e sicuro in cui crescere ed imparare, con il rigore di un metodo e la cura di una comunità." },
    ],
  },
  {
    id: "band",
    label: "The DAF experience",
    keys: [
      { key: "band.chip1", label: "Badge immagine (alto)", def: "<strong>Master class</strong> con coreografi ospiti delle più importanti realtà internazionali" },
      { key: "band.chip2", label: "Badge immagine (basso)", def: "<span class=\"dot\"></span> Performance e sale prove aperte delle compagnie — nella porta accanto" },
      { key: "band.label", label: "Etichetta sezione", def: "The DAF experience" },
      { key: "band.title", label: "Titolo sezione", def: "Una scuola nata<br /> dentro un palcoscenico." },
      { key: "band.p1", label: "Paragrafo 1", def: "La caratteristica che contraddistingue il Liceo Coreutico DAF è il luogo in cui nasce: il liceo coabita con il DAF, Centro Internazionale che da oltre quindici anni ridisegna in Italia i confini della formazione del giovane danzatore." },
      { key: "band.li1", label: "Elenco 1", def: "Master class con coreografi ospiti internazionali" },
      { key: "band.li2", label: "Elenco 2", def: "Creazioni coreografiche dedicate, a integrazione del piano di studi" },
      { key: "band.li3", label: "Elenco 3", def: "Workshop e laboratori complementari al percorso liceale" },
      { key: "band.li4", label: "Elenco 4", def: "Performance e sale prove aperte delle compagnie professionali — <em>realmente \"nella porta accanto\"</em>" },
      { key: "band.p2", label: "Paragrafo 2", def: "Una comunità artistica internazionale che apre ai propri studenti un canale preferenziale verso teatri e compagnie di tutto il mondo." },
      { key: "band.more", label: "Link in fondo", def: "Progetto educativo <i>→</i>" },
    ],
  },
  {
    id: "liceo",
    label: "Cos'è il liceo",
    keys: [
      { key: "liceo.label", label: "Etichetta sezione", def: "Cos'è il liceo" },
      { key: "liceo.title", label: "Titolo sezione", def: "Il liceo che danza." },
      { key: "liceo.p1", label: "Paragrafo", def: "Il Liceo Coreutico DAF è una scuola superiore quinquennale paritaria: materie umanistiche e scientifiche sullo stampo liceale, insieme al linguaggio coreutico — composizione, interpretazione ed esecuzione. Un'innovativa \"contaminazione\" che rende la danza disciplina istituzionale di valore formativo e culturale." },
      { key: "liceo.num1.v", label: "Numero 1", def: "32" },
      { key: "liceo.num1.l", label: "Didascalia numero 1", def: "ore settimanali,<br />tutti e 5 gli anni" },
      { key: "liceo.num2.v", label: "Numero 2", def: "462" },
      { key: "liceo.num2.l", label: "Didascalia numero 2", def: "ore di danza<br />in tutto il percorso" },
      { key: "liceo.num3.v", label: "Numero 3", def: "2" },
      { key: "liceo.num3.l", label: "Didascalia numero 3", def: "indirizzi: classica<br />o contemporanea" },
      { key: "liceo.num4.v", label: "Numero 4", def: "2009" },
      { key: "liceo.num4.l", label: "Didascalia numero 4", def: "da quando DAF<br />forma nuovi danzatori" },
      { key: "liceo.note", label: "Nota sotto i numeri", def: "Al termine del secondo anno, dopo la verifica per la certificazione delle competenze coreutiche prevista dalla convenzione, gli studenti scelgono l'indirizzo da seguire: <strong>danza classica</strong> o <strong>danza contemporanea</strong>." },
    ],
  },
  {
    id: "faq",
    label: "Domande frequenti",
    keys: [
      { key: "faq.label", label: "Etichetta sezione", def: "Domande frequenti" },
      { key: "faq.title", label: "Titolo sezione", def: "Vieni a conoscerci!" },
      { key: "faq.q1", label: "Domanda 1", def: "Cos'è il Liceo Coreutico DAF?" },
      { key: "faq.a1", label: "Risposta 1", def: "È una scuola superiore di secondo grado quinquennale strutturata per fornire una solida preparazione di base sullo stampo liceale — materie umanistiche e scientifiche — consentendo però anche di conseguire un riconoscimento nel campo dell'arte della danza: padronanza del linguaggio coreutico, della sua composizione, interpretazione ed esecuzione." },
      { key: "faq.q2", label: "Domanda 2", def: "Perché il Liceo Coreutico DAF è diverso?" },
      { key: "faq.a2", label: "Risposta 2", def: "Per il luogo in cui nasce: coabita con il DAF, Centro Internazionale di perfezionamento e formazione nella danza. Oltre al piano di lezioni, gli studenti accedono a master class con coreografi ospiti delle più importanti realtà internazionali, creazioni coreografiche dedicate, workshop e laboratori — e alla possibilità di assistere, o farne parte, a performance e sale prove aperte di compagnie professionali: realmente \"nella porta accanto\"." },
      { key: "faq.q3", label: "Domanda 3", def: "Posso entrare a qualsiasi anno del liceo?" },
      { key: "faq.a3", label: "Risposta 3", def: "Sì: la selezione è aperta anche agli studenti che volessero iscriversi alle classi 2ª, 3ª, 4ª e 5ª del Liceo Coreutico — e anche a chi ha già presentato domanda di iscrizione presso altre scuole. La possibilità di sostenere l'esame è subordinata alla presentazione di una richiesta presso la segreteria didattica." },
      { key: "faq.q4", label: "Domanda 4", def: "Che cos'è DAF?" },
      { key: "faq.a4", label: "Risposta 4", def: "DAF è un Centro Internazionale per il Perfezionamento e la Formazione nella danza, nato nel 2009. Ospita progetti di qualificati organismi culturali e organizza eventi e iniziative didattiche di settore in tutto il territorio nazionale: una grande comunità artistica internazionale che offre ai propri studenti un canale preferenziale per l'accesso a teatri e compagnie di tutto il mondo." },
    ],
  },
  {
    id: "amm",
    label: "Ammissioni",
    keys: [
      { key: "amm.label", label: "Etichetta sezione", def: "Ammissioni" },
      { key: "amm.title", label: "Titolo sezione", def: "Vuoi cambiare scuola<br /> e passare al Coreutico?" },
      { key: "amm.p1", label: "Paragrafo", def: "La selezione è aperta anche a chi ha presentato domanda di iscrizione presso altre scuole: ti scrivi alla segreteria didattica e organizziamo l'incontro per la prova." },
      { key: "amm.cta", label: "Bottone", def: "Prenota la prova di ammissione" },
      { key: "amm.more", label: "Link in fondo", def: "Pagina ammissioni <i>→</i>" },
      { key: "amm.chip", label: "Badge flottante", def: "Anche da altre scuole, a ogni anno di corso" },
    ],
  },
  {
    id: "dove",
    label: "Dove siamo",
    keys: [
      { key: "dove.label", label: "Etichetta sezione", def: "Dove siamo" },
      { key: "dove.title", label: "Titolo sezione", def: "Vieni a trovarci" },
      { key: "dove.p1", label: "Paragrafo", def: "Il Liceo Coreutico DAF è a Roma, in Via di Pietralata 159A: un'ex fabbrica trasformata in campus culturale — sale prove, teatri, spazi di studio. Vieni a conoscere la sede durante l'open day." },
      { key: "dove.card.title", label: "Card indirizzo — titolo", def: "Dance Arts Faculty — Liceo Coreutico" },
      { key: "dove.card.addr", label: "Card indirizzo — testo", def: "Via di Pietralata 159A, 00158 Roma" },
      { key: "dove.maplink", label: "Link mappa", def: "Apri in Google Maps ↗" },
    ],
  },
  {
    id: "prenota",
    label: "Form prenotazione",
    keys: [
      { key: "prenota.label", label: "Etichetta sezione", def: "Prenota" },
      { key: "prenota.title", label: "Titolo sezione", def: "Scegli la data, ti aspettiamo." },
      { key: "prenota.intro", label: "Introduzione", def: "Lascia i tuoi recapiti: la segreteria didattica confermerà la prenotazione via email." },
      { key: "form.nome", label: "Etichetta campo — nome", def: "Nome e cognome *" },
      { key: "form.email", label: "Etichetta campo — email", def: "Email *" },
      { key: "form.tel", label: "Etichetta campo — telefono", def: "Telefono <span class=\"opt\">(opzionale)</span>" },
      { key: "form.data", label: "Etichetta campo — data", def: "Data open day *" },
      { key: "form.anno", label: "Etichetta campo — anno", def: "Anno di iscrizione" },
      { key: "form.note", label: "Etichetta campo — note", def: "Note <span class=\"opt\">(opzionale)</span>" },
      { key: "form.err.nome", label: "Messaggio errore — nome", def: "Inserisci nome e cognome." },
      { key: "form.err.email", label: "Messaggio errore — email", def: "Inserisci un'email valida." },
      { key: "form.err.data", label: "Messaggio errore — data", def: "Scegli una delle tre date." },
      { key: "form.submit", label: "Bottone invio", def: "Prenota l'open day" },
      { key: "form.privacy", label: "Nota privacy", def: "Inviando la richiesta autorizzi la segreteria didattica a contattarti per la prenotazione." },
      { key: "form.done.title", label: "Conferma — titolo", def: "La tua richiesta è pronta." },
      { key: "form.done.p1", label: "Conferma — testo", def: "Ti abbiamo aperto l'email di prenotazione, già compilata con i tuoi dati: controlla e premi <strong>invia</strong> per completare la prenotazione." },
      { key: "form.done.alt1", label: "Conferma — frase 1", def: "Se il client di posta non si è aperto, scrivi direttamente a" },
      { key: "form.done.alt2", label: "Conferma — frase 2", def: "oppure copia l'indirizzo:" },
    ],
  },
  {
    id: "footer",
    label: "Footer",
    keys: [
      { key: "footer.bar1", label: "Barra footer — copyright", def: "© DAF 2026 — Liceo Coreutico, scuola paritaria · RMSL3M5001" },
      { key: "footer.bar2", label: "Barra footer — crediti", def: "Foto: Cristiano Castaldi · Pagine & Movie" },
    ],
  },
  {
    id: "mcta",
    label: "CTA mobile",
    keys: [
      { key: "mcta.text", label: "Testo barra mobile", def: "Open Day 2026/27 — ingresso gratuito" },
      { key: "mcta.cta", label: "Bottone barra mobile", def: "Prenota il posto" },
    ],
  },
];

const DEFAULTS = Object.create(null);
for (const section of SECTIONS) {
  for (const k of section.keys) DEFAULTS[k.key] = k.def;
}

module.exports = { SECTIONS, DEFAULTS };
