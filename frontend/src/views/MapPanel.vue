<script setup>
  import { reactive, inject, watch, computed } from 'vue'

  import Map from 'ol/Map'
  import View from 'ol/View'
  import TileLayer from 'ol/layer/Tile'
  import XYZ from 'ol/source/XYZ'
  import { get as getProjection} from 'ol/proj.js'
  import VectorSource from 'ol/source/Vector'
  import VectorLayer from 'ol/layer/Vector'
  import GeoJSON from 'ol/format/GeoJSON.js'
  import { Circle as CircleStyle,Fill,Stroke,Style, Text} from 'ol/style.js'


  const axiosPlain = inject('axiosPlain')

  let map
  let checkpointPoints
  let entryTrack
  let legsTrack

  const props = defineProps({
    entry: Object
  })

  const state = reactive({
    checkpoints: null,
    charge: null,
    entry: null,
    legs: null
  })
  
  watch(()=>props.entry, () => {
    console.log('entry watch', props.entry)
    if (props.entry) {
      let fnc = []
      if (props.entry.processing_status!='NO_GPS') {
        fnc.push(
          axiosPlain.get('/entry/' + props.entry.entry_id + '/geometry')
            .then(rows => {
              state.entry = rows.data[0]
            })
        )
      } else {
        state.entry = null
      }
      if(props.entry.processing_status=='LEGS') {
        fnc.push(
          axiosPlain.get('/entry/' + props.entry.entry_id + '/legs?from=map')
            .then(rows => {
              state.legs = rows.data
            })
        )
      } else {
        state.legs = null
      }
      Promise.all(fnc)
        .then(() => {
          return axiosPlain.get('/charge/' + props.entry.charge_id)
        })
        .then(rows => {
          state.charge = rows.data
          return axiosPlain.get('/charge/' + props.entry.charge_id + '/checkpoints')
        })
        .then(rows => {
          state.checkpoints = rows.data          
        })
        .then(() => {
          if (!map) {
            setupMap()
          }
          addCheckpoints()
          addTrack()
          addLegs()
        })
    }
  },{ immediate: true })

  function addCheckpoints() {
    checkpointPoints.setSource(
      new VectorSource({
        features: new GeoJSON().readFeatures(checkpointMarkers.value)
      })
    )
  }

  function addLegs() {
    console.log('addLegs')
    if (map && state.legs) {
      console.log('addLegs2')
      let json = {type: 'FeatureCollection', features: state.legs.map(l=>{
        return {
          type: 'Feature',
          properties: {name: l.leg_no},
          geometry: JSON.parse(l.leg_line)
        }
      })}
      console.log('addLegs json' , json)
      legsTrack.setSource(
        new VectorSource({
          features: new GeoJSON().readFeatures(json)
        })
      )
    }
  }

  function addTrack() {
    console.log('addTrack')
    if (map && state.entry && state.entry.clean_line_json) {
      let json

      json = JSON.parse(state.entry.clean_line_json)
      console.log('addTrack json' , json)
      entryTrack.setSource(
        new VectorSource({
          features: new GeoJSON().readFeatures(json)
        })
      )
    }
  }


  const mapCenter = computed(() => {
    if (state.charge.map_center) {
      let pnt=JSON.parse(state.charge.map_center)

      return pnt.coordinates
    } else {
      return [0,0]
    }
  })
  const checkpointMarkers = computed(() => {
    if (state.checkpoints) {
      return {
        type: "FeatureCollection",
        features: state.checkpoints.map(c => {
          return {
            type: 'Feature',
            properties: {name: c.short_name? c.short_name : c.sponsor_name},
            geometry: JSON.parse(c.location)
          }
        })
      }
    } else {
      return {}
    }
  })

  const projection = getProjection('EPSG:4326')

  function textStyle(feature) {
    return new Text( {
      text: feature.get('name'),
      textAlign: 'left',
      offsetX: 10,
      offsetY: 0
    })
  }
  function pointStyleFunction(feature) { //, resolution) {
    return new Style({
      image: new CircleStyle({
        radius: 3,
        fill: new Fill({color: 'black'}),
        stroke: new Stroke({color: 'black', width: 0.5}),
      }),
    text: textStyle(feature)
    })
  }
  function lineStyleFunction(color, size) {
    return function() {
      return new Style({
        stroke: new Stroke({
          color: color,
          width: size,
        })
      })
    }
  }

  function setupMap() {   
    console.log('setupMap') 
    checkpointPoints = new VectorLayer({
      style: pointStyleFunction,
    })
    entryTrack = new VectorLayer({
      style: lineStyleFunction('green', 0.8),
    })
    legsTrack = new VectorLayer({
      style: lineStyleFunction('red', 1.5),
    })

    map = new Map({
      target: 'map',
      layers: [
        new TileLayer({ source: new XYZ({url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'})})
      ],
      view: new View({
        center: mapCenter.value,
        zoom: state.charge.map_scale + 1,
        projection: projection
      })
    })

    map.addLayer(checkpointPoints) 
    map.addLayer(entryTrack) 
    map.addLayer(legsTrack) 
    
  }
</script>

<template>
  <v-card class="px-1 pt-2 pb-1"><div id="map" style="color:red;width:100%;height:400px;" class="map"></div></v-card>
  
</template>
<style>
      .map {
        width: 100%;
        height: 400px;
      }
</style>