import apis from './apis'
import { Store, History } from '../types'
import cem from '../utils/custom-event'

class Model {
  store: Store = {}

  constructor() {
    cem.subscribe('statepop', this.fetchData.bind(this))
    cem.subscribe('statechange', this.fetchData.bind(this))
    cem.subscribe('historycreate', this.createHistory.bind(this))
    cem.subscribe('historyupdate', this.updateHistory.bind(this))
    cem.subscribe('historymodalpopup', this.getModalData.bind(this))
  }

  getModalData(e: CustomEvent) {
    const { state, historyId } = e.detail
    const { categories, payments } = this.store

    let history: History = this.store.histories.find(
      (history) => history.id === historyId
    )

    cem.fire('createhistorymodal', {
      state,
      store: { categories, payments, history },
    })
  }

  async createHistory(e: CustomEvent) {
    const { historyData, state } = e.detail

    const newHistory: History = await (
      await apis.createHistory(historyData)
    ).json()

    if (historyData.isThisMonth) {
      this.store.histories.push(newHistory)
      this.initializeHistories()
      cem.fire('storeupdated', { state, store: this.store })
    }
  }

  async updateHistory(e: CustomEvent) {
    const { historyData, state } = e.detail

    const updatedHistory: History = await (
      await apis.updateHistory(historyData)
    ).json()

    if (historyData.isThisMonth) {
      const arrId = this.store.histories.findIndex(
        (history) => history.id === historyData.id
      )
      this.store.histories[arrId] = updatedHistory
      this.initializeHistories()
      cem.fire('storeupdated', { state, store: this.store })
    }
  }

  async fetchData(e: CustomEvent) {
    const { year, month, type } = e.detail
    await this.fetchDefault()
    await this.fetchHistory(year, month)
    const store = { ...this.store }
    if (type) {
      store.histories = store.histories.filter(
        (history) => history.type == type
      )
    }

    cem.fire('storeupdated', { state: e.detail, store })
  }

  initializeHistories() {
    let expenditureSum = 0,
      incomeSum = 0

    this.store.histories.forEach((history) => {
      history.type === 'income'
        ? (incomeSum += history.amount)
        : (expenditureSum += history.amount)
      history.date = history.date.slice(0, 10)
    })

    this.store.incomeSum = incomeSum
    this.store.expenditureSum = expenditureSum
  }

  async fetchDefault(): Promise<void> {
    if (this.store.payments) return
    this.store.payments = await (await apis.findPayment()).json()
    this.store.categories = await (await apis.findCategory()).json()
  }

  async fetchHistory(year: number, month: number): Promise<void> {
    this.store.histories = await (
      await apis.findHistory({ year, month })
    ).json()

    this.initializeHistories()
  }
}

export default Model
