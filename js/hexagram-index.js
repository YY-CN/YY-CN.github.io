(function () {
  'use strict';

  function init() {
    var page = document.getElementById('hexagram-index-page');
    if (!page) return;

    var trigrams = {
      '乾': '111',
      '兑': '011',
      '离': '101',
      '震': '001',
      '巽': '110',
      '坎': '010',
      '艮': '100',
      '坤': '000'
    };

    var hexagrams = [
      { number: 1, name: '乾为天', upper: '乾', lower: '乾', url: '/2026/06/03/乾为天/' },
      { number: 2, name: '坤为地', upper: '坤', lower: '坤', url: '/2026/06/04/坤为地/' },
      { number: 3, name: '水雷屯', upper: '坎', lower: '震', url: '/2026/06/06/水雷屯/' },
      { number: 4, name: '山水蒙', upper: '艮', lower: '坎', url: '/2026/06/06/山水蒙/' },
      { number: 5, name: '水天需', upper: '坎', lower: '乾', url: '/2026/06/07/水天需/' },
      { number: 6, name: '天水讼', upper: '乾', lower: '坎', url: '/2026/06/09/天水讼/' },
      { number: 7, name: '地水师', upper: '坤', lower: '坎', url: '/2026/06/10/地水师/' },
      { number: 8, name: '水地比', upper: '坎', lower: '坤', url: '/2026/06/11/水地比/' },
      { number: 9, name: '风天小畜', upper: '巽', lower: '乾', url: '/2026/06/12/风天小畜/' },
      { number: 10, name: '天泽履', upper: '乾', lower: '兑', url: '/2026/06/17/天泽履/' },
      { number: 11, name: '地天泰', upper: '坤', lower: '乾', url: '/2026/07/03/地天泰/' },
      { number: 12, name: '天地否', upper: '乾', lower: '坤', url: '/2026/07/03/天地否/' },
      { number: 13, name: '天火同人', upper: '乾', lower: '离', url: '/2026/07/03/天火同人/' },
      { number: 14, name: '火天大有', upper: '离', lower: '乾', url: '/2026/07/03/火天大有/' },
      { number: 15, name: '地山谦', upper: '坤', lower: '艮', url: '/2026/07/03/地山谦/' },
      { number: 16, name: '雷地豫', upper: '震', lower: '坤', url: '/2026/07/03/雷地豫/' },
      { number: 17, name: '泽雷随', upper: '兑', lower: '震', url: '/2026/08/06/泽雷随/' },
      { number: 18, name: '山风蛊', upper: '艮', lower: '巽', url: '/2026/08/06/山风蛊/' },
      { number: 19, name: '地泽临', upper: '坤', lower: '兑', url: '/2026/08/07/地泽临/' },
      { number: 20, name: '风地观', upper: '巽', lower: '坤', url: '/2026/08/06/风地观/' },
      { number: 21, name: '火雷噬嗑', upper: '离', lower: '震', url: '/2026/08/08/火雷噬嗑/' },
      { number: 22, name: '山火贲', upper: '艮', lower: '离', url: '/2026/08/09/山火贲/' },
      { number: 23, name: '山地剥', upper: '艮', lower: '坤', url: '/2026/08/06/山地剥/' },
      { number: 24, name: '地雷复', upper: '坤', lower: '震', url: '/2026/08/06/地雷复/' },
      { number: 25, name: '天雷无妄', upper: '乾', lower: '震' },
      { number: 26, name: '山天大畜', upper: '艮', lower: '乾' },
      { number: 27, name: '山雷颐', upper: '艮', lower: '震' },
      { number: 28, name: '泽风大过', upper: '兑', lower: '巽' },
      { number: 29, name: '坎为水', upper: '坎', lower: '坎' },
      { number: 30, name: '离为火', upper: '离', lower: '离' },
      { number: 31, name: '泽山咸', upper: '兑', lower: '艮' },
      { number: 32, name: '雷风恒', upper: '震', lower: '巽' },
      { number: 33, name: '天山遁', upper: '乾', lower: '艮' },
      { number: 34, name: '雷天大壮', upper: '震', lower: '乾' },
      { number: 35, name: '火地晋', upper: '离', lower: '坤' },
      { number: 36, name: '地火明夷', upper: '坤', lower: '离' },
      { number: 37, name: '风火家人', upper: '巽', lower: '离' },
      { number: 38, name: '火泽睽', upper: '离', lower: '兑' },
      { number: 39, name: '水山蹇', upper: '坎', lower: '艮' },
      { number: 40, name: '雷水解', upper: '震', lower: '坎' },
      { number: 41, name: '山泽损', upper: '艮', lower: '兑' },
      { number: 42, name: '风雷益', upper: '巽', lower: '震' },
      { number: 43, name: '泽天夬', upper: '兑', lower: '乾' },
      { number: 44, name: '天风姤', upper: '乾', lower: '巽' },
      { number: 45, name: '泽地萃', upper: '兑', lower: '坤' },
      { number: 46, name: '地风升', upper: '坤', lower: '巽' },
      { number: 47, name: '泽水困', upper: '兑', lower: '坎' },
      { number: 48, name: '水风井', upper: '坎', lower: '巽' },
      { number: 49, name: '泽火革', upper: '兑', lower: '离' },
      { number: 50, name: '火风鼎', upper: '离', lower: '巽' },
      { number: 51, name: '震为雷', upper: '震', lower: '震' },
      { number: 52, name: '艮为山', upper: '艮', lower: '艮' },
      { number: 53, name: '风山渐', upper: '巽', lower: '艮' },
      { number: 54, name: '雷泽归妹', upper: '震', lower: '兑' },
      { number: 55, name: '雷火丰', upper: '震', lower: '离' },
      { number: 56, name: '火山旅', upper: '离', lower: '艮' },
      { number: 57, name: '巽为风', upper: '巽', lower: '巽' },
      { number: 58, name: '兑为泽', upper: '兑', lower: '兑' },
      { number: 59, name: '风水涣', upper: '巽', lower: '坎' },
      { number: 60, name: '水泽节', upper: '坎', lower: '兑' },
      { number: 61, name: '风泽中孚', upper: '巽', lower: '兑' },
      { number: 62, name: '雷山小过', upper: '震', lower: '艮' },
      { number: 63, name: '水火既济', upper: '坎', lower: '离' },
      { number: 64, name: '火水未济', upper: '离', lower: '坎' }
    ];

    var pinyin = [
      'qián', 'kūn', 'zhūn', 'méng', 'xū', 'sòng', 'shī', 'bǐ',
      'xiǎo xù', 'lǚ', 'tài', 'pǐ', 'tóng rén', 'dà yǒu', 'qiān', 'yù',
      'suí', 'gǔ', 'lín', 'guān', 'shì hé', 'bì', 'bō', 'fù',
      'wú wàng', 'dà xù', 'yí', 'dà guò', 'kǎn', 'lí', 'xián', 'héng',
      'dùn', 'dà zhuàng', 'jìn', 'míng yí', 'jiā rén', 'kuí', 'jiǎn', 'xiè',
      'sǔn', 'yì', 'guài', 'gòu', 'cuì', 'shēng', 'kùn', 'jǐng',
      'gé', 'dǐng', 'zhèn', 'gèn', 'jiàn', 'guī mèi', 'fēng', 'lǚ',
      'xùn', 'duì', 'huàn', 'jié', 'zhōng fú', 'xiǎo guò', 'jì jì', 'wèi jì'
    ];

    var grid = document.getElementById('hexagram-grid');

    function numberLabel(number) {
      return (number < 10 ? '0' : '') + number;
    }

    function createTextElement(className, text) {
      var element = document.createElement('span');
      element.className = className;
      element.textContent = text;
      return element;
    }

    function createSymbol(entry) {
      var symbol = document.createElement('div');
      symbol.className = 'hexagram-symbol';
      symbol.setAttribute('aria-hidden', 'true');

      (trigrams[entry.upper] + trigrams[entry.lower]).split('').forEach(function (line) {
        var lineElement = document.createElement('span');
        lineElement.className = 'hexagram-line' + (line === '0' ? ' is-yin' : '');
        symbol.appendChild(lineElement);
      });

      return symbol;
    }

    function createCard(entry, romanizedName) {
      var isPublished = Boolean(entry.url);
      var card = document.createElement(isPublished ? 'a' : 'article');
      card.className = 'hexagram-card ' + (isPublished ? 'is-published' : 'is-pending');
      card.title = '第' + entry.number + '卦：' + entry.name;

      if (isPublished) {
        card.href = entry.url;
        card.setAttribute('aria-label', '第' + entry.number + '卦：' + entry.name + '，进入文章');
      } else {
        card.setAttribute('aria-label', '第' + entry.number + '卦：' + entry.name + '，待整理');
      }

      card.appendChild(createTextElement('hexagram-card-number', numberLabel(entry.number)));
      card.appendChild(createSymbol(entry));
      card.appendChild(createTextElement('hexagram-card-name', entry.name));
      card.appendChild(createTextElement('hexagram-card-trigrams', entry.upper + '上 · ' + entry.lower + '下'));

      var romanized = createTextElement('hexagram-card-state', romanizedName);
      romanized.lang = 'zh-Latn';
      card.appendChild(romanized);

      return card;
    }

    hexagrams.forEach(function (entry, index) {
      grid.appendChild(createCard(entry, pinyin[index]));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
