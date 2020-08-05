import { View, History, WindowHistoryState, Category } from '../../types'
import cem from '../../utils/custom-event'
import './styles'
import { groupBy, sum, loadHtml } from 'src/utils/helper'

export default class AnalyticsView implements View {
  state: WindowHistoryState
  histories: History[]
  categories: Category[]

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
  }

  setAttributes({ store, state }): void {
    const { histories, categories } = store
    this.state = state
    this.histories = histories
    this.categories = categories
  }

  calculateAmountSum(key: string): Array<object> {
    const groupedHistory = groupBy(this.histories, key)
    return Object.keys(groupedHistory)
      .map((key) => ({
        id: key,
        sum: sum(groupedHistory[key], 'amount', 0),
      }))
      .sort((a, b) => b.sum - a.sum)
  }

  createBarChart(): string {
    const totalsum = sum(this.histories, 'amount', 0)
    const sumsByCategory = this.calculateAmountSum('categoryId')
    console.log(sumsByCategory)
    console.log(this.categories)
    return /*html*/ `
<div class="bar-chart">
    ${loadHtml(
      sumsByCategory.map((data) => {
        const name = this.categories.find(
          (category) => category.id === +data.id
        ).name
        const percent = ((+data.sum / totalsum) * 100).toFixed(2)
        const amount = +data.sum

        return /*html*/ `
      <div class="item-row">
        <div class="name">${
          this.categories.find((category) => category.id === +data.id).name
        }</div>
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
