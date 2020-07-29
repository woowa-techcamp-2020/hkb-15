export default {
  fire: function (type, data) {
    document.dispatchEvent(
      new CustomEvent(type, {
        detail: data,
      })
    )
  },
  subscribe: function (type, listener) {
    document.addEventListener(type, listener)
  },
}
