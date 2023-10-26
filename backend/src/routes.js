const debug = require('debug')('mp-api:route')
const config = require('./config/config')

const ChargeController = require('./controllers/ChargeController')
const EntryController = require('./controllers/EntryController')
const TeamController = require('./controllers/TeamController')
const CarController = require('./controllers/CarController')

module.exports = (app) => {
    const prefix = '/api/' + config.api_version

    app.get(prefix + '/charges', ChargeController.index)
    app.get(prefix + '/charge/:charge_ref', ChargeController.show)
    app.get(prefix + '/charge/:charge_ref/update_distances', ChargeController.updateDistances)
    app.get(prefix + '/charge/:charge_ref/checkpoints', ChargeController.checkpoints)
    
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

    app.get(prefix + '/cars', CarController.index)
}