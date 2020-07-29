import apis from './apis'
import cem from '../utils/custom-event'
type Category = {
  id: number
  name: string
  type: string
}
type Payment = {
  id: number
  name: string
}

type History = {
  id: number
  type: string
  date: Date
  content: string
}

type Store = {
  categories?: Category[]
  payments?: Payment[]
  histories?: History[]
}

class Model {
  store: Store

  constructor() {
    cem.subscribe('getHistory', this.getHistory)
  }

  async getHistory(e) {
    const { year, month } = e.detail
    const startDate = `${year}-${month}-1`
    const endDate = `${year}-${month}-31`
    const histories = await (
      await apis.findHistory({ startDate, endDate })
    ).json()
    console.log(histories)
  }

  //   async init(year, month): Promise<void> {
  //     this.store.histories = (await (
  //       await apis.findHistory(month)
  //     ).json()) as History[]
  //   }
}

export default new Model()
