import {
  View,
  History,
  Payment,
  WindowHistoryState,
  CalendarDayData,
} from 'src/types'

import {
  Container,
  dayStr,
  numberWithCommas,
  groupBy,
  sum,
  addLeadingZeros,
  loadHtml,
} from 'src/utils/helper'

import cem from 'src/utils/custom-event'
import './styles'

export default class CalendarView implements View {
  state: WindowHistoryState
  histories: History[]
  payments: Payment[]
  historiesByDate: object

  constructor() {
    cem.subscribe('storeupdated', (e: CustomEvent) => {
      if (e.detail.state.path !== '/calendar') return
      this.setAttributes(e.detail)
      this.render()

      const calendarView = document.querySelector('.calendar-view')
      calendarView.addEventListener('click', this.clickEventHandler.bind(this))
    })
  }

  clickEventHandler(e: MouseEvent) {
    e.preventDefault()

    const { target } = e
    if (!(target instanceof HTMLElement)) return
    this.dataCellClickHandler(e, target)
  }

  dataCellClickHandler(e: MouseEvent, target: HTMLElement) {
    const dataCell = target.closest('.date-cell')
    if (!dataCell) return
    e.stopImmediatePropagation()

    const day = +(dataCell.querySelector('.date-indicator') as HTMLElement)
      .innerText

    const dateIndex = this.getDateIndex(this.state.year, this.state.month, day)

    const dateDetail = document.querySelector('.date-detail')
    dateDetail.innerHTML = loadHtml(
      this.historiesByDate[dateIndex]?.map((history: History) =>
        this.createHistoryCard(history)
      )
    )
  }

  createHistoryCard(history: History): string {
    return /*html*/ `
<div class="history-card" id="history-${history.id}">
  <div class="front">
    <div class="payment">${
      this.payments.find((payment) => payment.id === history.paymentId).name
    }</div>
    <div class="content">${history.content}</div>
  </div>
  <div class="back">
    <div class="amount ${history.type === 'income' ? 'income' : ''}">
      ${history.type === 'expenditure' ? '-' : '+'}${numberWithCommas(
      history.amount
    )}
    </div>
  </div>
</div>
`
  }

  setAttributes({ state, store }): void {
    const { histories, payments } = store
    this.state = state
    this.histories = histories
    this.payments = payments
  }

  getEmptyCellData(date: number): CalendarDayData {
    return {
      incomeSum: 0,
      expenditureSum: 0,
      date,
      isHoliday: false,
      isInThisMonth: false,
    }
  }

  getTypeSum(histories: History[], type: 'expenditure' | 'income'): number {
    return sum(
      histories.filter((history) => history.type === type),
      'amount',
      0
    )
  }

  getDateIndex = (year: number, month: number, day: number): string =>
    `${year}-${addLeadingZeros(month, 2)}-${addLeadingZeros(day, 2)}`

  getCalendarData() {
    const year = this.state.year
    const month = this.state.month - 1
    const calendarData: CalendarDayData[] = []
    const historiesByDate = groupBy(this.histories, 'date')
    const thisMonthStartDay = new Date(year, month, 1).getDay()
    const lastMonthEndDate = new Date(year, month, 0).getDate()
    const thisMonthEndDate = new Date(year, month + 1, 0).getDate()
    const lastMonthStartDate = lastMonthEndDate - thisMonthStartDay + 1

    this.historiesByDate = historiesByDate

    for (let i = 0; i < thisMonthStartDay; i++) {
      const date = i + lastMonthStartDate
      calendarData.push(this.getEmptyCellData(date))
    }

    for (let i = 0; i < thisMonthEndDate; i++) {
      const date = i + 1
      const dateIndex = this.getDateIndex(year, month + 1, date)
      const histories = historiesByDate[dateIndex] ?? []

      calendarData.push({
        date,
        isInThisMonth: true,
        isHoliday: false,
        expenditureSum: this.getTypeSum(histories, 'expenditure'),
        incomeSum: this.getTypeSum(histories, 'income'),
      })
    }

    const neededCellCnt = 42 - calendarData.length
    for (let i = 0; i < neededCellCnt; i++) {
      const date = i + 1
      calendarData.push(this.getEmptyCellData(date))
    }

    calendarData
      .filter((data, index) => index % 7 === 0)
      .forEach((data) => (data.isHoliday = true))

    return calendarData
  }

  render(): void {
    const calendarData = this.getCalendarData()
    const contentWrap = document.querySelector('.content-wrap')
    contentWrap.innerHTML = /*html*/ `
<div class='calendar-view'>
  ${this.Calendar(calendarData)}
  <div class='date-detail'></div>
</div>
`
  }

  Calendar(data: CalendarDayData[]): string {
    return Container({
      className: 'calendar',
      child: [this.TableHeader(), this.Table(data)],
    })
  }

  TableHeader = (): string =>
    Container({
      className: 'header',
      child: dayStr.map((day) => this.DayIndicator(day, day === 'SUN')),
    })

  DayIndicator = (day: string, isHoliday: boolean): string =>
    Container({
      className: `day-indicator ${isHoliday ? 'holiday' : ''}`,
      child: day,
    })

  Table = (data: CalendarDayData[]): string =>
    Container({
      className: 'table',
      child: data.map((dayData) => this.DateCell(dayData)),
    })

  DateCell = (data: CalendarDayData): string =>
    Container({
      className: `date-cell ${data.isInThisMonth ? '' : 'blur'}`,
      child: [
        Container({
          className: `date-indicator ${data.isHoliday ? 'holiday' : ''}`,
          child: data.date,
        }),
        Container({
          className: `sum-indicator`,
          child: [
            this.SumIndicator(data.incomeSum, 'income'),
            this.SumIndicator(data.expenditureSum, 'expenditure'),
          ],
        }),
      ],
    })

  SumIndicator = (sum: number, type: 'income' | 'expenditure'): string => {
    if (sum === 0) return ''
    return Container({
      className: type,
      child: `
<div class="sum">${type === 'income' ? '+' : '-'}${numberWithCommas(sum)}</div>
<i class="icon">circle_fill</i>
`,
    })
  }
}
