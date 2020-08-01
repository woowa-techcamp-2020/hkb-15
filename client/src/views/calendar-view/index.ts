import { View, History, CalendarDayData } from '../../types'
import cem from '../../utils/custom-event'
import './styles'
import {
  Container,
  dayStr,
  numberWithCommas,
  groupBy,
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
            this.SumIndicator(data.incomeSum, 'expenditure'),
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
