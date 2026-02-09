export function createGameOverModal(): {
  modal: HTMLDivElement
  scoreElement: HTMLDivElement
  restartButton: HTMLButtonElement
  close: () => void
  show: (finalScore: number) => void
} {
  const modal = document.createElement('div')
  modal.className = 'modal'
  modal.style.display = 'none'

  const overlay = document.createElement('div')
  overlay.className = 'modal__overlay'

  const content = document.createElement('div')
  content.className = 'modal__content'

  const title = document.createElement('h2')
  title.className = 'modal__title'
  title.textContent = 'ИГРА ОКОНЧЕНА'

  const scoreLabel = document.createElement('div')
  scoreLabel.className = 'modal__label'
  scoreLabel.textContent = 'Ваш результат:'

  const scoreElement = document.createElement('div')
  scoreElement.className = 'modal__score'
  scoreElement.textContent = '0'

  const restartButton = document.createElement('button')
  restartButton.className = 'modal__button'
  restartButton.textContent = 'ИГРАТЬ СНОВА'

  content.appendChild(title)
  content.appendChild(scoreLabel)
  content.appendChild(scoreElement)
  content.appendChild(restartButton)

  modal.appendChild(overlay)
  modal.appendChild(content)

  const formatScore = (score: number): string => {
    const rounded = Math.round(score * 10) / 10
    return rounded.toFixed(1)
  }

  return {
    modal,
    scoreElement,
    restartButton,
    show: (finalScore: number) => {
      scoreElement.textContent = formatScore(finalScore)
      modal.style.display = 'flex'
    },
    close: () => {
      modal.style.display = 'none'
    },
  }
}
