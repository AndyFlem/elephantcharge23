const Knex = require('../services/db')
const Luxon = require('luxon')
const DateTime = Luxon.DateTime
const Common = require('./CommonDebug')('Entry')
const ChargeCommon = require('./ChargeCommon')

//NOT_PROCESSED
//RAW
//CLEAN
//CHECKINS
//LEGS

module.exports = {
  // =======================
  // READ
  // =======================

  index (req, res) {
    Common.debug(req, 'index')

    Knex('v_entry')
      .where({charge_ref: req.params.charge_ref})
      .select()
      .then(entries => res.send(entries))
      .catch(err => {
        Common.error(req, 'index', err)
        res.status(500).send({ error: 'an error has occured getting the entires: ' + err })
      })
  },
  show (req, res) {
    Common.debug(req, 'show')

    let entry

    Knex.transaction(function (trx) {
      return module.exports.getEntryByCar(req, trx, req.params.charge_ref, req.params.car_no)  
        .then(ent => {
          entry = ent
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .then(() => {
      res.send(entry)
    })
    .catch(err => {
      Common.error(req, 'show', err)
      res.status(500).send({ error: 'An error has occured trying fetch the entry: ' + err })
    })
  },
  showById (req, res) {
    Common.debug(req, 'showById')

    let entry

    Knex.transaction(function (trx) {
      return module.exports.getEntry(req, trx, req.params.entry_id)  
        .then(ent => {
          entry = ent
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .then(() => {
      res.send(entry)
    })
    .catch(err => {
      Common.error(req, 'showById', err)
      res.status(500).send({ error: 'An error has occured trying fetch the entry: ' + err })
    })
  }, 
  entriesForCharge (req, trx, chargeId) {
    Common.debug(req, 'entriesForCharge', 'ChargeId: ' + chargeId )

    return Knex('v_entry')
      .where({charge_id: chargeId})
      .select()
      .transacting(trx)
  },

  legs(req, res) {
    Common.debug(req, 'legs')

    let legs

    Knex.transaction(function (trx) {
      return module.exports.getEntry(req, trx, req.params.entry_id)  
        .then(ent => {
          return module.exports.doGetLegs(req,trx, ent.entry_id)
        })
        .then(lgs => {
          legs=lgs
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .then(() => {
      res.send(legs)
    })
    .catch(err => {
      Common.error(req, 'legs', err)
      res.status(500).send({ error: 'An error has occured trying fetch the legs for the entry: ' + err })
    })
  },
  doGetLegs (req, trx, entryId) {
    Common.debug(req, 'doGetLegs')

    return Knex('v_entry_leg')
      .where({entry_id: entryId})
      .orderBy('leg_no')
      .transacting(trx)
      .select()
  },
  checkins(req, res) {
    Common.debug(req, 'checkins')
    let checkins

    Knex.transaction(function (trx) {
      return module.exports.getEntry(req, trx, req.params.entry_id)  
        .then(ent => {
          return module.exports.doGetCheckins(req,trx, ent.entry_id)
        })
        .then(cks => {
          checkins=cks
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .then(() => {
      res.send(checkins)
    })
    .catch(err => {
      Common.error(req, 'checkins', err)
      res.status(500).send({ error: 'An error has occured trying fetch the checkins for the entry: ' + err })
    })
  },
  doGetCheckins (req, trx, entryId) {
    Common.debug(req, 'doGetCheckins')

    return Knex('v_checkin')
      .where({entry_id: entryId})
      .orderBy('checkin_number')
      .transacting(trx)
      .select()
  },
  getEntry(req, trx, entryId) {
    Common.debug(req, 'getEntry')
    
    return Knex('v_entry')
      .where({entry_id: entryId})
      .select()
      .transacting(trx)
      .then(entries => {
        return entries[0]
      })
  },
  getEntryByCar(req, trx, chargeRef, carNo) {
    Common.debug(req, 'getEntryByCar')
    return Knex('v_entry')
      .where({charge_ref: chargeRef, car_no: carNo})
      .transacting(trx)
      .select()
      .then(entries => {
        return entries[0]
      })
  },
  // =======================
  // WRITE
  // =======================
  update (req, res) {
    Common.debug(req, 'update')

    Knex.transaction(function (trx) {
      Knex('entry')
        .update(req.body.entry)
        .where({entry_id: req.params.entry_id})
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .then(() => {
      res.send({'update': 'ok'})
    })
    .catch(err => {
      Common.error(req, 'update', err)
      res.status(500).send({ error: 'An error has occured trying update the  entry: ' + err })
    })    
  },
  updateDistances (req, res) {
    Common.debug(req, 'updateDistances')

    let entry
    let distances

    Knex.transaction(function (trx) {
      return module.exports.getEntryByCar(req, trx, req.params.charge_ref, req.params.car_no)
        .then(ent => {
          entry = ent
          return module.exports.doUpdateDistances (req, trx, entry.entry_id)
        })
        .then(dists => {
          distances = dists
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .then(() => {
      res.send(distances)
    })
    .catch(err => {
      Common.error(req, 'updateDistances', err)
      res.status(500).send({ error: 'An error has occured trying update the distances for the entry: ' + err })
    })      
  },
  doUpdateDistances (req, trx, entryId) {
    Common.debug(req, 'doUpdateDistances')

    let entry 
    let charge

    let distances={ 
      'TOTAL': 0,
      'GAUNTLET': 0,
      'NON_GAUNTLET': 0,
      'TSETSE_1': 0,
      'TSETSE_2': 0,
      'GAUNTLET_PENALTIES': 0,
      'PENALTIES': 0,
      'GAUNTLET_COMPETITION': 0,
      'TOTAL_COMPETITION': 0,
      'NET': null
    }

    return Knex('entry_distance')
      .where({entry_id: entryId})
      .delete()
      .transacting(trx)
      .then(() =>{
        return module.exports.getEntry(req, trx, entryId)
      })
      .then(ent => {
        entry = ent
        return ChargeCommon.getChargeById(req, trx, entry.charge_id)
      })
      .then(chg => {
        charge = chg
        return module.exports.doGetLegs(req, trx, entryId)
      })
      .then(legs => {
        for (const leg of legs) {
          distances.TOTAL += leg.distance_m
          if (leg.is_gauntlet) {
            distances.GAUNTLET += leg.distance_m
          } else {
            distances.NON_GAUNTLET += leg.distance_m
          }
          if (leg.leg_id == charge.tsetse1_leg_id) {
            distances.TSETSE_1 += leg.distance_m
          }
          if (leg.leg_id == charge.tsetse2_leg_id) {
            distances.TSETSE_2 += leg.distance_m
          }
        }

        distances.GAUNTLET_PENALTIES = entry.dist_penalty_gauntlet
        distances.PENALTIES = entry.dist_penalty_nongauntlet

        distances.GAUNTLET_COMPETITION = charge.gauntlet_multiplier * (distances.GAUNTLET + distances.GAUNTLET_PENALTIES)
        distances.TOTAL_COMPETITION = distances.GAUNTLET_COMPETITION + distances.PENALTIES + distances.NON_GAUNTLET
        
        if (entry.result_status == 'COMPLETE') {
          distances.NET = distances.TOTAL_COMPETITION - (charge.m_per_local * entry.raised_local)
        }

        let distInserts = Object.keys(distances).filter(distKey=>distances[distKey]).map(distKey=>{ 
          return Knex('entry_distance')
            .insert({
              'entry_id': entryId,
              'distance_ref': distKey,
              'distance_m': Math.floor(distances[distKey])
            })
            .transacting(trx)
        })
        return Promise.all(distInserts)
      })
      .then(() => {
        return distances
      })
  },
  clearResult(req, res) {
    Common.debug(req, 'clearResult')

    Knex.transaction(function (trx) {
      return module.exports.doClearResult(req, trx, req.params.entry_id)
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .then(() => {
      res.send({result: 'ok'})
    })
    .catch(err => {
      Common.error(req, 'clearResult', err)
      res.status(500).send({ error: 'An error has occured trying to clear the result for the entry: ' + err })
    })    
  },
  doClearResult(req, trx, entryId) {
    Common.debug(req, 'doClearResult')

    return module.exports.doDeleteDistances(req, trx, entryId)
      .then(() => {
        return module.exports.doDeleteLegs(req, trx, entryId)
      })
      .then(() => {
        return module.exports.doDeleteCheckins(req, trx, entryId)
      })
      .then(() => {
        return module.exports.doCalculateCheckins(req, trx, entryId)
      })
  },
  doDeleteDistances(req, trx, entryId) {
    Common.debug(req, 'doDeleteDistances')

    return Knex('entry_distance')
      .where({entry_id: entryId})
      .delete()
      .transacting(trx)

  },
  doDeleteCheckins(req, trx, entryId) {
    Common.debug(req, 'doDeleteCheckins')

    return Knex('checkin')
      .where({entry_id: entryId})
      .delete()
      .transacting(trx)
      .then(()=>{
        return Knex('entry')
          .update({checkins_calculated: false, checkins_consistent: false})
          .where({entry_id: entryId})
          .transacting(trx)
      })
      .then(() => {
        return Knex('entry')
          .update({processing_status: 'CLEAN'})
          .where({entry_id: entryId})
          .transacting(trx)  
      })        
  }, 
  doDeleteLegs(req, trx, entryId) {
    Common.debug(req, 'doDeleteLegs')

    return Knex('gps_clean')
      .update({entry_leg_id: null})
      .where({entry_id: entryId})
      .transacting(trx)
      .then(() => {
        return Knex('entry_leg')
          .where({entry_id: entryId})
          .delete()
          .transacting(trx)  
      })
      .then(() => {
        return Knex('entry')
          .update({processing_status: 'CHECKINS'})
          .where({entry_id: entryId})
          .transacting(trx)
      })      
  }, 
  calculateCheckins(req,res) {
    Common.debug(req, 'calculateCheckins')

    var checkins
    var entry

    Knex.transaction(function (trx) {
      return module.exports.getEntryByCar(req, trx, req.params.charge_ref, req.params.car_no)
        .then(ent => {
          entry = ent
          return module.exports.doCalculateCheckins(req, trx, entry.entry_id)
        })
        .then(chcks => {
          checkins = chcks
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .then(() => {
      res.send(checkins)
    })
    .catch(err => {
      Common.error(req, 'calculateCheckins', err)
      res.status(500).send({ error: 'An error has occured trying to calculate checkins for the entry: ' + err })
    })    
  },
  //Gets the ordered list of checkins (checkpoint stops) for the entry
  doCalculateCheckins(req, trx, entryId) {
    Common.debug(req, 'doCalculateCheckins')
    let charge
    let entry
    let points

    let startTime
    let endTime

    let checkin
    let checkinNumber = 0
    let checkins = []
    let last_checkpoint_id
    let last_gps_clean_id

    
    return module.exports.getEntry(req,trx,entryId)
      .then(ent=>{
        entry = ent
        return ChargeCommon.getChargeById(req, trx, entry.charge_id)
      })
      .then(chrg=>{
        charge = chrg

        startTime = DateTime.fromISO(charge.charge_date + 'T' + charge.start_time).minus({minutes: 15})
        endTime = DateTime.fromISO(charge.charge_date + 'T' + charge.end_time)
        if (entry.late_finish_min>0) {
          endTime = endTime.plus({minutes: entry.late_finish_min})
        }

        // Get all gps clean points inside a checkpoint radius
        return Knex.raw(`SELECT * FROM ec_points_within_checkpoint(${entryId}, '${startTime.toISO()}', '${endTime.toISO()}') ORDER BY gps_timestamp`)
          .transacting(trx)
      })
      .then(pnts => {
        points = pnts.rows

        //Iterate cthrough the gps points
        points.forEach((point, indx) => {
          //Test to see if the current checkin should be processed:
          //1) Last point in the set
          //2) New checkpoint_id
          //3) Same checkpoint_id but gap of 15 gps points (leave and return)
          if (indx == points.length-1 || last_checkpoint_id != point.checkpoint_id || point.gps_clean_id > (last_gps_clean_id+15)) {
            if (checkin) {
              checkin.points.forEach(v => {
                if (v.distance_m < checkin.distance_m) {
                  checkin.checkin_number = checkinNumber
                  checkin.distance_m = Math.round(v.distance_m)
                  checkin.checkin_timestamp = v.gps_timestamp
                  checkin.gps_clean_id = v.gps_clean_id
                } 
              })
              checkin.points = []
              checkins.push(checkin)
            }
            checkinNumber+=1
            checkin = {
              checkpoint_id: point.checkpoint_id, 
              distance_m: 10000, 
              points: []
            }
          }
          checkin.points.push(point)
          last_checkpoint_id = point.checkpoint_id
          last_gps_clean_id = point.gps_clean_id
        })
        //Persist
        return Promise.all(checkins.map(ck => {
          return Knex('checkin')
            .insert({
              entry_id: entryId, 
              checkpoint_id: ck.checkpoint_id, 
              gps_clean_id: ck.gps_clean_id, 
              checkin_number: ck.checkin_number, 
              checkin_timestamp: ck.checkin_timestamp, 
              distance_m: ck.distance_m
            })
            .transacting(trx)
        }))
      })
      .then(() => {
        return Knex('entry')
          .update({checkins_calculated: true})
          .where({entry_id: entryId})
          .transacting(trx)
      })
      .then(() => {
        return Knex('entry')
          .update({processing_status: 'CHECKINS'})
          .where({entry_id: entryId})
          .transacting(trx)  
      })      
  }
}