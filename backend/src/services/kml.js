const Knex = require('./db')
const Common = require('../controllers/CommonDebug')('KML')
const fs = require('fs')
const path = require('path')
const { create } = require('xmlbuilder2')

const EntryController = require('../controllers/EntryController')
const ChargeCommon = require('../controllers/ChargeCommon')

module.exports = {
   chargeKml (req, trx, chargeId) {
    Common.debug(null, 'chargeKml', chargeId)
    let entries
    let charge
    let kml, kmlDocument, kmlEntries
    let kmlName

    return Knex('v_charge')
      .where({'charge_id': chargeId})
      .select()
      .transacting(trx)
      .then(charges=>{
        charge=charges[0]
        
        return Knex('v_entry')
          .where({'charge_id': chargeId})
          .orderBy('car_no')
          .select()
          .transacting(trx)
      })
      .then(ents=>{
        entries = ents

        return module.exports.kmlHeader(req, trx, chargeId)
      })
      .then(ret => {
        kml=ret.kml
        kmlDocument=ret.kmlDocument
        
        kmlEntries = kmlDocument.ele('Folder')
          .ele('name').txt('Entries').up()
          .ele('open').txt('1').up()            

        req.query.geometry='kml'
        return Promise.all(entries.map(entry => {
          if (entry.processing_status=='LEGS'){
            return module.exports.addEntry(req, trx, entry, kmlDocument, kmlEntries)
          }
        }))
      })
      .then(() => {

        let out = kml.end({ prettyPrint: true })
        
          // Create the directory if it doesn't exist
          const dirPath = path.join(__dirname, './../../public/charges/kml/')
          console.log('dirPath', dirPath + charge.charge_ref)
          if (!fs.existsSync(dirPath + charge.charge_ref)){
            fs.mkdirSync(dirPath + charge.charge_ref, { recursive: false });
          }

        kmlName = charge.charge_ref + '/EC_' + charge.charge_ref + '.kml'
        fs.writeFileSync(dirPath + '/' + kmlName, out)
        return Knex('charge')
          .where({charge_id: chargeId})
          .update({kml: kmlName})
          .transacting(trx)
      })
      .then(() => {
        return {kml: kmlName}
      })
    },
    entryKml (req, trx, entryId) {
      Common.debug(null, 'entryKml', entryId)
      let entry
      let charge
      let kml, kmlDocument, kmlEntries
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
          
            // Create the directory if it doesn't exist
            const dirPath = path.join(__dirname, './../../public/charges/kml/')
            console.log('dirPath', dirPath + charge.charge_ref)
            if (!fs.existsSync(dirPath + charge.charge_ref)){
              fs.mkdirSync(dirPath + charge.charge_ref, { recursive: false });
            }

          kmlName =  + charge.charge_ref + '/' + entry.car_no + '_' + entry.entry_name + '.kml'
          fs.writeFileSync(dirPath + '/' + kmlName, out)
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
          let colCode
          if (entry.color){
            colCode = entry.color.slice(5,7)+ entry.color.slice(3,5)+ entry.color.slice(1,3)
          } else {
            colCode = 'FFFFFF'
          }
          kmlDocument.ele('Style').att('id', 'entry_' + entry.entry_id)
            .ele('LineStyle')
              .ele('color').txt('FF' + colCode).up()
              .ele('width').txt('4').up().up()
    
          kmlEntry=kmlEntries.ele('Folder')
            .ele('name').txt(entry.car_no + ' ' + entry.entry_name).up()
            .ele('open').txt('0').up()

          for (const leg of legs) {
            const legobj = create(leg.leg_line)
            kmlEntry.ele('Placemark')
              .ele('name').txt(entry.car_no + ' ' + leg.checkpoint1_name + ' to ' + leg.checkpoint2_name).up()
              .ele('styleUrl').txt('#entry_' + entry.entry_id).up()
              .import(legobj)
          }
        })
    }
}
