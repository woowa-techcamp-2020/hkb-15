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
      <button class="github-sign-in-button" onclick="location.href='http://localhost:3000/auth/github'">
        <i class="icon">logo_github</i>
        Sign In With Github
      </button>
    `
  }

  setAttributes(): void {}
}
