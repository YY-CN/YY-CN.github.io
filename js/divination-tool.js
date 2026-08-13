(function () {
  'use strict';

  var page = document.getElementById('divination-tool-page');
  if (!page) return;

  var STORAGE_KEY = 'hyacinth_divination_history_v1';
  var MAX_HISTORY = 12;
  var state = { method: 'meihua', mode: 'time', busy: false };

  var TRIGRAMS = {
    '乾': { name: '乾', symbol: '☰', nature: '天', element: '金', binary: '111', number: 1 },
    '兑': { name: '兑', symbol: '☱', nature: '泽', element: '金', binary: '011', number: 2 },
    '离': { name: '离', symbol: '☲', nature: '火', element: '火', binary: '101', number: 3 },
    '震': { name: '震', symbol: '☳', nature: '雷', element: '木', binary: '001', number: 4 },
    '巽': { name: '巽', symbol: '☴', nature: '风', element: '木', binary: '110', number: 5 },
    '坎': { name: '坎', symbol: '☵', nature: '水', element: '水', binary: '010', number: 6 },
    '艮': { name: '艮', symbol: '☶', nature: '山', element: '土', binary: '100', number: 7 },
    '坤': { name: '坤', symbol: '☷', nature: '地', element: '土', binary: '000', number: 8 }
  };

  var TRIGRAM_BY_NUMBER = {
    1: TRIGRAMS['乾'], 2: TRIGRAMS['兑'], 3: TRIGRAMS['离'], 4: TRIGRAMS['震'],
    5: TRIGRAMS['巽'], 6: TRIGRAMS['坎'], 7: TRIGRAMS['艮'], 8: TRIGRAMS['坤']
  };

  var NAJIA = {
    '乾': { inner: ['甲子', '甲寅', '甲辰'], outer: ['壬午', '壬申', '壬戌'] },
    '震': { inner: ['庚子', '庚寅', '庚辰'], outer: ['庚午', '庚申', '庚戌'] },
    '巽': { inner: ['辛丑', '辛亥', '辛酉'], outer: ['辛未', '辛巳', '辛卯'] },
    '坎': { inner: ['戊寅', '戊辰', '戊午'], outer: ['戊申', '戊戌', '戊子'] },
    '离': { inner: ['己卯', '己丑', '己亥'], outer: ['己酉', '己未', '己巳'] },
    '艮': { inner: ['丙辰', '丙午', '丙申'], outer: ['丙戌', '丙子', '丙寅'] },
    '兑': { inner: ['丁巳', '丁卯', '丁丑'], outer: ['丁亥', '丁酉', '丁未'] },
    '坤': { inner: ['乙未', '乙巳', '乙卯'], outer: ['癸丑', '癸亥', '癸酉'] }
  };

  var BRANCH_ELEMENTS = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
    '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
  };

  var SIX_SPIRITS = ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'];
  var SPIRIT_START = { '甲': 0, '乙': 0, '丙': 1, '丁': 1, '戊': 2, '己': 3, '庚': 4, '辛': 4, '壬': 5, '癸': 5 };
  var DAY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  var ELEMENT_RELATIONS = {
    '木': { generates: '火', overcomes: '土' }, '火': { generates: '土', overcomes: '金' },
    '土': { generates: '金', overcomes: '水' }, '金': { generates: '水', overcomes: '木' },
    '水': { generates: '木', overcomes: '火' }
  };

  var POST_URLS = {
    '111111': '/2026/06/03/乾为天/', '000000': '/2026/06/04/坤为地/',
    '010001': '/2026/06/06/水雷屯/', '100010': '/2026/06/06/山水蒙/',
    '010111': '/2026/06/07/水天需/', '111010': '/2026/06/09/天水讼/',
    '000010': '/2026/06/10/地水师/', '010000': '/2026/06/11/水地比/',
    '110111': '/2026/06/12/风天小畜/', '111011': '/2026/06/17/天泽履/',
    '000111': '/2026/07/03/地天泰/', '111000': '/2026/07/03/天地否/',
    '111101': '/2026/07/03/天火同人/', '101111': '/2026/07/03/火天大有/',
    '000100': '/2026/07/03/地山谦/', '001000': '/2026/07/03/雷地豫/',
    '011001': '/2026/08/06/泽雷随/', '100110': '/2026/08/06/山风蛊/',
    '000011': '/2026/08/07/地泽临/', '110000': '/2026/08/06/风地观/',
    '101001': '/2026/08/08/火雷噬嗑/', '100101': '/2026/08/09/山火贲/',
    '100000': '/2026/08/06/山地剥/', '000001': '/2026/08/06/地雷复/'
  };

  var HEXAGRAM_ROWS = [
    '000000|坤为地|元亨，利牝马之贞。|地势坤，君子以厚德载物。|柔顺包容，厚德载物。宜静守，不宜躁进。',
    '000001|地雷复|亨。出入无疾，朋来无咎。|雷在地中，复；先王以至日闭关。|一阳来复，否极泰来。利于改过自新。',
    '000010|地水师|贞，丈人吉，无咎。|地中有水，师；君子以容民畜众。|行军用师，需老成持重。聚众成事。',
    '000011|地泽临|元，亨，利，贞。|泽上有地，临；君子以教思无穷。|居高临下，督导教化。防盛极而衰。',
    '000100|地山谦|亨，君子有终。|地中有山，谦；君子以裒多益寡。|谦受益，满招损。谦虚待人，终得善终。',
    '000101|地火明夷|利艰贞。|明入地中，明夷；君子以莅众，用晦而明。|光明受损，处境艰难。宜韬光养晦。',
    '000110|地风升|元亨，用见大人，勿恤。|地中生木，升；君子以顺德，积小以高大。|上升渐进，积小成大。顺行其道。',
    '000111|地天泰|小往大来，吉亨。|天地交，泰；后以财成天地之道。|天地交泰，阴阳和畅。诸事亨通。',
    '001000|雷地豫|利建侯行师。|雷出地奋，豫；先王以作乐崇德。|雷出地奋，和乐之象。利于建业行师。',
    '001001|震为雷|亨。震来虩虩，笑言哑哑。|洊雷，震；君子以恐惧修省。|震动警醒，君子修省。临危不乱。',
    '001010|雷水解|利西南，无所往，其来复吉。|雷雨作，解；君子以赦过宥罪。|困难解除，雷雨作而百果生。宜宽宥。',
    '001011|雷泽归妹|征凶，无攸利。|泽上有雷，归妹；君子以永终知敝。|嫁娶之象，但非正配。征凶，宜守正。',
    '001100|雷山小过|亨，利贞。可小事，不可大事。|山上有雷，小过；君子以行过乎恭。|小有过越，宜下不宜上。小事可成。',
    '001101|雷火丰|亨，王假之，勿忧，宜日中。|雷电皆至，丰；君子以折狱致刑。|丰盛光大，如日中天。防盛极而衰。',
    '001110|雷风恒|亨，无咎，利贞，利有攸往。|雷风，恒；君子以立不易方。|恒久不变，守常道。持之以恒。',
    '001111|雷天大壮|利贞。|雷在天上，大壮；君子以非礼弗履。|阳气大壮，刚健有为。守正不恃强。',
    '010000|水地比|吉。原筮元永贞，无咎。|地上有水，比；先王以建万国，亲诸侯。|亲比互助，团结他人。守正得吉。',
    '010001|水雷屯|元亨利贞，勿用有攸往，利建侯。|云雷屯，君子以经纶。|万事开头难，宜筹建基业。',
    '010010|坎为水|习坎，有孚，维心亨。|水洊至，习坎；君子以常德行。|重重险难，诚信于心。习坎脱险。',
    '010011|水泽节|亨。苦节不可贞。|泽上有水，节；君子以制数度。|节制有度，亨通。不可过度苦节。',
    '010100|水山蹇|利西南，不利东北；利见大人，贞吉。|山上有水，蹇；君子以反身修德。|险阻在前，宜退守修德。',
    '010101|水火既济|亨，小利贞，初吉终乱。|水在火上，既济；君子以思患而豫防之。|事已成，防患未然。守成为难。',
    '010110|水风井|改邑不改井，无丧无得。|木上有水，井；君子以劳民劝相。|井养而不穷，贵在维护。功亏一篑凶。',
    '010111|水天需|有孚，光亨，贞吉。利涉大川。|云上于天，需；君子以饮食宴乐。|等待时机，有孚光亨。不可冒进。',
    '011000|泽地萃|亨。王假有庙，利见大人。|泽上于地，萃；君子以除戎器，戒不虞。|会聚之象，贵人相助。聚而后用。',
    '011001|泽雷随|元亨利贞，无咎。|泽中有雷，随；君子以向晦入宴息。|随顺时势，择善而从。',
    '011010|泽水困|亨，贞，大人吉，无咎。|泽无水，困；君子以致命遂志。|穷困之境，守正待时。大人可脱困。',
    '011011|兑为泽|亨，利贞。|丽泽，兑；君子以朋友讲习。|喜悦和悦，朋友讲习。亨而利贞。',
    '011100|泽山咸|亨，利贞，取女吉。|山上有泽，咸；君子以虚受人。|感应相通，以虚受人。人事和顺。',
    '011101|泽火革|巳日乃孚，元亨利贞，悔亡。|泽中有火，革；君子以治历明时。|变革之象，顺天应人。革故鼎新。',
    '011110|泽风大过|栋桡，利有攸往，亨。|泽灭木，大过；君子以独立不惧。|阳刚过甚，栋梁桡曲。特立独行。',
    '011111|泽天夬|扬于王庭，孚号有厉。|泽上于天，夬；君子以施禄及下。|五阳决一阴，果断除奸。利有攸往。',
    '100000|山地剥|不利有攸往。|山附于地，剥；上以厚下安宅。|阴盛阳衰，剥落之象。宜退守厚下。',
    '100001|山雷颐|贞吉。观颐，自求口实。|山下有雷，颐；君子以慎言语，节饮食。|颐养自正，修身养性。',
    '100010|山水蒙|亨。匪我求童蒙，童蒙求我。|山下出泉，蒙；君子以果行育德。|启蒙教育，诚心求教。果决育德。',
    '100011|山泽损|有孚，元吉，无咎，可贞。|山下有泽，损；君子以惩忿窒欲。|损下益上，有孚元吉。惩忿窒欲。',
    '100100|艮为山|艮其背，不获其身，无咎。|兼山，艮；君子以思不出其位。|止其所当止，不妄动。思不出位。',
    '100101|山火贲|亨，小利有攸往。|山下有火，贲；君子以明庶政。|文饰之美，小利攸往。重实质轻文饰。',
    '100110|山风蛊|元亨，利涉大川。|山下有风，蛊；君子以振民育德。|积弊已深，宜革故鼎新。',
    '100111|天山遁|亨，小利贞。|天下有山，遁；君子以远小人。|退避隐忍，远小人。小利守正。',
    '101000|火地晋|康侯用锡马蕃庶，昼日三接。|明出地上，晋；君子以自昭明德。|晋升之象，光明上进。日益亲近。',
    '101001|火雷噬嗑|亨。利用狱。|雷电噬嗑；先王以明罚敕法。|明察果断，利用狱讼。明辨是非。',
    '101010|火水未济|亨，小狐汔济，濡其尾，无攸利。|火在水上，未济；君子以慎辨物居方。|事未成，需谨慎行事。小狐涉水尾濡。',
    '101011|火泽睽|小事吉。|上火下泽，睽；君子以同而异。|乖睽离散，小事可吉。求同存异。',
    '101100|火山旅|小亨，旅贞吉。|山上有火，旅；君子以明慎用刑。|行旅在外，宜守正。谨慎用事。',
    '101101|离为火|利贞，亨。畜牝牛，吉。|明两作，离；大人以继明照于四方。|光明附丽，柔顺中正。畜牝牛吉。',
    '101110|火风鼎|元吉，亨。|木上有火，鼎；君子以正位凝命。|鼎新革故，正位凝命。大吉亨通。',
    '101111|火天大有|元亨。|火在天上，大有；君子以遏恶扬善。|大有收获，光明普照。顺天休命。',
    '110000|风地观|盥而不荐，有孚颙若。|风行地上，观；先王以省方观民设教。|观瞻视察，省方设教。宜观察学习。',
    '110001|风雷益|利有攸往，利涉大川。|风雷，益；君子以见善则迁，有过则改。|损上益下，兴盛之象。见善则迁。',
    '110010|风水涣|亨。王假有庙，利涉大川。|风行水上，涣；先王以享于帝立庙。|离散消解，化险为夷。聚合人心。',
    '110011|风泽中孚|豚鱼吉，利涉大川，利贞。|泽上有风，中孚；君子以议狱缓死。|诚信感通，利涉大川。诚信为本。',
    '110100|风山渐|女归吉，利贞。|山上有木，渐；君子以居贤德善俗。|循序渐进，女归之象。循序渐进则吉。',
    '110101|风火家人|利女贞。|风自火出，家人；君子以言有物，而行有恒。|家庭和睦，由内而外。正家定天下。',
    '110110|巽为风|小亨，利有攸往，利见大人。|随风，巽；君子以申命行事。|随顺谦逊，申命行事。小亨。',
    '110111|风天小畜|亨。密云不雨，自我西郊。|风行天上，小畜；君子以懿文德。|小有蓄积，密云不雨。修文德待时。',
    '111000|天地否|否之匪人，不利君子贞，大往小来。|天地不交，否；君子以俭德辟难。|天地不交，闭塞不通。宜俭德避难。',
    '111001|天雷无妄|元亨利贞。其匪正有眚，不利有攸往。|天下雷行，物与无妄；先王以茂对时。|真实无妄，顺其自然。心存不正则灾。',
    '111010|天水讼|有孚，窒惕，中吉，终凶。|天与水违行，讼；君子以作事谋始。|争讼之象，宜和解止争。谋事于始。',
    '111011|天泽履|履虎尾，不咥人，亨。|上天下泽，履；君子以辨上下，定民志。|谨慎履虎尾，不咥人亨。辨上下之分。',
    '111100|天山遁|亨，小利贞。|天下有山，遁；君子以远小人。|退避隐忍，远小人。小利守正。',
    '111101|天火同人|同人于野，亨。利涉大川。|天与火，同人；君子以类族辨物。|同人共事，光明正大。涉险有功。',
    '111110|天风姤|女壮，勿用取女。|天下有风，姤；后以施命诰四方。|一阴初生，遇合之象。相遇需谨慎。',
    '111111|乾为天|元亨利贞。|天行健，君子以自强不息。|刚健中正，自强不息。创始亨通。'
  ];

  var HEXAGRAMS = {};
  HEXAGRAM_ROWS.forEach(function (row) {
    var parts = row.split('|');
    HEXAGRAMS[parts[0]] = { hex: parts[0], name: parts[1], judgment: parts[2], image: parts[3], meaning: parts[4] };
  });

  var methodCards = page.querySelectorAll('[data-divination-method]');
  var modeButtons = page.querySelectorAll('[data-divination-mode]');
  var numberFields = document.getElementById('divination-number-fields');
  var questionInput = document.getElementById('divination-question');
  var numberOne = document.getElementById('divination-number-one');
  var numberTwo = document.getElementById('divination-number-two');
  var coinStage = document.getElementById('divination-coin-stage');
  var coinStatus = document.getElementById('divination-coin-status');
  var coinElements = page.querySelectorAll('.divination-coin');
  var castButton = document.getElementById('divination-cast-button');
  var formStatus = document.getElementById('divination-form-status');
  var resultElement = document.getElementById('divination-result');
  var historyPanel = document.getElementById('divination-history-panel');
  var historyList = document.getElementById('divination-history-list');

  init();

  function init() {
    methodCards.forEach(function (card) {
      card.addEventListener('click', function () { setMethod(card.getAttribute('data-divination-method')); });
    });
    modeButtons.forEach(function (button) {
      button.addEventListener('click', function () { setMode(button.getAttribute('data-divination-mode')); });
    });
    document.getElementById('divination-form').addEventListener('submit', startCasting);
    document.getElementById('divination-history-toggle').addEventListener('click', toggleHistory);
    document.getElementById('divination-history-clear').addEventListener('click', clearHistory);
    setMethod('meihua');
  }

  function setMethod(method) {
    state.method = method;
    state.mode = 'time';
    methodCards.forEach(function (card) {
      var active = card.getAttribute('data-divination-method') === method;
      card.classList.toggle('is-active', active);
      card.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    var title = document.getElementById('divination-form-title');
    var intro = document.getElementById('divination-form-intro');
    var secondButton = modeButtons[1];
    if (method === 'liuyao') {
      title.textContent = '周易六爻';
      intro.textContent = '铜钱摇取六爻，或以当前时间简化取数，观察动爻之变。';
      secondButton.setAttribute('data-divination-mode', 'coin');
      secondButton.innerHTML = '<i class="fa fa-circle"></i> 铜钱摇卦';
    } else {
      title.textContent = '梅花易数';
      intro.textContent = '选择时间或数字取象，得到本卦、动爻及体用关系。';
      secondButton.setAttribute('data-divination-mode', 'number');
      secondButton.innerHTML = '<i class="fa fa-hashtag"></i> 数字起卦';
    }
    refreshForm();
  }

  function setMode(mode) {
    if (state.busy) return;
    state.mode = mode;
    refreshForm();
  }

  function refreshForm() {
    modeButtons.forEach(function (button) {
      var active = button.getAttribute('data-divination-mode') === state.mode;
      button.classList.toggle('is-active', active);
    });
    var isNumber = state.method === 'meihua' && state.mode === 'number';
    var isCoin = state.method === 'liuyao' && state.mode === 'coin';
    numberFields.hidden = !isNumber;
    coinStage.hidden = !isCoin;
    if (isCoin) {
      coinStatus.textContent = '默念所问之事，准备摇取六爻。';
      castButton.querySelector('span').textContent = '开始摇卦';
    } else {
      castButton.querySelector('span').textContent = '开始起卦';
    }
    setFormStatus('所得结果仅作传统文化参考，请理性看待。', 'normal');
  }

  function startCasting(event) {
    event.preventDefault();
    if (state.busy) return;
    var question = questionInput.value.trim();
    if (state.method === 'meihua' && state.mode === 'number') {
      var first = Number(numberOne.value);
      var second = Number(numberTwo.value);
      if (!Number.isFinite(first) || !Number.isFinite(second)) {
        setFormStatus('请输入两个有效数字后再起卦。', 'error');
        numberOne.focus();
        return;
      }
      finishCasting(castMeihuaByNumbers(first, second, question));
      return;
    }
    if (state.method === 'liuyao' && state.mode === 'coin') {
      castLiuyaoByCoins(question);
      return;
    }
    finishCasting(castByTime(state.method, question));
  }

  function castByTime(method, question) {
    var now = new Date();
    var cyclicalYear = ((now.getFullYear() - 1984) % 60 + 60) % 60 + 1;
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var hourBranch = Math.floor(((now.getHours() + 1) % 24) / 2) + 1;
    var upperNumber = cyclicalYear + month + day;
    var lowerNumber = upperNumber + hourBranch;
    var upper = trigramByNumber(upperNumber);
    var lower = trigramByNumber(lowerNumber);
    var movingLine = modulo(lowerNumber, 6) - 1;
    return buildResult({
      method: method,
      mode: 'time',
      question: question,
      upper: upper,
      lower: lower,
      hex: upper.binary + lower.binary,
      movingLines: [movingLine],
      date: now,
      source: '以当前本地公历时间作简化取数：年序 ' + cyclicalYear + '、月 ' + month + '、日 ' + day + '、时序 ' + hourBranch + '。'
    });
  }

  function castMeihuaByNumbers(first, second, question) {
    var upper = trigramByNumber(Math.abs(first));
    var lower = trigramByNumber(Math.abs(second));
    var movingLine = modulo(Math.abs(first + second), 6) - 1;
    return buildResult({
      method: 'meihua',
      mode: 'number',
      question: question,
      upper: upper,
      lower: lower,
      hex: upper.binary + lower.binary,
      movingLines: [movingLine],
      date: new Date(),
      source: '以数字 ' + first + ' 取上卦、' + second + ' 取下卦；两数之和取动爻。'
    });
  }

  function castLiuyaoByCoins(question) {
    state.busy = true;
    castButton.disabled = true;
    var lines = [];
    var lineNumber = 0;
    setFormStatus('正在摇取六爻，请稍候。', 'normal');

    function nextLine() {
      if (lineNumber >= 6) {
        state.busy = false;
        castButton.disabled = false;
        var hex = lines.map(function (line) { return String(line.value); }).reverse().join('');
        finishCasting(buildResult({
          method: 'liuyao',
          mode: 'coin',
          question: question,
          hex: hex,
          movingLines: lines.map(function (line, index) { return line.moving ? index : -1; }).filter(function (index) { return index >= 0; }),
          date: new Date(),
          source: '三枚铜钱连续摇取六次，自初爻至上爻成卦。'
        }));
        return;
      }

      lineNumber += 1;
      coinStatus.textContent = '正在摇取第 ' + lineNumber + ' 爻…';
      var coins = [Math.random() < .5 ? 1 : 0, Math.random() < .5 ? 1 : 0, Math.random() < .5 ? 1 : 0];
      animateCoins(coins);
      window.setTimeout(function () {
        var sum = coins.reduce(function (total, coin) { return total + (coin ? 3 : 2); }, 0);
        var line = lineFromSum(sum);
        lines.push(line);
        coinStatus.textContent = '第 ' + lineNumber + ' 爻得 ' + line.label + '，' + (lineNumber < 6 ? '继续摇取下一爻…' : '卦象已成。');
        window.setTimeout(nextLine, 570);
      }, 680);
    }
    nextLine();
  }

  function animateCoins(coins) {
    coinElements.forEach(function (coin, index) {
      coin.classList.remove('is-tossing', 'is-tail');
      void coin.offsetWidth;
      coin.classList.add('is-tossing');
      if (!coins[index]) coin.classList.add('is-tail');
    });
  }

  function lineFromSum(sum) {
    if (sum === 6) return { value: 0, moving: true, label: '老阴（动）' };
    if (sum === 7) return { value: 1, moving: false, label: '少阳' };
    if (sum === 8) return { value: 0, moving: false, label: '少阴' };
    return { value: 1, moving: true, label: '老阳（动）' };
  }

  function buildResult(input) {
    var upper = input.upper || trigramFromBinary(input.hex.slice(0, 3));
    var lower = input.lower || trigramFromBinary(input.hex.slice(3, 6));
    var changedHex = changeHex(input.hex, input.movingLines);
    var result = {
      method: input.method,
      mode: input.mode,
      question: input.question,
      source: input.source,
      hex: input.hex,
      changedHex: changedHex,
      hexagram: HEXAGRAMS[input.hex],
      changedHexagram: HEXAGRAMS[changedHex],
      upper: upper,
      lower: lower,
      movingLines: input.movingLines
    };

    if (input.method === 'meihua') {
      var movingInUpper = input.movingLines.some(function (line) { return line >= 3; });
      result.ti = movingInUpper ? lower : upper;
      result.yong = movingInUpper ? upper : lower;
      result.relation = wuxingRelation(result.ti.element, result.yong.element);
      result.relationText = relationText(result.relation, result.ti, result.yong);
    }
    if (input.method === 'liuyao') {
      result.liuyao = createLiuyaoPlate(input.hex, changedHex, input.movingLines, input.date || new Date());
    }
    return result;
  }

  function createLiuyaoPlate(hex, changedHex, movingLines, date) {
    var palace = getPalaceInfo(hex);
    var dayStem = getDayStem(date);
    var spiritOffset = SPIRIT_START[dayStem];
    var originalNajia = getNajiaLines(hex);
    var hiddenSpirits = getHiddenSpirits(originalNajia, palace);
    var originalLines = originalNajia.map(function (line, index) {
      return decoratePlateLine(line, index, palace.element, movingLines.indexOf(index) !== -1, index === palace.shi, index === palace.ying, SIX_SPIRITS[(spiritOffset + index) % 6]);
    });
    originalLines.forEach(function (line, index) { line.hiddenSpirit = hiddenSpirits[index]; });
    var changedLines = getNajiaLines(changedHex).map(function (line, index) {
      return decoratePlateLine(line, index, palace.element, false, false, false, SIX_SPIRITS[(spiritOffset + index) % 6]);
    });
    return {
      palace: palace,
      dayStem: dayStem,
      spiritsStart: SIX_SPIRITS[spiritOffset],
      originalLines: originalLines,
      changedLines: changedLines
    };
  }

  function getNajiaLines(hex) {
    var outer = trigramFromBinary(hex.slice(0, 3));
    var inner = trigramFromBinary(hex.slice(3, 6));
    var values = NAJIA[inner.name].inner.concat(NAJIA[outer.name].outer);
    return values.map(function (value) {
      var branch = value.charAt(1);
      return { stemBranch: value, branch: branch, element: BRANCH_ELEMENTS[branch] };
    });
  }

  function decoratePlateLine(line, index, palaceElement, moving, shi, ying, spirit) {
    return {
      index: index,
      position: ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'][index],
      stemBranch: line.stemBranch,
      element: line.element,
      kin: sixKin(palaceElement, line.element),
      moving: moving,
      shi: shi,
      ying: ying,
      spirit: spirit
    };
  }

  function getHiddenSpirits(originalLines, palace) {
    var presentKinds = originalLines.map(function (line) { return sixKin(palace.element, line.element); });
    var palaceHex = palace.trigram.binary + palace.trigram.binary;
    return getNajiaLines(palaceHex).map(function (line) {
      var kin = sixKin(palace.element, line.element);
      return presentKinds.indexOf(kin) === -1 ? { kin: kin, stemBranch: line.stemBranch, element: line.element } : null;
    });
  }

  function getPalaceInfo(hex) {
    var outer = hex.slice(0, 3);
    var inner = hex.slice(3, 6);
    var same = [];
    for (var i = 0; i < 3; i += 1) {
      if (inner.charAt(i) === outer.charAt(i)) same.push(i);
    }

    var category;
    var shi;
    var palaceBinary;
    if (same.length === 3) {
      category = '本宫卦';
      shi = 5;
      palaceBinary = outer;
    } else if (same.length === 0) {
      category = '三世卦';
      shi = 2;
      palaceBinary = outer;
    } else if (same.length === 1) {
      if (same[0] === 0) {
        category = '二世卦';
        shi = 1;
        palaceBinary = outer;
      } else if (same[0] === 2) {
        category = '四世卦';
        shi = 3;
        palaceBinary = invertTrigram(inner);
      } else {
        category = '游魂卦';
        shi = 3;
        palaceBinary = invertTrigram(inner);
      }
    } else {
      var different = [0, 1, 2].filter(function (position) { return same.indexOf(position) === -1; })[0];
      if (different === 2) {
        category = '一世卦';
        shi = 0;
        palaceBinary = outer;
      } else if (different === 0) {
        category = '五世卦';
        shi = 4;
        palaceBinary = invertTrigram(inner);
      } else {
        category = '归魂卦';
        shi = 2;
        palaceBinary = inner;
      }
    }

    var palace = trigramFromBinary(palaceBinary);
    return {
      name: palace.name + '宫',
      trigram: palace,
      element: palace.element,
      category: category,
      shi: shi,
      ying: (shi + 3) % 6
    };
  }

  function invertTrigram(binary) {
    return binary.split('').map(function (bit) { return bit === '0' ? '1' : '0'; }).join('');
  }

  function sixKin(palaceElement, lineElement) {
    if (palaceElement === lineElement) return '兄弟';
    if (ELEMENT_RELATIONS[lineElement].generates === palaceElement) return '父母';
    if (ELEMENT_RELATIONS[palaceElement].generates === lineElement) return '子孙';
    if (ELEMENT_RELATIONS[lineElement].overcomes === palaceElement) return '官鬼';
    return '妻财';
  }

  function getDayStem(date) {
    // 2000-01-07 为甲子日；按本地公历日期以零点换日计算日干。
    var current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    var reference = Date.UTC(2000, 0, 7);
    var elapsedDays = Math.round((current - reference) / 86400000);
    return DAY_STEMS[((elapsedDays % 10) + 10) % 10];
  }

  function finishCasting(result) {
    renderResult(result);
    saveHistory(result);
    renderHistory();
    setFormStatus('卦象已成，可阅读下方本卦与变卦的基础释义。', 'success');
    window.setTimeout(function () {
      resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  function renderResult(result) {
    var methodText = result.method === 'meihua' ? '梅花易数' : '周易六爻';
    var modeText = result.mode === 'coin' ? '铜钱摇卦' : result.mode === 'number' ? '数字起卦' : '时间取数';
    var movingText = result.movingLines.length ? result.movingLines.map(function (line) { return '第' + (line + 1) + '爻'; }).join('、') : '无动爻';
    var postLink = POST_URLS[result.hex];

    resultElement.innerHTML =
      '<div class="divination-result-heading">' +
        '<span class="divination-result-number">02</span>' +
        '<div><h2>所得卦象</h2><p>' + methodText + ' · ' + modeText + ' · ' + escapeHtml(result.source) + '</p></div>' +
      '</div>' +
      (result.question ? '<p class="divination-result-question"><i class="fa fa-comment-o"></i> 所问：' + escapeHtml(result.question) + '</p>' : '') +
      '<div class="divination-hex-grid">' +
        renderHexCard('本卦', result.hex, result.hexagram, result.movingLines, false) +
        renderHexCard('变卦', result.changedHex, result.changedHexagram, [], true) +
      '</div>' +
      '<div class="divination-moving-summary"><strong>动爻</strong>' + movingText + '</div>' +
      (result.method === 'meihua' ? renderMeihuaAnalysis(result) : '') +
      (result.method === 'liuyao' ? renderLiuyaoPlate(result) : '') +
      '<div class="divination-interpretation-grid">' +
        renderInterpretation('卦辞', 'fa-quote-left', result.hexagram.judgment, false) +
        renderInterpretation('象曰', 'fa-leaf', result.hexagram.image, false) +
        renderInterpretation('白话释义', 'fa-book-open', result.hexagram.meaning, true) +
      '</div>' +
      '<section class="divination-ai-result" id="divination-ai-result" hidden aria-live="polite"></section>' +
      '<div class="divination-result-actions">' +
        (postLink ? '<a href="' + postLink + '"><i class="fa fa-book"></i> 阅读对应卦文</a>' : '') +
        '<button type="button" id="divination-ai-interpret"><i class="fa fa-magic"></i> AI 解读</button>' +
        '<button type="button" id="divination-copy-result" hidden><i class="fa fa-copy"></i> 复制结果</button>' +
      '</div>';
    resultElement.hidden = false;
    document.getElementById('divination-ai-interpret').addEventListener('click', function () { requestAiInterpretation(result); });
    document.getElementById('divination-copy-result').addEventListener('click', function () { copyResult(result); });
  }

  function renderHexCard(label, hex, data, movingLines, changed) {
    var upper = trigramFromBinary(hex.slice(0, 3));
    var lower = trigramFromBinary(hex.slice(3, 6));
    return '<article class="divination-hex-card' + (changed ? ' is-changed' : '') + '">' +
      '<span>' + label + '</span>' +
      '<h3>' + data.name + '</h3>' +
      '<p>' + upper.name + upper.symbol + '上 · ' + lower.name + lower.symbol + '下</p>' +
      renderDiagram(hex, movingLines) +
    '</article>';
  }

  function renderDiagram(hex, movingLines) {
    var lines = hex.split('').map(function (bit, index) {
      var moving = movingLines.indexOf(5 - index) !== -1;
      return '<span class="divination-yao' + (bit === '0' ? ' is-yin' : '') + (moving ? ' is-moving' : '') + '">' + (moving ? '<em>动</em>' : '') + '</span>';
    }).join('');
    return '<div class="divination-hexagram-symbol" aria-label="卦象">' + lines + '</div>';
  }

  function renderMeihuaAnalysis(result) {
    return '<div class="divination-meihua-analysis">' +
      '<div><strong>体卦</strong>' + result.ti.name + result.ti.symbol + '（' + result.ti.element + '）　<strong>用卦</strong>' + result.yong.name + result.yong.symbol + '（' + result.yong.element + '）</div>' +
      '<div><strong>体用关系</strong><b>' + result.relation + '</b>　' + result.relationText + '</div>' +
    '</div>';
  }

  function renderLiuyaoPlate(result) {
    var plate = result.liuyao;
    var rows = [];
    for (var index = 5; index >= 0; index -= 1) {
      rows.push(renderLiuyaoPlateRow(plate.originalLines[index], plate.changedLines[index]));
    }
    return '<section class="divination-plate" aria-label="六爻纳甲装卦盘">' +
      '<div class="divination-plate-heading"><div><span>NA JIA PLATE</span><h3>六爻纳甲装卦</h3></div><p>以' + plate.dayStem + '日排六神（六兽），' + plate.palace.name + '属' + plate.palace.element + '，' + plate.palace.category + '。</p></div>' +
      '<div class="divination-plate-meta"><span><b>卦宫</b>' + plate.palace.name + '（' + plate.palace.element + '）</span><span><b>世应</b>世在' + plate.originalLines[plate.palace.shi].position + ' · 应在' + plate.originalLines[plate.palace.ying].position + '</span><span><b>六神 / 六兽</b>' + plate.dayStem + '日初爻起' + plate.spiritsStart + '</span></div>' +
      '<div class="divination-plate-table"><div class="divination-plate-head"><span>伏神</span><span>六神</span><span>本卦 · 六亲纳甲</span><span>爻位</span><span>变卦 · 六亲纳甲</span></div>' + rows.join('') + '</div>' +
      '<p class="divination-plate-note"><i class="fa fa-info-circle"></i> 变卦六亲依主卦' + plate.palace.name + '五行排定；世、应标于本卦。</p>' +
    '</section>';
  }

  function renderLiuyaoPlateRow(original, changed) {
    var tags = (original.shi ? '<em class="is-shi">世</em>' : '') + (original.ying ? '<em class="is-ying">应</em>' : '') + (original.moving ? '<em class="is-moving">动</em>' : '');
    return '<div class="divination-plate-row">' +
      '<span class="divination-plate-hidden">' + (original.hiddenSpirit ? original.hiddenSpirit.kin + original.hiddenSpirit.stemBranch + original.hiddenSpirit.element : '') + '</span>' +
      '<span class="divination-plate-spirit">' + original.spirit + '</span>' +
      '<span class="divination-plate-line"><b>' + original.kin + '</b><i>' + original.stemBranch + original.element + '</i></span>' +
      '<span class="divination-plate-position">' + original.position + tags + '</span>' +
      '<span class="divination-plate-line is-changed"><b>' + changed.kin + '</b><i>' + changed.stemBranch + changed.element + '</i></span>' +
    '</div>';
  }

  function renderInterpretation(title, icon, content, wide) {
    return '<article class="divination-interpretation' + (wide ? ' is-wide' : '') + '"><h3><i class="fa ' + icon + '"></i>' + title + '</h3><p>' + escapeHtml(content) + '</p></article>';
  }

  function copyResult(result) {
    var button = document.getElementById('divination-copy-result');
    var output = document.getElementById('divination-ai-result');
    var aiText = output && output.dataset ? output.dataset.aiText : '';
    if (!aiText) {
      setFormStatus('请先生成 AI 解读后再复制结果。', 'error');
      return;
    }
    var divinationText = result.method === 'liuyao' ? buildLiuyaoAiText(result) : buildMeihuaAiText(result);
    var text = divinationText + '\n\nAI 解读\n' + aiText;
    copyText(text).then(function () {
      setFormStatus('起卦信息与 AI 解读结果已复制。', 'success');
      if (!button) return;
      button.innerHTML = '<i class="fa fa-check"></i> 已复制';
      window.setTimeout(function () { button.innerHTML = '<i class="fa fa-copy"></i> 复制结果'; }, 1600);
    });
  }

  function requestAiInterpretation(result) {
    var button = document.getElementById('divination-ai-interpret');
    var output = document.getElementById('divination-ai-result');
    var copyButton = document.getElementById('divination-copy-result');
    var content = result.method === 'liuyao' ? buildLiuyaoAiText(result) : buildMeihuaAiText(result);
    if (!button || !output) return;

    button.disabled = true;
    button.innerHTML = '<i class="fa fa-spinner fa-spin"></i> 解读中';
    output.hidden = false;
    delete output.dataset.aiText;
    if (copyButton) copyButton.hidden = true;
    output.className = 'divination-ai-result is-loading';
    output.innerHTML = '<p><i class="fa fa-spinner fa-spin"></i> 正在整理卦象并请求解读…</p>';

    fetch('https://hyacinth-ai.jiatu9712.workers.dev/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content })
    }).then(function (response) {
      return response.json().then(function (data) {
        if (!response.ok || !data.text) throw new Error(data.error || '暂时无法获取 AI 解读');
        return data.text;
      });
    }).then(function (text) {
      output.className = 'divination-ai-result';
      output.dataset.aiText = text;
      output.innerHTML = '<div class="divination-ai-heading"><span>AI INTERPRETATION</span><h3><i class="fa fa-magic"></i> AI 解读</h3></div><div class="divination-ai-content">' + renderAiMarkdown(text) + '</div><p class="divination-ai-note">内容仅作传统文化参考，请结合现实情况独立判断。</p>';
      if (copyButton) copyButton.hidden = false;
      button.innerHTML = '<i class="fa fa-refresh"></i> 重新解读';
      setFormStatus('AI 解读已生成。', 'success');
    }).catch(function (error) {
      output.className = 'divination-ai-result is-error';
      output.innerHTML = '<p><i class="fa fa-exclamation-circle"></i> ' + escapeHtml(error.message || '暂时无法获取 AI 解读') + '</p>';
      button.innerHTML = '<i class="fa fa-repeat"></i> 重试 AI 解读';
      setFormStatus('AI 解读暂不可用，请稍后重试。', 'error');
    }).finally(function () {
      button.disabled = false;
    });
  }

  function buildMeihuaAiText(result) {
    var changedUpper = trigramFromBinary(result.changedHex.slice(0, 3));
    var changedLower = trigramFromBinary(result.changedHex.slice(3, 6));
    return [
      '【梅花易数起卦｜请供 AI 参考分析】',
      '起卦方式：' + (result.mode === 'number' ? '数字起卦' : '时间取数'),
      '取数说明：' + result.source,
      result.question ? '所问之事：' + result.question : '所问之事：未填写',
      '本卦：' + result.hexagram.name + '（上' + result.upper.name + result.upper.symbol + ' · 下' + result.lower.name + result.lower.symbol + '）',
      '变卦：' + result.changedHexagram.name + '（上' + changedUpper.name + changedUpper.symbol + ' · 下' + changedLower.name + changedLower.symbol + '）',
      '动爻：' + formatMovingLines(result.movingLines),
      '体卦：' + result.ti.name + result.ti.symbol + '（' + result.ti.element + '）',
      '用卦：' + result.yong.name + result.yong.symbol + '（' + result.yong.element + '）',
      '体用关系：' + result.relation + '。' + result.relationText,
      '本卦卦辞：' + result.hexagram.judgment,
      '本卦象曰：' + result.hexagram.image,
      '基础释义：' + result.hexagram.meaning,
      '',
      '请基于以上梅花易数起卦信息，以传统术语作文化层面的结构化分析；结论仅供参考。'
    ].join('\n');
  }

  function buildLiuyaoAiText(result) {
    var plate = result.liuyao;
    var lines = [
      '【六爻起卦排盘｜请供 AI 参考分析】',
      '起卦方式：' + (result.mode === 'coin' ? '铜钱摇卦' : '时间取数'),
      '取数说明：' + result.source,
      result.question ? '所问之事：' + result.question : '所问之事：未填写',
      '本卦：' + result.hexagram.name,
      '变卦：' + result.changedHexagram.name,
      '卦宫：' + plate.palace.name + '，五行属' + plate.palace.element + '，' + plate.palace.category,
      '日干：' + plate.dayStem + '日（初爻起' + plate.spiritsStart + '）',
      '世应：世在' + plate.originalLines[plate.palace.shi].position + '，应在' + plate.originalLines[plate.palace.ying].position,
      '动爻：' + formatMovingLines(result.movingLines),
      '',
      '【六爻排盘：自上而下】',
      '爻位｜伏神｜六神（六兽）｜本卦（六亲·纳甲）｜标记｜变卦（六亲·纳甲）'
    ];

    for (var index = 5; index >= 0; index -= 1) {
      var original = plate.originalLines[index];
      var changed = plate.changedLines[index];
      var marks = [];
      if (original.shi) marks.push('世');
      if (original.ying) marks.push('应');
      if (original.moving) marks.push('动');
      lines.push(
        original.position + '｜' +
        (original.hiddenSpirit ? original.hiddenSpirit.kin + original.hiddenSpirit.stemBranch + original.hiddenSpirit.element : '—') + '｜' +
        original.spirit + '｜' +
        original.kin + original.stemBranch + original.element + '｜' +
        (marks.length ? marks.join('、') : '—') + '｜' +
        changed.kin + changed.stemBranch + changed.element
      );
    }

    lines.push('', '本卦卦辞：' + result.hexagram.judgment, '本卦象曰：' + result.hexagram.image, '基础释义：' + result.hexagram.meaning, '', '请根据以上六爻纳甲排盘，结合世应、动爻、六亲、六神、变卦进行传统文化层面的结构化分析；结论仅供参考。');
    return lines.join('\n');
  }

  function formatMovingLines(movingLines) {
    return movingLines.length ? movingLines.map(function (line) { return '第' + (line + 1) + '爻'; }).join('、') : '无动爻';
  }

  function toggleHistory() {
    historyPanel.hidden = !historyPanel.hidden;
    if (!historyPanel.hidden) renderHistory();
  }

  function getHistory() {
    try {
      var stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  function saveHistory(result) {
    try {
      var history = getHistory();
      history.unshift({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        method: result.method === 'meihua' ? '梅花易数' : '周易六爻',
        name: result.hexagram.name,
        changedName: result.changedHexagram.name,
        question: result.question || '',
        time: formatTime(new Date())
      });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
    } catch (error) {
      // 浏览器拒绝本地存储时，仍保留本次起卦结果。
    }
  }

  function renderHistory() {
    var history = getHistory();
    if (!history.length) {
      historyList.innerHTML = '<p class="divination-history-empty">尚无记录。起卦记录仅保存在当前浏览器中。</p>';
      return;
    }
    historyList.innerHTML = history.map(function (item) {
      return '<article class="divination-history-item"><i class="fa fa-yin-yang"></i><div><strong>' + escapeHtml(item.name) + ' → ' + escapeHtml(item.changedName) + '</strong><small>' + escapeHtml(item.method) + ' · ' + escapeHtml(item.time) + (item.question ? ' · ' + escapeHtml(item.question) : '') + '</small></div><button type="button" data-history-id="' + escapeHtml(item.id) + '" aria-label="删除此记录" title="删除"><i class="fa fa-times"></i></button></article>';
    }).join('');
    historyList.querySelectorAll('[data-history-id]').forEach(function (button) {
      button.addEventListener('click', function () { removeHistory(button.getAttribute('data-history-id')); });
    });
  }

  function removeHistory(id) {
    try {
      var history = getHistory().filter(function (item) { return item.id !== id; });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {}
    renderHistory();
  }

  function clearHistory() {
    if (!window.confirm('确定清空当前浏览器保存的全部起卦记录吗？')) return;
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (error) {}
    renderHistory();
  }

  function trigramByNumber(value) {
    return TRIGRAM_BY_NUMBER[modulo(value, 8)];
  }

  function trigramFromBinary(binary) {
    var names = Object.keys(TRIGRAMS);
    for (var i = 0; i < names.length; i += 1) {
      if (TRIGRAMS[names[i]].binary === binary) return TRIGRAMS[names[i]];
    }
    return TRIGRAMS['乾'];
  }

  function changeHex(hex, movingLines) {
    var bits = hex.split('');
    movingLines.forEach(function (line) {
      var stringIndex = 5 - line;
      bits[stringIndex] = bits[stringIndex] === '0' ? '1' : '0';
    });
    return bits.join('');
  }

  function modulo(value, divisor) {
    var remainder = Math.abs(value) % divisor;
    return remainder || divisor;
  }

  function wuxingRelation(body, use) {
    var relations = {
      '木': { generates: '火', overcomes: '土' }, '火': { generates: '土', overcomes: '金' },
      '土': { generates: '金', overcomes: '水' }, '金': { generates: '水', overcomes: '木' },
      '水': { generates: '木', overcomes: '火' }
    };
    if (body === use) return '比和';
    if (relations[body].generates === use) return '体生用';
    if (relations[body].overcomes === use) return '体克用';
    if (relations[use].generates === body) return '用生体';
    return '用克体';
  }

  function relationText(relation, body, use) {
    var texts = {
      '体生用': body.name + body.element + '生' + use.name + use.element + '，多有付出与消耗，宜量力而行。',
      '体克用': body.name + body.element + '克' + use.name + use.element + '，可主动处理，但仍需守正。',
      '用生体': use.name + use.element + '生' + body.name + body.element + '，得助之象，宜顺势推进。',
      '用克体': use.name + use.element + '克' + body.name + body.element + '，阻碍之象，宜审慎应对。',
      '比和': body.name + body.element + '与' + use.name + use.element + '同气，比和相助，宜稳中求进。'
    };
    return texts[relation];
  }

  function setFormStatus(message, type) {
    var icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-leaf';
    formStatus.innerHTML = '<i class="fa ' + icon + '"></i> ' + escapeHtml(message);
    formStatus.style.color = type === 'error' ? '#9a5646' : type === 'success' ? '#687a5d' : '';
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }

  function legacyCopy(text) {
    return new Promise(function (resolve) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try { document.execCommand('copy'); } catch (error) {}
      textarea.remove();
      resolve();
    });
  }

  function formatTime(date) {
    function pad(value) { return String(value).padStart(2, '0'); }
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
  }

  function renderAiMarkdown(text) {
    var lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
    var html = [];
    var paragraph = [];
    var list = null;
    var quote = [];

    function inline(value) {
      var safe = escapeHtml(value);
      return safe
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/__([^_]+)__/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>')
        .replace(/(^|[^_])_([^_]+)_(?!_)/g, '$1<em>$2</em>');
    }

    function flushParagraph() {
      if (!paragraph.length) return;
      html.push('<p>' + paragraph.map(inline).join('<br>') + '</p>');
      paragraph = [];
    }

    function flushList() {
      if (!list) return;
      html.push('<' + list.type + '>' + list.items.map(function (item) { return '<li>' + inline(item) + '</li>'; }).join('') + '</' + list.type + '>');
      list = null;
    }

    function flushQuote() {
      if (!quote.length) return;
      html.push('<blockquote>' + quote.map(inline).join('<br>') + '</blockquote>');
      quote = [];
    }

    lines.forEach(function (line) {
      var heading = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
      var unordered = line.match(/^\s*[-+*]\s+(.+)$/);
      var ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
      var blockquote = line.match(/^\s*>\s?(.*)$/);

      if (!line.trim()) {
        flushParagraph();
        flushList();
        flushQuote();
        return;
      }

      if (/^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
        flushParagraph();
        flushList();
        flushQuote();
        html.push('<hr>');
        return;
      }

      if (heading) {
        flushParagraph();
        flushList();
        flushQuote();
        var level = Math.min(6, Math.max(4, heading[1].length + 1));
        html.push('<h' + level + '>' + inline(heading[2]) + '</h' + level + '>');
        return;
      }

      if (blockquote) {
        flushParagraph();
        flushList();
        quote.push(blockquote[1]);
        return;
      }

      if (unordered || ordered) {
        flushParagraph();
        flushQuote();
        var nextType = unordered ? 'ul' : 'ol';
        if (!list || list.type !== nextType) {
          flushList();
          list = { type: nextType, items: [] };
        }
        list.items.push((unordered || ordered)[1]);
        return;
      }

      flushList();
      flushQuote();
      paragraph.push(line);
    });

    flushParagraph();
    flushList();
    flushQuote();
    return html.join('');
  }

  function escapeHtml(value) {
    var node = document.createElement('div');
    node.textContent = String(value || '');
    return node.innerHTML;
  }
}());
