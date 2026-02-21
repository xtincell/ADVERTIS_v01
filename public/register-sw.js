// Register ADVERTIS Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/sw.js")
      .then(function (reg) {
        console.log("[ADVERTIS] SW registered, scope:", reg.scope);
      })
      .catch(function (err) {
        console.warn("[ADVERTIS] SW registration failed:", err);
      });
  });
}
