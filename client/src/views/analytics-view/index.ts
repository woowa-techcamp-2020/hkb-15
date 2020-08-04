import { View, History, WindowHistoryState, Category } from '../../types'
import cem from '../../utils/custom-event'
import './styles'
import { groupBy, sum } from 'src/utils/helper'

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

  calculateAmountSum(key: string): object {
    const groupedHistory = groupBy(this.histories, key)
    return Object.keys(groupedHistory)
      .map((key) => ({
        id: key,
        sum: sum(groupedHistory[key], 'amount', 0),
      }))
      .sort((a, b) => b.sum - a.sum)
  }

  createBarChart(): string {
    const sums = this.calculateAmountSum('categoryId')
    console.log(sums)
    return ''
  }
}
