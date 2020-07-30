export default {
  fire: function (type: string, data?: unknown): void {
    document.dispatchEvent(
      new CustomEvent(type, {
        detail: data,
      })
    )
  },
  subscribe: function (
    type: string,
    listener: EventListenerOrEventListenerObject
  ): void {
    document.addEventListener(type, listener)
  },
}
