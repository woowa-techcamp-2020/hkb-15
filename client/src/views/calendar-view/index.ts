import { View, History } from '../../types'
import cem from '../../utils/custom-event'
import './styles'
import { dayStr, numberWithCommas, groupBy } from '../../utils/helper'

export default class HistoryView implements View {
  constructor() {
    cem.subscribe('storeupdated', (e: CustomEvent) => this.render(e))
  }

  getCalendarData(year: number, month: number, histories: History[]) {
    const historiesByDate = groupBy(histories, 'date')
    const startDay = new Date(year, month, 1)
    const endDay = new Date(year, month + 1, 0)
  }

  render(e: CustomEvent): void {
    if (e.detail.path !== '/calendar') return

    const { histories, year, month } = e.detail
    this.getCalendarData(year, month, histories)

    const contentWrap = document.querySelector('.content-wrap')
    contentWrap.innerHTML = this.createCalendar()
  }

  createCalendar() {
    return `
  <div class="calendar">
    ${this.createHeader()}
    ${this.createTable()}
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

  createTable() {
    return `
<div class="table">
  ${this.createDateCell(1, true, true, 2000, 5000)}
  <div class="date-cell 1">2</div>
  <div class="date-cell 1">3</div>
  <div class="date-cell 1">4</div>
  <div class="date-cell 1">5</div>
  <div class="date-cell 1">6</div>
  <div class="date-cell 1">7</div>

  <div class="date-cell 1">1</div>
  <div class="date-cell 1">2</div>
  <div class="date-cell 1">3</div>
  <div class="date-cell 1">4</div>
  <div class="date-cell 1">5</div>
  <div class="date-cell 1">6</div>
  <div class="date-cell 1">7</div>

  <div class="date-cell 1"></div>
  <div class="date-cell 1"></div>
  <div class="date-cell 1"></div>
  <div class="date-cell 1"></div>
  <div class="date-cell 1"></div>
  <div class="date-cell 1"></div>
  <div class="date-cell 1"></div>

  <div class="date-cell 1"></div>
  <div class="date-cell 1"></div>
  <div class="date-cell 1"></div>
  <div class="date-cell 1"></div>
  <div class="date-cell 1"></div>
  <div class="date-cell 1"></div>
  <div class="date-cell 1"></div>

  <div class="date-cell 1"></div>
  <div class="date-cell 1"></div>
  <div class="date-cell 1"></div>
  <div class="date-cell 1"></div>
  <div class="date-cell 1"></div>
  <div class="date-cell 1"></div>
  <div class="date-cell 1"></div>
</div>
  `
  }

  createDateCell(
    date: number,
    isInThisMonth: boolean,
    isHoliday: boolean,
    incomeSum: number,
    expeditureSum: number
  ): string {
    return `
<div class="date-cell">
  <div class="date-indicator 
  ${isInThisMonth ? '' : 'blur'} 
  ${isHoliday ? 'holiday' : ''}"
  >${date}</div>
  <div class="sum-indicator">
    <div class="income">+${numberWithCommas(incomeSum)}</div>
    <div class="expenditure">-${numberWithCommas(expeditureSum)}</div>
  </div>
</div>`
  }
}
