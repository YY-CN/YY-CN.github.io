// 每日一卦：以梅花易数时间起卦法（农历年月日〔+时辰〕取上卦、下卦、动爻），
// 生成当日卦象卡片。卦义与文章链接来自 js/hexagram-post-map.js（文章 front-matter）。
// 农历转换依赖 source/lib/solarlunar（MIT，jjonline/solarlunar）。
(function () {
  'use strict';

  // 八卦先天数：乾一、兑二、离三、震四、巽五、坎六、艮七、坤八
  var TRIGRAM_NAMES = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];
  // 地支数：子一、丑二、……、亥十二（农历年起卦用）
  var ZHI_INDEX = { 子: 1, 丑: 2, 寅: 3, 卯: 4, 辰: 5, 巳: 6, 午: 7, 未: 8, 申: 9, 酉: 10, 戌: 11, 亥: 12 };
  var MOVING_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
  var HEXAGRAM_NAMES = [
    '乾为天', '坤为地', '水雷屯', '山水蒙', '水天需', '天水讼', '地水师', '水地比',
    '风天小畜', '天泽履', '地天泰', '天地否', '天火同人', '火天大有', '地山谦', '雷地豫',
    '泽雷随', '山风蛊', '地泽临', '风地观', '火雷噬嗑', '山火贲', '山地剥', '地雷复',
    '天雷无妄', '山天大畜', '山雷颐', '泽风大过', '坎为水', '离为火', '泽山咸', '雷风恒',
    '天山遁', '雷天大壮', '火地晋', '地火明夷', '风火家人', '火泽睽', '水山蹇', '雷水解',
    '山泽损', '风雷益', '泽天夬', '天风姤', '泽地萃', '地风升', '泽水困', '水风井',
    '泽火革', '火风鼎', '震为雷', '艮为山', '风山渐', '雷泽归妹', '雷火丰', '火山旅',
    '巽为风', '兑为泽', '风水涣', '水泽节', '风泽中孚', '雷山小过', '水火既济', '火水未济'
  ];
  // 每卦的上下卦（先天数）。MATRIX[(上卦-1)*8+(下卦-1)] = 文王卦序。
  var HEXAGRAM_TRIGRAMS = [
    [1, 1], [8, 8], [6, 4], [7, 6], [6, 1], [1, 6], [8, 6], [6, 8],
    [5, 1], [1, 2], [8, 1], [1, 8], [1, 3], [3, 1], [8, 7], [4, 8],
    [2, 4], [7, 5], [8, 2], [5, 8], [3, 4], [7, 3], [7, 8], [8, 4],
    [1, 4], [7, 1], [7, 4], [2, 5], [6, 6], [3, 3], [2, 7], [4, 5],
    [1, 7], [4, 1], [3, 8], [8, 3], [5, 3], [3, 2], [6, 7], [4, 6],
    [7, 2], [5, 4], [2, 1], [1, 5], [2, 8], [8, 5], [2, 6], [6, 5],
    [2, 3], [3, 5], [4, 4], [7, 7], [5, 7], [4, 2], [4, 3], [3, 7],
    [5, 5], [2, 2], [5, 6], [6, 2], [5, 2], [4, 7], [6, 3], [3, 6]
  ];

  function buildMatrix() {
    var matrix = new Array(64);
    for (var i = 0; i < 64; i++) {
      matrix[(HEXAGRAM_TRIGRAMS[i][0] - 1) * 8 + (HEXAGRAM_TRIGRAMS[i][1] - 1)] = i + 1;
    }
    return matrix;
  }

  var MATRIX = buildMatrix();

  // 梅花易数取余数：余 0 按最大数论（卦为八、爻为六）。
  function remainder(total, base) {
    var result = total % base;
    return result === 0 ? base : result;
  }

  // 卦象以自然日为准：23 点起作次日（晚子时归次日），避免跨午夜摆动。
  function resolveDivinationDate(now) {
    var date = new Date(now.getTime());
    if (date.getHours() >= 23) date.setDate(date.getDate() + 1);
    return date;
  }

  function lunarBranchNumber(lunar) {
    var branch = String(lunar.gzYear || '').charAt(1);
    return ZHI_INDEX[branch] || 1;
  }

  function hourBranchNumber(hour) {
    return Math.floor((hour + 1) / 2) % 12 + 1;
  }

  function castDailyHexagram(now, lunar) {
    var yearNumber = lunarBranchNumber(lunar);
    var hourNumber = hourBranchNumber(now.getHours());
    var upper = remainder(yearNumber + lunar.lMonth + lunar.lDay, 8);
    var lower = remainder(yearNumber + lunar.lMonth + lunar.lDay + hourNumber, 8);
    var moving = remainder(yearNumber + lunar.lMonth + lunar.lDay + hourNumber, 6);
    var number = MATRIX[(upper - 1) * 8 + (lower - 1)];

    return {
      number: number,
      name: HEXAGRAM_NAMES[number - 1],
      upperName: TRIGRAM_NAMES[upper - 1],
      lowerName: TRIGRAM_NAMES[lower - 1],
      movingName: MOVING_NAMES[moving - 1],
      glyph: String.fromCodePoint(0x4DC0 + number - 1),
      lunarText: (lunar.isLeap ? '闰' : '') + lunar.monthCn + lunar.dayCn,
      yearGanZhi: lunar.gzYear,
      dayGanZhi: lunar.gzDay
    };
  }

  function pickResult() {
    var solarLunar = window.solarLunar && (window.solarLunar.default || window.solarLunar);
    if (!solarLunar || typeof solarLunar.solar2lunar !== 'function') return null;

    var now = new Date();
    var lunar = solarLunar.solar2lunar(
      resolveDivinationDate(now).getFullYear(),
      resolveDivinationDate(now).getMonth() + 1,
      resolveDivinationDate(now).getDate()
    );
    if (!lunar || lunar === -1) return null;

    var cast = castDailyHexagram(now, lunar);
    var maps = window.HEXAGRAM_POST_URLS || {};
    var descriptions = window.HEXAGRAM_POST_DESCRIPTIONS || {};
    cast.url = maps[String(cast.number)] || '';
    cast.description = String(descriptions[String(cast.number)] || '').trim();
    return cast;
  }

  function createLink(href, className, innerHtml) {
    var link = document.createElement('a');
    link.href = href;
    link.className = className;
    link.innerHTML = innerHtml;
    return link;
  }

  function buildHomepageCard(cast) {
    var card = document.createElement('section');
    card.className = 'daily-hexagram-card';

    var kicker = document.createElement('p');
    kicker.className = 'dh-kicker';
    kicker.innerHTML = '<i class="fa fa-yin-yang" aria-hidden="true"></i> 每日一卦 · 农历' +
      cast.yearGanZhi + '年 ' + cast.lunarText + ' · ' + cast.dayGanZhi + '日';
    card.appendChild(kicker);

    var main = document.createElement('div');
    main.className = 'dh-main';

    var glyph = document.createElement('span');
    glyph.className = 'dh-glyph';
    glyph.setAttribute('aria-hidden', 'true');
    glyph.textContent = cast.glyph;
    main.appendChild(glyph);

    var info = document.createElement('div');
    info.className = 'dh-info';

    var name = document.createElement('h2');
    name.className = 'dh-name';
    if (cast.url) {
      name.appendChild(createLink(cast.url, '', cast.name));
    } else {
      name.textContent = cast.name;
    }
    info.appendChild(name);

    if (cast.description) {
      var desc = document.createElement('p');
      desc.className = 'dh-desc';
      desc.textContent = cast.description;
      info.appendChild(desc);
    }

    var structure = document.createElement('p');
    structure.className = 'dh-structure';
    structure.textContent = '上' + cast.upperName + ' · 下' + cast.lowerName + ' · 动在' + cast.movingName;
    info.appendChild(structure);

    main.appendChild(info);
    card.appendChild(main);
    return card;
  }

  function buildSidebarCard(cast) {
    var section = document.createElement('section');
    section.className = 'daily-hexagram-mini';

    var label = document.createElement('p');
    label.className = 'dhm-label';
    label.innerHTML = '<i class="fa fa-yin-yang" aria-hidden="true"></i> 今日一卦';
    section.appendChild(label);

    var line = document.createElement('p');
    line.className = 'dhm-line';
    var inner = '<span class="dhm-glyph" aria-hidden="true">' + cast.glyph + '</span> ' + cast.name;
    if (cast.url) {
      line.appendChild(createLink(cast.url, '', inner));
    } else {
      line.innerHTML = inner;
    }
    section.appendChild(line);
    return section;
  }

  function isHomepage() {
    return /^\/(page\/\d+\/)?$/.test(location.pathname);
  }

  function render(cast) {
    if (isHomepage()) {
      var posts = document.querySelector('.content.index');
      if (posts && !posts.querySelector('.daily-hexagram-card')) {
        posts.insertBefore(buildHomepageCard(cast), posts.firstChild);
      }
    }

    var sidebarState = document.querySelector('.site-state-wrap');
    if (sidebarState && sidebarState.parentNode && !document.querySelector('.daily-hexagram-mini')) {
      sidebarState.insertAdjacentElement('afterend', buildSidebarCard(cast));
    }
  }

  function init() {
    var cast = pickResult();
    if (cast) render(cast);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
