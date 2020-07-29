import apis from './apis'
import { Store } from '../types'
import cem from '../utils/custom-event'

class Model {
  store: Store

  constructor() {
    this.store = {}
    cem.subscribe('initstore', (e: CustomEvent) => this.getInitialData(e))
  }

  async getInitialData(e: CustomEvent) {
    const { year, month } = e.detail
    this.store.payments = await (await apis.findPayment()).json()
    this.store.categories = await (await apis.findCategory()).json()
    this.store.histories = await (
      await apis.findHistory({
        startDate: `${year}-${month}-01`,
        endDate: `${year}-${month}-31`,
      })
    ).json()
    cem.fire('storeupdated', { ...e.detail, ...this.store })
  }
}

export default Model
