import { View, WindowHistoryState } from 'src/types'
import cem from 'src/utils/custom-event'
import { monthStr, numberWithCommas, dommer } from 'src/utils/helper'
import './styles'

export default class HeaderView implements View {
  state: WindowHistoryState
  incomeSum: number
  expenditureSum: number

  constructor() {
    const header = document.querySelector('header')
    header.addEventListener('click', this.clickEventHandler.bind(this))

    cem.subscribe('storeupdated', (e: CustomEvent) => {
      this.setAttributes(e.detail)
      this.render()
    })

    cem.subscribe('login', (e: CustomEvent) => (header.innerHTML = ''))
  }

  setAttributes({ state, store }): void {
    this.state = state
    this.expenditureSum = store.expenditureSum
    this.incomeSum = store.incomeSum
  }

  clickEventHandler(e: MouseEvent) {
    e.preventDefault()

    const { target } = e
    if (!(target instanceof HTMLElement)) return

    this.navigationIconClickHandler(target)
    this.typeButtonClickHandler(target)
    this.shaderClickHandler(target)
    this.cardClickHandler(target)
  }

  getPathFromLink(aTag: Element): string {
    const path = aTag.getAttribute('href')
    return path
  }

  navigationIconClickHandler(target: Element): void {
    const a = target.closest('a')
    if (!a) return

    const path = this.getPathFromLink(a)
    this.setInsetStyle(path)
    cem.fire('statechange', Object.assign({}, history.state, { path }))
  }

  typeButtonClickHandler(target: HTMLElement): void {
    const button = target.closest<HTMLElement>('.money-button')
    if (!button) return

    const state = { ...history.state }
    const sumIndicator = button.closest('.sum-indicator')
    const selectedButton = sumIndicator.querySelector('.selected')
    const type = button.classList.contains('income') ? 'income' : 'expenditure'

    if (!selectedButton) {
      state.type = type
      button.classList.toggle('selected')
    } else if (selectedButton === button) {
      delete state.type
      selectedButton.classList.toggle('selected')
    } else {
      state.type = type
      selectedButton.classList.toggle('selected')
      button.classList.toggle('selected')
    }

    button.addEventListener('transitionend', () => {
      cem.fire('statechange', state)
    })
  }

  cardClickHandler(target: HTMLElement): void {
    if (!target.closest('.credit-card-btn')) return
    cem.fire('activatepaymentsmanager')
  }

  shaderClickHandler(target: HTMLElement): void {
    const shader = target.closest<HTMLElement>('.shader')

    if (!shader) return

    const toRight = shader.classList.contains('left')

    const transform = `translateX(${((toRight ? +1 : -1) * 100) / 3}%)`

    const monthSelector = shader.parentElement.querySelector<HTMLElement>(
      '.month-selector'
    )

    monthSelector.style.transform = transform

    const state = history.state as WindowHistoryState

    const calculatedAppearingMonth = state.month + (toRight ? -2 : +2)

    const destinationMonth = toRight
      ? state.month - 1 < 1
        ? 12
        : state.month - 1
      : state.month + 1 > 12
      ? 1
      : state.month + 1

    const destinationYear = toRight
      ? state.month - 1 < 1
        ? state.year - 1
        : state.year
      : state.month + 1 > 12
      ? state.year + 1
      : state.year

    // -1: previous year
    // 0: current year
    // 1: next year
    const overflowFlag: -1 | 0 | 1 =
      calculatedAppearingMonth > 12 ? 1 : calculatedAppearingMonth < 1 ? -1 : 0

    const appearingMonth =
      overflowFlag === 1
        ? calculatedAppearingMonth - 12
        : overflowFlag === -1
        ? calculatedAppearingMonth + 12
        : calculatedAppearingMonth

    const appearingYear = state.year + overflowFlag

    const appearingMonthIndicator = dommer(
      this.createMonthIndicator(appearingYear, appearingMonth)
    ).firstElementChild as HTMLElement

    appearingMonthIndicator.style.position = 'absolute'
    appearingMonthIndicator.style.width = 100 / 3 + '%'

    if (toRight) {
      appearingMonthIndicator.style.right = '100%'
    } else {
      appearingMonthIndicator.style.left = '100%'
    }

    const method = toRight ? 'prepend' : 'append'

    monthSelector[method](appearingMonthIndicator)

    shader.classList.add('forcedly-shaded')

    monthSelector.addEventListener('transitionend', () => {
      cem.fire('statechange', {
        ...state,
        year: destinationYear,
        month: destinationMonth,
      })
    })
  }

  setInsetStyle(pathName: string): void {
    const styleName = 'selected'
    document.querySelector(`nav .${styleName}`)?.classList.remove(styleName)

    const node = document.querySelector(
      `nav .icon-wrap>a[href='${pathName}']>.icon`
    )
    node.classList.toggle(styleName)
  }

  render(): void {
    document.querySelector('header').innerHTML = `
      ${this.createNavigator()}
      ${this.createMonthSelector()}
      ${this.createSumIndicator()}
    `
    this.setInsetStyle(this.state.path)
  }

  createMonthSelector(): string {
    const { year, month } = this.state
    const prevYear = month === 1 ? year - 1 : year
    const prevMonth = month === 1 ? 12 : month - 1
    const nextYear = month === 12 ? year + 1 : year
    const nextMonth = month === 12 ? 1 : month + 1
    return /*html*/ `
<div class="month-selector-wrapper">
  <div class="month-selector">
    ${this.createMonthIndicator(prevYear, prevMonth)}
    ${this.createMonthIndicator(year, month)}
    ${this.createMonthIndicator(nextYear, nextMonth)}
  </div>
  <div class="shader left"></div>
  <div class="shader right"></div>
</div>
`
  }

  createMonthIndicator(year: number, month: number): string {
    return /*html*/ `
<div class="month-indicator">
  <div class="year">${year}</div>
  <div class="month">${monthStr[month]}</div>
</div>
`
  }

  createSumIndicator(): string {
    return /*html*/ `
<div class="sum-indicator-wrap">
  <div class="sum-indicator">
    <div class="money-button income ${
      this.state.type && this.state.type == 'income' ? 'selected' : ''
    }">+${numberWithCommas(this.incomeSum)}</div>
    <div class="money-button expenditure ${
      this.state.type && this.state.type == 'expenditure' ? 'selected' : ''
    }">-${numberWithCommas(this.expenditureSum)}</div>
  </div>
</div>
`
  }

  createNavigator(): string {
    return /*html*/ `
<nav>
  <div class="icon-wrap">
    <a href="/"><i class="icon">clock</i></a>
  </div>
  <div class="icon-wrap">
    <a href="/calendar"><i class="icon">calendar</i></a>
  </div>
  <div class="icon-wrap">
    <a href="/analytics"><i class="icon">chart_bar</i></a>
  </div>
  <div class="separator">
    <span class="line"></span>
  </div>
  <div class="icon-wrap credit-card">
    <button class="credit-card-btn">
      <i class="icon">creditcard</i>
    </button>
  </div>
</nav>
`
  }
}
