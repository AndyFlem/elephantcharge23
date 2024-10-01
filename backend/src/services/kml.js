const Knex = require('./db')
const Luxon = require('luxon')
const DateTime = Luxon.DateTime
const Common = require('../controllers/CommonDebug')('KML')
const fs = require('fs')
const { create, convert, fragment } = require('xmlbuilder2')

const EntryController = require('../controllers/EntryController')
const ChargeCommon = require('../controllers/ChargeCommon')

module.exports = {
    entryKml (req, trx, entryId) {
      Common.debug(null, 'entryKml', entryId)
      let entry
      let charge
      let checkpoints
      let kml,kmlDocument,kmlEntries,kmlEntry
      let kmlName

      return Knex('v_entry')
        .where({'entry_id': entryId})
        .select()
        .transacting(trx)
        .then(entries=>{
          entry=entries[0]
          
          return module.exports.kmlHeader(req, trx, entry.charge_id)
        })
        .then(ret => {
          kml=ret.kml
          kmlDocument=ret.kmlDocument
          charge=ret.charge
          
          kmlEntries = kmlDocument.ele('Folder')
            .ele('name').txt('Entries').up()
            .ele('open').txt('1').up()            

          req.query.geometry='kml'
          return module.exports.addEntry(req, trx, entry, kmlDocument, kmlEntries)
        })
        .then(() => {

          let out = kml.end({ prettyPrint: true })
          // create folder if it doesnt exist
          if (!fs.existsSync('./../public/charges/kml/' + charge.charge_ref)){
            fs.mkdirSync('./../public/charges/kml/' + charge.charge_ref)
          }
          kmlName = charge.charge_ref + '/' + entry.car_no + '_' + entry.entry_name + '.kml'
          fs.writeFileSync('./../public/charges/kml/' +  kmlName, out)
          return Knex('entry')
            .where({entry_id: entryId})
            .update({kml: kmlName})
            .transacting(trx)
        })
        .then(() => {
          return {kml: kmlName}
        })
    },

    kmlHeader(req, trx, chargeId) {
      Common.debug(null, 'kmlHeader', chargeId)
 
      let kml, kmlDocument, kmlCheckpoints
      let checkpoints
      let charge

      return Knex('v_charge')
        .where({charge_id: chargeId})
        .transacting(trx)
        .select()
        .then(charges => {
          charge = charges[0]

          return Knex('v_checkpoint')
            .where({charge_id: chargeId})
            .transacting(trx)
            .select()
        })
        .then(checkpts => {
          checkpoints = checkpts
          kml = create({ version: '1.0' })
          .ele('kml')
            .att('xmlns', 'http://www.opengis.net/kml/2.2')
    
          kmlDocument = kml.ele('Document')
            .ele('name').txt(charge.charge_name).up()
    
          kmlCheckpoints=kmlDocument.ele('Folder')
            .ele('name').txt('Checkpoints').up()
            .ele('open').txt('0').up()
    
          for (const checkpoint of checkpoints) {
            const cpobj = create(checkpoint.location_kml)
    
            kmlCheckpoints.ele('Placemark')
              .ele('name').txt(checkpoint.sponsor_name).up()
              .import(cpobj)
          }

          return { kml, kmlDocument, charge }
        })
    },

    addEntry(req, trx, entry, kmlDocument, kmlEntries) {
      return EntryController.doGetLegs(req, trx, entry.entry_id)
        .then(legs => {
          kmlDocument.ele('Style').att('id', 'entry_' + entry.entry_id)
            .ele('LineStyle')
              .ele('color').txt('FF' + entry.color.slice(5,7)+ entry.color.slice(3,5)+ entry.color.slice(1,3)).up()
              .ele('width').txt('4').up().up()
    
          kmlEntry=kmlEntries.ele('Folder')
            .ele('name').txt(entry.entry_name).up()
            .ele('open').txt('0').up()

          for (const leg of legs) {
            const legobj = create(leg.leg_line)
            kmlEntry.ele('Placemark')
              .ele('name').txt(leg.checkpoint1_name + ' to ' + leg.checkpoint2_name).up()
              .ele('styleUrl').txt('#entry_' + entry.entry_id).up()
              .import(legobj)
          }
        })
    }
}
