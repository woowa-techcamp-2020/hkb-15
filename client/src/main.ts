import 'regenerator-runtime/runtime'
import Model from './models'
import Router from './router'

import cem from './utils/custom-event'

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
