// 顶部菜单增强：把「标签 / 分类 / 归档」收进「文章」下拉，并把「关于」
// 排到「搜索」之前。其余保持 NexT 原生行为（高亮、搜索弹层、移动端抽屉）。
// 脚本在解析期同步执行：必须先于 next-boot 的 DOMContentLoaded 动效运行，
// 否则新菜单项会因 .use-motion .menu-item { opacity: 0 } 而不可见。
(function () {
  'use strict';

  var menu = document.getElementById('menu');
  if (!menu) return;

  function findItem(path) {
    var links = menu.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('href') === path) return links[i].parentNode;
    }
    return null;
  }

  var liHome = findItem('/');
  var liTags = findItem('/tags/');
  var liCats = findItem('/categories/');
  var liArch = findItem('/archives/');
  if (!liHome || !liTags || !liCats || !liArch) return;

  // 「文章」下拉父项
  var parentLi = document.createElement('li');
  parentLi.className = 'menu-item menu-item-posts';

  var toggle = document.createElement('a');
  toggle.href = 'javascript:void(0);';
  toggle.className = 'menu-posts-toggle';
  toggle.setAttribute('aria-haspopup', 'true');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<i class="fa fa-book fa-fw" aria-hidden="true"></i>文章' +
    '<i class="fa fa-angle-down fa-fw menu-caret" aria-hidden="true"></i>';
  parentLi.appendChild(toggle);

  var panel = document.createElement('ul');
  panel.className = 'menu-posts-dropdown';
  panel.appendChild(liTags);
  panel.appendChild(liCats);
  panel.appendChild(liArch);
  parentLi.appendChild(panel);

  menu.insertBefore(parentLi, liHome.nextSibling);

  // 「关于」挪到「搜索」之前（搜索由 NexT 自动追加在末尾，保持不动）
  var liAbout = findItem('/about/');
  var liSearch = menu.querySelector('.menu-item-search');
  if (liAbout && liSearch) menu.insertBefore(liAbout, liSearch);

  // 菜单项是 inline-block，间距来自节点间的空白文本。上述移动会让某些
  // 位置堆积多个空白节点，导致间距不均——统一成每对相邻项恰好一个空格。
  Array.from(menu.childNodes).forEach(function (node) {
    if (node.nodeType === 3 && !node.textContent.trim()) menu.removeChild(node);
  });
  var itemNodes = Array.from(menu.childNodes).filter(function (node) {
    return node.nodeType === 1;
  });
  while (menu.firstChild) menu.removeChild(menu.firstChild);
  itemNodes.forEach(function (el, index) {
    if (index > 0) menu.appendChild(document.createTextNode(' '));
    menu.appendChild(el);
  });

  // 下拉开合
  function closePanel() {
    parentLi.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    var open = parentLi.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', function (event) {
    if (!parentLi.contains(event.target)) closePanel();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closePanel();
  });

  // 浏览标签/分类/归档页时，父项同步 NexT 的高亮样式。
  // registerActiveMenuItem 会因父项是 javascript: 链接而取消高亮，
  // 因此在 NexT 启动（DOMContentLoaded）与 load 后各同步一次。
  function syncActive() {
    var active = /^\/(tags|categories|archives)(\/|$)/.test(location.pathname);
    parentLi.classList.toggle('menu-item-active', active);
  }
  syncActive();
  document.addEventListener('DOMContentLoaded', syncActive);
  window.addEventListener('load', syncActive);
})();
