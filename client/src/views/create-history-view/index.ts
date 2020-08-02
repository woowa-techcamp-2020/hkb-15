import { View } from '../../types'
import cem from '../../utils/custom-event'

import './styles'

export default class CreateHistoryView implements View {
  constructor() {
    cem.subscribe('createhistorymodal', (e: CustomEvent) => this.render(e))
    const contentWrap = document.querySelector('.content-wrap')
    contentWrap.addEventListener('click', (e: MouseEvent) =>
      this.clickEventHandler(e)
    )
    contentWrap.addEventListener('keydown', (e: KeyboardEvent) => {
      this.keydownEventHandler(e)
    })
    contentWrap.addEventListener('focusout', (e: FocusEvent) => {
      this.focusoutHandler(e)
    })
  }

  focusoutHandler(e: FocusEvent) {
    const { target } = e
    if (!(target instanceof HTMLInputElement)) return

    if (target.closest('.date-picker')) {
      const value = parseInt(target.value)
      switch (target.className) {
        case 'year':
          if (value < 2010) target.value = '2010'
          else if (value > 2020) target.value = '2020'
          break
        case 'month':
          if (value < 1) target.value = '01'
          else if (value > 12) target.value = '12'
          else if (target.value.length === 1) target.value = '0' + target.value
          break

        case 'day':
          if (value < 1) target.value = '01'
          else if (value > 31) target.value = '31'
          else if (target.value.length === 1) target.value = '0' + target.value
          break
      }
    }
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

  keydownEventHandler(e: KeyboardEvent): void {
    const { target } = e
    if (!(target instanceof HTMLElement)) return

    if (target.closest('.date-picker')) {
      if (!this.numberKeyValidator(e)) {
        e.preventDefault()
      }
    }
  }
  clickEventHandler(e: MouseEvent) {
    e.preventDefault()

    const { target } = e
    if (!(target instanceof HTMLElement)) return

    if (target.closest('.close-icon') || !target.closest('.history-form')) {
      const modal = document.querySelector('.modal')
      if (!modal) return
      e.stopImmediatePropagation()
      modal.classList.toggle('remove')

      Promise.all(
        modal.getAnimations().map((animation) => animation.finished)
      ).then(() => modal.remove())
    }

    const typeIndicator = target.closest('.type-indicator')
    if (typeIndicator) {
      const styleName = 'selected'
      document
        .querySelector(`.type-picker .${styleName}`)
        ?.classList.remove(styleName)

      typeIndicator.classList.toggle(styleName)
    }

    const categoryIndicator = target.closest('.category-indicator')
    if (categoryIndicator) {
      const styleName = 'selected'
      document
        .querySelector(`.category-picker .${styleName}`)
        ?.classList.remove(styleName)

      categoryIndicator.classList.toggle(styleName)
    }

    const card = target.closest('.card')
    if (card) {
      const pickIcon = document.querySelector(`.card-picker .icon`)
      target.appendChild(pickIcon)
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
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
        <div class="type-indicator income"></div>
        <div class="type-indicator expenditure selected"></div>
      </div>
      
      <div class="date-picker">
        <input class="year" type="text" maxlength="4" value="2020"></input>.
        <input class="month" type="text" maxlength="2" value="06"></input>.
        <input class="day" type="text" maxlength="2" value="20"></input>          
      </div>
      <div class="category-picker">
        <div class="category-indicator selected">Food</div>
        <div class="category-indicator">Medical</div>
        <div class="category-indicator">Transport</div>
        <div class="category-indicator">Culture</div>
        <div class="category-indicator">Beauty</div>
      </div>

      <div class="card-picker" dir="ltr">
        <div class="card-container">
          <div class="card hyundai">
            <i class="icon">checkmark_circle_fill</i>
          </div>
          <div class="card lotte"></div>
          <div class="card kakao"></div>
          <div class="card shinhan"></div>
        </div>
      </div>

      <div class="input-wrap">
        <input class="content-input" type="text" placeholder="Label" name="content"></input>
        <input class="amount-input" type="text" placeholder="Amount" name="amount"></input>
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
