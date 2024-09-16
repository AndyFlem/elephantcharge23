import { format } from 'd3'
import { DateTime } from 'luxon'

export default {
  install: (app, options) => {

    app.provide('format', {

      entryStatusColor: (entry) => {
        switch(entry.processing_status) {
          case 'NO_GPS':
            return 'grey'
          case 'CLEAN':
            return 'red'
          case 'CHECKINS':
            return 'red'
          case 'LEGS':
            if (entry.result_status == 'COMPLETE') {
              return 'green'
            } else {
              return 'orange'
            }
          default:
            return '-'
        }
      },
      entryStatusDescription: (entry) => {
        switch(entry.processing_status) {
          case 'NO_GPS':
            return 'No GPS'
          case 'CLEAN':
            return 'Track'
          case 'CHECKINS':
            return 'Checkpoints'
          case 'LEGS':
            return entry.result_status
        }     
      }, 
      distance: (value) => {
        if (!value) {
          return '-'
        } else {
          return format(',.4r')(value/1000) + ' km'  
        }
      },
      currency: (value) => {
        return format(',.0f')(value)
      },
      number: (value) => {
        return format(',.0f')(value)
      },      
      multiple: (value) => {
        return format('.1f')(value) + 'x'
      },
      time: (value) => {
        return DateTime.fromISO(value).toFormat('HH:mm')
      },
      date: (value) => {
        return DateTime.fromISO(value).toFormat('ccc dd LLL yyyy')
      },
      dateTime: (value) => {
        return DateTime.fromISO(value).toFormat('ccc dd LLL yyyy HH:mm')
      },
      secs: (value) => {
        return format('.0f')(value) + ' mins'
      },
      speed: (value) => {
        return format('.2r')(value) + ' km/h'
      }

    })
  }
}