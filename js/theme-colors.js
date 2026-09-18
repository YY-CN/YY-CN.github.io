(function () {
  'use strict';

  var STORAGE_KEY = 'hyacinth-theme-color';
  var CHANGE_EVENT = 'theme-color-change';
  var DEFAULT_ID = 'default';

  // swatch 仅用于面板色点展示，需与 theme-colors.css 中同名色板一致。
  var PALETTES = [
    { id: DEFAULT_ID, label: '暖棕', swatch: '#9a6545' },
    { id: 'white', label: '素白', swatch: '#ffffff' },
    { id: 'pine', label: '松烟', swatch: '#47694e' },
    { id: 'ink', label: '黛蓝', swatch: '#47617e' },
    { id: 'plum', label: '绛紫', swatch: '#75588a' },
    { id: 'rouge', label: '胭脂', swatch: '#9c4a46' },
    { id: 'dusk', label: '玄夜', swatch: '#202228' }
  ];

  var widget = null;
  var panel = null;
  var toggleButton = null;

  function readStoredPalette() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function storePalette(id) {
    try {
      if (id === DEFAULT_ID) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, id);
    } catch (error) {
      // 隐私模式等场景下持久化失败不阻塞切换。
    }
  }

  function currentPalette() {
    var id = document.documentElement.getAttribute('data-theme-color');
    return id || DEFAULT_ID;
  }

  function applyPalette(id, animate) {
    var root = document.documentElement;

    if (animate) {
      root.classList.add('theme-color-transition');
      window.setTimeout(function () {
        root.classList.remove('theme-color-transition');
      }, 500);
    }

    if (id === DEFAULT_ID) root.removeAttribute('data-theme-color');
    else root.setAttribute('data-theme-color', id);

    storePalette(id);
    updateOptionStates();

    var changeEvent;
    try {
      changeEvent = new CustomEvent(CHANGE_EVENT);
    } catch (error) {
      changeEvent = document.createEvent('CustomEvent');
      changeEvent.initCustomEvent(CHANGE_EVENT, false, false, null);
    }
    document.dispatchEvent(changeEvent);
  }

  function updateOptionStates() {
    if (!panel) return;
    var active = currentPalette();
    var options = panel.querySelectorAll('.theme-color-option');

    for (var i = 0; i < options.length; i++) {
      options[i].setAttribute('aria-pressed', options[i].getAttribute('data-palette-id') === active ? 'true' : 'false');
    }
  }

  function closePanel() {
    if (!panel || !panel.classList.contains('is-open')) return;
    panel.classList.remove('is-open');
    panel.setAttribute('hidden', '');
    toggleButton.setAttribute('aria-expanded', 'false');
  }

  function openPanel() {
    if (!panel) return;
    panel.removeAttribute('hidden');
    // 强制回流后再挂类，保证透明度过渡生效；不用 rAF（后台标签页会被节流）。
    void panel.offsetWidth;
    panel.classList.add('is-open');
    toggleButton.setAttribute('aria-expanded', 'true');
  }

  function togglePanel() {
    if (panel.classList.contains('is-open')) closePanel();
    else openPanel();
  }

  function buildWidget() {
    widget = document.createElement('div');
    widget.className = 'theme-color-widget';

    toggleButton = document.createElement('button');
    toggleButton.className = 'theme-color-toggle';
    toggleButton.type = 'button';
    toggleButton.setAttribute('aria-haspopup', 'true');
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.title = '更换主题色';
    toggleButton.setAttribute('aria-label', '更换主题色');
    toggleButton.innerHTML = '<i class="fa fa-paint-brush"></i>';

    panel = document.createElement('div');
    panel.className = 'theme-color-panel';
    panel.setAttribute('hidden', '');
    panel.setAttribute('role', 'menu');
    panel.setAttribute('aria-label', '主题色板');

    var title = document.createElement('p');
    title.className = 'theme-color-panel-title';
    title.textContent = '主题换色';
    panel.appendChild(title);

    PALETTES.forEach(function (palette) {
      var option = document.createElement('button');
      option.className = 'theme-color-option';
      option.type = 'button';
      option.setAttribute('data-palette-id', palette.id);
      option.setAttribute('aria-pressed', 'false');

      var swatch = document.createElement('span');
      swatch.className = 'swatch';
      swatch.style.background = palette.swatch;
      swatch.setAttribute('aria-hidden', 'true');

      var label = document.createElement('span');
      label.className = 'label';
      label.textContent = palette.label;

      var check = document.createElement('i');
      check.className = 'fa fa-check';
      check.setAttribute('aria-hidden', 'true');

      option.appendChild(swatch);
      option.appendChild(label);
      option.appendChild(check);

      option.addEventListener('click', function () {
        applyPalette(palette.id, true);
      });

      panel.appendChild(option);
    });

    toggleButton.addEventListener('click', togglePanel);
    document.addEventListener('click', function (event) {
      if (widget && !widget.contains(event.target)) closePanel();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closePanel();
    });

    widget.appendChild(toggleButton);
    widget.appendChild(panel);
    document.body.appendChild(widget);
  }

  function init() {
    // head.swig 已按存储预应用色板，这里只需恢复挂件选中态。
    var stored = readStoredPalette();
    if (stored && stored !== document.documentElement.getAttribute('data-theme-color')) {
      applyPalette(stored, false);
    }

    buildWidget();
    updateOptionStates();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
