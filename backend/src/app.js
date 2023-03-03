const config = require('./config/config')
const debug = require('debug')('ec23:app')
process.env.NODE_ENV = config.development_mode ? 'development' : 'production'

const express = require('express')
const app = express()

const http = require('http').Server(app)
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')

const corsOptions = {
  origin: config.cors_origin,
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

debug('Starting ec23 api server.')

app.set('trust proxy', true)
app.use(bodyParser.json())
app.use(cors(corsOptions))
app.options('*', cors())

app.use('/static', express.static(path.join(__dirname, '/../static')))

app.use((req, res, next) => {
  if (req.query.source) {
    req.source = req.query.source
    delete req.query.source
  }
  if (req.body.source) {
    req.source = req.body.source
    delete req.body.source
  }
  debug(`${req.method}: ${req.source}.vue, ${req.baseUrl + req.path} ${JSON.stringify(req.query)} ${JSON.stringify(req.body)}`)

  next()
})

require('./routes')(app)

http.listen(config.port)

debug(`EC23 api server started on ${config.port}. Development mode: ${config.development_mode}`)
