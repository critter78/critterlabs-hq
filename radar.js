/* =====================================================================
   RADAR — CritterLabs HQ chat widget (self-injecting, no dependencies)
   Drop one line on any page:  <script src="radar.js" defer></script>
   Design: Cliff's handoff (radar-widget.html). Wiring: Claude backend.
   ===================================================================== */
(function () {
  "use strict";

  /* ---- CONFIG: set this to your deployed Render backend URL ---- */
  var RADAR_ENDPOINT = "https://radar-backend.onrender.com"; // change if your service URL differs
  var CONTACT_URL = "contact.html";
  var MAX_HISTORY = 20;

  if (window.__radarLoaded) return; window.__radarLoaded = true;

  var fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Caveat:wght@600;700&display=swap";
  document.head.appendChild(fontLink);

  var css = document.createElement("style");
  css.textContent = `
  #radar-widget{--rad-green:#3ddc84;--rad-amber:#f5b53f;--rad-blue:#3b74ff;--rad-bg:#0b0f16;--rad-header:#0e1420;--rad-input:#0c1119;--rad-border:#1d2532;--rad-divider:#161d29;--rad-bot-bg:#121a26;--rad-bot-bd:#1f2937;--rad-bot-tx:#d7deea;--rad-usr-bg:#16263f;--rad-usr-bd:#24487a;--rad-usr-tx:#dce7f7;--rad-text:#eef2f8;--rad-muted:#7f8b9e;--rad-faint:#5a6575;--rad-font:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace;--rad-script:'Caveat',cursive;--rad-launcher-size:76px;--rad-panel-w:380px;--rad-panel-h:600px;--rad-gap:24px;position:fixed;right:var(--rad-gap);bottom:var(--rad-gap);z-index:2147483000;font-family:var(--rad-font)}
  #radar-widget *{box-sizing:border-box}
  .radar-launcher{position:relative;width:var(--rad-launcher-size);height:var(--rad-launcher-size);border:1px solid #1f3a2a;border-radius:24px;cursor:pointer;padding:0;background:radial-gradient(circle at 32% 26%,#10301d,#080f0b);display:flex;align-items:center;justify-content:center;overflow:visible;box-shadow:0 10px 30px rgba(0,0,0,.45);animation:softpulseG 3.4s ease-in-out infinite;transition:transform .18s ease,box-shadow .18s ease}
  .radar-launcher:hover{transform:translateY(-2px);box-shadow:0 14px 34px rgba(0,0,0,.5),0 0 30px rgba(61,220,132,.28)}
  .radar-launcher:active{transform:translateY(0) scale(.97)}
  #radar-widget.open .radar-launcher{animation:none}
  .radar-badge{position:absolute;top:-5px;right:-5px;min-width:20px;height:20px;border-radius:50%;background:var(--rad-amber);color:#1a1206;font:700 11px/20px var(--rad-font);text-align:center;box-shadow:0 0 10px rgba(245,181,63,.55);z-index:6}
  #radar-widget.open .radar-badge{display:none}
  .radar-panel{position:absolute;right:0;bottom:calc(var(--rad-launcher-size) + 16px);width:var(--rad-panel-w);height:var(--rad-panel-h);background:var(--rad-bg);border:1px solid var(--rad-border);border-radius:20px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.6);flex-direction:column;transform-origin:bottom right;display:none}
  .radar-panel.is-open{display:flex;animation:radarPop .22s ease forwards}
  @keyframes radarPop{from{transform:translateY(10px) scale(.98)}to{transform:none}}
  .radar-head{display:flex;align-items:center;gap:12px;padding:15px 16px;border-bottom:1px solid var(--rad-divider);background:linear-gradient(180deg,var(--rad-header),var(--rad-bg))}
  .radar-head-meta{flex:1;min-width:0}
  .radar-name{display:flex;align-items:baseline;gap:9px}
  .radar-name b{font:700 13px/1 var(--rad-font);letter-spacing:.04em;color:var(--rad-text)}
  .radar-name span{font:700 15px/1 var(--rad-script);color:var(--rad-amber)}
  .radar-status{display:flex;align-items:center;gap:6px;margin-top:6px}
  .radar-status i{width:6px;height:6px;border-radius:50%;background:var(--rad-green);box-shadow:0 0 6px var(--rad-green)}
  .radar-status span{font:500 9.5px/1 var(--rad-font);letter-spacing:.1em;color:var(--rad-muted)}
  .radar-head-btns{display:flex;gap:10px}
  .radar-head-btns button{background:none;border:none;color:var(--rad-faint);font:400 15px/1 var(--rad-font);cursor:pointer;padding:2px}
  .radar-head-btns button:hover{color:var(--rad-text)}
  .radar-body{flex:1;overflow-y:auto;padding:18px 16px;display:flex;flex-direction:column;gap:14px;background-image:linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px);background-size:26px 26px}
  .radar-body::-webkit-scrollbar{width:8px}
  .radar-body::-webkit-scrollbar-thumb{background:#1c2533;border-radius:4px}
  .radar-day{text-align:center;font:500 9px/1 var(--rad-font);letter-spacing:.12em;color:#3a4452}
  .radar-row{display:flex;gap:10px;align-items:flex-start}
  .radar-row.me{justify-content:flex-end}
  .radar-row .spacer{flex-shrink:0;width:26px;height:26px}
  .radar-bubble{max-width:80%;padding:11px 13px;font:400 12.5px/1.6 var(--rad-font);word-wrap:break-word;overflow-wrap:anywhere}
  .radar-bubble.bot{background:var(--rad-bot-bg);border:1px solid var(--rad-bot-bd);color:var(--rad-bot-tx);border-radius:4px 14px 14px 14px}
  .radar-bubble.bot.cont{border-radius:14px}
  .radar-bubble.me{background:var(--rad-usr-bg);border:1px solid var(--rad-usr-bd);color:var(--rad-usr-tx);border-radius:14px 14px 4px 14px}
  .radar-bubble b{color:var(--rad-green)}
  .radar-bubble a{color:var(--rad-amber);text-decoration:underline}
  .radar-typing{background:var(--rad-bot-bg);border:1px solid var(--rad-bot-bd);border-radius:4px 14px 14px 14px;padding:13px 15px;display:flex;gap:5px;align-items:center}
  .radar-typing i{width:6px;height:6px;border-radius:50%;background:var(--rad-green);animation:typing 1.3s ease-in-out infinite}
  .radar-typing i:nth-child(2){animation-delay:.2s}.radar-typing i:nth-child(3){animation-delay:.4s}
  .radar-chips{padding:12px 16px 4px;border-top:1px solid var(--rad-divider)}
  .radar-chips .lbl{font:500 8.5px/1 var(--rad-font);letter-spacing:.14em;color:#4a5566;margin-bottom:10px}
  .radar-chips .row{display:flex;flex-wrap:wrap;gap:8px}
  .radar-chip{border:1px solid #284a37;background:rgba(61,220,132,.06);color:#aef0c9;font:500 11px/1 var(--rad-font);padding:8px 12px;border-radius:20px;cursor:pointer;transition:background .15s ease}
  .radar-chip:hover{background:rgba(61,220,132,.13)}
  .radar-chip.primary{border-color:#2f4d86;background:rgba(59,116,255,.12);color:#bcd2ff;font-weight:600}
  .radar-chip.primary:hover{background:rgba(59,116,255,.2)}
  .radar-input{display:flex;align-items:center;gap:10px;padding:12px 14px;border-top:1px solid var(--rad-divider);background:var(--rad-input)}
  .radar-input input{flex:1;background:none;border:none;outline:none;font:400 12px/1 var(--rad-font);color:var(--rad-text)}
  .radar-input input::placeholder{color:var(--rad-faint)}
  .radar-send{width:34px;height:34px;border:none;border-radius:10px;background:linear-gradient(180deg,var(--rad-blue),#2a5cf0);color:#fff;font:700 14px/1 var(--rad-font);cursor:pointer;box-shadow:0 4px 12px rgba(59,116,255,.35)}
  .radar-foot{padding:0 16px 10px;text-align:center}
  .radar-foot button{background:none;border:none;color:var(--rad-faint);font:500 9.5px/1 var(--rad-font);letter-spacing:.08em;cursor:pointer}
  .radar-foot button:hover{color:var(--rad-green)}
  .rc-face{position:relative;border-radius:50%;border:1px solid rgba(61,220,132,.4);overflow:hidden;background:radial-gradient(circle,#0c1a12,#070d09)}
  .rc-ant{position:absolute;left:50%;transform:translateX(-50%);background:#2f5a40;transform-origin:bottom;z-index:6;animation:antbob 2.4s ease-in-out infinite}
  .rc-ant i{position:absolute;left:50%;transform:translateX(-50%);border-radius:50%;background:var(--rad-amber);animation:blip 1.6s ease-in-out infinite}
  .rc-sweep{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,rgba(61,220,132,0) 0deg,rgba(61,220,132,0) 295deg,rgba(61,220,132,.32) 360deg);animation:radarspin 3.4s linear infinite}
  .rc-eyes{position:absolute;left:0;right:0;display:flex;justify-content:center;animation:blink 4.5s ease-in-out infinite}
  .rc-eye{border-radius:50%;background:#eafff4;position:relative;box-shadow:0 0 6px rgba(61,220,132,.5)}
  .rc-eye i{position:absolute;border-radius:50%;background:#0a1f14}
  .rc-glass{position:absolute;left:0;right:0;display:flex;justify-content:center;align-items:center;z-index:3}
  .rc-lens{border:1.6px solid rgba(245,181,63,.92);border-radius:6px;background:rgba(61,220,132,.05);box-shadow:0 0 5px rgba(245,181,63,.25)}
  .rc-bridge,.rc-temple{background:rgba(245,181,63,.9);border-radius:1px}
  .rc-smile{position:absolute;left:0;right:0;display:flex;justify-content:center}
  .rc-smile i{border:2px solid var(--rad-green);border-top:none;border-radius:0 0 18px 18px;box-shadow:0 2px 6px rgba(61,220,132,.22)}
  @keyframes radarspin{to{transform:rotate(360deg)}}
  @keyframes blip{0%,100%{opacity:1}50%{opacity:.18}}
  @keyframes blink{0%,90%,100%{transform:scaleY(1)}95%{transform:scaleY(.12)}}
  @keyframes antbob{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-2px)}}
  @keyframes softpulseG{0%,100%{box-shadow:0 10px 30px rgba(0,0,0,.45),0 0 22px rgba(61,220,132,.10)}50%{box-shadow:0 10px 30px rgba(0,0,0,.45),0 0 30px rgba(61,220,132,.26)}}
  @keyframes typing{0%,60%,100%{transform:translateY(0);opacity:.35}30%{transform:translateY(-4px);opacity:1}}
  @media (prefers-reduced-motion:reduce){.radar-launcher,.rc-ant,.rc-sweep,.rc-eyes,.radar-typing i{animation:none!important}}
  @media (max-width:480px){#radar-widget{right:12px;bottom:12px}.radar-panel{width:calc(100vw - 24px);height:min(72vh,600px);right:0}}
  `;
  document.head.appendChild(css);

  var AVATAR = `<div class="rc-face" style="flex-shrink:0;width:26px;height:26px;">
      <div class="rc-sweep"></div>
      <div class="rc-eyes" style="top:7px;gap:5px;">
        <div class="rc-eye" style="width:4.5px;height:5.5px;box-shadow:none;"><i style="width:2px;height:2px;top:2px;left:1.3px;"></i></div>
        <div class="rc-eye" style="width:4.5px;height:5.5px;box-shadow:none;"><i style="width:2px;height:2px;top:2px;left:1.3px;"></i></div>
      </div>
      <div class="rc-glass" style="top:5px;gap:1.5px;"><div class="rc-lens" style="width:8px;height:7.5px;border-width:1px;border-radius:2.5px;box-shadow:none;"></div><div class="rc-lens" style="width:8px;height:7.5px;border-width:1px;border-radius:2.5px;box-shadow:none;"></div></div>
      <div class="rc-smile" style="bottom:5px;"><i style="width:8px;height:4px;border-width:1.5px;border-radius:0 0 8px 8px;box-shadow:none;"></i></div>
    </div>`;

  var LAUNCHER_FACE = `<div class="rc-ant" style="top:9px;width:1.5px;height:11px;"><i style="top:-7px;width:6px;height:6px;box-shadow:0 0 8px var(--rad-amber);"></i></div>
    <div class="rc-face" style="width:60px;height:60px;box-shadow:inset 0 0 14px rgba(61,220,132,.12);">
      <div style="position:absolute;inset:7px;border-radius:50%;border:1px solid rgba(61,220,132,.1);"></div>
      <div class="rc-sweep"></div>
      <div class="rc-eyes" style="top:17px;gap:11px;">
        <div class="rc-eye" style="width:10px;height:13px;"><i style="width:5px;height:5px;top:5px;left:3px;"></i><i style="width:1.8px;height:1.8px;top:4px;left:5px;background:#fff;"></i></div>
        <div class="rc-eye" style="width:10px;height:13px;"><i style="width:5px;height:5px;top:5px;left:2px;"></i><i style="width:1.8px;height:1.8px;top:4px;left:4px;background:#fff;"></i></div>
      </div>
      <div class="rc-glass" style="top:15px;gap:2px;"><div class="rc-temple" style="width:6px;height:1.6px;opacity:.85;"></div><div class="rc-lens" style="width:17px;height:16px;"></div><div class="rc-bridge" style="width:5px;height:1.6px;"></div><div class="rc-lens" style="width:17px;height:16px;"></div><div class="rc-temple" style="width:6px;height:1.6px;opacity:.85;"></div></div>
      <div class="rc-smile" style="bottom:12px;"><i style="width:18px;height:9px;"></i></div>
    </div>`;

  var wrap = document.createElement("div");
  wrap.id = "radar-widget";
  wrap.innerHTML = `
    <div class="radar-panel" role="dialog" aria-label="Chat with Radar">
      <div class="radar-head">
        <div style="flex-shrink:0;width:38px;height:38px;border-radius:11px;background:radial-gradient(circle at 32% 26%,#10301d,#080f0b);border:1px solid #1f3a2a;display:flex;align-items:center;justify-content:center;position:relative;overflow:visible;">
          <div class="rc-ant" style="top:4px;width:1px;height:6px;z-index:2;"><i style="top:-4px;width:4px;height:4px;box-shadow:0 0 5px var(--rad-amber);"></i></div>${AVATAR}
        </div>
        <div class="radar-head-meta"><div class="radar-name"><b>RADAR</b><span>your eyes on the data</span></div>
        <div class="radar-status"><i></i><span>ONLINE · HQ BUILD CO-PILOT</span></div></div>
        <div class="radar-head-btns"><button class="radar-reset" aria-label="Reset chat" title="Start over">⟲</button><button class="radar-close" aria-label="Close">✕</button></div>
      </div>
      <div class="radar-body"><div class="radar-day">TODAY</div></div>
      <div class="radar-chips"><div class="lbl">SUGGESTED</div><div class="row">
        <button class="radar-chip" data-q="What's a build cost?">What's a build cost?</button>
        <button class="radar-chip" data-q="What data can you connect?">What data can you connect?</button>
        <button class="radar-chip" data-q="Show me some example builds.">See example builds</button>
        <button class="radar-chip primary" data-q="I'd like to book a discovery call.">Book a discovery call →</button>
      </div></div>
      <form class="radar-input" autocomplete="off"><input type="text" placeholder="Message Radar…" aria-label="Message Radar"><button class="radar-send" type="submit" aria-label="Send">↑</button></form>
      <div class="radar-foot"><button class="radar-human" type="button">Talk to a human →</button></div>
    </div>
    <button class="radar-launcher" aria-label="Chat with Radar" aria-expanded="false">${LAUNCHER_FACE}<span class="radar-badge">1</span></button>`;

  function init() {
    document.body.appendChild(wrap);

    var launcher = wrap.querySelector(".radar-launcher");
    var panel = wrap.querySelector(".radar-panel");
    var body = wrap.querySelector(".radar-body");
    var form = wrap.querySelector(".radar-input");
    var input = form.querySelector("input");
    var history = [];
    var greeted = false;
    var sending = false;

    try { history = JSON.parse(localStorage.getItem("radar_history") || "[]"); } catch (e) { history = []; }

    function save() { try { localStorage.setItem("radar_history", JSON.stringify(history.slice(-MAX_HISTORY))); } catch (e) {} }
    function scroll() { body.scrollTop = body.scrollHeight; }
    function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
    function fmt(t) {
      t = esc(t);
      t = t.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
      t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
      t = t.replace(/(^|[\s(])(https?:\/\/[^\s)<]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
      t = t.replace(/\n/g, "<br>");
      return t;
    }

    function addUser(text) {
      var row = document.createElement("div"); row.className = "radar-row me";
      var b = document.createElement("div"); b.className = "radar-bubble me"; b.textContent = text;
      row.appendChild(b); body.appendChild(row); scroll();
    }
    function addBot(html, cont) {
      var row = document.createElement("div"); row.className = "radar-row";
      row.innerHTML = (cont ? '<div class="spacer"></div>' : AVATAR) + '<div class="radar-bubble bot' + (cont ? ' cont' : '') + '">' + html + '</div>';
      body.appendChild(row); scroll();
    }
    function showTyping() {
      var row = document.createElement("div"); row.className = "radar-row";
      row.innerHTML = AVATAR + '<div class="radar-typing"><i></i><i></i><i></i></div>';
      body.appendChild(row); scroll(); return row;
    }

    function renderHistory() {
      if (greeted) return; greeted = true;
      if (history.length) {
        history.forEach(function (m) { if (m.role === "user") addUser(m.content); else addBot(fmt(m.content)); });
      } else {
        addBot("Hey — I'm <b>Radar</b>. I help you scope and ship your custom HQ. I've got the whole CritterLabs playbook on my screen.");
        addBot("Tell me what you're tracking and I'll tell you what's possible — and roughly what it'll cost — before you ever talk to a human.", true);
      }
    }

    function open(v) {
      wrap.classList.toggle("open", v);
      panel.classList.toggle("is-open", v);
      launcher.setAttribute("aria-expanded", v ? "true" : "false");
      if (v) { renderHistory(); setTimeout(function () { input.focus(); }, 220); scroll(); }
    }

    async function send(text) {
      if (sending || !text) return;
      sending = true;
      addUser(text);
      history.push({ role: "user", content: text }); save();
      var typing = showTyping();
      try {
        if (!RADAR_ENDPOINT) throw new Error("no-endpoint");
        var r = await fetch(RADAR_ENDPOINT.replace(/\/$/, "") + "/api/chat", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history.slice(-MAX_HISTORY) })
        });
        var data = await r.json();
        typing.remove();
        if (!r.ok || !data.reply) throw new Error(data.error || "bad");
        addBot(fmt(data.reply));
        history.push({ role: "assistant", content: data.reply }); save();
      } catch (e) {
        typing.remove();
        addBot('I’m just being wired up right now. Meanwhile, the fastest way to get answers is the <a href="' + CONTACT_URL + '">$250 discovery call</a> — or <a href="' + CONTACT_URL + '">drop us a note</a>.');
      } finally { sending = false; }
    }

    launcher.addEventListener("click", function () { open(!wrap.classList.contains("open")); });
    wrap.querySelector(".radar-close").addEventListener("click", function () { open(false); });
    wrap.querySelector(".radar-reset").addEventListener("click", function () {
      history = []; save();
      body.innerHTML = '<div class="radar-day">TODAY</div>'; greeted = false; renderHistory();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") open(false); });

    wrap.querySelectorAll(".radar-chip").forEach(function (chip) {
      chip.addEventListener("click", function () { send(chip.getAttribute("data-q")); });
    });
    form.addEventListener("submit", function (e) { e.preventDefault(); var t = input.value.trim(); if (!t) return; input.value = ""; send(t); });

    wrap.querySelector(".radar-human").addEventListener("click", function () {
      var email = prompt("Leave your email and Cliff will follow up — we'll send him your question and this chat.");
      if (email === null) return;
      var transcript = history.map(function (m) { return (m.role === "user" ? "You: " : "Radar: ") + m.content; }).join("\n");
      var users = history.filter(function (m) { return m.role === "user"; });
      var lastQ = users.length ? users[users.length - 1].content : "";
      addBot('Got it — sending this to a human now. You’ll hear back soon. Prefer to book directly? <a href="' + CONTACT_URL + '">Grab a discovery call →</a>');
      if (RADAR_ENDPOINT) {
        fetch(RADAR_ENDPOINT.replace(/\/$/, "") + "/api/escalate", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email, question: lastQ, transcript: transcript })
        }).catch(function () {});
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
