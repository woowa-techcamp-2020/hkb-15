export type Content = Record<string, string | number | string[]> | Content[]
export interface Category {
  id: number
  name: string
  type: string
}
export interface Payment {
  id: number
  name: string
}

export interface History {
  id: number
  type: string
  date: string
  content: string
  amount: number
}

export interface Store {
  categories?: Category[]
  payments?: Payment[]
  histories?: History[]
  expenditureSum?: number
  incomeSum?: number
}

export interface View {
  render(e: Event): void
}

export interface CalendarDayData {
  date: number
  isInThisMonth: boolean
  isHoliday: boolean
  incomeSum: number
  expenditureSum: number
}

export type WindowHistoryState = {
  path?: string
  year?: number
  month?: number
}
