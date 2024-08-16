const debug = require('debug')('mp-api:route')
const config = require('./config/config')

const ChargeController = require('./controllers/ChargeController')
const EntryController = require('./controllers/EntryController')
const TeamController = require('./controllers/TeamController')
const CarController = require('./controllers/CarController')
const SponsorController = require('./controllers/SponsorController')

module.exports = (app) => {
  const prefix = '/api/' + config.api_version

  app.get(prefix + '/charges', ChargeController.index)
  app.get(prefix + '/charge/:charge_ref', ChargeController.show)
  app.get(prefix + '/charge/:charge_ref/update_distances', ChargeController.updateDistances)
  app.get(prefix + '/charge/:charge_ref/checkpoints', ChargeController.checkpoints)
  app.post(prefix + '/charge', ChargeController.create)
  app.delete(prefix + '/charge/:charge_ref', ChargeController.delete) 

  app.get(prefix + '/charge/:charge_ref/entries', EntryController.index)
  app.get(prefix + '/charge/:charge_ref/entry/:car_no', EntryController.show)
  app.get(prefix + '/entry/:entry_id', EntryController.showById)
  app.put(prefix + '/entry/:entry_id', EntryController.update)
  app.put(prefix + '/entry/:entry_id/clear_result', EntryController.clearResult)
  app.get(prefix + '/entry/:entry_id/legs', EntryController.legs)
  app.get(prefix + '/entry/:entry_id/checkins', EntryController.checkins)

  app.get(prefix + '/charge/:charge_ref/entry/:car_no/update_distances', EntryController.updateDistances)
  app.get(prefix + '/charge/:charge_ref/entry/:car_no/calculate_checkins', EntryController.calculateCheckins)

  app.get(prefix + '/teams', TeamController.index)
  app.get(prefix + '/team/:team_id', TeamController.show)
  app.post(prefix + '/team', TeamController.create)
  app.put(prefix + '/team/:team_id', TeamController.update)
  app.delete(prefix + '/team/:team_id', TeamController.delete) 

  app.get(prefix + '/cars', CarController.index)
  app.get(prefix + '/makes', CarController.indexMakes)
  app.get(prefix + '/car/:car_id', CarController.show)
  app.post(prefix + '/car', CarController.create)
  app.put(prefix + '/car/:car_id', CarController.update)
  app.delete(prefix + '/car/:car_id', CarController.delete)

  app.get(prefix + '/sponsors', SponsorController.index)
  app.get(prefix + '/sponsor/:sponsor_id', SponsorController.show)
  app.post(prefix + '/sponsor', SponsorController.create)
  app.put(prefix + '/sponsor/:sponsor_id', SponsorController.update)
  app.delete(prefix + '/sponsor/:sponsor_id', SponsorController.delete)  
}