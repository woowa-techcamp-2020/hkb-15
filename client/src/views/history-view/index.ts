import { View, History } from '../../types'
import cem from '../../utils/custom-event'
import './styles'
import { numberWithCommas, groupBy } from '../../utils/helper'

export default class HistoryView implements View {
  constructor() {
    cem.subscribe('storeupdated', (e: CustomEvent) => this.render(e))
  }

  render(e: CustomEvent): void {
    if (e.detail.path !== '/') return
    const { histories } = e.detail
    const historiesByDate = groupBy(histories, 'date')

    const contentWrap = document.querySelector('.content-wrap')

    contentWrap.innerHTML = Object.keys(historiesByDate).reduce(
      (a: string, b: string) =>
        a + this.createDateColumn(b, historiesByDate[b]),
      ''
    )
  }

  createDateColumn(date: string, histories: History[]) {
    console.log(histories)
    return `
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
    return `
<div class="date-indicator">${date}</div>
`
  }
  createHistoryCard(history: History): string {
    return `
<div class="history-card" id="history-1">
  <div class="front">
    <div class="payment">KakaoBank</div>
    <div class="content">${history.content}</div>
  </div>
  <div class="back">
    <div class="amount ${history.type === '수입' ? 'income' : ''}">
      ${history.type === '지출' ? '-' : '+'}${numberWithCommas(history.amount)}
    </div>
  </div>
</div>
`
  }
}
