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
  create (req, res) {
    Common.debug(req, 'create')

    const oInsert = {charge_name: req.body.charge_name, charge_ref: req.body.charge_ref, location: req.body.location, charge_date: req.body.charge_date, start_time: req.body.start_time, end_time: req.body.end_time, m_per_local: req.body.m_per_local, exchange_rate: req.body.exchange_rate, gauntlet_multiplier: req.body.gauntlet_multiplier}

    Knex('charge')
      .insert(oInsert)      
      .returning('charge_ref')
      .then(chargeRefs => res.send({ charge_ref: chargeRefs[0].charge_ref }))
      .catch(err => {
        Common.error(req, 'create', err)
        res.status(500).send({ error: 'an error has occured creating the charge: ' + err })
      })
  }, 
  delete (req, res) {
    Common.debug(req, 'delete')

    Knex('charge')
      .delete()      
      .where('charge_ref', req.params.charge_ref)
      .then(() => res.send({ message: 'ok' }))
      .catch(err => {
        Common.error(req, 'delete', err)
        res.status(500).send({ error: 'an error has occured deleting the charge: ' + err })
      })
  },  

}