import { View, History, Category, Payment } from '../../types'
import {
  getNumber,
  addLeadingZeros,
  loadHtml,
  getPaymentEnKeyName,
} from '../../utils/helper'
import cem from '../../utils/custom-event'

import './styles'

export default class CreateHistoryView implements View {
  year: string
  month: string
  day: string
  categories: Category[]
  payments: Payment[]

  constructor() {
    cem.subscribe('createhistorymodal', (e: CustomEvent) => {
      //setting default date info for today
      this.setAttributes(e.detail.store)
      this.render()
    })

    const contentWrap = document.querySelector('.content-wrap')
    contentWrap.addEventListener('click', (e: MouseEvent) =>
      this.clickEventHandler(e)
    )
    contentWrap.addEventListener('keydown', (e: KeyboardEvent) =>
      this.keydownEventHandler(e)
    )
    contentWrap.addEventListener('focusout', (e: FocusEvent) =>
      this.focusoutEventHandler(e)
    )
  }

  setAttributes({ categories, payments }): void {
    const today = new Date()
    this.year = today.getFullYear().toString()
    this.month = addLeadingZeros(today.getMonth() + 1, 2)
    this.day = addLeadingZeros(today.getDate() + 1, 2)
    this.categories = categories
    this.payments = payments
  }

  getInputValue(selector: string): string {
    return (document.querySelector(selector) as HTMLInputElement)?.value
  }

  getElementId(selector: string): number {
    return getNumber((document.querySelector(selector) as HTMLElement)?.id)
  }

  getElementInnerText(selector: string): string {
    return (document.querySelector(selector) as HTMLElement).innerText
  }

  async closeModal(isRemove: boolean) {
    const modal = document.querySelector('.modal')
    modal.classList.toggle('remove')
    await Promise.all(
      modal.getAnimations().map((animation) => animation.finished)
    )
    if (isRemove) modal.remove()
  }

  numberKeyValidator(e: KeyboardEvent): boolean {
    return (
      e.code.includes('Digit') ||
      e.code.includes('Arrow') ||
      (e.code === 'KeyA' && e.metaKey) ||
      e.code === 'Backspace' ||
      e.code === 'Tab'
    )
  }

  dateValidator(
    target: HTMLInputElement,
    min: string,
    max: string,
    initial: string,
    length: number
  ) {
    const value = +target.value

    if (value < +min || !value) target.value = initial
    else if (value > +max) target.value = initial
    else if (target.value.length !== length)
      target.value = addLeadingZeros(+target.value, length)
  }

  focusoutEventHandler(e: FocusEvent) {
    const { target } = e
    if (!(target instanceof HTMLInputElement)) return

    if (target.closest('.date-picker')) {
      switch (target.className) {
        case 'year':
          this.dateValidator(target, '2000', '2030', this.year, 4)
          break
        case 'month':
          this.dateValidator(target, '01', '12', this.month, 2)
          break
        case 'day':
          this.dateValidator(target, '01', '31', this.day, 2)
          break
      }
    }
  }

  submitButtonHandler(): boolean {
    const content = this.getInputValue('.content-input')
    const amount = this.getInputValue('.amount-input')
    return content.length + amount.length !== 0
  }

  keydownEventHandler(e: KeyboardEvent): void {
    const { target } = e
    if (!(target instanceof HTMLElement)) return

    if (target.closest('.date-picker') || target.className == 'amount-input') {
      if (!this.numberKeyValidator(e)) e.preventDefault()
    }

    const submitButton = document.querySelector(
      '.submit-button'
    ) as HTMLInputElement

    submitButton.disabled = !this.submitButtonHandler()
  }

