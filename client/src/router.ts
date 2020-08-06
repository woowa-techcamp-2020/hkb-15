import cem from './utils/custom-event'
import LoginView from './views/login-view'
import HeaderView from './views/header-view'
import HistoryView from './views/history-view'
import CalendarView from './views/calendar-view'
import AnalyticsView from './views/analytics-view'
import CreateHistoryView from './views/create-history-view'
import PaymentManager from './views/payment-manager'

export default class Router {
  constructor() {
    new HeaderView()
    new HistoryView()
    new CalendarView()
    new AnalyticsView()
    new CreateHistoryView()
    new PaymentManager()
    new LoginView()

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
