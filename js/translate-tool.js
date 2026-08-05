(function () {
  'use strict';

  function init() {
    var page = document.getElementById('translate-tool-page');
    if (!page) return;

    var form = document.getElementById('translate-form');
    var source = document.getElementById('translate-source');
    var target = document.getElementById('translate-target');
    var input = document.getElementById('translate-input');
    var result = document.getElementById('translate-result');
    var inputCount = document.getElementById('translate-input-count');
    var resultState = document.getElementById('translate-result-state');
    var resultLanguage = document.getElementById('translate-result-language');
    var status = document.getElementById('translate-status');
    var submitButton = document.getElementById('translate-submit-button');
    var clearButton = document.getElementById('translate-clear-button');
    var copyButton = document.getElementById('translate-copy-button');
    var swapButton = document.getElementById('translate-swap-button');
    var maxBytes = 500;
    var translatedText = '';
    var translatedInput = '';
    var activeRequest = null;

    function getByteLength(value) {
      if (window.TextEncoder) return new TextEncoder().encode(value).length;
      return unescape(encodeURIComponent(value)).length;
    }

    function languageName(select) {
      return select.options[select.selectedIndex].text;
    }

    function setStatus(message, type) {
      var icon = 'fa-info-circle';
      status.className = '';

      if (type === 'busy') {
        icon = 'fa-spinner fa-spin';
        status.classList.add('is-busy');
      } else if (type === 'error') {
        icon = 'fa-exclamation-circle';
        status.classList.add('is-error');
      } else if (type === 'success') {
        icon = 'fa-check-circle';
      }

      status.innerHTML = '<i class="fa ' + icon + '"></i> ' + message;
    }

    function setResultPlaceholder(message) {
      result.className = 'translate-result is-placeholder';
      result.innerHTML = '<span class="translate-result-placeholder"><i class="fa fa-feather"></i> ' + message + '</span>';
      resultState.innerHTML = '<i class="far fa-circle"></i> 尚未生成译文';
      copyButton.disabled = true;
    }

    function setLoading() {
      result.className = 'translate-result is-loading';
      result.innerHTML = '<span><i class="fa fa-spinner fa-spin"></i> 正在请求翻译服务…</span>';
      resultState.innerHTML = '<i class="far fa-circle"></i> 翻译中';
      copyButton.disabled = true;
    }

    function setResultText(value) {
      result.className = 'translate-result';
      result.textContent = value;
      resultState.innerHTML = '<i class="fa fa-check-circle"></i> 译文已生成';
      copyButton.disabled = false;
    }

    function decodeEntities(value) {
      var decoder = document.createElement('textarea');
      decoder.innerHTML = value;
      return decoder.value;
    }

    function resetResult(message) {
      translatedText = '';
      translatedInput = '';
      setResultPlaceholder(message || '译文会在这里出现');
      resultLanguage.textContent = '等待翻译结果。';
    }

    function updateInputState() {
      var value = input.value;
      var bytes = getByteLength(value);
      var hasText = value.trim().length > 0;
      var isOverLimit = bytes > maxBytes;

      inputCount.innerHTML = '<i class="fa fa-pencil"></i> ' + bytes + ' / ' + maxBytes + ' 字节';
      inputCount.classList.toggle('is-over-limit', isOverLimit);
      input.classList.toggle('is-over-limit', isOverLimit);
      submitButton.disabled = !hasText || isOverLimit;

      if (translatedInput && value !== translatedInput) {
        resetResult('内容已改变，请重新翻译');
      }

      if (isOverLimit) {
        setStatus('当前内容超过 500 字节，请删减后再翻译', 'error');
      } else if (hasText && !translatedText) {
        setStatus('内容准备完成，可开始翻译', 'ready');
      } else if (!hasText) {
        setStatus('输入内容后即可开始翻译', 'ready');
      }
    }

    function copyText(value) {
      if (!value) return;

      function complete() {
        var original = copyButton.innerHTML;
        copyButton.innerHTML = '<i class="fa fa-check"></i> 已复制';
        window.setTimeout(function () { copyButton.innerHTML = original; }, 1300);
        setStatus('译文已复制到剪贴板', 'success');
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(complete).catch(function () {
          setStatus('复制失败，请手动选中译文复制', 'error');
        });
        return;
      }

      var helper = document.createElement('textarea');
      helper.value = value;
      helper.setAttribute('readonly', '');
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      document.execCommand('copy');
      document.body.removeChild(helper);
      complete();
    }

    function translate() {
      var value = input.value.trim();
      var bytes = getByteLength(value);

      if (!value) {
        setStatus('请先输入需要翻译的文字', 'error');
        input.focus();
        return;
      }

      if (bytes > maxBytes) {
        setStatus('当前内容超过 500 字节，请删减后再翻译', 'error');
        return;
      }

      if (source.value === target.value) {
        setStatus('请选择两种不同的语言', 'error');
        target.focus();
        return;
      }

      if (activeRequest && activeRequest.abort) activeRequest.abort();

      var controller = window.AbortController ? new AbortController() : null;
      var requestOptions = { headers: { Accept: 'application/json' } };
      activeRequest = controller;
      if (controller) requestOptions.signal = controller.signal;

      setLoading();
      submitButton.disabled = true;
      setStatus('正在翻译，请稍候…', 'busy');
      resultLanguage.textContent = languageName(source) + ' → ' + languageName(target);

      var apiUrl = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(value) +
        '&langpair=' + encodeURIComponent(source.value + '|' + target.value) + '&mt=1';
      var timeoutId = window.setTimeout(function () {
        if (controller) controller.abort();
      }, 15000);

      window.fetch(apiUrl, requestOptions)
        .then(function (response) {
          if (!response.ok) throw new Error('request-failed');
          return response.json();
        })
        .then(function (data) {
          var translated = data && data.responseData && data.responseData.translatedText;
          if (!translated) throw new Error('empty-result');

          translatedText = decodeEntities(String(translated));
          translatedInput = input.value;
          setResultText(translatedText);
          setStatus('翻译完成，可复制译文或继续修改原文', 'success');
        })
        .catch(function (error) {
          if (error && error.name === 'AbortError') {
            setStatus('请求超时，请稍后重试', 'error');
          } else {
            setStatus('暂时无法连接翻译服务，请稍后重试', 'error');
          }
          resetResult('暂时没有拿到译文，请稍后重试');
        })
        .then(function () {
          window.clearTimeout(timeoutId);
          activeRequest = null;
          submitButton.disabled = !input.value.trim() || getByteLength(input.value) > maxBytes;
        });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      translate();
    });

    input.addEventListener('input', updateInputState);
    input.addEventListener('keydown', function (event) {
      if (event.ctrlKey && event.key === 'Enter' && !event.isComposing) {
        event.preventDefault();
        if (!submitButton.disabled) translate();
      }
    });

    clearButton.addEventListener('click', function () {
      if (activeRequest && activeRequest.abort) activeRequest.abort();
      activeRequest = null;
      input.value = '';
      resetResult();
      updateInputState();
      input.focus();
    });

    copyButton.addEventListener('click', function () {
      copyText(translatedText);
    });

    swapButton.addEventListener('click', function () {
      var sourceValue = source.value;
      source.value = target.value;
      target.value = sourceValue;

      if (translatedText) {
        input.value = translatedText;
        resetResult('已交换语言，请继续翻译');
      }

      updateInputState();
      input.focus();
    });

    source.addEventListener('change', function () {
      resetResult('语言已改变，请重新翻译');
      updateInputState();
    });

    target.addEventListener('change', function () {
      resetResult('语言已改变，请重新翻译');
      updateInputState();
    });

    resetResult();
    updateInputState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
