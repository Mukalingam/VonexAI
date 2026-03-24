(function () {
  // Find the script tag to get the agent ID
  var scripts = document.querySelectorAll("script[data-agent-id]");
  var script = scripts[scripts.length - 1];
  if (!script) return;

  var agentId = script.getAttribute("data-agent-id");
  if (!agentId) return;

  var origin = script.src.replace(/\/embed\.js.*$/, "");

  // Vonex AI "Z" logo with sound wave (matches the brand)
  var logoSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 40 40" fill="none">' +
    '<rect x="8" y="8" width="24" height="24" rx="5" fill="white" fill-opacity="0.2"/>' +
    '<path d="M14 14h12l-12 12h12" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M32 12 C34 14, 34 18, 32 20" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-linecap="round" fill="none"/>' +
    '<path d="M35 10 C38 13, 38 19, 35 22" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" stroke-linecap="round" fill="none"/>' +
    '</svg>';

  var closeSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  // Create the floating chat button
  var btn = document.createElement("div");
  btn.id = "vonex-chat-btn";
  btn.innerHTML = logoSvg;
  btn.style.cssText =
    "position:fixed;bottom:16px;right:16px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#2E3192,#DE6C33);color:white;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 16px rgba(46,49,146,0.35);z-index:99999;transition:transform 0.2s;";
  btn.onmouseenter = function () {
    btn.style.transform = "scale(1.1)";
  };
  btn.onmouseleave = function () {
    btn.style.transform = "scale(1)";
  };

  // Create the iframe container
  var container = document.createElement("div");
  container.id = "vonex-chat-container";
  container.style.cssText =
    "position:fixed;bottom:96px;right:24px;width:400px;height:600px;border-radius:12px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.15);z-index:99999;display:none;";

  var iframe = document.createElement("iframe");
  iframe.src = origin + "/chat/" + agentId;
  iframe.style.cssText = "width:100%;height:100%;border:none;";
  iframe.allow = "microphone";
  container.appendChild(iframe);

  // Mobile close button (inside the chat container)
  var mobileClose = document.createElement("div");
  mobileClose.style.cssText =
    "position:absolute;top:8px;right:8px;width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,0.5);color:white;display:none;align-items:center;justify-content:center;cursor:pointer;z-index:100000;";
  mobileClose.innerHTML = closeSvg;
  container.appendChild(mobileClose);

  // Toggle chat
  var isOpen = false;
  function closeChat() {
    isOpen = false;
    container.style.display = "none";
    btn.innerHTML = logoSvg;
    btn.style.display = "flex";
    mobileClose.style.display = "none";
  }
  btn.onclick = function () {
    isOpen = !isOpen;
    container.style.display = isOpen ? "block" : "none";
    btn.innerHTML = isOpen ? closeSvg : logoSvg;
    if (window.innerWidth < 640 && isOpen) {
      btn.style.display = "none";
      mobileClose.style.display = "flex";
    }
  };
  mobileClose.onclick = closeChat;

  // Responsive: on mobile, make container full screen
  function applyResponsive() {
    if (window.innerWidth < 640) {
      container.style.width = "100%";
      container.style.height = "100%";
      container.style.bottom = "0";
      container.style.right = "0";
      container.style.borderRadius = "0";
    } else {
      container.style.width = "400px";
      container.style.height = "600px";
      container.style.bottom = "96px";
      container.style.right = "24px";
      container.style.borderRadius = "12px";
    }
  }
  applyResponsive();
  window.addEventListener("resize", applyResponsive);

  document.body.appendChild(container);
  document.body.appendChild(btn);
})();
