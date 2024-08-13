const Knex = require('../services/db')
const Luxon = require('luxon')
const DateTime = Luxon.DateTime

const Common = require('./CommonDebug')('Charge')

const ChargeCommon = require('./ChargeCommon')
const EntryController = require('./EntryController')

module.exports = {
  // =======================
  // READ
  // =======================
  index (req, res) {
    console.log('index@!!!!!!!!!!!!!!!!')
    Common.debug(req, 'index')

    Knex('v_charge')
      .select()
      .then(charges => res.send(charges))
      .catch(err => {
        Common.error(req, 'index', err)
        res.status(500).send({ error: 'an error has occured getting the charges: ' + err })
      })
  },
  
  show (req, res) {
    Common.debug(req, 'show')

    let charge

    Knex.transaction(function (trx) {
      return ChargeCommon.getChargeByRef(req, trx, req.params.charge_ref)
        .then(chge => {
          charge = chge
        })
        .then(trx.commit)
        .catch(trx.rollback)
      })
      .then(() => {
        res.send(charge)
      })
      .catch(err => {
        Common.error(req, 'index', err)
        res.status(500).send({ error: 'an error has occured getting the charge: ' + err })
      })
  }, 
  checkpoints (req, res) {
    Common.debug(req, 'checkpoints')

    Knex('v_checkpoint')
      .where({charge_ref: req.params.charge_ref})
      .select()
      .then(checkpoints => res.send(checkpoints))
      .catch(err => {
        Common.error(req, 'checkpoints', err)
        res.status(500).send({ error: 'an error has occured getting the checkpoints: ' + err })
      })
  },
  
  

  // =======================
  // WRITE
  // =======================
  updateDistances (req, res) {
    Common.debug(req, 'updateDistances')

    let charge

    Knex.transaction(function (trx) {
      return ChargeCommon.getChargeByRef(req, trx, req.params.charge_ref)
        .then(chge => {
          charge = chge
          return EntryController.entriesForCharge(req, trx, charge.charge_id)
        })      
        .then(entries => {
          return Promise.all(entries.map(entry=>{
            return EntryController.doUpdateDistances(req, trx, entry.entry_id)
          }))
        })
        .then(trx.commit)
        .catch(trx.rollback)
      })
      .then(() => {
        res.send({result:'ok'})
      })
      .catch(err => {
        Common.error(req, 'index', err)
        res.status(500).send({ error: 'an error has occured updating distances for all entries: ' + err })
      })
  }, 


}