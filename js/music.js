const songs = [
  {
    name: 'Love Forever (永恒的爱)',
    artist: '加藤ミリヤ/清水翔太',
    album: 'Love Forever'
  },
  {
    name: '好きだから。 (因为我喜欢你。)',
    artist: '『ユイカ』/れん (Ren)',
    album: '好きだから。'
  },
  {
    name: '须尽欢',
    artist: '浅影阿',
    album: '浅影的翻唱合集'
  },
  {
    name: 'You(=I)',
    artist: '脸红的思春期 (볼빨간사춘기)',
    album: 'RED PLANET (JAPAN EDITION)'
  },
  {
    name: '忘れてください (还请忘却)',
    artist: '『ユイカ』/れん (Ren)',
    album: '忘れてください (还请忘却)'
  }
]

function renderSongs(list) {
  const container = document.getElementById('song-list')
  if (!container) return

  container.innerHTML = list.map((song, index) => {
    return `
      <div class="song-item">
        <div class="song-index">${String(index + 1).padStart(2, '0')}</div>

        <div class="song-main">
          <h3>${song.name}</h3>
          <p>${song.artist}</p>
        </div>

        <div class="song-album">${song.album}</div>

        <button class="song-btn" data-name="${song.name}" data-artist="${song.artist}">
          播放
        </button>
      </div>
    `
  }).join('')

  bindPlayButtons()
}

function bindPlayButtons() {
  const buttons = document.querySelectorAll('.song-btn')
  const currentSongName = document.getElementById('current-song-name')
  const currentSongArtist = document.getElementById('current-song-artist')

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const name = button.dataset.name
      const artist = button.dataset.artist

      if (currentSongName) currentSongName.textContent = name
      if (currentSongArtist) currentSongArtist.textContent = artist
    })
  })
}

function bindSearch() {
  const input = document.getElementById('song-search')
  if (!input) return

  input.addEventListener('input', () => {
    const keyword = input.value.trim().toLowerCase()

    const filteredSongs = songs.filter(song => {
      return (
        song.name.toLowerCase().includes(keyword) ||
        song.artist.toLowerCase().includes(keyword) ||
        song.album.toLowerCase().includes(keyword)
      )
    })

    renderSongs(filteredSongs)
  })
}

document.addEventListener('DOMContentLoaded', () => {
  renderSongs(songs)
  bindSearch()
})