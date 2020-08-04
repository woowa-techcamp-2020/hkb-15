import './style.scss'
import cem from 'src/utils/custom-event'
import apis from 'src/models/apis'
import { Payment } from 'src/types'
import { dommer, loadHtml, getPaymentEnKeyName, html } from 'src/utils/helper'

const creatingCardPlacholder = 'Enter your payment name'

export default class PaymentManager {
  private paymentManagerElm: HTMLElement
  private state: 'unloaded' | 'loaded' | 'addingPaymentMethod'

  constructor() {
    cem.subscribe('activatepaymentsmanager', this.load.bind(this))
  }

  private setDom(payments: Payment[]) {
    this.paymentManagerElm = dommer(html`
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
                html`<div class="card-wrapper">
                  <div class="actions-container">
                    <button class="action delete"></button>
                  </div>
                  <div
                    class="card ${getPaymentEnKeyName(payment.name)}"
                    data-card-id="${payment.id}"
                    style="transition-delay: ${i * 0.05}s;"
                  >
                    <span class="name">${payment.name}</span>
                  </div>
                </div>`
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
        // Click "Add Payment method" button
        this.addPaymentMethod()
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
        if (
          !target.closest('.payment-manager .header') &&
          !target.closest('.payment-manager .card-wrapper') &&
          !target.closest('.payment-manager .card')
        ) {
          this.unload()
        }
      }
    })
  }

  async load() {
    const res = await apis.findPayment()
    const payments = (await res.json()) as Payment[]

    this.setDom(payments.sort((a, b) => b.id - a.id))
    this.state = 'loaded'
  }

  async unload() {
    this.paymentManagerElm.addEventListener('transitionend', () => {
      this.paymentManagerElm.remove()
    })

    this.paymentManagerElm.classList.remove('loaded')

    this.state = 'unloaded'
  }

  async addPaymentMethod() {
    if (this.state === 'addingPaymentMethod') {
      return
    }

    this.state = 'addingPaymentMethod'

    const creatingCardElm = dommer(html`
      <div class="card-wrapper creating">
        <div class="actions-container">
          <button class="action delete"></button>
        </div>
        <div class="card">
          <span class="name" contenteditable>${creatingCardPlacholder}</span>
        </div>
      </div>
    `).firstElementChild as HTMLElement

    creatingCardElm.style.transition = `all 300ms ease`
    creatingCardElm.style.height = `0px`
    creatingCardElm.style.marginTop = `0px`
    creatingCardElm.style.marginBottom = `0px`
    creatingCardElm.style.opacity = `0`

    this.paymentManagerElm
      .querySelector('.cards-container')
      .prepend(creatingCardElm)

    this.paymentManagerElm.scrollTo(0, 0)

    creatingCardElm.getBoundingClientRect()

    creatingCardElm.style.margin = ''
    creatingCardElm.style.height =
      creatingCardElm.querySelector<HTMLElement>('.card').clientHeight + 'px'
    creatingCardElm.style.opacity = `1`

    let tec: () => void

    creatingCardElm.addEventListener(
      'transitionend',
      (tec = () => {
        creatingCardElm.removeEventListener('transitionend', tec)

        creatingCardElm.removeAttribute('style')

        const cardNameInputElm = creatingCardElm.querySelector<HTMLElement>(
          '.name'
        )

        cardNameInputElm.focus()

        const sel = window.getSelection()
        const range = document.createRange()
        range.setStartBefore(cardNameInputElm.firstChild)
        range.setEndAfter(cardNameInputElm.firstChild)

        sel.removeAllRanges()
        sel.addRange(range)

        cardNameInputElm.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            cardNameInputElm.blur()
            return
          } else if (e.key === 'Escape') {
            creatingCardElm.remove()
          } else {
            setTimeout(() => {
              creatingCardElm.querySelector(
                '.card'
              ).className = `card ${getPaymentEnKeyName(
                cardNameInputElm.textContent
              )}`
            }, 0)
          }
        })

        cardNameInputElm.addEventListener('blur', async () => {
          this.state = 'loaded'

          // Get trimmed card name
          const cardName = cardNameInputElm.textContent.trim()

          // If the card name is empty, remove the element
          if (cardName.length === 0 || cardName === creatingCardPlacholder) {
            creatingCardElm.remove()
          } else {
            cardNameInputElm.removeAttribute('contenteditable')

            const res = await apis.createPayment({
              name: cardName,
            })

            const data = await res.json()

            creatingCardElm.classList.remove('creating')
            creatingCardElm
              .querySelector('.card')
              .setAttribute('data-card-id', data.id)
          }
        })
      })
    )
  }
}
