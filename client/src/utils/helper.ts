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
