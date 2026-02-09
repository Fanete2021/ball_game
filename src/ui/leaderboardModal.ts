export interface LeaderboardEntry {
  nickname: string
  score: number
  when: number
}

export interface LeaderboardResponse {
  items: LeaderboardEntry[]
}

export const createLeaderboardModal = (): {
  modal: HTMLDivElement
  show: (leaderboardData: LeaderboardResponse) => void
  close: () => void
} => {
  const modal = document.createElement('div')
  modal.className = 'modal leaderboard-modal'
  modal.style.display = 'none'

  const overlay = document.createElement('div')
  overlay.className = 'modal__overlay'

  const content = document.createElement('div')
  content.className = 'modal__content leaderboard-modal__content'

  const title = document.createElement('h2')
  title.className = 'modal__title'
  title.textContent = 'ТАБЛИЦА ЛИДЕРОВ'

  const table = document.createElement('div')
  table.className = 'leaderboard-modal__table'

  const tableHeader = document.createElement('div')
  tableHeader.className = 'leaderboard-modal__table-header'
  tableHeader.innerHTML = `
    <div class="leaderboard-modal__cell leaderboard-modal__cell--rank">#</div>
    <div class="leaderboard-modal__cell leaderboard-modal__cell--player">Игрок</div>
    <div class="leaderboard-modal__cell leaderboard-modal__cell--score">Счет</div>
    <div class="leaderboard-modal__cell leaderboard-modal__cell--date">Дата</div>
  `

  const tableBody = document.createElement('div')
  tableBody.className = 'leaderboard-modal__table-body'

  const closeButton = document.createElement('button')
  closeButton.className = 'modal__button'
  closeButton.textContent = 'ЗАКРЫТЬ'
  closeButton.addEventListener('click', () => {
    modal.style.display = 'none'
  })

  table.appendChild(tableHeader)
  table.appendChild(tableBody)
  content.appendChild(title)
  content.appendChild(table)
  content.appendChild(closeButton)
  modal.appendChild(overlay)
  modal.appendChild(content)

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  }

  return {
    modal,
    show: (data: LeaderboardResponse) => {
      tableBody.innerHTML = ''

      data.items.forEach((entry, index) => {
        const row = document.createElement('div')
        row.className = 'leaderboard-modal__table-row'

        const dateStr = formatDate(entry.when)

        row.innerHTML = `
          <div class="leaderboard-modal__cell leaderboard-modal__cell--rank">${index + 1}</div>
          <div class="leaderboard-modal__cell leaderboard-modal__cell--player">${entry.nickname}</div>
          <div class="leaderboard-modal__cell leaderboard-modal__cell--score">${entry.score}</div>
          <div class="leaderboard-modal__cell leaderboard-modal__cell--date">${dateStr}</div>
        `

        tableBody.appendChild(row)
      })

      modal.style.display = 'flex'
    },
    close: () => {
      modal.style.display = 'none'
    }
  }
}
