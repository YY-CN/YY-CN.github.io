document.addEventListener('DOMContentLoaded', () => {
  loadPhotos()
})

let allPhotos = []
let currentFilter = 'all'

function loadPhotos() {
  const dataUrl = new URL('../data/photos.json', window.location.href).href

  fetch(dataUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('照片数据请求失败')
      }
      return response.json()
    })
    .then(photos => {
      allPhotos = Array.isArray(photos) ? photos : []

      renderStats(allPhotos)
      renderHero(allPhotos)
      renderTabs(allPhotos)
      renderPhotos(allPhotos)
      bindViewerClose()
    })
    .catch(error => {
      console.error('照片数据加载失败：', error)

      const container = document.getElementById('photo-masonry')
      if (container) {
        container.innerHTML = `
          <div class="photos-error">
            照片加载失败，请检查 source/data/photos.json 是否存在，或者 JSON 格式是否正确。
          </div>
        `
      }
    })
}

function renderStats(photos) {
  const countEl = document.getElementById('photo-count')
  const categoryCountEl = document.getElementById('photo-place-count')
  const featureCountEl = document.getElementById('photo-feature-count')

  const categories = [...new Set(photos.map(photo => photo.category).filter(Boolean))]
  const featuredPhotos = photos.filter(photo => photo.featured)

  if (countEl) countEl.textContent = photos.length
  if (categoryCountEl) categoryCountEl.textContent = categories.length
  if (featureCountEl) featureCountEl.textContent = featuredPhotos.length
}

function renderHero(photos) {
  const heroImg = document.getElementById('photos-hero-img')
  const heroTitle = document.getElementById('photos-hero-title')

  if (!heroImg || !heroTitle || photos.length === 0) return

  const featuredPhoto = photos.find(photo => photo.featured) || photos[0]

  heroImg.src = featuredPhoto.url
  heroImg.alt = featuredPhoto.title || '精选照片'
  heroTitle.textContent = featuredPhoto.title || '把普通日子里的光留下来。'
}

function renderTabs(photos) {
  const tabsContainer = document.getElementById('photo-tabs')
  if (!tabsContainer) return

  const categories = [...new Set(photos.map(photo => photo.category).filter(Boolean))]

  tabsContainer.innerHTML = `
    <button class="photo-tab active" data-filter="all">全部</button>
    ${categories.map(category => `
      <button class="photo-tab" data-filter="${escapeAttribute(category)}">${escapeHTML(category)}</button>
    `).join('')}
  `

  const tabs = tabsContainer.querySelectorAll('.photo-tab')

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      currentFilter = tab.dataset.filter

      tabs.forEach(item => item.classList.remove('active'))
      tab.classList.add('active')

      renderPhotos(allPhotos)
    })
  })
}

function renderPhotos(photos) {
  const container = document.getElementById('photo-masonry')
  if (!container) return

  const filteredPhotos = currentFilter === 'all'
    ? photos
    : photos.filter(photo => photo.category === currentFilter)

  if (filteredPhotos.length === 0) {
    container.innerHTML = `
      <div class="photos-empty">
        这个分类下暂时还没有照片。
      </div>
    `
    return
  }

  container.innerHTML = filteredPhotos.map((photo, index) => `
    <figure class="photo-card" data-index="${index}">
      <img src="${escapeAttribute(photo.url)}" alt="${escapeAttribute(photo.title || '照片')}" loading="lazy">
      <figcaption>
        <span>${escapeHTML(photo.category || '未分类')}</span>
        <h3>${escapeHTML(photo.title || '未命名照片')}</h3>
        <p>${escapeHTML(photo.desc || '')}</p>
      </figcaption>
    </figure>
  `).join('')

  const cards = container.querySelectorAll('.photo-card')

  cards.forEach((card, index) => {
    card.addEventListener('click', () => {
      openViewer(filteredPhotos[index])
    })
  })
}

function openViewer(photo) {
  const viewer = document.getElementById('photo-viewer')
  const viewerImg = document.getElementById('photo-viewer-img')
  const viewerTitle = document.getElementById('photo-viewer-title')
  const viewerDesc = document.getElementById('photo-viewer-desc')

  if (!viewer || !viewerImg || !photo) return

  viewerImg.src = photo.url
  viewerImg.alt = photo.title || '照片预览'

  if (viewerTitle) viewerTitle.textContent = photo.title || '未命名照片'
  if (viewerDesc) viewerDesc.textContent = photo.desc || ''

  viewer.classList.add('show')
  document.body.style.overflow = 'hidden'
}

function closeViewer() {
  const viewer = document.getElementById('photo-viewer')
  const viewerImg = document.getElementById('photo-viewer-img')

  if (!viewer) return

  viewer.classList.remove('show')
  document.body.style.overflow = ''

  if (viewerImg) {
    viewerImg.src = ''
  }
}

function bindViewerClose() {
  const closeBtn = document.getElementById('photo-viewer-close')
  const viewer = document.getElementById('photo-viewer')
  const mask = viewer ? viewer.querySelector('.photo-viewer-mask') : null

  if (closeBtn) {
    closeBtn.addEventListener('click', closeViewer)
  }

  if (mask) {
    mask.addEventListener('click', closeViewer)
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeViewer()
    }
  })
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