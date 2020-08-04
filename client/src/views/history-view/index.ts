import {
  View,
  History,
  Payment,
  Category,
  WindowHistoryState,
} from '../../types'
import cem from '../../utils/custom-event'
import './styles'
import {
  numberWithCommas,
  groupBy,
  dateWithDay,
  getNumber,
} from '../../utils/helper'

export default class HistoryView implements View {
  state: WindowHistoryState
  histories: History[]
  categories: Category[]
  payments: Payment[]

  constructor() {
    cem.subscribe('storeupdated', (e: CustomEvent) => {
      if (e.detail.state.path !== '/') return
      this.setAttributes(e.detail)
      this.render()
    })

    const contentWrap = document.querySelector('.content-wrap')
    contentWrap.addEventListener('click', this.clickEventHandler.bind(this))
  }

  setAttributes({ state, store }): void {
    const { histories, categories, payments } = store
    this.state = state
    this.histories = histories
    this.categories = categories
    this.payments = payments
  }

  clickEventHandler(e: MouseEvent) {
    e.preventDefault()

    const { target } = e
    if (!(target instanceof HTMLElement)) return
    this.createHistoryButtonClickHandler(e, target)
    this.historyCardClickHandler(e, target)
  }

  createHistoryButtonClickHandler(e: MouseEvent, target: HTMLElement) {
    if (!target.closest('.float')) return
    e.stopImmediatePropagation()
    cem.fire('historymodalgetdata', { state: this.state })
  }

  historyCardClickHandler(e: MouseEvent, target: HTMLElement) {
    const historyCard = target.closest('.history-card')
    if (!historyCard) return
    e.stopImmediatePropagation()
    const historyId = getNumber(historyCard.id)
    cem.fire('historymodalgetdata', { historyId, state: this.state })
  }

  render(): void {
    const historiesByDate = groupBy(this.histories, 'date')
    const contentWrap = document.querySelector('.content-wrap')
    contentWrap.innerHTML = `
${Object.keys(historiesByDate)
  .sort()
  .reverse()
  .reduce(
    (a: string, b: string) => a + this.createDateColumn(b, historiesByDate[b]),
    ''
  )}
${this.createFloatingButton()}
`
  }

  createDateColumn(date: string, histories: History[]) {
    return /*html*/ `
<div class="date-history-column">
  ${this.createDateIndicator(date)}
  ${histories.reduce(
    (a: string, b: History) => a + this.createHistoryCard(b),
    ''
  )}
</div>
`
  }

  createDateIndicator(date: string): string {
    return /*html*/ `
<div class="date-indicator">${dateWithDay(date)}</div>
`
  }

  createHistoryCard(history: History): string {
    return /*html*/ `
<div class="history-card" id="history-${history.id}">
  <div class="front">
    <div class="payment">${
      this.payments.find((payment) => payment.id === history.paymentId).name
    }</div>
    <div class="content">${history.content}</div>
  </div>
  <div class="back">
    <div class="amount ${history.type === 'income' ? 'income' : ''}">
      ${history.type === 'expenditure' ? '-' : '+'}${numberWithCommas(
      history.amount
    )}
    </div>
  </div>
</div>
`
  }

  createFloatingButton(): string {
    return /*html*/ `
<div class="float">
    <i class="icon">plus_circle_fill</i>
    <div class="text">Add History</div>
</div>
  `
  }
}
