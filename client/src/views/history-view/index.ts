import { View } from '../../types'
import cem from '../../utils/custom-event'
import './styles'

export default class HistoryView implements View {
  constructor() {
    cem.subscribe('storeupdated', (e: CustomEvent) => this.render(e))
  }
  render(e: Event): void {
    const contentWrap = document.querySelector('.content-wrap')
    contentWrap.innerHTML = `
      ${this.createDateIndicator()}
      ${this.createHistoryCard()}
    `
  }
  createDateIndicator(date?: string): string {
    return `<div class="date-indicator">TUE 16th</div>`
  }
  createHistoryCard(history?: History): string {
    return `<div class="history-card" id="history-1">
      <div class="front">
        <div class="payment">KakaoBank</div>
        <div class="content">Haircut</div>
      </div>
      <div class="back">
        <div class="amount">-14,000</div>
      </div>
    </div>`
  }
}
