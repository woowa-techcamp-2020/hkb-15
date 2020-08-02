import apis from './apis'
import { Store } from '../types'
import cem from '../utils/custom-event'

class Model {
  store: Store = {}

  constructor() {
    cem.subscribe('statepop', (e: CustomEvent) => this.getData(e))
    cem.subscribe('statechange', (e: CustomEvent) => this.getData(e))
  }

  async getData(e: CustomEvent) {
    const { year, month, type } = e.detail
    await this.setDefault()
    await this.setHistory(year, month)
    const store = { ...this.store }
    if (type) {
      store.histories = store.histories.filter(
        (history) => history.type == type
      )
    }
    cem.fire('storeupdated', { ...e.detail, ...store })
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
