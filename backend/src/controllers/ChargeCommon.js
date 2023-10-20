const Knex = require('../services/db')
const Luxon = require('luxon')
const DateTime = Luxon.DateTime

const Common = require('./CommonDebug')('ChargeCommon')

module.exports = {
  // =======================
  // READ
  // =======================
  getChargeByRef(req, trx, chargeRef) {
    Common.debug(req, 'getChargeByRef')
    
    return Knex('v_charge')
      .where({charge_ref: chargeRef})
      .select()
      .transacting(trx)
      .then(charges => {
        if (charges.length !== 1) { throw new Error('Charge not found.')  }
        return charges[0]
      })
  },  
  getChargeById(req, trx, chargeId) {
    Common.debug(req, 'getChargeById')
    
    return Knex('v_charge')
      .where({charge_id: chargeId})
      .select()
      .transacting(trx)
      .then(charges => {
        if (charges.length !== 1) { throw new Error('Charge not found.')  }
        return charges[0]
      })
  }   
}