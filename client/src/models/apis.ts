type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'
type Input = Record<string, string | number>
const defaultOptions = (method: Method): RequestInit => ({
  method,
  headers: {
    'Content-Type': 'application/json',
  },
})

const serverUrl = 'http://localhost:3000'

const createQuery = (data: Input): string => {
  return data
    ? '?' +
        Object.keys(data)
          .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
          .join('&')
    : ''
}

const POST = async (url = '', data: Input): Promise<Response> =>
  await fetch(`${serverUrl}${url}`, {
    body: JSON.stringify(data),
    ...defaultOptions('POST'),
  })

const PUT = async (url = '', data: Input): Promise<Response> =>
  await fetch(`${serverUrl}${url}`, {
    body: JSON.stringify(data),
    ...defaultOptions('PUT'),
  })

const GET = async (url = '', data: Input): Promise<Response> =>
  await fetch(`${serverUrl}${url}${createQuery(data)}`, defaultOptions('GET'))

const DELETE = async (url = ''): Promise<Response> =>
  await fetch(`${serverUrl}${url}`, defaultOptions('DELETE'))

export default {
  logIn: async (data: Input) => await POST('/user/login', data),
  signUp: async (data: Input) => await POST('/user', data),
  createHistory: async (data: Input) => await POST('/history', data),
  findHistory: async (data: Input) => await GET('/history', data),
  updateHistory: async (data: Input) => await PUT('/history', data),
  deleteHistory: async (id: number) => await DELETE(`/history/${id}`),
  createPayment: async (data: Input) => await POST('/payment', data),
  findPayment: async (data?: Input) => await GET('/payment', data),
  updatePayment: async (data: Input) => await PUT('/payment', data),
  deletePayment: async (id: number) => await DELETE(`/payment/${id}`),
  findCategory: async (data?: Input) => await GET('/category', data),
}