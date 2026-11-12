/* =========================================================
   NextGenPH chat widget
   The robot is the chat button. Click it (or the round button that appears when the
   robot is not on screen) to open the chat. The answers come from your chat server
   (chat.py), which reads the Google Sheet.

   SETTINGS YOU CAN EDIT: the CHAT_CONFIG block just below.
   ========================================================= */
(function () {
  "use strict";

  var CHAT_CONFIG = {
    // Address of your chat server (the /api/chat address).
    // For testing on your own computer, run the server and keep this:
    apiUrl: "https://nextgenph.dap.edu.ph/api/chat",

    title: "NextGenPH Assistant",
    welcome: "Hi! I can answer questions about NextGenPH: the contest, the sectors, and the 2025 and 2026 entries.",

    // Questions shown as tap-to-ask buttons until the visitor sends a message
    starterQuestions: [
      "What is NextGenPH?",
      "What is the Batch 2026 Innovation Question?",
      "Who are the previous winners?"
    ],

    // Small note under the message box
    notice: "AI-generated answers can be wrong. Please check official announcements. Please don't share personal information.",

    // The little speech bubble that pops out beside the robot, so visitors know it is a chatbot
    bubbleText: "Hi! Ask me anything about NextGenPH.",
    bubbleDelaySeconds: 1.5,   // first pop-in: wait this long after the robot is on screen
    bubbleEverySeconds: 10,    // it pops in again this many seconds after the last time it popped in
    bubbleVisibleSeconds: 5,   // how long it stays before popping out
    bubbleMaxPops: 6,          // pop-ins per page view, then it rests (0 = keep going). It stops for good in this
                               // browser tab once the chat has been opened, or the visitor hides it with the x or Esc.

    timeoutSeconds: 45,        // give up waiting for an answer after this long
    reactionSeconds: 2.2,      // how long the robot's thumbs-up / head shake lasts
    maxMessageLength: 2000,    // the server accepts up to 2000 characters
    storageKey: "nextgenph-chat-v1"
  };
  var CFG = CHAT_CONFIG;

  var robot = window.NextGenRobot || null;   // exists only while the 3D robot is running

  /* ---------------------------------------------------------
     Small helpers
  --------------------------------------------------------- */
  function make(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function newSessionId() {
    var bytes = "";
    try {
      var a = new Uint8Array(16);
      window.crypto.getRandomValues(a);
      for (var i = 0; i < a.length; i++) bytes += ("0" + a[i].toString(16)).slice(-2);
    } catch (err) {
      for (var j = 0; j < 32; j++) bytes += Math.floor(Math.random() * 16).toString(16);
    }
    return "w" + bytes;
  }

  /* ---------------------------------------------------------
     Chat state, kept for this browser tab only (sessionStorage),
     so the conversation continues when the visitor opens another page.
  --------------------------------------------------------- */
  var state = { sid: newSessionId(), messages: [], open: false, hintOff: false };

  function isMessage(m) { return m && (m.role === "user" || m.role === "bot") && typeof m.text === "string"; }
  (function restore() {
    try {
      var raw = window.sessionStorage.getItem(CFG.storageKey);
      if (!raw) return;
      var saved = JSON.parse(raw);
      if (!saved || !Array.isArray(saved.messages)) return;
      var sid = typeof saved.sid === "string" ? saved.sid.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64) : "";
      if (sid) state.sid = sid;
      state.messages = saved.messages.filter(isMessage).slice(-40);
      state.open = !!saved.open;
      state.hintOff = !!saved.hintOff;
    } catch (err) { /* storage unavailable: carry on without it */ }
  })();
  function save() {
    try {
      window.sessionStorage.setItem(CFG.storageKey, JSON.stringify({
        sid: state.sid, messages: state.messages.slice(-40), open: state.open,
        hintOff: state.hintOff
      }));
    } catch (err) { /* ignore */ }
  }

  /* ---------------------------------------------------------
     Turning the assistant's text into safe page content.
     Built from DOM nodes only (never innerHTML), so nothing it says can run as code.
  --------------------------------------------------------- */
  // [text](address) links, **bold**, plain web addresses and email addresses
  var INLINE = /(\[([^\]\n]+)\]\(([^()\s]+(?:\([^()\s]*\)[^()\s]*)*)\))|(\*\*[^*\n]+\*\*)|(https?:\/\/[^\s<>]+)|([A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,})/g;

  // The only addresses a link may point to: this site's own pages, or a normal web address.
  // Anything else (javascript:, data:, ...) is shown as plain text, never as a link.
  var PAGE_LINK = /^(?:sector|sectors|years|index)\.html(?:\?[A-Za-z0-9=&_%.\-]*)?$/;
  var WEB_LINK = /^https?:\/\/[^\s<>]+$/;

  // Following a link to the site: the next page opens with the chat closed (so it does not cover the entry);
  // the conversation is kept, and the visitor can reopen it with the robot.
  function onPageLinkClick(ev) {
    if (ev.defaultPrevented || ev.button > 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    state.open = false;
    save();
  }

  function makeLink(label, href) {
    var a;
    if (PAGE_LINK.test(href)) {                       // a page of this site: same tab
      a = make("a", "chat-link", label);
      a.href = href;
      a.addEventListener("click", onPageLinkClick);
      return a;
    }
    if (WEB_LINK.test(href)) {                        // somewhere else: new tab
      a = make("a", "", label);
      a.href = href; a.target = "_blank"; a.rel = "noopener noreferrer";
      a.appendChild(make("span", "visually-hidden", " (opens in a new tab)"));
      return a;
    }
    return null;
  }

  function addInline(parent, text) {
    var last = 0, m;
    INLINE.lastIndex = 0;
    while ((m = INLINE.exec(text)) !== null) {
      if (m.index > last) parent.appendChild(document.createTextNode(text.slice(last, m.index)));
      var piece = m[0], trailing = "";
      if (m[1]) {                                     // [label](address)
        parent.appendChild(makeLink(m[2], m[3]) || document.createTextNode(m[2]));
      } else if (m[4]) {                              // **bold**
        parent.appendChild(make("strong", "", piece.slice(2, -2)));
      } else if (m[5]) {                              // a plain web address
        var tail = /[.,;:!?)"'\]]+$/.exec(piece);        // punctuation after a link belongs to the sentence
        if (tail) { trailing = tail[0]; piece = piece.slice(0, piece.length - trailing.length); }
        parent.appendChild(makeLink(piece, piece) || document.createTextNode(piece));
        if (trailing) parent.appendChild(document.createTextNode(trailing));
      } else {                                        // an email address
        var mail = make("a", "", piece);
        mail.href = "mailto:" + piece;
        parent.appendChild(mail);
      }
      last = m.index + m[0].length;
    }
    if (last < text.length) parent.appendChild(document.createTextNode(text.slice(last)));
  }

  var LIST_ITEM = /^\s*([-*\u2022]|\d+[.)])\s+/;
  function renderRich(container, text) {
    String(text).replace(/\r/g, "").split(/\n{2,}/).forEach(function (block) {
      var lines = block.split("\n").filter(function (l) { return l.trim().length > 0; });
      var para = [], list = [];
      function flushPara() {
        if (!para.length) return;
        var p = make("p");
        para.forEach(function (l, i) {
          if (i) p.appendChild(make("br"));
          addInline(p, l.trim());
        });
        container.appendChild(p);
        para = [];
      }
      function flushList() {
        if (!list.length) return;
        var ul = make(/^\s*\d/.test(list[0]) ? "ol" : "ul", "chat-list");
        list.forEach(function (l) {
          var li = make("li");
          addInline(li, l.replace(LIST_ITEM, ""));
          ul.appendChild(li);
        });
        container.appendChild(ul);
        list = [];
      }
      // An intro line followed straight away by bullet lines is common: split the block into runs
      lines.forEach(function (l) {
        if (LIST_ITEM.test(l)) { flushPara(); list.push(l); } else { flushList(); para.push(l); }
      });
      flushPara();
      flushList();
    });
  }

  /* ---------------------------------------------------------
     Building the widget
  --------------------------------------------------------- */
  var ICON_CHAT = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3 20.5v-17L22 12 3 20.5zm2-3.4L16.5 12 5 6.9v3.6l7 1.5-7 1.5v3.6z"/></svg>';

  // The robot's click area: an invisible button the robot's page code keeps over the robot
  var robotButton = make("button", "chat-robot-hit");
  robotButton.type = "button";
  robotButton.id = "ngChatRobot";
  robotButton.hidden = true;
  robotButton.title = "Chat with the NextGenPH assistant";
  robotButton.setAttribute("aria-label", "Chat with the NextGenPH assistant");
  robotButton.setAttribute("aria-controls", "ngChatPanel");
  robotButton.setAttribute("aria-expanded", "false");

  // The round button shown when the robot is not on screen (or the 3D robot is switched off)
  var launcher = make("button", "chat-launcher");
  launcher.type = "button";
  launcher.id = "ngChatLauncher";
  launcher.hidden = true;
  launcher.innerHTML = ICON_CHAT;
  launcher.setAttribute("aria-label", "Chat with the NextGenPH assistant");
  launcher.setAttribute("aria-controls", "ngChatPanel");
  launcher.setAttribute("aria-expanded", "false");

  // The speech bubble that pops out beside the robot (a visual hint only: the robot's own button
  // already has a proper name for screen readers and the keyboard, so this is hidden from them)
  var hint = make("div", "chat-hint");
  hint.hidden = true;
  hint.setAttribute("aria-hidden", "true");
  hint.appendChild(make("div", "chat-hint-body", CFG.bubbleText));
  var hintX = make("span", "chat-hint-x");     // the little x that hides the bubble (the x itself is drawn by the stylesheet)
  hint.appendChild(hintX);

  // The chat panel
  var panel = make("section", "chat-panel");
  panel.id = "ngChatPanel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "false");
  panel.setAttribute("aria-labelledby", "ngChatTitle");

  var head = make("div", "chat-head");
  var title = make("h2", "chat-title", CFG.title);
  title.id = "ngChatTitle";
  var newChat = make("button", "chat-head-btn", "New chat");
  newChat.type = "button";
  var closeBtn = make("button", "chat-head-btn chat-close");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Close chat");
  closeBtn.textContent = "\u00D7";
  head.appendChild(title);
  head.appendChild(newChat);
  head.appendChild(closeBtn);

  var log = make("div", "chat-log");
  log.id = "ngChatLog";
  log.setAttribute("role", "log");
  log.setAttribute("aria-live", "polite");
  log.setAttribute("aria-relevant", "additions");

  var starters = make("div", "chat-starters");

  var form = make("form", "chat-form");
  var input = make("textarea", "chat-input");
  input.id = "ngChatInput";
  input.rows = 1;
  input.maxLength = CFG.maxMessageLength;
  input.placeholder = "Type your question\u2026";
  input.setAttribute("aria-label", "Type your question");
  var sendBtn = make("button", "chat-send");
  sendBtn.type = "submit";
  sendBtn.innerHTML = ICON_SEND;
  sendBtn.setAttribute("aria-label", "Send");
  form.appendChild(input);
  form.appendChild(sendBtn);

  var notice = make("p", "chat-notice", CFG.notice);

  panel.appendChild(head);
  panel.appendChild(log);
  panel.appendChild(starters);
  panel.appendChild(form);
  panel.appendChild(notice);

  document.body.appendChild(robotButton);
  document.body.appendChild(launcher);
  document.body.appendChild(panel);
  document.body.appendChild(hint);

  /* ---------------------------------------------------------
     Messages
  --------------------------------------------------------- */
  function scrollToEnd() { log.scrollTop = log.scrollHeight; }

  function addMessage(role, text) {
    var row = make("div", "chat-msg chat-msg-" + role);
    var bubble = make("div", "chat-bubble");
    var who = make("span", "visually-hidden", role === "user" ? "You: " : "Assistant: ");
    bubble.appendChild(who);
    if (role === "bot") renderRich(bubble, text); else bubble.appendChild(document.createTextNode(text));
    row.appendChild(bubble);
    log.appendChild(row);
    scrollToEnd();
    return row;
  }

  function addTyping() {
    var row = make("div", "chat-msg chat-msg-bot chat-typing");
    var bubble = make("div", "chat-bubble");
    bubble.appendChild(make("span", "visually-hidden", "The assistant is typing"));
    for (var i = 0; i < 3; i++) bubble.appendChild(make("span", "chat-dot"));
    row.appendChild(bubble);
    log.appendChild(row);
    scrollToEnd();
    return row;
  }
  function removeNode(node) { if (node && node.parentNode) node.parentNode.removeChild(node); }

  function renderStarters() {
    while (starters.firstChild) starters.removeChild(starters.firstChild);
    starters.hidden = state.messages.length > 0 || !CFG.starterQuestions.length;
    CFG.starterQuestions.forEach(function (q) {
      var b = make("button", "chat-starter", q);
      b.type = "button";
      b.addEventListener("click", function () { sendMessage(q); });
      starters.appendChild(b);
    });
  }

  function renderAll() {
    while (log.firstChild) log.removeChild(log.firstChild);
    addMessage("bot", CFG.welcome);
    state.messages.forEach(function (m) { addMessage(m.role, m.text); });
    renderStarters();
  }

  /* ---------------------------------------------------------
     The speech bubble: it pops in beside the robot (or beside the round button when the robot is
     not on screen), stays a few seconds, pops out, and does it again every 10 seconds. It follows
     the robot while it moves.
     It stops for good in this tab once the visitor opens the chat, or hides it (x button, or Esc).
     It also rests after a few pops, and people who prefer less motion get it just once.
  --------------------------------------------------------- */
  var hintOn = false;            // inside its "visible" time
  var hintLeaving = false;       // popping out
  var hintRight = false;         // true when it sits to the right of the robot (default: to the left)
  var hintPops = 0;              // how many times it has popped in on this page
  var hintBox = { w: 0, h: 0 };
  var hintCycleTimer = null, hintEndTimer = null, hintFadeTimer = null;
  var lastRobotRect = null;
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var maxPops = reduceMotion ? 1 : CFG.bubbleMaxPops;

  function anchorAvailable() { return robotVisible || !launcher.hidden; }
  function hintMayPop() {
    return !state.hintOff && !state.open && anchorAvailable() && (maxPops <= 0 || hintPops < maxPops);
  }
  function hintClasses() { hint.className = "chat-hint" + (hintRight ? " is-right" : "") + (hintLeaving ? " is-leaving" : ""); }

  function positionHint() {
    if (hint.hidden) return;
    var useRobot = robotVisible && lastRobotRect;
    var rect = useRobot ? lastRobotRect : launcher.getBoundingClientRect();
    var centre = useRobot ? 0.28 : 0.5;            // 0.28 = about where the robot's head is
    var vw = window.innerWidth, vh = window.innerHeight, gap = 10;
    var w = hintBox.w || 200, h = hintBox.h || 50;
    var fitsLeft = rect.left - w - gap >= 8;
    var fitsRight = rect.left + rect.width + w + gap <= vw - 8;
    var right = hintRight;
    if (!right && !fitsLeft && fitsRight) right = true;       // no room on the left: go to the right of the robot
    else if (right && !fitsRight && fitsLeft) right = false;
    var x = right ? rect.left + rect.width + gap : rect.left - w - gap;
    var y = rect.top + rect.height * centre - h / 2;
    x = Math.max(8, Math.min(x, vw - w - 8));
    y = Math.max(84, Math.min(y, vh - h - 8));                // stay below the top menu
    hint.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
    if (right !== hintRight) { hintRight = right; hintClasses(); }
  }

  function updateHint() {
    var show = hintOn && !state.open && anchorAvailable();
    if (show && hint.hidden) {
      hintLeaving = false;
      hint.hidden = false;
      hintBox = { w: hint.offsetWidth, h: hint.offsetHeight };
      hintClasses();
    }
    if (!show && !hint.hidden && !hintLeaving) hint.hidden = true;
    if (show) positionHint();
  }

  function popIn() {
    hintCycleTimer = null;
    if (!hintMayPop()) return;             // not now: scheduleHint() tries again when things change
    if (hintOn) { hintCycleTimer = setTimeout(popIn, 1000); return; }
    clearTimeout(hintFadeTimer);
    hintOn = true;
    hintPops += 1;
    updateHint();
    hintEndTimer = setTimeout(popOut, CFG.bubbleVisibleSeconds * 1000);
    if (maxPops <= 0 || hintPops < maxPops) hintCycleTimer = setTimeout(popIn, CFG.bubbleEverySeconds * 1000);
  }

  function popOut() {
    hintEndTimer = null;
    hintOn = false;
    if (hint.hidden) return;
    hintLeaving = true;
    hintClasses();
    hintFadeTimer = setTimeout(function () { hintLeaving = false; hint.hidden = true; }, 350);
  }

  function stopHints() {                   // stop everything at once (chat opened, or the visitor hid the bubble)
    clearTimeout(hintCycleTimer); hintCycleTimer = null;
    clearTimeout(hintEndTimer); hintEndTimer = null;
    clearTimeout(hintFadeTimer); hintFadeTimer = null;
    hintOn = false;
    hintLeaving = false;
    hint.hidden = true;
  }

  function dismissHints() {                // the visitor said "no thanks": no more bubbles in this tab
    state.hintOff = true;
    stopHints();
    save();
  }

  function scheduleHint() {                // called whenever the robot or the chat appears, disappears or opens
    if (hintOn || hintLeaving) return;     // it is showing: its own timers carry on
    if (hintMayPop()) {
      if (!hintCycleTimer) hintCycleTimer = setTimeout(popIn, CFG.bubbleDelaySeconds * 1000);
    } else if (hintCycleTimer) {
      clearTimeout(hintCycleTimer); hintCycleTimer = null;
    }
  }

  hint.addEventListener("click", function () { if (!state.open) openChat(false); });
  hintX.addEventListener("click", function (ev) { ev.stopPropagation(); dismissHints(); });

  /* ---------------------------------------------------------
     The robot: where its click area is, which button to show, how it reacts
  --------------------------------------------------------- */
  var robotVisible = false;
  var robotPending = !!robot && !robot.ready;   // the 3D model is still loading
  var moodTimer = null;

  function refreshButtons() {
    var showLauncher = !state.open && !robotVisible && !robotPending;
    launcher.hidden = !showLauncher;
    robotButton.hidden = !robotVisible;
    var expanded = state.open ? "true" : "false";
    launcher.setAttribute("aria-expanded", expanded);
    robotButton.setAttribute("aria-expanded", expanded);
    updateHint();
    scheduleHint();
  }

  var lastBox = "";
  if (robot) {
    robot.onMove = function (rect, visible) {
      if (visible !== robotVisible) { robotVisible = visible; refreshButtons(); }
      if (!visible) return;
      var box = Math.round(rect.width) + "x" + Math.round(rect.height);
      if (box !== lastBox) {
        lastBox = box;
        robotButton.style.width = Math.round(rect.width) + "px";
        robotButton.style.height = Math.round(rect.height) + "px";
      }
      robotButton.style.transform = "translate3d(" + rect.left.toFixed(1) + "px," + rect.top.toFixed(1) + "px,0)";
      lastRobotRect = rect;
      if (!hint.hidden) positionHint();             // the bubble follows the robot
    };
    if (robotPending) {
      var done = function () { if (robotPending) { robotPending = false; refreshButtons(); } };
      document.addEventListener("nextgen-robot-ready", done);
      setTimeout(done, 4000);   // if the robot never shows up, offer the round button instead
    }
  }

  function setMood(name, revertAfterSeconds) {
    if (!robot) return;
    robot.setMood(name);
    clearTimeout(moodTimer);
    if (revertAfterSeconds) moodTimer = setTimeout(function () { if (robot && state.open) robot.setMood("wave"); }, revertAfterSeconds * 1000);
  }

  function dockRobot() {
    if (!robot || !state.open) return;
    var r = panel.getBoundingClientRect();
    robot.dock({ x: r.right - Math.max(70, Math.min(110, r.width * 0.26)), seatY: r.top + 6 });
  }

  /* ---------------------------------------------------------
     Open / close
  --------------------------------------------------------- */
  var opener = null;

  function openChat(quiet) {
    if (!quiet) opener = document.activeElement === robotButton ? robotButton : launcher;
    state.hintOff = true;     // the visitor found the chat: no more bubbles in this tab
    stopHints();
    state.open = true;
    panel.hidden = false;
    refreshButtons();
    setMood("wave");
    dockRobot();
    scrollToEnd();
    if (!quiet) input.focus();
    save();
  }

  function closeChat() {
    state.open = false;
    panel.hidden = true;
    if (robot) { clearTimeout(moodTimer); robot.setMood("wave"); robot.dock(null); }
    refreshButtons();
    var target = (opener && !opener.hidden) ? opener : (!robotButton.hidden ? robotButton : launcher);
    if (target && !target.hidden) target.focus();
    save();
  }

  function toggle() { if (state.open) closeChat(); else openChat(false); }
  robotButton.addEventListener("click", toggle);
  launcher.addEventListener("click", toggle);
  closeBtn.addEventListener("click", closeChat);
  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Escape" && ev.key !== "Esc") return;
    if (state.open) closeChat();
    else if (!state.hintOff && (hintOn || hintCycleTimer)) dismissHints();   // Esc also hides the pop-up bubble
  });

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      dockRobot();
      if (!hint.hidden) { hintBox = { w: hint.offsetWidth, h: hint.offsetHeight }; positionHint(); }
    }, 120);
  });

  newChat.addEventListener("click", function () {
    state.sid = newSessionId();
    state.messages = [];
    renderAll();
    save();
    input.focus();
  });

  /* ---------------------------------------------------------
     Sending a message to the chat server
  --------------------------------------------------------- */
  var busy = false;

  function setBusy(on) {
    busy = on;
    sendBtn.disabled = on;
    panel.setAttribute("aria-busy", on ? "true" : "false");
  }

  function autosize() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight || 44, 110) + "px";
  }

  function errorText(status, data) {
    var serverText = data && typeof data.error === "string" ? data.error : "";
    if (status === 429) return serverText || "You are sending messages quickly. Please wait a minute and try again.";
    if (status === 400) return serverText || "Please send a shorter message.";
    if (status === 502 || status === 503 || status === 504) return "The assistant is temporarily unavailable. Please try again shortly.";
    return "Something went wrong. Please try again.";
  }

  function sendMessage(text) {
    text = String(text || "").trim();
    if (!text || busy) return;
    if (text.length > CFG.maxMessageLength) text = text.slice(0, CFG.maxMessageLength);

    setBusy(true);
    state.messages.push({ role: "user", text: text });
    addMessage("user", text);
    starters.hidden = true;
    input.value = "";
    autosize();
    var typing = addTyping();
    setMood("think");
    save();

    var controller = (typeof AbortController !== "undefined") ? new AbortController() : null;
    var timer = setTimeout(function () { if (controller) controller.abort(); }, CFG.timeoutSeconds * 1000);

    fetch(CFG.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, session_id: state.sid }),
      signal: controller ? controller.signal : undefined
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          return { ok: res.ok, status: res.status, data: data };
        });
      })
      .then(function (r) {
        removeNode(typing);
        if (r.ok && r.data && typeof r.data.answer === "string" && r.data.answer.trim()) {
          state.messages.push({ role: "bot", text: r.data.answer });
          addMessage("bot", r.data.answer);
          setMood("yes", CFG.reactionSeconds);
        } else {
          addMessage("error", errorText(r.status, r.data));
          setMood("no", CFG.reactionSeconds);
        }
      })
      .catch(function (err) {
        if (window.console && window.console.error) window.console.error("NextGenPH chat error:", err);   // the real reason, for the browser Console
        removeNode(typing);
        addMessage("error", "I can\u2019t reach the assistant right now. Please check your connection and try again.");
        setMood("no", CFG.reactionSeconds);
      })
      .then(function () {
        clearTimeout(timer);
        setBusy(false);
        save();
        if (state.open) input.focus();
      });
  }

  form.addEventListener("submit", function (ev) { ev.preventDefault(); sendMessage(input.value); });
  input.addEventListener("keydown", function (ev) {
    if (ev.key === "Enter" && !ev.shiftKey && !ev.isComposing) { ev.preventDefault(); sendMessage(input.value); }
  });
  input.addEventListener("input", autosize);

  /* ---------------------------------------------------------
     Start
  --------------------------------------------------------- */
  renderAll();
  refreshButtons();
  if (state.open) openChat(true);   // the chat was open on the previous page: keep it open, without grabbing focus

  if (window.NEXTGEN_CHAT_TEST) {   // used only by the automated tests
    window.NEXTGEN_CHAT_TEST.api = {
      state: state, renderRich: renderRich, openChat: openChat, closeChat: closeChat, sendMessage: sendMessage,
      refs: { hint: hint, robotButton: robotButton, launcher: launcher, panel: panel, log: log, input: input, sendBtn: sendBtn, starters: starters, newChat: newChat, closeBtn: closeBtn, form: form }
    };
  }
})();