const Knex = require('./db')
const Luxon = require('luxon')
const DateTime = Luxon.DateTime
const Common = require('../controllers/CommonDebug')('KML')
const fs = require('fs')
const { create, convert } = require('xmlbuilder2')

const EntryController = require('../controllers/EntryController')

module.exports = {
    entryKml (req, trx, entryId) {
      Common.debug(null, 'entryKml', entryId)
      let entry
      let kml = this.kmlHeader()

      return Knex('v_entry')
        .where({'entry_id': entryId})
        .select()
        .transacting(trx)
        .then(entries=>{
          entry=entries[0]
          
          kml.kml.Document.folder = {
            name: entry.entry_name,
            open: 1,
            folder: {
              name: 'Legs',
              open: 1
            }
          }
          req.query.geometry='kml'
          return EntryController.doGetLegs(req, trx, entryId)
        })
        .then(legs=>{

          kml.kml.Document.folder.folder = legs.map(leg=>{
            const legobj = convert(leg.leg_line, { format: "object" })
            return {Placemark: {
              name: leg.checkpoint1_name + ' to ' + leg.checkpoint2_name,
              Linestring: {
                tessellate: 1,
                coordinates: legobj.LineString.coordinates
              }}
            }
          })

          return create(kml).end({ prettyPrint: true })
        })

    },
    kmlHeader () {
      return {
          kml: {
              '@xmlns': 'http://www.opengis.net/kml/2.2',
              Document: {
                  name: 'KML Document',
                  open: 1
              }
          }
      }
    }
}