import axios from 'axios'

export default {
  install: (app, options) => {
    const axiosPlain = axios.create({
      baseURL: options.baseUrl,
      withCredentials: false,
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' }
    })
    
    axiosPlain.interceptors.request.use(request => {
      console.log('Axios request: ' + request.method + ':' + request.url)
      return request
    })  

    app.provide('axiosPlain', axiosPlain)
  }
}