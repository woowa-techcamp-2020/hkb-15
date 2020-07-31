import { View } from '../../types'
import cem from '../../utils/custom-event'
import { numberWithCommas, monthStr } from '../../utils/helper'
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
<div class="month-selector">
  ${this.createMonthIndicator(prevYear, prevMonth)}
  ${this.createMonthIndicator(year, month)}
  ${this.createMonthIndicator(nextYear, nextMonth)}
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
</nav>
`
  }
}
