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
    const { historyData, state, nextEvent } = e.detail

    const newHistory: History = await (
      await apis.createHistory(historyData)
    ).json()
    if (historyData.isThisMonth) {
      this.store.histories.push(newHistory)
      if (newHistory.type === 'income') {
        this.store.incomeSum += newHistory.amount
      } else {
        this.store.expenditureSum += newHistory.amount
      }
    }
    cem.fire('storeupdated', { state, store: this.store })
  }

  async fetchData(e: CustomEvent) {
    const { year, month, type, nextEvent } = e.detail
    await this.setDefault()
    await this.setHistory(year, month)
    const store = { ...this.store }
    if (type) {
      store.histories = store.histories.filter(
        (history) => history.type == type
      )
    }

    cem.fire('storeupdated', { state: e.detail, store })
  }

  async setDefault(): Promise<void> {
    if (this.store.payments) return
    this.store.payments = await (await apis.findPayment()).json()
    this.store.categories = await (await apis.findCategory()).json()
  }

  async setHistory(year: number, month: number): Promise<void> {
    let expenditureSum = 0,
      incomeSum = 0

    this.store.histories = await (
      await apis.findHistory({ year, month })
    ).json()

    this.store.histories.forEach((history) => {
      history.type === 'income'
        ? (incomeSum += history.amount)
        : (expenditureSum += history.amount)
      history.date = history.date.toString().slice(0, 10)
    })

    this.store.incomeSum = incomeSum
    this.store.expenditureSum = expenditureSum
  }
}

export default Model
