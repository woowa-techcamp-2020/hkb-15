import './style.scss'
import cem from 'src/utils/custom-event'
import apis from 'src/models/apis'
import { Payment } from 'src/types'
import { dommer, loadHtml, getPaymentEnKeyName } from 'src/utils/helper'

export default class PaymentManager {
  private paymentManagerElm: HTMLElement

  constructor() {
    cem.subscribe('activatepaymentsmanager', this.load.bind(this))
  }

  private setDom(payments: Payment[]) {
    this.paymentManagerElm = dommer(`
<div class="payment-manager">
  <div class="header">
    <h1 class="title">Manage your payments</h1>
    <button class="add-payment-method-btn">
      <i class="icon">plus_circle_fill</i>
      Add Payment Method
    </button>
  </div>
  <div class="cards-container">
    ${loadHtml(
      payments.map(
        (payment, i) =>
          `<div class="card-wrapper">
            <div class="actions-container">
              <button class="action delete"></button>
            </div>
            <div class="card ${getPaymentEnKeyName(
              payment.name
            )}" data-card-id="${payment.id}" style="transition-delay: ${
            i * 0.05
          }s;"></div></div>`
      )
    )}
  </div>
</div>
`).firstElementChild as HTMLElement

    document.body.appendChild(this.paymentManagerElm)

    this.paymentManagerElm.getBoundingClientRect()

    this.paymentManagerElm.classList.add('loaded')

    this.paymentManagerElm.addEventListener('click', async (e) => {
      const { target } = e

      if (!(target instanceof HTMLElement)) {
        return
      }

      if (target.closest('.add-payment-method-btn')) {
      } else if (target.closest('.action.delete')) {
        const cardId = parseInt(
          target
            .closest('.card-wrapper')
            .querySelector('.card')
            .getAttribute('data-card-id')
        )

        await apis.deletePayment(cardId)

        const cardWrapper = target.closest<HTMLElement>('.card-wrapper')

        // Animation
        cardWrapper.style.transition = 'all 300ms ease'
        cardWrapper.style.height = `${cardWrapper.clientHeight}px`
        cardWrapper.getBoundingClientRect()
        cardWrapper.style.height = '0px'
        cardWrapper.style.margin = '0px'
        cardWrapper.style.transform = 'translateX(150%)'

        cardWrapper.addEventListener('transitionend', () => {
          cardWrapper.remove()
        })
      } else {
        this.unload()
      }
    })
  }

  async load() {
    const res = await apis.findPayment()
    const payments = (await res.json()) as Payment[]

    this.setDom(payments)
  }

  async unload() {
    this.paymentManagerElm.addEventListener('transitionend', () => {
      this.paymentManagerElm.remove()
    })
    this.paymentManagerElm.classList.remove('loaded')
  }
}
