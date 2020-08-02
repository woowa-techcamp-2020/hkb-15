import { View, WindowHistoryState } from '../../types'
import cem from '../../utils/custom-event'
import { monthStr, numberWithCommas, dommer } from '../../utils/helper'
import './styles'

export default class HeaderView implements View {
  constructor() {
    const header = document.querySelector('header')

    header.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault()

      const { target } = e
      if (!(target instanceof HTMLElement)) return

      const a = target.closest('a')
      if (a) return this.navigationIconClickHandler(a)

      const button = target.closest('.money-button')
      if (button) return this.moneyButtonClickHandler(button)

      const shader = target.closest<HTMLElement>('.shader')

      if (shader) {
        return this.shaderClickHandler(shader)
      }

      if (target.closest('.credit-card-btn')) {
        return this.cardClickHandler()
      }
    })
    cem.subscribe('storeupdated', (e: CustomEvent) => this.render(e))
  }

  getPathFromLink(aTag: Element): string {
    const path = aTag.getAttribute('href')
    return path
  }

  navigationIconClickHandler(target: Element): void {
    const path = this.getPathFromLink(target)
    this.setInsetStyle(path)
    cem.fire('statechange', Object.assign({}, history.state, { path }))
  }

  moneyButtonClickHandler(targetButton: Element): void {
    const state = { ...history.state }
    const sumIndicator = targetButton.closest('.sum-indicator')
    const selectedButton = sumIndicator.querySelector('.selected')
    const type = targetButton.classList.contains('income')
      ? 'income'
      : 'expenditure'

    if (!selectedButton) {
      state.type = type
      targetButton.classList.toggle('selected')
    } else if (selectedButton === targetButton) {
      delete state.type
      selectedButton.classList.toggle('selected')
    } else {
      state.type = type
      selectedButton.classList.toggle('selected')
      targetButton.classList.toggle('selected')
    }

    cem.fire('statechange', state)
  }

  cardClickHandler(): void {
    cem.fire('activatepaymentsmanager')
  }

  shaderClickHandler(shader: HTMLElement): void {
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

  render(e: CustomEvent): void {
    const { path, year, month, type, expenditureSum, incomeSum } = e.detail
    document.querySelector('header').innerHTML = `
      ${this.createNavigator()}
      ${this.createMonthSelector(year, month)}
      ${this.createSumIndicator(incomeSum, expenditureSum, type)}
    `
    this.setInsetStyle(path)
  }

  createMonthSelector(year: number, month: number): string {
    const prevYear = month === 1 ? year - 1 : year
    const prevMonth = month === 1 ? 12 : month - 1
    const nextYear = month === 12 ? year + 1 : year
    const nextMonth = month === 12 ? 1 : month + 1
    return `
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

  createMonthIndicator(year: number, month: number) {
    return `
<div class="month-indicator">
  <div class="year">${year}</div>
  <div class="month">${monthStr[month]}</div>
</div>
`
  }

  createSumIndicator(
    incomeSum: number,
    expeditureSum: number,
    type: string
  ): string {
    console.log(type)

    return `
<div class="sum-indicator-wrap">
  <div class="sum-indicator">
    <div class="money-button income ${
      type && type == 'income' ? 'selected' : ''
    }">+${numberWithCommas(incomeSum)}</div>
    <div class="money-button expenditure ${
      type && type == 'expenditure' ? 'selected' : ''
    }">-${numberWithCommas(expeditureSum)}</div>
  </div>
</div>
`
  }

  createNavigator(): string {
    return `
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
    </button
  </div>
</nav>
`
  }
}
