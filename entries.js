/* =========================================================
   Entries pages
   - batch-2025.html / batch-2026.html : the innovation question, then the sector tiles for that year
     (the page says which year with data-year on its <body>; the old sectors.html?year=2025 now just redirects there)
   - sector.html   : the entries of one sector          (sector.html?year=2025&sector=education)
                     or one entry (the chat assistant's links): sector.html?year=2025&entry=<name-made-from-the-title>
   The text and videos come from data/entries-YEAR.js — edit those files, not this one.
   ========================================================= */
(function () {
  "use strict";

  var DATA = window.NEXTGEN_DATA || {};
  var params = new URLSearchParams(window.location.search);
  var year = (document.body.getAttribute("data-year") || params.get("year") || "2025").replace(/[^0-9]/g, "") || "2025";
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
  function batchUrl() { return "batch-" + encodeURIComponent(year) + ".html"; }
  function sectorsUrl() { return batchUrl() + "#sectors"; }
  function sectorUrl(id) { return batchUrl() + "?sector=" + encodeURIComponent(id) + "#entries"; }
  // Tile pictures are looked for in images/sectors/ first, then in images/ (where the old site kept them)
  function artUrls(file) { return ["images/sectors/" + encodeURI(file), "images/" + encodeURI(file)]; }
  function entriesFor(sectorId) {
    return entries.filter(function (e) {
      return e.sectors.indexOf("all") !== -1 || e.sectors.indexOf(sectorId) !== -1;
    });
  }
  function soonText() { return "Entries for " + year + " will be added soon."; }
  // A year with one sector (2026: Energy) shows just that one tile.
  var singleSector = sectors.length === 1;

  /* ---------------------------------------------------------
     Sectors page
  --------------------------------------------------------- */
  function renderSectorsPage(grid) {
    var label = byId("yearLabel");
    var msg = byId("soonMsg");
    if (label) label.textContent = "NextGenPH " + year;

    if (!yearData || !hasEntries) {
      if (msg) {
        msg.textContent = yearData ? soonText() : "We couldn\u2019t find the entries for that year.";
        msg.hidden = false;
      }
      grid.hidden = true;
      return;
    }

    if (singleSector) addClass(grid, "is-single");   // one tile: centre it
    sectors.forEach(function (s) {
      var item = make("li");
      var link = make("a", "sector-tile");
      link.href = sectorUrl(s.id);   // without JavaScript this reloads the page with the sector chosen
      link.addEventListener("click", function (ev) {   // with JavaScript the entries open below the tiles, no reload
        if (ev.defaultPrevented || ev.button > 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
        if (window.NextGenEntries && window.NextGenEntries.openSector(s.id)) ev.preventDefault();
      });
      var art = make("span", "sector-tile-art");
      art.setAttribute("aria-hidden", "true");
      link.setAttribute("data-sector", s.id);
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

  /* ---------------------------------------------------------
     Entries of a sector, shown on the batch page itself (below the sector tiles)
  --------------------------------------------------------- */
  function renderEntriesView(list) {
    var section = byId("entries");
    var tilesSection = byId("sectors");
    var heading = byId("sector-heading");
    var eyebrow = byId("sectorEyebrow");
    var tools = byId("entryTools");
    var pageMsg = byId("pageMsg");
    var chips = byId("chips");
    var input = byId("entrySearch");
    var label = byId("searchLabel");
    var count = byId("resultCount");
    var noMatch = byId("noMatch");
    var logo = byId("sectorLogo");
    var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var cards = [];
    var current = null;
    var targetCard = null;
    if (eyebrow) eyebrow.textContent = "NextGenPH " + year;

    function scrollToNode(node) {
      if (node && node.scrollIntoView) node.scrollIntoView({ block: "start", behavior: calm ? "auto" : "smooth" });
    }

    // Every collapsed card gets the same height, and "Read more" appears only on the cards whose
    // text is cut off. An expanded card grows on its own; the others keep their height.
    function isClipped(node) { return !!node && node.scrollHeight > node.clientHeight + 1; }
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

    // Search: filters the cards as you type
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
      else if (shown === 0) count.textContent = "No entries match “" + input.value.trim() + "”.";
      else count.textContent = "Showing " + shown + " of " + total + (total === 1 ? " entry" : " entries");
      noMatch.hidden = shown !== 0 || !query;
    }
    input.addEventListener("input", function () {
      if (targetCard) { removeClass(targetCard.item, "is-target"); targetCard = null; }   // searching ends the highlight
      applyFilter();
      updateLayout();
    });
    byId("searchForm").addEventListener("submit", function (ev) { ev.preventDefault(); });

    // Heights depend on the fonts and the screen width, so measure again when those settle or change
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(updateLayout);
    window.addEventListener("load", updateLayout);
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateLayout, 150);
    });

    // Sector switcher inside the entries area (only when the year has several sectors)
    var chipLinks = [];
    if (singleSector) chips.hidden = true;
    else {
      chips.hidden = false;
      sectors.forEach(function (s) {
        var chip = make("a", "chip", s.name);
        chip.href = sectorUrl(s.id);
        chip.addEventListener("click", function (ev) {
          if (ev.defaultPrevented || ev.button > 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
          ev.preventDefault();
          showSector(s, { push: true, scroll: false });
        });
        chip.setAttribute("data-sector", s.id);
        chips.appendChild(chip);
        chipLinks.push(chip);
      });
    }

    function markCurrent(id) {
      var all = Array.prototype.slice.call(document.querySelectorAll("#sectorGrid a, #chips a"));
      all.forEach(function (a) {
        if (a.getAttribute("data-sector") === id) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
      if (tilesSection) { if (id) addClass(tilesSection, "is-open"); else removeClass(tilesSection, "is-open"); }
    }

    function loadLogo(sector) {
      if (!logo) return;
      logo.hidden = true;
      removeClass(heading, "visually-hidden");
      if (!sector.art) return;
      (function tryLogo(urls) {
        if (!urls.length) return;
        var probe = new Image();
        probe.onload = function () {
          if (current !== sector) return;
          logo.src = urls[0]; logo.alt = sector.name; logo.hidden = false;
          addClass(heading, "visually-hidden");   // the picture carries the name; screen readers still get the heading
        };
        probe.onerror = function () { tryLogo(urls.slice(1)); };
        probe.src = urls[0];
      })(artUrls(sector.art));
    }

    // Show one sector's entries. o.entrySlug: open and highlight that entry. o.scroll: move the page to the entries.
    // o.push: add a browser history step and update the address (batch-2025.html?sector=education).
    function showSector(sector, o) {
      o = o || {};
      current = sector;
      targetCard = null;
      while (list.firstChild) list.removeChild(list.firstChild);
      input.value = "";
      section.hidden = false;
      tools.hidden = false;
      pageMsg.hidden = true;
      heading.textContent = sector.name;
      loadLogo(sector);
      input.placeholder = "Search entries in " + sector.name + "…";
      label.textContent = "Search entries in " + sector.name;
      markCurrent(sector.id);
      document.title = sector.name + " — NextGenPH " + year + " entries" + TITLE_SUFFIX;

      cards = entriesFor(sector.id).map(function (e) { return buildCard(e, updateLayout); });
      cards.forEach(function (c) { list.appendChild(c.item); });
      if (o.entrySlug) for (var c = 0; c < cards.length; c++) if (cards[c].slug === o.entrySlug) targetCard = cards[c];
      applyFilter();
      updateLayout();

      if (o.push && window.history && history.pushState) {
        var url = batchUrl() + "?sector=" + encodeURIComponent(sector.id) + (o.entrySlug ? "&entry=" + encodeURIComponent(o.entrySlug) : "");
        try { history.pushState({ sector: sector.id }, "", url); } catch (err) { /* opened from a file: keep the old address */ }
      }

      if (targetCard) {
        // A link to one entry: open it, mark it, move keyboard / screen-reader focus to it, scroll to it
        var t = targetCard;
        setExpanded(t, true);
        addClass(t.item, "is-target");
        updateLayout();
        document.title = t.titleText + " — " + sector.name + " — NextGenPH " + year + TITLE_SUFFIX;
        var reveal = function () {
          t.title.tabIndex = -1;
          if (t.title.focus) t.title.focus({ preventScroll: true });
          scrollToNode(t.item);
        };
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(reveal); else reveal();
        window.addEventListener("load", function () {   // images finishing can shift the page a little: settle on the entry
          if (t.item.scrollIntoView) t.item.scrollIntoView({ block: "start", behavior: "auto" });
        });
      } else if (o.scroll) {
        heading.tabIndex = -1;
        if (heading.focus) heading.focus({ preventScroll: true });
        scrollToNode(section);
      }
    }

    function hideEntries() {
      current = null; targetCard = null; cards = [];
      while (list.firstChild) list.removeChild(list.firstChild);
      section.hidden = true;
      markCurrent("");
    }

    function sectorOf(id) {
      for (var i = 0; i < sectors.length; i++) if (sectors[i].id === id) return sectors[i];
      return null;
    }
    function entryBySlug(slug) {
      for (var k = 0; k < entries.length; k++) if (slugOf(entries[k].title) === slug) return entries[k];
      return null;
    }
    // The sector that holds an entry (an entry shown under every sector stays in the sector asked for, or the first one)
    function sectorForEntry(entry, preferred) {
      if (preferred && entriesFor(preferred.id).indexOf(entry) !== -1) return preferred;
      for (var j = 0; j < sectors.length; j++) if (entry.sectors.indexOf(sectors[j].id) !== -1) return sectors[j];
      return preferred || sectors[0] || null;
    }

    // Used by the sector tiles and by the chat assistant's links, so nothing reloads
    window.NextGenEntries = {
      year: year,
      openSector: function (id) {
        var s = sectorOf(id);
        if (!s || !hasEntries) return false;
        showSector(s, { push: true, scroll: true });
        return true;
      },
      openEntry: function (slug) {
        var entry = entryBySlug(String(slug || "").toLowerCase().replace(/[^a-z0-9-]/g, ""));
        if (!entry) return false;
        var s = sectorForEntry(entry, current);
        if (!s) return false;
        showSector(s, { entrySlug: slugOf(entry.title), push: true });
        return true;
      }
    };

    // Browser Back / Forward between the sectors
    window.addEventListener("popstate", function () {
      var p = new URLSearchParams(window.location.search);
      var s = sectorOf(p.get("sector") || "");
      var slug = (p.get("entry") || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (s) showSector(s, { entrySlug: slug, scroll: !slug });
      else if (!singleSector) hideEntries();
    });

    // First load
    if (!hasEntries) {
      if (singleSector) {   // nothing to show yet, and no tiles above: say so here
        heading.textContent = sectors[0].name;
        tools.hidden = true;
        pageMsg.textContent = soonText();
        pageMsg.hidden = false;
      }
      return;
    }
    var wantedSlug = (params.get("entry") || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
    var wantedEntry = wantedSlug ? entryBySlug(wantedSlug) : null;
    var start = sectorOf(params.get("sector") || "");
    if (wantedEntry) {
      showSector(sectorForEntry(wantedEntry, start), { entrySlug: wantedSlug });
    } else if (start) {
      showSector(start, { scroll: true });
    } else if (singleSector) {
      showSector(sectors[0], {});
    } else {
      section.hidden = true;   // several sectors: the entries appear once one is chosen
    }
  }

  // The old standalone sector.html: every year with entries now shows them on its batch page.
  function renderOldSectorPage() {
    var heading = byId("sector-heading");
    var back = byId("backLink");
    var tools = byId("entryTools");
    var pageMsg = byId("pageMsg");
    if (yearData) {
      var qs = [];
      if (params.get("sector")) qs.push("sector=" + encodeURIComponent(params.get("sector")));
      if (params.get("entry")) qs.push("entry=" + encodeURIComponent(params.get("entry")));
      window.location.replace(batchUrl() + (qs.length ? "?" + qs.join("&") : "#entries"));
      return;
    }
    document.title = "Year not found — NextGenPH" + TITLE_SUFFIX;
    heading.textContent = "Year not found";
    tools.hidden = true;
    pageMsg.textContent = "We couldn’t find the entries for that year.";
    pageMsg.hidden = false;
    if (back) { back.href = "index.html"; back.textContent = "← Back to home"; }
  }

  var grid = byId("sectorGrid");
  if (grid) renderSectorsPage(grid);
  var list = byId("entryGrid");
  if (list) {
    if (hasClass(document.body, "page-batch")) renderEntriesView(list);
    else renderOldSectorPage();
  }
})();
