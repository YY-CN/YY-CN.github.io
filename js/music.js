const songs = [
  {
    name: '歌曲名称 1',
    artist: '歌手 A',
    album: '专辑名称 1'
  },
  {
    name: '歌曲名称 2',
    artist: '歌手 B',
    album: '专辑名称 2'
  },
  {
    name: '歌曲名称 3',
    artist: '歌手 C',
    album: '专辑名称 3'
  },
  {
    name: '歌曲名称 4',
    artist: '歌手 D',
    album: '专辑名称 4'
  },
  {
    name: '歌曲名称 5',
    artist: '歌手 E',
    album: '夜晚循环'
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