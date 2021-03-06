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

export function addLeadingZeros(number: number, length: number) {
  let s = number.toString()
  while (s.length < length) s = '0' + s
  return s
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

export const getNumber = (str: string) =>
  str ? Number(str.replace(/[^0-9]/g, '')) : undefined

export const getPaymentEnKeyName = (paymentName: string) => {
  const pName = paymentName.toLowerCase()

  if (pName.includes('카카오') || pName.includes('kakao')) {
    return 'kakao'
  } else if (pName.includes('신한') || pName.includes('shinhan')) {
    return 'shinhan'
  } else if (pName.includes('삼성') || pName.includes('samsung')) {
    return 'samsung'
  } else if (pName.includes('롯데') || pName.includes('lotte')) {
    return 'lotte'
  } else if (pName.includes('우리') || pName.includes('woori')) {
    return 'woori'
  } else if (pName.includes('현금') || pName.includes('cash')) {
    return 'cash'
  } else if (pName.includes('현대') || pName.includes('hyundai')) {
    return 'hyundai'
  } else if (pName.includes('비씨') || pName.includes('bc')) {
    return 'bc'
  } else {
    return ''
  }
}

const lit = (s: TemplateStringsArray, ...args: unknown[]) =>
  s.map((ss, i) => `${ss}${args[i] || ''}`).join('')

export const html = lit
