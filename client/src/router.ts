import cem from './utils/custom-event'
import HeaderView from './views/header-view'
import HistoryView from './views/history-view'
import CreateHistoryView from './views/create-history-view'
import CalendarView from './views/calendar-view'
export default class Router {
  constructor() {
    const headerView = new HeaderView()
    const historyView = new HistoryView()
    const createHistoryView = new CreateHistoryView()
    const calendarView = new CalendarView()
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
