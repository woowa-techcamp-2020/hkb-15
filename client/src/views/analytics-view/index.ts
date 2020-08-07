import type { View, History, WindowHistoryState, Category } from 'src/types'
import cem from 'src/utils/custom-event'
import './styles/index.scss'
import { groupBy, sum, loadHtml, html } from 'src/utils/helper'
import { PieChart, LineChart } from 'woowahan-chart'

const pieColorVariants = [
  '#FF5959',
  '#F98F54',
  '#F0C350',
  '#7BCA3D',
  '#56DB9B',
  '#2BCFDA',
  '#5580EF',
  '#9979F3',
  '#D879F0',
  '#FF5FA2',
]

export default class AnalyticsView implements View {
  state: WindowHistoryState
  expenditureHistories: History[]
  categories: Category[]
  sumsByCategory: {
    /** Category ID */
    id: number | string
    category: string
    sum: number
    percent: number
  }[]

  constructor() {
    cem.subscribe('storeupdated', (e: CustomEvent) => {
      if (e.detail.state.path !== '/analytics') {
        document.querySelector<HTMLElement>(
          '.sum-indicator-wrap'
        ).style.display = ''
        return
      }

      document.querySelector<HTMLElement>('.sum-indicator-wrap').style.display =
        'none'

      this.setAttributes(e.detail)
      this.render()
    })
  }

  delegateEvents(target: HTMLElement) {
    if (
      target.classList.contains('ao-btn') &&
      !target.classList.contains('checked')
    ) {
      target.parentElement
        .querySelectorAll('.ao-btn')
        .forEach((btn) => btn.classList.toggle('checked'))

      document.querySelector('section.by-categories').classList.toggle('hidden')
      document.querySelector('section.daily').classList.toggle('hidden')
    }
  }

  render(): void {
    const contentWrap = document.querySelector('.content-wrap')

    contentWrap.innerHTML = /*html*/ `
<div class='analytics-view'>
  ${this.createBarChart()}
</div>
`
    document
      .querySelector<HTMLElement>('.analytics-options')
      .addEventListener('click', (e) => {
        if (e.target instanceof HTMLElement) {
          this.delegateEvents(e.target)
        }
      })

    if (this.sumsByCategory.length > 0) {
      PieChart({
        target: '.pie-chart',
        segments: this.sumsByCategory.map((data, i) => ({
          ...data,
          color: pieColorVariants[i],
        })),
      })

      const groupedExpendituresHistory = groupBy(
        this.expenditureHistories,
        'date'
      )

      let max = 0
      let head = 0
      let exponent = 0

      const dailyExpenditures = [
        ...Array(new Date(this.state.year, this.state.month, 0).getDate()),
      ]
        .map(
          (_, i) =>
            `${this.state.year}-${
              (this.state.month < 10 ? '0' : '') + this.state.month
            }-${(i + 1 < 10 ? '0' : '') + (i + 1)}`
        )
        .map((date, i) => {
          const y =
            (groupedExpendituresHistory[date]?.reduce(
              (accum, item) => accum + item.amount,
              0
            ) as number) ?? 0

          if (y > max) {
            max = y
          }

          return {
            x: (i + 1).toString(),
            y,
          }
        })

      for (let i = 0; ; i += 1) {
        if (max / 10 ** i < 1) {
          break
        } else {
          head = Math.floor(max / 10 ** i) + 1
          exponent = i
        }
      }

      LineChart({
        target: '.line-chart',
        data: dailyExpenditures,
        maxY: head * 10 ** exponent,
        intervalY: 10 ** exponent / 2,
        intervalX: 2,
      })
    }
  }

  setAttributes({ store, state }): void {
    const { histories, categories } = store
    this.state = state
    this.expenditureHistories = (histories as History[]).filter(
      (history) => history.type === 'expenditure'
    )
    this.categories = categories
  }

  calculateAmountSum(key: string): { id: number | string; sum: number }[] {
    const groupedHistory = groupBy(this.expenditureHistories, key)
    return Object.keys(groupedHistory)
      .map((key) => ({
        id: +key === parseInt(key) ? +key : key,
        sum: sum(groupedHistory[key], 'amount', 0),
      }))
      .sort((a, b) => b.sum - a.sum)
  }

  createBarChart(): string {
    const totalsum = sum(this.expenditureHistories, 'amount', 0)
    this.sumsByCategory = this.calculateAmountSum('categoryId').map((data) => ({
      ...data,
      category: this.categories.find((category) => category.id === data.id)
        .name,
      percent: +((data.sum / totalsum) * 100).toFixed(2),
    }))

    return html`
      <div class="analytics-options">
        <button class="ao-btn checked by-categories">By Categories</button>
        <button class="ao-btn daily">By Dates</button>
      </div>

      <div class="analytics-container">
        <section class="by-categories">
          <div class="pie-chart"></div>
          <div class="bar-chart">
            ${loadHtml(
              this.sumsByCategory.map((data) => {
                const percent = ((+data.sum / totalsum) * 100).toFixed(2)
                const amount = +data.sum

                return html`
                  <div class="item-row">
                    <div class="name">
                      ${this.categories.find(
                        (category) => category.id === data.id
                      ).name}
                    </div>
                    <div class="percent">${percent}%</div>
                    <div class="bar-wrap">
                      <div class="bar" style="width: ${percent}%"></div>
                    </div>
                    <div class="amount">${amount.toLocaleString()}</div>
                  </div>
                `
              })
            )}
          </div>
        </section>

        <section class="daily hidden">
          <div class="line-chart"></div>
        </section>
      </div>
    `
  }
}
