import cem from './utils/custom-event'

export default class Router {
  defaultState = {
    year: 2020,
    month: 7,
    path: '/',
  }
  constructor() {
    window.addEventListener('popstate', (event) => {
      cem.fire('popstate', event.state)
      this.stateChangeHandler(event)
    })
    cem.subscribe('statechange', (event: CustomEvent) =>
      this.stateChangeHandler({ state: event.detail })
    )
    this.stateChangeHandler({ state: history.state ?? this.defaultState })
  }
  stateChangeHandler(event?: Record<'state', Record<string, string | number>>) {
    const { path, year, month } = event.state
    switch (path) {
      default:
        cem.fire('initstore', event.state)
    }
  }
}
