import cem from './utils/custom-event'

export default class Router {
  constructor() {
    window.addEventListener('popstate', (event) => {
      if (event.state === null) return
      cem.fire('statepop', event.state)
    })
    cem.subscribe('statechange', (event: CustomEvent) =>
      this.stateChangeHandler({ state: event.detail })
    )
  }
  stateChangeHandler(event?: Record<'state', Record<string, string | number>>) {
    history.pushState(event.state, '', event.state.path as string)
  }
}
