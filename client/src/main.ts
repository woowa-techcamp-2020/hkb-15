import 'regenerator-runtime/runtime'
import Model from './models'
import Router from './router'
import HeaderView from './views/header-view'
import HistoryView from './views/history-view'
import cem from './utils/custom-event'

new HeaderView()
new HistoryView()
new Model()
new Router()

cem.fire(
  'statechange',
  history.state ?? {
    path: '/',
    year: 2020,
    month: 7,
  }
)
