(function () {
  'use strict';

  var SUMMARY_ENDPOINT = 'https://hyacinth-ai.jiatu9712.workers.dev/summary';
  var MAX_CONTENT_LENGTH = 20000;

  function init() {
    if (!document.querySelector('meta[property="article:published_time"]')) return;

    var post = document.querySelector('article.post-block');
    var postHeader = post && post.querySelector('.post-header');
    var postBody = post && post.querySelector('.post-body');

    if (!post || !postHeader || !postBody || document.getElementById('post-ai-summary')) return;

    var card = document.createElement('section');
    card.className = 'post-ai-summary';
    card.id = 'post-ai-summary';
    card.setAttribute('aria-label', 'AI 文章摘要');
    card.innerHTML =
      '<button class="post-ai-summary-toggle" id="post-ai-summary-toggle" type="button" aria-expanded="false" aria-controls="post-ai-summary-panel" title="查看 AI 摘要">' +
        '<i class="fa fa-feather-alt" aria-hidden="true"></i><span class="post-ai-summary-visually-hidden">查看 AI 摘要</span>' +
      '</button>' +
      '<div class="post-ai-summary-bubble">' +
        '<p class="post-ai-summary-prompt">点击羽毛笔可以查看本文摘要哦～</p>' +
        '<div class="post-ai-summary-panel" id="post-ai-summary-panel" aria-hidden="true" inert>' +
          '<div class="post-ai-summary-panel-inner">' +
            '<div class="post-ai-summary-heading">' +
              '<div><span>DEEPSEEK SUMMARY</span><h2>AI 摘要</h2></div>' +
              '<em id="post-ai-summary-state">按需生成</em>' +
            '</div>' +
            '<div class="post-ai-summary-message" id="post-ai-summary-message" aria-live="polite">' +
              '<p>正在准备文章摘要。</p>' +
            '</div>' +
            '<div class="post-ai-summary-actions">' +
              '<button type="button" id="post-ai-summary-generate"><i class="fa fa-magic"></i> 生成本文摘要</button>' +
              '<button type="button" id="post-ai-summary-copy" hidden><i class="fa fa-copy"></i> 复制摘要</button>' +
            '</div>' +
            '<small><i class="fa fa-shield-alt"></i> 点击后才会调用本站 DeepSeek 接口；摘要仅供快速了解文章内容。</small>' +
          '</div>' +
        '</div>' +
      '</div>';

    postHeader.insertAdjacentElement('afterend', card);

    var toggleButton = document.getElementById('post-ai-summary-toggle');
    var panel = document.getElementById('post-ai-summary-panel');
    var generateButton = document.getElementById('post-ai-summary-generate');
    var copyButton = document.getElementById('post-ai-summary-copy');
    var message = document.getElementById('post-ai-summary-message');
    var state = document.getElementById('post-ai-summary-state');
    var summaryText = '';
    var hasGenerated = false;

    toggleButton.addEventListener('click', function () {
      var shouldExpand = !card.classList.contains('is-expanded');
      card.classList.toggle('is-expanded', shouldExpand);
      toggleButton.setAttribute('aria-expanded', shouldExpand ? 'true' : 'false');
      toggleButton.title = shouldExpand ? '收起 AI 摘要' : '查看 AI 摘要';
      panel.setAttribute('aria-hidden', shouldExpand ? 'false' : 'true');
      panel.toggleAttribute('inert', !shouldExpand);

      if (shouldExpand && !hasGenerated && !generateButton.disabled) {
        generateSummary(false);
      }
    });

    generateButton.addEventListener('click', function () {
      generateSummary(hasGenerated);
    });

    copyButton.addEventListener('click', function () {
      if (!summaryText) return;
      copyText(summaryText).then(function () {
        copyButton.innerHTML = '<i class="fa fa-check"></i> 已复制';
        window.setTimeout(function () {
          copyButton.innerHTML = '<i class="fa fa-copy"></i> 复制摘要';
        }, 1500);
      }).catch(function () {
        copyButton.innerHTML = '<i class="fa fa-exclamation-circle"></i> 复制失败';
        window.setTimeout(function () {
          copyButton.innerHTML = '<i class="fa fa-copy"></i> 复制摘要';
        }, 1500);
      });
    });

    function generateSummary(force) {
      var title = getPostTitle();
      var content = getPostContent(postBody);

      if (!title || content.length < 50) {
        setError('文章正文过短，暂时无法生成摘要。');
        return;
      }

      setLoading(force ? '正在重新生成摘要…' : '正在阅读文章并生成摘要…');

      var controller = new AbortController();
      var timeoutId = window.setTimeout(function () {
        controller.abort();
      }, 60000);

      window.fetch(SUMMARY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title,
          content: content,
          url: window.location.pathname,
          force: force
        }),
        signal: controller.signal
      }).then(function (response) {
        return response.text().then(function (raw) {
          var data;
          try {
            data = JSON.parse(raw);
          } catch (error) {
            throw new Error('摘要接口返回了无法识别的数据。');
          }

          if (!response.ok || !data.summary) {
            throw new Error(data.error || '暂时无法生成摘要。');
          }

          return data;
        });
      }).then(function (data) {
        summaryText = normalizeSummary(String(data.summary).trim(), 220);
        hasGenerated = true;
        message.className = 'post-ai-summary-message is-ready';
        message.textContent = summaryText;
        state.textContent = data.cached ? '已读取缓存' : 'AI 已生成';
        state.className = 'is-success';
        generateButton.innerHTML = '<i class="fa fa-redo"></i> 重新生成';
        copyButton.hidden = false;
      }).catch(function (error) {
        setError(error && error.name === 'AbortError'
          ? '摘要生成超时，请稍后重试。'
          : (error.message || '暂时无法生成摘要。'));
      }).finally(function () {
        window.clearTimeout(timeoutId);
        generateButton.disabled = false;
      });
    }

    function setLoading(text) {
      generateButton.disabled = true;
      copyButton.hidden = true;
      state.textContent = '生成中';
      state.className = 'is-loading';
      message.className = 'post-ai-summary-message is-loading';
      message.innerHTML = '<i class="fa fa-spinner fa-spin" aria-hidden="true"></i><p>' + escapeHtml(text) + '</p>';
      generateButton.innerHTML = '<i class="fa fa-spinner fa-spin"></i> 生成中';
    }

    function setError(text) {
      state.textContent = '生成失败';
      state.className = 'is-error';
      message.className = 'post-ai-summary-message is-error';
      message.textContent = text;
      generateButton.disabled = false;
      generateButton.innerHTML = '<i class="fa fa-redo"></i> 重试';
      copyButton.hidden = !summaryText;
    }
  }

  function getPostTitle() {
    var title = document.querySelector('.post-title');
    return title ? title.textContent.replace(/\s+/g, ' ').trim() : document.title.trim();
  }

  function getPostContent(postBody) {
    var clone = postBody.cloneNode(true);
    clone.querySelectorAll([
      'script',
      'style',
      'noscript',
      'pre',
      'code',
      '.headerlink',
      '.post-ai-summary',
      '.mjx-container'
    ].join(',')).forEach(function (element) {
      element.remove();
    });

    return clone.textContent
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, MAX_CONTENT_LENGTH);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () {
        return legacyCopy(text);
      });
    }
    return legacyCopy(text);
  }

  function normalizeSummary(text, maxLength) {
    if (text.length <= maxLength) return text;

    var excerpt = text.slice(0, maxLength);
    var boundary = Math.max(
      excerpt.lastIndexOf('。'),
      excerpt.lastIndexOf('！'),
      excerpt.lastIndexOf('？')
    );

    if (boundary >= 100) {
      return excerpt.slice(0, boundary + 1);
    }

    return excerpt.trim() + '…';
  }

  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', 'readonly');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        if (document.execCommand('copy')) {
          resolve();
        } else {
          reject(new Error('Copy command was rejected'));
        }
      } catch (error) {
        reject(error);
      } finally {
        textarea.remove();
      }
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
