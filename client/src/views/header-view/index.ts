import { View } from '../../types'
import cem from '../../utils/custom-event'
import './styles'

export default class HeaderView implements View {
  constructor() {
    document
      .querySelector('header')
      .addEventListener('click', async (e: Event) =>
        this.navigationIconClickHandler(e)
      )
    cem.subscribe('storeupdated', (e: CustomEvent) => this.render(e))
    cem.subscribe('popstate', (e: CustomEvent) => this.render(e))
  }

  render(e: CustomEvent): void {
    const { path, year, month, expeditureSum, incomeSum } = e.detail

    document.querySelector('header').innerHTML = `
      ${this.createNavigator()}
      ${this.createMonthSelector(year, month)}
      ${this.createSumIndicator(incomeSum, expeditureSum)}
    `
    this.setInsetStyle(path)
  }

  createMonthSelector(year: number, month: number): string {
    return `
<div class="month-selector">
  <div class="month-indicator">
    <div class="year">2020</div>
    <div class="month">May</div>
  </div>
  <div class="month-indicator">
    <div class="year">2020</div>
    <div class="month">June</div>
  </div>
  <div class="month-indicator">
    <div class="year">2020</div>
    <div class="month">July</div>
  </div>
</div>
`
  }

  createSumIndicator(incomeSum: number, expeditureSum: number): string {
    return `
<div class="sum-indicator-wrap">
  <div class="sum-indicator">
    <div class="income money-button">+4,000,000</div>
    <div class="expediture money-button">-444.790</div>
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

  getCurrentPath(e: Event, listNode: Element): string {
    e.preventDefault()
    const path = listNode.querySelector('a').getAttribute('href')
    return path
  }

  navigationIconClickHandler(e: Event): void {
    const { target } = e
    if (!(target instanceof HTMLElement)) return
    const listNode = target.closest('.icon-wrap')
    if (!listNode) return
    const path = this.getCurrentPath(e, listNode)
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
