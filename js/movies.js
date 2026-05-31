document.addEventListener('DOMContentLoaded', () => {
  loadMovies()
})

function loadMovies() {
  const dataUrl = new URL('../data/movies.json', window.location.href).href

  fetch(dataUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('电影数据请求失败')
      }
      return response.json()
    })
    .then(movies => {
      const movieList = Array.isArray(movies) ? movies : []

      renderMovies(movieList, 'watching', 'movies-watching')
      renderMovies(movieList, 'favorite', 'movies-favorite')
      renderMovies(movieList, 'wishlist', 'movies-wishlist')
    })
    .catch(error => {
      console.error('电影数据加载失败：', error)

      renderError('movies-watching')
      renderError('movies-favorite')
      renderError('movies-wishlist')
    })
}

function renderMovies(movies, category, containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  const filteredMovies = movies.filter(movie => movie.category === category)

  if (filteredMovies.length === 0) {
    container.innerHTML = `
      <div class="movies-empty">
        这里暂时还没有电影。
      </div>
    `
    return
  }

  container.innerHTML = filteredMovies.map(movie => `
    <div class="movie-card">
      <img src="${escapeAttribute(movie.cover)}" alt="${escapeAttribute(movie.name || '电影封面')}" loading="lazy">
      <div class="movie-info">
        <h3>${escapeHTML(movie.name || '未命名电影')}</h3>
        <span>${escapeHTML(movie.status || '')}</span>
      </div>
    </div>
  `).join('')
}

function renderError(containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  container.innerHTML = `
    <div class="movies-error">
      电影加载失败，请检查 source/data/movies.json 是否存在，或者 JSON 格式是否正确。
    </div>
  `
}

function escapeHTML(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function escapeAttribute(value) {
  return escapeHTML(value)
}