import { View, History } from '../../types'
import { getNumber } from '../../utils/helper'
import cem from '../../utils/custom-event'

import './styles'

export default class CreateHistoryView implements View {
  constructor() {
    cem.subscribe('createhistorymodal', (e: CustomEvent) => this.render(e))

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
    length: number
  ) {
    const value = +target.value

    if (value < +min || !value) target.value = min
    else if (value > +max) target.value = max
    else if (target.value.length !== length) target.value = '0' + target.value
  }

  focusoutEventHandler(e: FocusEvent) {
    const { target } = e
    if (!(target instanceof HTMLInputElement)) return

    if (target.closest('.date-picker')) {
      switch (target.className) {
        case 'year':
          this.dateValidator(target, '2000', '2030', 4)
          break
        case 'month':
          this.dateValidator(target, '01', '12', 2)
          break
        case 'day':
          this.dateValidator(target, '01', '31', 2)
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

  async clickEventHandler(e: MouseEvent) {
    e.preventDefault()

    const { target } = e
    if (!(target instanceof HTMLElement)) return

    this.closeHandler(target)
    this.pickerHandler(target, '.type-picker', '.type-indicator')
    this.pickerHandler(target, '.category-picker', '.category-indicator')
    this.pickerHandler(target, '.card-picker', '.card', true)
    this.submissionHandler(target)
  }

  render(e: Event): void {
    const contentWrap = document.querySelector('.content-wrap')
    contentWrap.innerHTML += this.createModal()
  }

  createModal(): string {
    return `
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
        <input class="year" type="text" maxlength="4" value="2020"></input>.
        <input class="month" type="text" maxlength="2" value="06"></input>.
        <input class="day" type="text" maxlength="2" value="20"></input>          
      </div>
      <div class="category-picker">
        <div class="category-indicator selected" id="category-1">Food</div>
        <div class="category-indicator" id="category-2">Medical</div>
        <div class="category-indicator" id="category-3">Transport</div>
        <div class="category-indicator" id="category-4">Culture</div>
        <div class="category-indicator" id="category-5">Beauty</div>
      </div>
      <div class="card-picker" dir="ltr">
        <div class="card-container">
          <div class="card hyundai selected" id="type-1">
            <i class="icon">checkmark_circle_fill</i>
          </div>
          <div class="card lotte" id="type-2">
            <i class="icon">checkmark_circle_fill</i>
          </div>
          <div class="card kakao" id="type-3">
            <i class="icon">checkmark_circle_fill</i>
          </div>
          <div class="card shinhan" id="type-4">
            <i class="icon">checkmark_circle_fill</i>
          </div>
        </div>
      </div>
      <div class="input-wrap">
        <input class="content-input" type="text" maxlength="20" placeholder="Label" name="content"></input>
        <input class="amount-input" type="text" maxlength="10" placeholder="Amount" name="amount"></input>
      </div>
      <div class="submit-button-wrap">
        <input class="submit-button" type="submit" value="Done" disabled></input>
      </div>
    </form> 
  </div>
</div>
`
  }
}
