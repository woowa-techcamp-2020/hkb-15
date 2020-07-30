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
  expenditureSum?: number | 0
  incomeSum?: number | 0
}
export interface View {
  render(e: Event): void
}
