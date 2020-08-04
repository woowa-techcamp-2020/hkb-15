import { View, History, WindowHistoryState, Category } from '../../types'
import cem from '../../utils/custom-event'
import './styles'

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
    contentWrap.innerHTML = ''
  }

  setAttributes({ store, state }): void {
    const { histories, categories } = store
    this.state = state
    this.histories = histories
    this.categories = categories
  }
}
