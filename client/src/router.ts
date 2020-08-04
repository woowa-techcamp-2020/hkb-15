import cem from './utils/custom-event'
import HeaderView from './views/header-view'
import HistoryView from './views/history-view'
import CreateHistoryView from './views/create-history-view'
import CalendarView from './views/calendar-view'
import PaymentManager from './views/payment-manager'

export default class Router {
  constructor() {
    new HeaderView()
    new HistoryView()
    new CreateHistoryView()
    new CalendarView()
    new PaymentManager()

    window.addEventListener('popstate', (event) => {
      if (event.state === null) return
      cem.fire('statepop', event.state)
    })

    cem.subscribe('statechange', (event: CustomEvent) =>
      this.stateChangeHandler({ state: event.detail })
    )
  }

  stateChangeHandler(event?: Record<'state', Record<string, string | number>>) {
    if (event.state.isReplace) {
      delete event.state.isReplace
      history.replaceState(event.state, '', event.state.path as string)
    } else {
      history.pushState(event.state, '', event.state.path as string)
    }
  }
}
