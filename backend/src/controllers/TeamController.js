const Knex = require('../services/db')
const Luxon = require('luxon')
const DateTime = Luxon.DateTime

const Common = require('./CommonDebug')('Team')

module.exports = {
  // =======================
  // READ
  // =======================
  index (req, res) {
    Common.debug(req, 'index')

    Knex('v_team')
      .select()
      .then(teams => res.send(teams))
      .catch(err => {
        Common.error(req, 'index', err)
        res.status(500).send({ error: 'an error has occured getting the teams: ' + err })
      })
  },
  show (req, res) {
    Common.debug(req, 'show')

    Knex('v_team')
      .where('team_id', req.params.team_id)      
      .select()
      .then(teams => res.send(teams[0]))
      .catch(err => {
        Common.error(req, 'show', err)
        res.status(500).send({ error: 'an error has occured getting the team: ' + err })
      })
  },  
  update (req, res) {
    Common.debug(req, 'update')

    const oUpdate = {team_name: req.body.team_name, team_ref: req.body.team_ref, captain: req.body.captain, website: req.body.website, email: req.body.email}

    Knex('team')
      .update(oUpdate)      
      .where('team_id', req.params.team_id)
      .then(() => res.send({ message: 'ok' }))
      .catch(err => {
        Common.error(req, 'update', err)
        res.status(500).send({ error: 'an error has occured updating the team: ' + err })
      })
  },
  create (req, res) {
    Common.debug(req, 'create')

    const oInsert = {team_name: req.body.team_name, team_ref: req.body.team_ref, captain: req.body.captain, website: req.body.website, email: req.body.email}

    Knex('team')
      .insert(oInsert)      
      .returning('team_id')
      .then(teamIds => res.send({ team_id: teamIds[0].team_id }))
      .catch(err => {
        Common.error(req, 'create', err)
        res.status(500).send({ error: 'an error has occured creating the team: ' + err })
      })
  },
  delete (req, res) {
    Common.debug(req, 'delete')

    Knex('team')
      .delete()      
      .where('team_id', req.params.team_id)
      .then(() => res.send({ message: 'ok' }))
      .catch(err => {
        Common.error(req, 'delete', err)
        res.status(500).send({ error: 'an error has occured deleting the team: ' + err })
      })
  }  
}