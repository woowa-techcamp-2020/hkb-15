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

const dayStr = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

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
