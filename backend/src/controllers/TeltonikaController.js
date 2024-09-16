const Knex = require('../services/db')
const TelKnex = require('../services/teltonika_db')
const config = require('../config/config')
const Common = require('./CommonDebug')('Teltonika')

module.exports = {
  indexIMEIs (req, res) {
    Common.debug(req, 'indexIMEIs')

    TelKnex('imei')
      .select()
      .then(rows => {
        res.send( rows)
      })
      .catch(err => {
        Common.error(req, 'indexIMEIs', err)
        res.status(500).send({ error: 'an error has occured getting the list of devices: ' + err })
      })
  },
  indexEntries (req, res) {
    Common.debug(req, 'indexEntries')

    Knex('v_entry')
      .where({charge_id: req.params.charge_id})
      .whereNotNull('imei')
      .select()
      .then(entries => res.send(entries))
      .catch(err => {
        Common.error(req, 'indexEntries', err)
        res.status(500).send({ error: 'an error has occured getting the entires: ' + err })
      })
  },
  recentTrack (req, res) {
    Common.debug(req, 'recentTrack')

    let hours = req.query.hrs || 24

    TelKnex.raw(`SELECT * FROM ec23_recentpositions(?,?)`,[req.params.imei, hours])
      .then(rows => {
        res.send( rows.rows[0])
      })
      .catch(err => {
        Common.error(req, 'recentTrack', err)
        res.status(500).send({ error: 'an error has occured getting the recent track: ' + err })
      })
  },  
  
}