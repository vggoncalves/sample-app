(function () {
  'use strict';
  var supported = ['pt-BR', 'en', 'es', 'fr', 'ar', 'hi', 'zh-Hans'];
  var stored;
  try { stored = window.localStorage.getItem('sample.locale'); } catch (_) { stored = null; }
  function supportedLocale(value) {
    if (!value) return undefined;
    var normalized = value.replace('_', '-').toLowerCase();
    return supported.find(function (locale) {
      return locale.toLowerCase() === normalized || locale.split('-')[0] === normalized.split('-')[0];
    });
  }
  var locale = supportedLocale(stored);
  if (!locale) {
    for (var index = 0; index < navigator.languages.length && !locale; index += 1) locale = supportedLocale(navigator.languages[index]);
  }
  window.location.replace('/' + (locale || 'pt-BR') + '/');
}());
