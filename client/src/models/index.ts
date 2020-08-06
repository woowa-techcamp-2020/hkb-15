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
    cem.subscribe('historymodalgetdata', this.getModalData.bind(this))
  }

  async sanitizeResponse(promise: Promise<Response>): Promise<object> {
    const res = await promise
    if (res.status === 401) {
      cem.fire('login')
    } else return await res.json()
  }

  getModalData(e: CustomEvent) {
    const { state, historyId } = e.detail
    const { categories, payments } = this.store

    let history: History = this.store.histories.find(
      (history) => history.id === historyId
    )

    cem.fire('historymodalcreate', {
      state,
      store: { categories, payments, history },
    })
  }

  async createHistory(e: CustomEvent) {
    const { historyData, state } = e.detail

    const newHistory = (await this.sanitizeResponse(
      apis.createHistory(historyData)
    )) as History

    if (historyData.isThisMonth) {
      this.store.histories.push(newHistory)
      this.initializeHistories()
      cem.fire('storeupdated', { state, store: this.store })
    }
  }

  async updateHistory(e: CustomEvent) {
    const { historyData, state } = e.detail

    const updatedHistory = (await this.sanitizeResponse(
      apis.updateHistory(historyData)
    )) as History

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
    await this.fetchCategories()
    await this.fetchPayments()
    await this.fetchHistories(year, month)

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

  async fetchPayments(): Promise<void> {
    if (this.store.payments) return
    this.store.payments = await this.sanitizeResponse(apis.findPayment())
  }

  async fetchCategories(): Promise<void> {
    if (this.store.categories) return
    this.store.categories = await this.sanitizeResponse(apis.findCategory())
  }

  async fetchHistories(year: number, month: number): Promise<void> {
    this.store.histories = await this.sanitizeResponse(
      apis.findHistory({ year, month })
    )

    this.initializeHistories()
  }
}

export default Model
