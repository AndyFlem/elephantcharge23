const debug = require('debug')('mp-api:route')
const config = require('./config/config')

const ChargeController = require('./controllers/ChargeController')
const EntryController = require('./controllers/EntryController')
const TeamController = require('./controllers/TeamController')
const CarController = require('./controllers/CarController')
const SponsorController = require('./controllers/SponsorController')
const GeotabController = require('./controllers/GeotabController')
const CheckpointController = require('./controllers/CheckpointController')
const TeltonikaController = require('./controllers/TeltonikaController')

module.exports = (app) => {
  const prefix = '/api/' + config.api_version

  app.get(prefix + '/charges', ChargeController.index)
  app.get(prefix + '/charge/:charge_id', ChargeController.show)
  app.get(prefix + '/charge/:charge_id/legs', ChargeController.legs)
  app.post(prefix + '/charge', ChargeController.create)
  app.put(prefix + '/charge/:charge_id', ChargeController.update)
  app.delete(prefix + '/charge/:charge_id', ChargeController.delete) 
  app.post(prefix + '/charge/:charge_id/checkpointsFromKML', CheckpointController.createFromKML)
  app.post(prefix + '/charge/:charge_id/tsetse', ChargeController.createTsetse)
  app.delete(prefix + '/charge/:charge_id/tsetse/:leg_id', ChargeController.deleteTsetse)

  app.get(prefix + '/charge/:charge_id/carNosAvailable', ChargeController.carNosAvailable)
  app.get(prefix + '/charge/:charge_id/update_distances', ChargeController.updateDistances)

  app.get(prefix + '/awards', ChargeController.awards)
  app.get(prefix + '/charge/:charge_id/distance_results/:award_id', ChargeController.distanceAwardResults)
  
  app.get(prefix + '/charge/:charge_id/entries', EntryController.index)

  app.get(prefix + '/entry/:entry_id', EntryController.show)
  app.get(prefix + '/entry/:entry_id/geometry', EntryController.showGeometry)

  app.post(prefix + '/entry', EntryController.create)
  app.put(prefix + '/entry/:entry_id', EntryController.update)
  app.delete(prefix + '/entry/:entry_id', EntryController.delete)

  app.put(prefix + '/entry/:entry_id/clear_result', EntryController.clearResult)
  app.get(prefix + '/entry/:entry_id/legs', EntryController.legs)
  app.get(prefix + '/entry/:entry_id/checkins', EntryController.checkins)
  app.put(prefix + '/entry/:entry_id/process_legs', EntryController.processLegs)
  
  app.get(prefix + '/entry/:entry_id/update_distances', EntryController.updateDistances)
  app.get(prefix + '/entry/:entry_id/calculate_checkins', EntryController.calculateCheckins)
  app.put(prefix + '/entry/:entry_id/update_checkpoint_card', EntryController.updateCheckpointCard)
  app.delete(prefix + '/entry/:entry_id/checkin/:checkin_id', EntryController.deleteCheckin)

  app.post(prefix + '/entry/:entry_id/importGeotab', EntryController.importGeotab)
  app.post(prefix + '/entry/:entry_id/importGpx', EntryController.importGpx)
  
  app.get(prefix + '/classes', EntryController.indexClasses)
  app.get(prefix + '/categories', EntryController.indexCategories)
  
  app.get(prefix + '/charge/:charge_id/checkpoints', CheckpointController.index)
  app.get(prefix + '/checkpoint/:checkpoint_id', CheckpointController.show)
  app.post(prefix + '/checkpoint', CheckpointController.create)
  app.put(prefix + '/checkpoint/:checkpoint_id', CheckpointController.update)
  app.delete(prefix + '/checkpoint/:checkpoint_id', CheckpointController.delete)

  app.get(prefix + '/teams', TeamController.index)
  app.get(prefix + '/charge/:charge_id/teamsAvailable', TeamController.indexAvailableForCharge)
  app.get(prefix + '/team/:team_id', TeamController.show)
  app.post(prefix + '/team', TeamController.create)
  app.put(prefix + '/team/:team_id', TeamController.update)
  app.delete(prefix + '/team/:team_id', TeamController.delete) 

  app.get(prefix + '/cars', CarController.index)
  app.get(prefix + '/charge/:charge_id/carsAvailable', CarController.indexAvailableForCharge)
  app.get(prefix + '/makes', CarController.indexMakes)
  app.get(prefix + '/car/:car_id', CarController.show)
  app.post(prefix + '/car', CarController.create)
  app.put(prefix + '/car/:car_id', CarController.update)
  app.delete(prefix + '/car/:car_id', CarController.delete)

  app.get(prefix + '/sponsors', SponsorController.index)
  app.get(prefix + '/charge/:charge_id/sponsorsAvailable', SponsorController.indexAvailableForCharge)
  app.get(prefix + '/sponsor/:sponsor_id', SponsorController.show)
  app.post(prefix + '/sponsor', SponsorController.create)
  app.put(prefix + '/sponsor/:sponsor_id', SponsorController.update)
  app.delete(prefix + '/sponsor/:sponsor_id', SponsorController.delete)
  
  app.get(prefix + '/geotab/devices', GeotabController.indexDevices)
  app.get(prefix + '/geotab/:device_id/info', GeotabController.deviceInfo)
  
  app.get(prefix + '/teltonika/imeis', TeltonikaController.indexIMEIs)
  app.get(prefix + '/charge/:charge_id/teltonika_entries', TeltonikaController.indexEntries)
  app.get(prefix + '/teltonika/:imei/recent_track', TeltonikaController.recentTrack)
  
  
}