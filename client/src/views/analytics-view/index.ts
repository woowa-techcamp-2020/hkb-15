import { View, History, WindowHistoryState, Category } from '../../types'
import cem from '../../utils/custom-event'
import './styles'
import { groupBy, sum, loadHtml, html } from 'src/utils/helper'
import { PieChart } from 'woowahan-chart'
import Color from 'color'

export default class AnalyticsView implements View {
  state: WindowHistoryState
  expenditureHistories: History[]
  categories: Category[]
  sumsByCategory: {
    /** Category ID */
    id: number
    category: string
    sum: number
    percent: number
  }[]

  constructor() {
    cem.subscribe('storeupdated', (e: CustomEvent) => {
      if (e.detail.state.path !== '/analytics') return
      this.setAttributes(e.detail)
      this.render()
    })
  }

  render(): void {
    const contentWrap = document.querySelector('.content-wrap')
    contentWrap.innerHTML = this.createBarChart()

    if (this.sumsByCategory.length > 0) {
      PieChart({
        target: '.pie-chart',
        segments: this.sumsByCategory.map((data, i) => ({
          ...data,
          color: Color('#f8123b')
            .lighten(i * 0.15)
            .string(),
        })),
      })
    }
  }

  setAttributes({ store, state }): void {
    const { histories, categories } = store
    this.state = state
    this.expenditureHistories = (histories as History[]).filter(
      (history) => history.type === 'expenditure'
    )
    this.categories = categories
  }

  calculateAmountSum(key: string): { id: number; sum: number }[] {
    const groupedHistory = groupBy(this.expenditureHistories, key)
    return Object.keys(groupedHistory)
      .map((key) => ({
        id: +key,
        sum: sum(groupedHistory[key], 'amount', 0),
      }))
      .sort((a, b) => b.sum - a.sum)
  }

  createBarChart(): string {
    const totalsum = sum(this.expenditureHistories, 'amount', 0)
    this.sumsByCategory = this.calculateAmountSum('categoryId').map((data) => ({
      ...data,
      category: this.categories.find((category) => category.id === data.id)
        .name,
      percent: +((data.sum / totalsum) * 100).toFixed(2),
    }))

    return html`
      <div class="pie-chart"></div>
      <div class="bar-chart">
        ${loadHtml(
          this.sumsByCategory.map((data) => {
            const name = this.categories.find(
              (category) => category.id === +data.id
            ).name
            const percent = ((+data.sum / totalsum) * 100).toFixed(2)
            const amount = +data.sum

            return html`
              <div class="item-row">
                <div class="name">
                  ${this.categories.find((category) => category.id === data.id)
                    .name}
                </div>
                <div class="percent">${percent}%</div>
                <div class="bar-wrap">
                  <div class="bar" style="width: ${percent}%"></div>
                </div>
                <div class="amount">${amount}</div>
              </div>
            `
          })
        )}
      </div>
    `
  }
}
