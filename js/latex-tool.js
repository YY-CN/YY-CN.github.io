(function () {
  'use strict';

  function init() {
    var page = document.getElementById('latex-tool-page');
    if (!page) return;

    var output = document.getElementById('latex-output');
    var renderContent = document.getElementById('latex-render-content');
    var status = document.getElementById('latex-status');
    var editorState = document.getElementById('latex-editor-state');
    var previewMode = document.getElementById('latex-preview-mode');
    var copyButton = document.getElementById('latex-copy-button');
    var copyMarkdownButton = document.getElementById('latex-copy-markdown-button');
    var clearButton = document.getElementById('latex-clear-button');
    var modeButtons = page.querySelectorAll('[data-formula-mode]');
    var templateButtons = page.querySelectorAll('[data-formula]');
    var mode = 'block';

    function escapeHtml(value) {
      return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function setStatus(text, editing) {
      status.innerHTML = '<i class="fa fa-circle"></i> ' + text;
      status.classList.toggle('is-editing', Boolean(editing));
    }

    function typesetPreview(attempt) {
      var mathJax = window.MathJax;

      if (mathJax && mathJax.typesetPromise) {
        if (mathJax.typesetClear) mathJax.typesetClear([renderContent]);
        mathJax.typesetPromise([renderContent]).catch(function () {
          renderContent.classList.add('is-empty');
          renderContent.textContent = '公式语法暂时无法渲染，请检查输入内容。';
        });
        return;
      }

      if (mathJax && mathJax.Hub && mathJax.Hub.Queue) {
        mathJax.Hub.Queue(['Typeset', mathJax.Hub, renderContent]);
        return;
      }

      if (attempt < 40) {
        window.setTimeout(function () { typesetPreview(attempt + 1); }, 150);
      }
    }

    function renderFormula() {
      var value = output.value.trim();
      var content = value || '\\text{在左侧粘贴 LaTeX 公式}';
      var delimiter = mode === 'inline' ? ['\\(', '\\)'] : ['\\[', '\\]'];
      renderContent.classList.toggle('is-empty', !value);
      renderContent.innerHTML = delimiter[0] + escapeHtml(content) + delimiter[1];
      typesetPreview(0);

      if (value) {
        setStatus('正在编辑', true);
        editorState.innerHTML = '<i class="fa fa-check-circle"></i> 已输入 ' + value.length + ' 个字符';
      } else {
        setStatus('等待输入', false);
        editorState.innerHTML = '<i class="fa fa-keyboard"></i> 在这里开始输入';
      }
    }

    function setMode(nextMode) {
      mode = nextMode;
      previewMode.textContent = mode === 'inline' ? '行内' : '块级';
      modeButtons.forEach(function (button) {
        button.classList.toggle('is-active', button.getAttribute('data-formula-mode') === mode);
      });
      renderFormula();
    }

    function copyText(text, button, label) {
      if (!text) return;

      function complete() {
        var original = button.innerHTML;
        button.innerHTML = '<i class="fa fa-check"></i> 已复制';
        window.setTimeout(function () { button.innerHTML = original; }, 1300);
        editorState.innerHTML = '<i class="fa fa-check-circle"></i> 已复制' + label;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(complete);
        return;
      }

      output.focus();
      output.select();
      document.execCommand('copy');
      output.setSelectionRange(0, 0);
      complete();
    }

    output.addEventListener('input', renderFormula);
    copyButton.addEventListener('click', function () {
      copyText(output.value.trim(), copyButton, ' LaTeX 源码');
    });
    copyMarkdownButton.addEventListener('click', function () {
      var value = output.value.trim();
      var markdown = mode === 'inline' ? '$' + value + '$' : '$$\n' + value + '\n$$';
      copyText(value ? markdown : '', copyMarkdownButton, ' Markdown 公式');
    });
    clearButton.addEventListener('click', function () {
      output.value = '';
      renderFormula();
      output.focus();
    });

    modeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        setMode(button.getAttribute('data-formula-mode'));
      });
    });

    templateButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        output.value = button.getAttribute('data-formula');
        renderFormula();
        editorState.innerHTML = '<i class="fa fa-bookmark"></i> 已载入模板：' + button.getAttribute('data-name');
        output.focus();
      });
    });

    renderFormula();
    window.addEventListener('load', renderFormula);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
