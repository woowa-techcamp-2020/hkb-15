import apis from './apis'
import { Store, History } from '../types'
import cem from '../utils/custom-event'

class Model {
  store: Store = {}

  constructor() {
    cem.subscribe('statepop', (e: CustomEvent) => this.fetchData(e))
    cem.subscribe('statechange', (e: CustomEvent) => this.fetchData(e))
    cem.subscribe('historycreate', (e: CustomEvent) => this.createHistory(e))
    cem.subscribe('getdata', (e: CustomEvent) => this.getData(e))
  }

  getData(e: CustomEvent) {
    const { state, nextEvent } = e.detail
    cem.fire(nextEvent, { state, store: this.store })
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
