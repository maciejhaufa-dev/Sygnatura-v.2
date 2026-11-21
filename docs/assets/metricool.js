/* Metricool tracking for public Studio Sygnatura pages. */
(function () {
  'use strict';
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://tracker.metricool.com/resources/be.js';
  script.onload = script.onreadystatechange = function () {
    if (script.readyState && !/loaded|complete/.test(script.readyState)) return;
    if (window.beTracker && typeof window.beTracker.t === 'function') {
      window.beTracker.t({ hash: 'adf9c4572d4341f27a103f242293d85b' });
    }
    script.onload = script.onreadystatechange = null;
  };
  document.getElementsByTagName('head')[0].appendChild(script);
})();
