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
  },
  indexMakes (req, res) {
    Common.debug(req, 'indexMakes')

    Knex('make')      
      .select()
      .then(makes => res.send(makes))
      .catch(err => {
        Common.error(req, 'indexMakes', err)
        res.status(500).send({ error: 'an error has occured getting the makes: ' + err })
      })
  },
  show (req, res) {
    Common.debug(req, 'show')

    Knex('v_car')
      .where('car_id', req.params.car_id)      
      .select()
      .then(cars => res.send(cars[0]))
      .catch(err => {
        Common.error(req, 'show', err)
        res.status(500).send({ error: 'an error has occured getting the car: ' + err })
      })
  },
  update (req, res) {
    Common.debug(req, 'update')

    const oUpdate = {car_name: req.body.car_name, make_id: req.body.make_id, model: req.body.model, year: req.body.year, colour: req.body.colour, registration: req.body.registration}

    Knex('car')
      .update(oUpdate)      
      .where('car_id', req.params.car_id)
      .then(() => res.send({ message: 'ok' }))
      .catch(err => {
        Common.error(req, 'update', err)
        res.status(500).send({ error: 'an error has occured updating the car: ' + err })
      })
  },
  create (req, res) {
    Common.debug(req, 'create')

    const oInsert = {car_name: req.body.car_name, make_id: req.body.make_id, model: req.body.model, year: req.body.year, colour: req.body.colour, registration: req.body.registration}

    Knex('car')
      .insert(oInsert)      
      .returning('car_id')
      .then(carIds => res.send({ car_id: carIds[0].car_id }))
      .catch(err => {
        Common.error(req, 'create', err)
        res.status(500).send({ error: 'an error has occured creating the car: ' + err })
      })
  },
  delete (req, res) {
    Common.debug(req, 'delete')

    Knex('car')
      .delete()      
      .where('car_id', req.params.car_id)
      .then(() => res.send({ message: 'ok' }))
      .catch(err => {
        Common.error(req, 'delete', err)
        res.status(500).send({ error: 'an error has occured deleting the car: ' + err })
      })
  },  
}