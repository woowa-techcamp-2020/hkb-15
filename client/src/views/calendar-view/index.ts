import { View, History, CalendarDayData } from '../../types'
import cem from '../../utils/custom-event'
import './styles'
import { dayStr, numberWithCommas, groupBy } from '../../utils/helper'

export default class HistoryView implements View {
  constructor() {
    cem.subscribe('storeupdated', (e: CustomEvent) => this.render(e))
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

  getCalendarData(year: number, month: number, histories: History[]) {
    month = month - 1
    const calendarData: CalendarDayData[] = []
    const historiesByDate = groupBy(histories, 'date')
    const thisMonthStartDay = new Date(year, month, 1).getDay()
    const lastMonthEndDate = new Date(year, month, 0).getDate()
    const thisMonthEndDate = new Date(year, month + 1, 0).getDate()
    console.log(lastMonthEndDate, thisMonthStartDay)
    const lastMonthStartDate = lastMonthEndDate - thisMonthStartDay + 1
    Array.from(
      Array(thisMonthStartDay),
      (_, i) => i + lastMonthStartDate
    ).forEach((date) => calendarData.push(this.getEmptyCellData(date)))
    Array.from(Array(thisMonthEndDate), (_, i) => i + 1).forEach((date) => {
      const dateObj = new Date(year, month, date)
      const histories = historiesByDate[dateObj.toISOString().slice(0, 10)]

      const expenditureSum = histories
        ? histories
            .filter((history) => history.type === 'expenditure')
            .reduce((sum, history) => sum + history.amount, 0)
        : 0

      const incomeSum = histories
        ? histories
            .filter((history) => history.type === 'income')
            .reduce((sum, history) => sum + history.amount, 0)
        : 0

      calendarData.push({
        date,
        isInThisMonth: true,
        isHoliday: false,
        expenditureSum,
        incomeSum,
      })
    })
    Array.from(
      Array(42 - calendarData.length),
      (_, i) => i + 1
    ).forEach((date) => calendarData.push(this.getEmptyCellData(date)))
    return calendarData
  }

  render(e: CustomEvent): void {
    if (e.detail.path !== '/calendar') return

    const { histories, year, month } = e.detail
    const calendarData = this.getCalendarData(year, month, histories)
    console.log(calendarData)
    const contentWrap = document.querySelector('.content-wrap')
    contentWrap.innerHTML = this.createCalendar(calendarData)
  }

  createCalendar(data: CalendarDayData[]): string {
    return `
  <div class="calendar">
    ${this.createHeader()}
    ${this.createTable(data)}
  </div>
  `
  }

  createHeader() {
    return `
<div class="header">
  ${dayStr.reduce((a, b) => a + this.createDayIndicator(b, b === 'SUN'), '')}
</div>
`
  }

  createDayIndicator(day: string, isHoliday: boolean): string {
    return `
  <div class="day-indicator ${isHoliday ? 'holiday' : ''}">${day}</div>  
  `
  }

  createTable(data: CalendarDayData[]): string {
    return `
<div class="table">
  ${data.reduce((a, b) => a + this.createDateCell(b), '')}
</div>
  `
  }

  createDateCell(data: CalendarDayData): string {
    return `
<div class="date-cell
${data.isInThisMonth ? '' : 'blur'} 
">
  <div class="date-indicator 
  ${data.isHoliday ? 'holiday' : ''}"
  >${data.date}</div>
  <div class="sum-indicator">
    ${this.createSumIndicator(data.incomeSum, 'income')}
    ${this.createSumIndicator(data.incomeSum, 'expenditure')}
  </div>
</div>`
  }

  createSumIndicator(sum: number, type: 'income' | 'expenditure'): string {
    if (sum === 0) return ''
    return `
<div class="${type}">
  ${type === 'income' ? '+' : '-'}${numberWithCommas(sum)}
</div>
`
  }
}