  async submissionHandler(target: HTMLElement) {
    if (target.className !== 'submit-button') return
    const year = +this.getInputValue('.date-picker .year')
    const month = +this.getInputValue('.date-picker .month')
    const day = +this.getInputValue('.date-picker .day')

    const historyData: History = {
      type: this.getElementInnerText('.type-picker .selected'),
      date: `${year}-${month}-${day}`,
      content: this.getInputValue('.content-input'),
      amount: +this.getInputValue('.amount-input'),
      paymentId: this.getElementId('.card-picker .selected'),
      categoryId: this.getElementId('.category-picker .selected'),
      isThisMonth: history.state.year === year && history.state.month === month,
    }

    await this.closeModal(false)
    cem.fire('historycreate', { historyData, state: history.state })
  }

  closeHandler(target: HTMLElement) {
    if (target.closest('.close-icon') || !target.closest('.history-form')) {
      this.closeModal(true)
    }
  }

  pickerHandler(
    target: HTMLElement,
    parentSelector: string,
    childSelector: string,
    isScrollIntoView = false
  ): void {
    const indicator = target.closest(childSelector)
    if (!indicator) return

    document
      .querySelector(`${parentSelector} .selected`)
      ?.classList.remove('selected')

    indicator.classList.toggle('selected')

    if (isScrollIntoView) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }

  typeChangeHandler(target: HTMLElement): void {
    const indicator = target.closest('.type-indicator')
    if (!indicator || !(indicator instanceof HTMLElement)) return

    const type = indicator.innerText
    const categoryPicker = document.querySelector('.category-picker')
    categoryPicker.innerHTML = this.createCategorySelector(type)
  }

  async clickEventHandler(e: MouseEvent) {
    e.preventDefault()

    const { target } = e
    if (!(target instanceof HTMLElement)) return

    this.closeHandler(target)
    this.pickerHandler(target, '.type-picker', '.type-indicator')
    this.pickerHandler(target, '.category-picker', '.category-indicator')
    this.pickerHandler(target, '.card-picker', '.card', true)
    this.typeChangeHandler(target)
    this.submissionHandler(target)
  }

  render(): void {
    const contentWrap = document.querySelector('.content-wrap')
    contentWrap.innerHTML += this.createModal()
  }

  createCategorySelector(type: string): string {
    return /*html*/ `${loadHtml(
      this.categories
        .filter((category) => category.type === type)
        .map((category, index) => {
          return /*html*/ `<div class='category-indicator ${
            index === 0 ? 'selected' : ''
          }' id="category-${category.id}">
            ${category.name}
          </div>`
        })
    )}`
  }

  createModal(): string {
    return /*html*/ `
<div class="modal">
  <div class="history-form-wrap">
    <form class="history-form">
      <div class="icon-wrap">
        <i class="icon close-icon">xmark_circle_fill</i>
      </div>
      <div class="type-picker">
        <div class="type-indicator income">income</div>
        <div class="type-indicator expenditure selected">expenditure</div>
      </div>
      <div class="date-picker">
        <input class="year" maxlength="4" value="${this.year}" />.
        <input class="month" maxlength="2" value="${this.month}" />.
        <input class="day" maxlength="2" value="${this.day}" />       
      </div>
      <div class="category-picker">
        ${this.createCategorySelector('expenditure')}         
      </div>
      <div class="card-picker" dir="ltr">
        <div class="card-container">
          ${loadHtml(
            this.payments.map(
              (payment, index) => `
              <div class="card ${getPaymentEnKeyName(payment.name)} ${
                index === 0 ? 'selected' : ''
              }" id="payment-${payment.id}">
                <i class="icon">checkmark_circle_fill</i>
              </div>
            `
            )
          )}
        </div>
      </div>
      <div class="input-wrap">
        <input class="content-input" maxlength="20" placeholder="Label" name="content" />
        <input class="amount-input" maxlength="10" placeholder="Amount" name="amount" />
      </div>
      <div class="submit-button-wrap">
        <input class="submit-button" type="submit" value="Done" disabled />
      </div>
    </form> 
  </div>
</div>
`
  }
}
