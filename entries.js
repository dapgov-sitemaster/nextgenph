/* =========================================================
   Entries pages
   - sectors.html  : the sector tiles for a year        (sectors.html?year=2025)
   - sector.html   : the entries of one sector          (sector.html?year=2025&sector=education)
                     or one entry (the chat assistant's links): sector.html?year=2025&entry=<name-made-from-the-title>
   The text and videos come from data/entries-YEAR.js — edit those files, not this one.
   ========================================================= */
(function () {
  "use strict";

  var DATA = window.NEXTGEN_DATA || {};
  var params = new URLSearchParams(window.location.search);
  var year = (params.get("year") || "2025").replace(/[^0-9]/g, "") || "2025";
  var yearData = DATA[year] || null;
  var sectors = (yearData && yearData.sectors) || [];
  var entries = (yearData && yearData.entries) || [];
  var hasEntries = entries.length > 0;

  var TITLE_SUFFIX = " | Development Academy of the Philippines";

  function make(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function byId(id) { return document.getElementById(id); }

  // Text pasted from Word, Sheets or the web often carries invisible characters. Remove them,
  // and tidy extra spaces, so cards and search always see clean text.
  var INVISIBLE = /[\u200B\u200C\u200D\u2060\uFEFF]/g;
  function clean(text) { return String(text == null ? "" : text).replace(INVISIBLE, "").replace(/\s+/g, " ").trim(); }
  function paragraphsOf(text) {   // a new line in the description starts a new paragraph
    return String(text == null ? "" : text).replace(INVISIBLE, "").split(/\r?\n/)
      .map(function (p) { return p.replace(/\s+/g, " ").trim(); })
      .filter(function (p) { return p.length > 0; });
  }
  var VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;   // a real YouTube code, not the "YouTubeVideoID" placeholder
  function hasClass(node, name) { return (" " + node.className + " ").indexOf(" " + name + " ") !== -1; }
  function addClass(node, name) { if (!hasClass(node, name)) node.className = (node.className + " " + name).trim(); }
  function removeClass(node, name) { node.className = (" " + node.className + " ").replace(" " + name + " ", " ").trim(); }
  // A short address-friendly name made from an entry's title. The chat server (chat.py) makes exactly the same
  // name from the Sheet, so a link like sector.html?year=2025&entry=senyas-sign-language... finds the entry.
  // If you change this, change entry_slug() in chat.py in the same way.
  function slugOf(title) {
    var s = String(title == null ? "" : title).replace(INVISIBLE, "");
    if (s.normalize) s = s.normalize("NFKD");
    return s.toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function sectorsUrl() { return "sectors.html?year=" + encodeURIComponent(year); }
  function sectorUrl(id) { return "sector.html?year=" + encodeURIComponent(year) + "&sector=" + encodeURIComponent(id); }
  // Tile pictures are looked for in images/sectors/ first, then in images/ (where the old site kept them)
  function artUrls(file) { return ["images/sectors/" + encodeURI(file), "images/" + encodeURI(file)]; }
  function entriesFor(sectorId) {
    return entries.filter(function (e) {
      return e.sectors.indexOf("all") !== -1 || e.sectors.indexOf(sectorId) !== -1;
    });
  }
  function soonText() { return "Entries for " + year + " will be added soon."; }
  // A year with one sector (2026: Energy) has no sector list to choose from.
  var singleSector = sectors.length === 1;

  /* ---------------------------------------------------------
     Sectors page
  --------------------------------------------------------- */
  function renderSectorsPage(grid) {
    var label = byId("yearLabel");
    var msg = byId("soonMsg");
    if (label) label.textContent = "NextGenPH " + year;
    document.title = "Choose a sector — NextGenPH " + year + TITLE_SUFFIX;

    if (!yearData || !hasEntries) {
      if (msg) {
        msg.textContent = yearData ? soonText() : "We couldn\u2019t find the entries for that year.";
        msg.hidden = false;
      }
      grid.hidden = true;
      return;
    }

    // Only one sector: skip the tile page and open its entries directly.
    if (singleSector) {
      window.location.replace(sectorUrl(sectors[0].id));
      return;
    }

    sectors.forEach(function (s) {
      var item = make("li");
      var link = make("a", "sector-tile");
      link.href = sectorUrl(s.id);
      var art = make("span", "sector-tile-art");
      art.setAttribute("aria-hidden", "true");
      var name = make("span", "sector-tile-name", s.name);
      link.appendChild(art);
      link.appendChild(name);
      item.appendChild(link);
      grid.appendChild(item);

      // Use your tile picture if it exists, otherwise keep the text tile.
      if (s.art) {
        (function tryPicture(urls) {
          if (!urls.length) return;
          var probe = new Image();
          probe.onload = function () {
            art.style.backgroundImage = 'url("' + urls[0] + '")';
            link.className += " has-art";
          };
          probe.onerror = function () { tryPicture(urls.slice(1)); };
          probe.src = urls[0];
        })(artUrls(s.art));
      }
    });
  }

  /* ---------------------------------------------------------
     Sector (category) page
  --------------------------------------------------------- */
  function playVideo(media, entry) {
    var frame = document.createElement("iframe");
    frame.className = "entry-frame";
    frame.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(entry.video) + "?autoplay=1&rel=0";
    frame.title = "Video: " + entry.title;
    frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    frame.setAttribute("allowfullscreen", "");
    frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    while (media.firstChild) media.removeChild(media.firstChild);
    media.appendChild(frame);
    frame.focus();
  }

  function setExpanded(card, open) {
    card.expanded = open;
    if (open) addClass(card.inner, "is-expanded"); else removeClass(card.inner, "is-expanded");
    card.short.hidden = open;      // the cut-off version
    card.full.hidden = !open;      // the whole text, in paragraphs
    card.more.textContent = open ? "Show less" : "Read more";
    card.more.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function buildCard(entry, onToggle) {
    var title = clean(entry.title);
    var school = clean(entry.school);
    var paras = paragraphsOf(entry.description);
    var hasVideo = VIDEO_ID.test(String(entry.video || ""));

    var item = make("li", "entry-card");
    var inner = make("article", "entry-card-inner");

    // Video: a thumbnail you click to play, or "Video coming soon" while there is no real video code
    var media = make("div", "entry-media");
    if (hasVideo) {
      var play = make("button", "entry-play");
      play.type = "button";
      play.setAttribute("aria-label", "Play video: " + title);
      var thumb = make("img");
      thumb.alt = "";
      thumb.loading = "lazy";
      thumb.decoding = "async";
      thumb.src = "https://i.ytimg.com/vi/" + encodeURIComponent(entry.video) + "/hqdefault.jpg";
      thumb.onerror = function () { thumb.style.display = "none"; };
      var icon = make("span", "entry-play-icon");
      icon.setAttribute("aria-hidden", "true");
      play.appendChild(thumb);
      play.appendChild(icon);
      media.appendChild(play);
      play.addEventListener("click", function () { playVideo(media, { title: title, video: entry.video }); });
    } else {
      var soon = make("div", "entry-media-soon");
      soon.appendChild(make("span", "entry-media-soon-text", "Video coming soon"));
      media.appendChild(soon);
    }

    var body = make("div", "entry-body");
    var titleEl = make("h2", "entry-title", title);
    var schoolEl = school ? make("p", "entry-school", school) : null;
    var short = make("p", "entry-desc entry-desc-short", paras.join(" "));   // one block, cut off after a few lines
    var full = make("div", "entry-desc entry-desc-full");                    // the same text in paragraphs
    full.hidden = true;
    paras.forEach(function (p) { full.appendChild(make("p", "", p)); });

    var actions = make("div", "entry-actions");
    var more = make("button", "entry-more", "Read more");
    more.type = "button";
    more.hidden = true;               // shown only when the text is actually cut off
    more.setAttribute("aria-expanded", "false");
    actions.appendChild(more);
    if (hasVideo) {
      var yt = make("a", "entry-yt", "Watch on YouTube");
      yt.href = "https://www.youtube.com/watch?v=" + encodeURIComponent(entry.video);
      yt.target = "_blank";
      yt.rel = "noopener noreferrer";
      yt.appendChild(make("span", "visually-hidden", " (opens in a new tab)"));
      actions.appendChild(yt);
    }

    body.appendChild(titleEl);
    if (schoolEl) body.appendChild(schoolEl);
    body.appendChild(short);
    body.appendChild(full);
    body.appendChild(actions);
    inner.appendChild(media);
    inner.appendChild(body);
    item.appendChild(inner);

    var card = {
      item: item, inner: inner, title: titleEl, school: schoolEl, short: short, full: full, more: more,
      slug: slugOf(title), titleText: title,
      expanded: false, hasVideo: hasVideo,
      text: (title + " " + school + " " + paras.join(" ")).toLowerCase()
    };
    more.addEventListener("click", function () { setExpanded(card, !card.expanded); onToggle(); });
    return card;
  }

  function renderSectorPage(list) {
    var sectorId = params.get("sector") || "";
    var wantedEntry = (params.get("entry") || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
    var targetEntry = null;
    if (wantedEntry) for (var k = 0; k < entries.length; k++) if (slugOf(entries[k].title) === wantedEntry) { targetEntry = entries[k]; break; }
    var sector = null;
    for (var i = 0; i < sectors.length; i++) if (sectors[i].id === sectorId) sector = sectors[i];
    // A link to one entry (for example from the chat assistant) names the entry, not the sector:
    // open the sector that holds it. An entry shown under every sector stays in the sector asked for, or the first one.
    if (targetEntry && (!sector || entriesFor(sector.id).indexOf(targetEntry) === -1)) {
      var home = null;
      for (var j = 0; j < sectors.length && !home; j++) if (targetEntry.sectors.indexOf(sectors[j].id) !== -1) home = sectors[j];
      sector = home || sector || sectors[0] || null;
    }

    var heading = byId("sector-heading");
    var eyebrow = byId("sectorEyebrow");
    var back = byId("backLink");
    var tools = byId("entryTools");
    var pageMsg = byId("pageMsg");
    if (eyebrow) eyebrow.textContent = "NextGenPH " + year;
    if (back) {
      if (singleSector) { back.href = "years.html"; back.textContent = "\u2190 Choose a year"; }  // no sector list to go back to
      else back.href = sectorsUrl();
    }

    function showMessage(headingText, text) {
      heading.textContent = headingText;
      tools.hidden = true;
      pageMsg.textContent = text;
      pageMsg.hidden = false;
    }

    if (!yearData) {
      document.title = "Year not found — NextGenPH" + TITLE_SUFFIX;
      showMessage("Year not found", "We couldn\u2019t find the entries for that year.");
      if (back) { back.href = "years.html"; back.textContent = "\u2190 Choose a year"; }
      return;
    }
    if (!sector) {
      document.title = (wantedEntry ? "Entry" : "Sector") + " not found — NextGenPH " + year + TITLE_SUFFIX;
      if (wantedEntry) showMessage("Entry not found", "We couldn\u2019t find that entry. Please go back and choose a sector.");
      else showMessage("Sector not found", "We couldn\u2019t find that sector. Please go back and choose one.");
      return;
    }
    heading.textContent = sector.name;
    document.title = sector.name + " — NextGenPH " + year + " entries" + TITLE_SUFFIX;
    if (!hasEntries) { showMessage(sector.name, soonText()); return; }

    // Sector switcher (not needed when the year has only one sector)
    var chips = byId("chips");
    var active = null;
    if (singleSector) chips.hidden = true;
    else sectors.forEach(function (s) {
      var chip = make("a", "chip", s.name);
      chip.href = sectorUrl(s.id);
      if (s.id === sector.id) { chip.setAttribute("aria-current", "page"); active = chip; }
      chips.appendChild(chip);
    });
    if (active) chips.scrollLeft = Math.max(0, active.offsetLeft - (chips.clientWidth - active.offsetWidth) / 2);

    // Entry cards
    var cards = [];
    function isClipped(node) { return !!node && node.scrollHeight > node.clientHeight + 1; }
    // Every collapsed card gets the same height, and "Read more" appears only on the cards whose
    // text is cut off. An expanded card grows on its own; the others keep their height.
    function updateLayout() {
      cards.forEach(function (c) { c.inner.style.minHeight = ""; });
      cards.forEach(function (c) {
        if (c.item.hidden || c.expanded) return;
        c.more.hidden = !(isClipped(c.title) || isClipped(c.school) || isClipped(c.short));
      });
      var tallest = 0;
      cards.forEach(function (c) {
        if (!c.item.hidden && !c.expanded) tallest = Math.max(tallest, c.inner.offsetHeight || 0);
      });
      if (tallest > 0) cards.forEach(function (c) { if (!c.item.hidden) c.inner.style.minHeight = tallest + "px"; });
    }
    cards = entriesFor(sector.id).map(function (e) { return buildCard(e, updateLayout); });
    cards.forEach(function (c) { list.appendChild(c.item); });
    var targetCard = null;
    if (targetEntry) for (var c = 0; c < cards.length; c++) if (cards[c].slug === wantedEntry) targetCard = cards[c];

    // Search: filters the cards as you type
    var input = byId("entrySearch");
    var label = byId("searchLabel");
    var count = byId("resultCount");
    var noMatch = byId("noMatch");
    input.placeholder = "Search entries in " + sector.name + "\u2026";
    label.textContent = "Search entries in " + sector.name;
    byId("searchForm").addEventListener("submit", function (ev) { ev.preventDefault(); });

    function applyFilter() {
      var query = input.value.toLowerCase().trim();
      var words = query ? query.split(/\s+/) : [];
      var shown = 0;
      cards.forEach(function (c) {
        var match = words.every(function (w) { return c.text.indexOf(w) !== -1; });
        c.item.hidden = !match;
        if (match) shown++;
      });
      var total = cards.length;
      if (!query) count.textContent = total + (total === 1 ? " entry" : " entries");
      else if (shown === 0) count.textContent = "No entries match \u201c" + input.value.trim() + "\u201d.";
      else count.textContent = "Showing " + shown + " of " + total + (total === 1 ? " entry" : " entries");
      noMatch.hidden = shown !== 0 || !query;
    }
    input.addEventListener("input", function () {
      if (targetCard) removeClass(targetCard.item, "is-target");   // searching ends the highlight
      applyFilter();
      updateLayout();
    });
    applyFilter();
    updateLayout();

    // Arrived from a link to one entry: open it, mark it, move the keyboard/screen-reader focus to it, scroll to it
    if (targetCard) {
      setExpanded(targetCard, true);
      addClass(targetCard.item, "is-target");
      updateLayout();
      document.title = targetCard.titleText + " \u2014 " + sector.name + " \u2014 NextGenPH " + year + TITLE_SUFFIX;
      var reveal = function () {
        targetCard.title.tabIndex = -1;
        if (targetCard.title.focus) targetCard.title.focus({ preventScroll: true });
        var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (targetCard.item.scrollIntoView) targetCard.item.scrollIntoView({ block: "start", behavior: calm ? "auto" : "smooth" });
      };
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(reveal); else reveal();
      window.addEventListener("load", function () {   // images finishing can shift the page a little: settle on the entry
        if (targetCard.item.scrollIntoView) targetCard.item.scrollIntoView({ block: "start", behavior: "auto" });
      });
    }

    // Heights depend on the fonts and the screen width, so measure again when those settle or change
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(updateLayout);
    window.addEventListener("load", updateLayout);
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateLayout, 150);
    });
  }

  var grid = byId("sectorGrid");
  if (grid) renderSectorsPage(grid);
  var list = byId("entryGrid");
  if (list) renderSectorPage(list);
})();