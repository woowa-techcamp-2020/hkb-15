export function numberWithCommas(x: number): string {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function groupBy(objArr: {}[], key: string): object {
  return objArr.reduce((a, b) => {
    a[b[key]] = a[b[key]] ?? []
    a[b[key]].push(b)
    return a
  }, {})
}

export const monthStr = [
  '',
  'Jan',
  'Feb',
  'March',
  'April',
  'May',
  'June',
  'July',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
]

export const dayStr = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

export function dateWithDay(dateStr: string): string {
  const dateObj = new Date(dateStr)
  const day = dateObj.getDay()
  const date = dateObj.getDate()
  let dateExtension = 'th'
  if (date == 1) dateExtension = 'st'
  else if (date == 2) dateExtension = 'st'
  else if (date == 3) dateExtension = 'rd'
  return `${dayStr[day]}, ${date}${dateExtension}`
}

export const dommer = (markup: TemplateStringsArray | string) => {
  const frag = document.createDocumentFragment()

  const markupStr =
    typeof markup === 'string' ? markup : Array.isArray(markup) ? markup[0] : ''

  let travelNode = new DOMParser().parseFromString(markupStr, 'text/html').body
    .firstElementChild

  while (travelNode) {
    frag.appendChild(travelNode)

    travelNode = travelNode.nextElementSibling
  }

  return frag
}

const getChildHtml = (child: string | string[]): string => {
  if (!child) return ''
  if (Array.isArray(child)) {
    return `${child.reduce((a, b) => a + getChildHtml(b), '')}`
  } else return child
}

export const loadHtml = getChildHtml

export const Container = ({
  className = 'default',
  child = undefined,
  id = undefined,
}) => {
  return `
<div class='${className}' ${id ? `id= ${id}` : ''}>
 ${getChildHtml(child)}
</div>
`
}

export const sum = <T>(objArr: object[], prop: string, initialValue: T): T => {
  return objArr.reduce((sum, item) => sum + item[prop], initialValue)
}
