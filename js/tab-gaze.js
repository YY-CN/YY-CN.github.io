// 浏览器标签页「注视」：切走时标题变为随机提示文本，
// 切回时先显示欢迎语，2 秒后恢复原标题。
(function () {
  'use strict';

  // 切走标签页时随机展示的文本
  var GAZE_TITLES = [
    '(⊙_⊙) 别乱跑，我在注视你……',
    '╭(°A°`)╮ 人去哪了？',
    '(¬_¬) 偷偷跑掉了……',
    '☯ 正在被注视……'
  ];
  var WELCOME_TITLE = '✔ 欢迎回来！';
  var WELCOME_MS = 2000;

  var baseTitle = document.title;
  var state = 'normal'; // normal | gazing | welcome
  var backTimer = 0;

  function pickGazeTitle() {
    return GAZE_TITLES[Math.floor(Math.random() * GAZE_TITLES.length)];
  }

  function onVisibilityChange() {
    if (document.hidden) {
      if (state === 'normal') baseTitle = document.title;
      window.clearTimeout(backTimer);
      document.title = pickGazeTitle();
      state = 'gazing';
      return;
    }

    if (state !== 'gazing') return;
    document.title = WELCOME_TITLE;
    state = 'welcome';
    backTimer = window.setTimeout(function () {
      document.title = baseTitle;
      state = 'normal';
    }, WELCOME_MS);
  }

  document.addEventListener('visibilitychange', onVisibilityChange);
})();
