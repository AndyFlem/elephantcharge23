const Knex = require('../services/db')
const Luxon = require('luxon')
const DateTime = Luxon.DateTime

const Common = require('./CommonDebug')('Car')

module.exports = {
  // =======================
  // READ
  // =======================
  index (req, res) {
    Common.debug(req, 'index')

    Knex('v_car')      
      .select()
      .then(cars => res.send(cars))
      .catch(err => {
        Common.error(req, 'index', err)
        res.status(500).send({ error: 'an error has occured getting the cars: ' + err })
      })
  }
}