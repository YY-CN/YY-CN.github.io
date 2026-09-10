(function () {
  'use strict';

  var page = document.querySelector('.shuoshuo-page');
  if (!page) return;

  var timeline = document.getElementById('shuoshuo-timeline');
  var status = document.getElementById('shuoshuo-status');
  var dataUrl = new URL('../data/shuoshuo.json', window.location.href).href;

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // 先转义再处理换行与链接，数据里的 HTML 不会被执行。
  function renderContent(value) {
    var html = escapeHtml(value).replace(/\r?\n/g, '<br>');
    return html.replace(/(https?:\/\/[^\s<]+)/g, function (match) {
      return '<a href="' + match + '" target="_blank" rel="noopener nofollow">' + match + '</a>';
    });
  }

  function parseDate(value) {
    return new Date(String(value).replace(' ', 'T'));
  }

  function formatDate(value) {
    var date = parseDate(value);
    if (isNaN(date.getTime())) return escapeHtml(value);
    var month = date.getMonth() + 1;
    var day = date.getDate();
    return month + ' 月 ' + day + ' 日';
  }

  function formatTime(value) {
    var date = parseDate(value);
    if (isNaN(date.getTime())) return '';
    var hour = ('0' + date.getHours()).slice(-2);
    var minute = ('0' + date.getMinutes()).slice(-2);
    return hour + ':' + minute;
  }

  function createElement(tag, className, innerHtml) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (innerHtml != null) el.innerHTML = innerHtml;
    return el;
  }

  function buildCard(item) {
    var card = createElement('article', 'shuoshuo-card');
    var meta = [];

    card.appendChild(createElement('div', 'shuoshuo-content', renderContent(item.content)));

    if (item.image) {
      var figure = createElement('figure', 'shuoshuo-figure');
      var link = createElement('a');
      link.href = item.image;
      link.target = '_blank';
      link.rel = 'noopener';
      var img = createElement('img');
      img.src = item.image;
      img.loading = 'lazy';
      img.alt = '说说配图';
      link.appendChild(img);
      figure.appendChild(link);
      card.appendChild(figure);
    }

    var footerParts = ['<span class="shuoshuo-time"><i class="fa fa-clock-o" aria-hidden="true"></i> ' +
      formatDate(item.date) + ' ' + formatTime(item.date) + '</span>'];

    if (item.mood) {
      footerParts.push('<span class="shuoshuo-mood"><i class="fa fa-heart-o" aria-hidden="true"></i> ' +
        escapeHtml(item.mood) + '</span>');
    }

    (item.tags || []).forEach(function (tag) {
      meta.push('<span class="shuoshuo-tag">#' + escapeHtml(tag) + '</span>');
    });

    var footer = createElement('footer', 'shuoshuo-footer', footerParts.join(''));
    if (meta.length) {
      footer.appendChild(createElement('span', 'shuoshuo-tags', meta.join('')));
    }
    card.appendChild(footer);
    return card;
  }

  function render(items) {
    items.sort(function (a, b) {
      return parseDate(b.date) - parseDate(a.date);
    });

    document.getElementById('shuoshuo-count').textContent = String(items.length);

    var currentYear = null;
    var years = 0;

    items.forEach(function (item) {
      var date = parseDate(item.date);
      var year = isNaN(date.getTime()) ? '未知' : date.getFullYear();
      if (year !== currentYear) {
        years += 1;
        currentYear = year;
        timeline.appendChild(createElement('div', 'shuoshuo-year',
          '<span>' + escapeHtml(String(year)) + '</span>'));
      }
      timeline.appendChild(buildCard(item));
    });

    document.getElementById('shuoshuo-years').textContent = String(years);
  }

  function showStatus(html) {
    status.innerHTML = html;
    status.hidden = false;
  }

  fetch(dataUrl)
    .then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(function (items) {
      if (!Array.isArray(items) || !items.length) {
        showStatus('<i class="fa fa-info-circle"></i> 暂时还没有说说。');
        return;
      }
      render(items);
    })
    .catch(function () {
      showStatus('<i class="fa fa-exclamation-circle"></i> 说说加载失败，请检查 source/data/shuoshuo.json 是否存在且为合法 JSON。');
    });
})();
