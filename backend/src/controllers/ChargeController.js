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
      return ChargeCommon.getChargeByRef(req, trx, req.params.charge_id)
        .then(chge => {
          if (chge) {
            charge = chge
          } else {
            return ChargeCommon.getChargeById(req, trx, req.params.charge_id)
            .then(chge => {
              charge = chge
            })    
          }          
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
  carNosAvailable(req, res) {
    Common.debug(req, 'entryNosAvailable')

    Knex.raw('SELECT car_no FROM generate_series(1, 99) car_no where car_no not in (SELECT e.car_no from entry e inner join charge c on e.charge_id=c.charge_id where c.charge_id=?)', [req.params.charge_id])
      .then(carNos => res.send(carNos.rows))
      .catch(err => {
        Common.error(req, 'carNosAvailable', err)
        res.status(500).send({ error: 'an error has occured getting the car numbers: ' + err })
      })
  },
  
  awards(req, res) {
    Common.debug(req, 'awards')

    let awards

    Knex.transaction(function (trx) {
      return Knex('v_award')
        .select()
        .transacting(trx) 
        .then(awds=>{
          awards = awds
        })
        .then(trx.commit)
        .catch(trx.rollback)
      })
      .then(() => {
        res.send(awards)
      })
      .catch(err => {
        Common.error(req, 'awards', err)
        res.status(500).send({ error: 'an error has occured getting the awards: ' + err })
      })
  },
  distanceAwardResults(req, res) {
    Common.debug(req, 'distanceAwardResults')

    let awards

    Knex.transaction(function (trx) {
      return Knex('v_distanceawardresults')
        .where({charge_id: req.params.charge_id, award_id: req.params.award_id})
        .select()
        .transacting(trx) 
        .then(awds=>{
          awards = awds
        })
        .then(trx.commit)
        .catch(trx.rollback)
      })
      .then(() => {
        res.send(awards)
      })
      .catch(err => {
        Common.error(req, 'distanceAwardResults', err)
        res.status(500).send({ error: 'an error has occured getting the distance award results: ' + err })
      })
  },

  legs(req, res) {
    Common.debug(req, 'legs')

    let legs

    Knex.transaction(function (trx) {
      return Knex('v_leg')
        .where({charge_id: req.params.charge_id})
        .orderBy('is_gauntlet','desc')
        .orderBy('is_tsetse','desc')
        .select()
        .transacting(trx) 
        .then(lgs=>{
          legs = lgs
        })
        .then(trx.commit)
        .catch(trx.rollback)
      })
      .then(() => {
        res.send(legs)
      })
      .catch(err => {
        Common.error(req, 'legs', err)
        res.status(500).send({ error: 'an error has occured getting the legs: ' + err })
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

    const oInsert = {map_scale:12, charge_name: req.body.charge_name, charge_ref: req.body.charge_ref, location: req.body.location, charge_date: req.body.charge_date, start_time: req.body.start_time, end_time: req.body.end_time, m_per_local: req.body.m_per_local, exchange_rate: req.body.exchange_rate, gauntlet_multiplier: req.body.gauntlet_multiplier}

    Knex('charge')
      .insert(oInsert)      
      .returning('charge_id')
      .then(chargeIds => res.send({ charge_id: chargeIds[0].charge_id }))
      .catch(err => {
        Common.error(req, 'create', err)
        res.status(500).send({ error: 'an error has occured creating the charge: ' + err })
      })
  },
  update (req, res) {
    Common.debug(req, 'update')

    const oUpdate = {charge_name: req.body.charge_name, charge_ref: req.body.charge_ref, location: req.body.location, charge_date: req.body.charge_date, start_time: req.body.start_time, end_time: req.body.end_time, m_per_local: req.body.m_per_local, exchange_rate: req.body.exchange_rate, gauntlet_multiplier: req.body.gauntlet_multiplier}

    Knex('charge')
      .update(oUpdate)      
      .where('charge_id', req.params.charge_id)
      .then(() => res.send({ message: 'ok' }))
      .catch(err => {
        Common.error(req, 'update', err)
        res.status(500).send({ error: 'an error has occured updating the charge: ' + err })
      })
  },
  delete (req, res) {
    Common.debug(req, 'delete')

    Knex('charge')
      .delete()      
      .where('charge_id', req.params.charge_id)
      .then(() => res.send({ message: 'ok' }))
      .catch(err => {
        Common.error(req, 'delete', err)
        res.status(500).send({ error: 'an error has occured deleting the charge: ' + err })
      })
  },
  createTsetse (req, res) {
    Common.debug(req, 'createTsetse')

    let charge

    Knex.transaction(function (trx) {
      return ChargeCommon.getChargeById(req, trx, req.params.charge_id)
        .then(chge => {
          charge = chge
          let qry = Knex('charge')
            .where({charge_id: charge.charge_id})
    
          if (!charge.tsetse1_leg_id) {
            qry.update({tsetse1_leg_id: req.body.leg_id})
          } else {
            if (!charge.tsetse2_leg_id) {
              qry.update({tsetse2_leg_id: req.body.leg_id})
            }  
          }
          
          return qry
            .transacting(trx)
        })
        .then(() => {
          return Knex('leg')
            .update({is_tsetse: true})
            .where({leg_id: req.body.leg_id})
            .transacting(trx)
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .then(() => {
      res.send({result:'ok'})
    })
    .catch(err => {
      Common.error(req, 'createTsetse', err)
      res.status(500).send({ error: 'an error has occured creating the tsetse: ' + err })
    })    
  },
  deleteTsetse (req, res) {
    Common.debug(req, 'deleteTsetse')
    
    let charge

    Knex.transaction(function (trx) {
      return ChargeCommon.getChargeById(req, trx, req.params.charge_id)
        .then(chge => {
          charge = chge
          let qry = Knex('charge')
            .where({charge_id: charge.charge_id})
    
          if (charge.tsetse1_leg_id == req.params.leg_id) {
            qry.update({tsetse1_leg_id: null})
          } 
          if (!charge.tsetse2_leg_id == req.params.leg_id) {
            qry.update({tsetse2_leg_id: null})
          }
          
          return qry
            .transacting(trx)
        })
        .then(() => {
          return Knex('leg')
            .update({is_tsetse: false})
            .where({leg_id: req.params.leg_id})
            .transacting(trx)
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .then(() => {
      res.send({result:'ok'})
    })
    .catch(err => {
      Common.error(req, 'deleteTsetse', err)
      res.status(500).send({ error: 'an error has occured deleting the tsetse: ' + err })
    })
  }  
}