import { View } from '../../types'
import cem from '../../utils/custom-event'
import './styles'

export default class LoginView implements View {
  constructor() {
    cem.subscribe('login', this.render)
  }

  render(): void {
    const contentWrap = document.querySelector('.content-wrap')
    contentWrap.innerHTML = /*html*/ `
      <button class="github-sign-in-button">
        <i class="icon">logo_github</i>
        Log In with Github
      </button>
    `
  }

  setAttributes(): void {}
}
