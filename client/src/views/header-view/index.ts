import { View } from '../../types'
import cem from '../../utils/custom-event'
import { numberWithCommas, monthStr } from '../../utils/helper'
import './styles'

export default class HeaderView implements View {
  constructor() {
    document
      .querySelector('header')
      .addEventListener('click', (e: MouseEvent) => {
        e.preventDefault()
        const { target } = e
        if (!(target instanceof HTMLElement)) return
        const aTag = target.closest('a')

        if (aTag) return this.navigationIconClickHandler(target)
        const button = target.closest('.money-button')
        console.log(button)
        if (button) return button.classList.toggle('selected')
      })
    cem.subscribe('storeupdated', (e: CustomEvent) => this.render(e))
  }

  render(e: CustomEvent): void {
    const { path, year, month, expenditureSum, incomeSum } = e.detail
    document.querySelector('header').innerHTML = `
      ${this.createNavigator()}
      ${this.createMonthSelector(year, month)}
      ${this.createSumIndicator(incomeSum, expenditureSum)}
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
  <div class="month-indicator">
    <div class="year">${prevYear}</div>
    <div class="month">${monthStr[prevMonth]}</div>
  </div>
  <div class="month-indicator">
    <div class="year">${year}</div>
    <div class="month">${monthStr[month]}</div>
  </div>
  <div class="month-indicator">
    <div class="year">${nextYear}</div>
    <div class="month">${monthStr[nextMonth]}</div>
  </div>
</div>
`
  }

  createSumIndicator(incomeSum: number, expeditureSum: number): string {
    return `
<div class="sum-indicator-wrap">
  <div class="sum-indicator">
    <div class="money-button income">+${numberWithCommas(incomeSum)}</div>
    <div class="money-button expenditure">-${numberWithCommas(
      expeditureSum
    )}</div>
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

  setInsetStyle(pathName: string): void {
    const styleName = 'selected'
    document.querySelector(`nav .${styleName}`)?.classList.remove(styleName)

    const node = document.querySelector(
      `nav .icon-wrap>a[href='${pathName}']>.icon`
    )
    node.classList.toggle(styleName)
  }

  getPathFromLink(aTag: Element): string {
    const path = aTag.getAttribute('href')
    return path
  }

  navigationIconClickHandler(target: Element): void {
    const path = this.getPathFromLink(target)
    const state = {
      path,
      year: 2020,
      month: 7,
    }
    cem.fire('statechange', state)
    history.pushState(state, '', path)
    this.setInsetStyle(path)
  }
}
