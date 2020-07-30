import apis from './apis'
import { Store } from '../types'
import cem from '../utils/custom-event'

class Model {
  store: Store = {}

  constructor() {
    cem.subscribe('initstore', (e: CustomEvent) => this.getInitialData(e))
  }

  async getInitialData(e: CustomEvent) {
    const { year, month } = e.detail
    await this.setDefault()
    await this.setHistory(year, month)
    cem.fire('storeupdated', { ...e.detail, ...this.store })
  }

  async setDefault(): Promise<void> {
    this.store.payments = await (await apis.findPayment()).json()
    this.store.categories = await (await apis.findCategory()).json()
  }

  async setHistory(year: number, month: number): Promise<void> {
    let expenditureSum = 0,
      incomeSum = 0

    this.store.histories = await (
      await apis.findHistory({
        startDate: `${year}-${month}-01`,
        endDate: `${year}-${month}-31`,
      })
    ).json()

    this.store.histories.forEach((history) => {
      history.type === '수입'
        ? (incomeSum += history.amount)
        : (expenditureSum += history.amount)
      history.date = history.date.toString().slice(0, 10)
    })

    this.store.incomeSum = incomeSum
    this.store.expenditureSum = expenditureSum
  }
}

export default Model
