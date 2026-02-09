export interface headerUI {
  scoreElement: HTMLElement,
  livesElement: HTMLElement,
  startButton: HTMLElement,
  leaderboardButton: HTMLElement,
  buffTimerElement: HTMLElement,
  comboValueElement: HTMLElement,
  difficultyElement: HTMLElement,
  timerElement: HTMLElement
}

export const getHeaderUI = (config: { app: HTMLElement | Element}): headerUI => {
  const { app } = config

  const scoreElement = app.querySelector('.header__info-group__value')! as HTMLElement
  const livesElement = app.querySelector('.header__info-group--lives .header__info-group__value')! as HTMLElement
  const startButton = app.querySelector('.header__button--start')! as HTMLElement
  const leaderboardButton = app.querySelector('.header__button--leaderboard')! as HTMLElement
  const buffTimerElement = app.querySelector('.header__indicator--buff .header__indicator__value')! as HTMLElement
  const comboValueElement = app.querySelector('.header__indicator--combo .header__indicator__value')! as HTMLElement
  const difficultyElement = app.querySelector('.header__indicator--difficulty .header__indicator__value')! as HTMLElement
  const timerElement = app.querySelector('.header__indicator--timer .header__indicator__value')! as HTMLElement

  return {
    scoreElement,
    livesElement,
    startButton,
    leaderboardButton,
    buffTimerElement,
    comboValueElement,
    difficultyElement,
    timerElement,
  }
}

export const updateLivesDisplay = (
  props: { livesElement: HTMLElement, lives: number, maxLives: number }
): void => {
  const { livesElement, lives, maxLives } = props;
  livesElement.innerHTML = ''

  for (let i = 0; i < maxLives; ++i) {
    livesElement.innerHTML += i < lives ? '❤️' : '🤍'
  }
}
