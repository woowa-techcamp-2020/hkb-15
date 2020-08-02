import { View, History, CalendarDayData } from '../../types'
import cem from '../../utils/custom-event'
import './styles'
import {
  Container,
  dayStr,
  numberWithCommas,
  groupBy,
  sum,
} from '../../utils/helper'

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

  getTypeSum(histories: History[], type: 'expenditure' | 'income'): number {
    return sum(
      histories.filter((history) => history.type === type),
      'amount',
      0
    )
  }

  getCalendarData(year: number, month: number, histories: History[]) {
    const calendarData: CalendarDayData[] = []
    const historiesByDate = groupBy(histories, 'date')
    const thisMonthStartDay = new Date(year, month, 1).getDay()
    const lastMonthEndDate = new Date(year, month, 0).getDate()
    const thisMonthEndDate = new Date(year, month + 1, 0).getDate()
    const lastMonthStartDate = lastMonthEndDate - thisMonthStartDay + 1

    for (let i = 0; i < thisMonthStartDay; i++) {
      const date = i + lastMonthStartDate
      calendarData.push(this.getEmptyCellData(date))
    }

    for (let i = 0; i < thisMonthEndDate; i++) {
      const date = i + 1
      const dateIndex = new Date(year, month, date).toISOString().slice(0, 10)
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

  render(e: CustomEvent): void {
    if (e.detail.path !== '/calendar') return

    const { histories, year, month } = e.detail
    const calendarData = this.getCalendarData(year, month - 1, histories)
    const contentWrap = document.querySelector('.content-wrap')
    contentWrap.innerHTML = this.Calendar(calendarData)
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
      child: `${type === 'income' ? '+' : '-'}${numberWithCommas(sum)}`,
    })
  }
}
