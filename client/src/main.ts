type Content = Record<string, string | number | string[]>

// Util
function getPath(): string {
  return location.pathname
}

function setInsetStyle(pathName: string): void {
  const styleName = 'button-inset'
  document.querySelector(`.${styleName}`)?.classList.remove(styleName)

  const node = document.querySelector(`nav li>a[href='${pathName}'`)
  node.closest('li').classList.toggle(styleName)
}

function getCurrentPath(e: Event, listNode: Element): string {
  if ((<Element>e.target).nodeName === 'A') e.preventDefault()
  const path = listNode.querySelector('a').getAttribute('href')
  return path
}

async function getInitData(): Promise<Content> {
  const res = await fetch('/api/content.json')
  return res.json()
}

async function getStates(path: string): Promise<Content> {
  switch (path) {
    case '/':
      return Promise.resolve({})
    case '/login':
      return await getInitData()
    case '/calendar':
      return await getInitData()
    case '/analytics':
      return await getInitData()
    default:
      break
  }
}

// render
function render(renderTarget: Element, sHTML: string) {
  renderTarget.innerHTML = sHTML
}

// Push State
function onLink(): void {
  document
    .querySelector('nav ul')
    .addEventListener('click', async (e: Event) => {
      const listNode = (<Element>e.target).closest('li')
      if (!listNode) return

      const path = getCurrentPath(e, listNode)
      const state = await getStates(path)

      //push state
      history.pushState(state, '', path)

      //render page
      popStateHandler({ state })
    })
}

function popStateHandler(data?: Record<'state', Content>) {
  const renderTargetWrap = document.querySelector('.content-wrap')
  const targetView = getPath()

  const contentViewHTML = viewMap[targetView](data?.state.content)
  render(renderTargetWrap, contentViewHTML)

  setInsetStyle(targetView)
}

// Pop State
function onRouter() {
  window.addEventListener('popstate', popStateHandler)
}

// View
const viewMap = {
  '/'() {
    return `<h2>안녕하세요 코드스쿼드에 오셨네요!</h2>`
  },
  '/content'(data: Content) {
    if (!data) return
    return Object.values(data).reduce((prev: Content, next: Content) => {
      return (
        prev +
        `<li> 
            <h3>${next.name}</h3>
            <div>${next.body}</div>
        </li>`
      )
    }, ``)
  },
  '/profile'(data: Content) {
    return `<h2>코드스쿼드는 SW를 찐하게 배우는 공간입니다</h2>`
  },
}

// Initialize
;(function () {
  onLink()
  onRouter()
  popStateHandler()
})()
