<script setup>
  import { reactive, inject, watch, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { format } from 'd3'
  import { DateTime } from 'luxon'
  import "leaflet/dist/leaflet.css"
  import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet"

  const axiosPlain = inject('axiosPlain')
  const route = useRoute()
  const router = useRouter()

  //##################
  //STATE
  //##################
  const state = reactive({
    chargeRef: null,
    carNo: null,
    entry: null,
    charge: null,
    legs: [],
    checkins: [],
    locked: false,
    checkpoints: null
  })

  const alerts = reactive({
    visible:false,
    type:null,
    title: null,
    text: null
  })

  //##################
  //SETUP
  //##################
  state.chargeRef = route.params.charge_ref
  state.teamNo = route.params.car_no
  getEntry()

  watch(() => route.params.charge_ref, newChargeRef => { 
    state.chargeRef = newChargeRef 
    if (state.teamNo) { getEntry() }
  })
  watch(() => route.params.team_no, newTeamNo => { 
    state.teamNo = newTeamNo
    if (state.chargeRef) { getEntry() }
  })

  //##################
  //DATA
  //##################
  function getEntry() {
    axiosPlain.get('/charge/' + state.chargeRef)
    .then(rows => {
        state.charge = rows.data
        return Promise.all([
          axiosPlain.get('/charge/' + state.chargeRef + '/entry/' + state.teamNo)
            .then(rows => {
              state.entry = rows.data
              if (state.entry.leg_count>0) {
                return axiosPlain.get('/entry/' + state.entry.entry_id + '/legs')
              } else {
                return axiosPlain.get('/entry/' + state.entry.entry_id + '/checkins')
              }
            })
            .then(rows => {
              if (state.entry.leg_count>0) {
                state.legs = rows.data
              } else {
                state.checkins = rows.data
              }
            }),
            axiosPlain.get('/charge/' + state.charge.charge_ref + '/checkpoints')  
              .then(rows => state.checkpoints = rows.data)
        ])
    })
    .catch(err => {alert('error', 'Error', err)})
  }

  //##################
  //ACTIONS
  //##################
  function alert(type, title, text) {
    alerts.type = type
      alerts.title = title
      alerts.text = text
      alerts.visible = true
      setTimeout(()=>{alerts.visible = false},3000)    
  }
  function updateStartingCheckpointId() {
    var oEntry = {entry: {starting_checkpoint_id: state.entry.starting_checkpoint_id}}
    axiosPlain.put('/entry/' + state.entry.entry_id, oEntry)
    .then(() => {alert('success', '', 'Entry updated')})
    .catch(err => {alert('error', 'Error', err)})
  }
  function updateCompletePerCard() {
    var oEntry = {entry: {complete_per_card: state.entry.complete_per_card}}
    axiosPlain.put('/entry/' + state.entry.entry_id, oEntry)
    .then(() => {alert('success', '', 'Entry updated')})
    .catch(err => {alert('error', 'Error', err)})
  }
  function clearResult() {
    state.locked=true
    return axiosPlain.put('/entry/' + state.entry.entry_id + '/clear_result')
      .then(() => { router.go(0) })
      .catch(err =>{ console.log(err) })
  }

  //##################
  //COMPUTED
  //##################
  const resultState = computed(() => { 
    if (state.entry.no_gps) {
      return 'No GPS'
    }
    if (!state.entry.checkins_calculated || !state.entry.checkins_consistent) {
      return 'Not Processed'
    }
    if (state.entry.completed) {
      return 'Complete'
    }
    return 'DNF ' + (state.entry.checkpoint_count-1) + ' of ' + state.charge.checkpoint_count
  })

  const legs = computed(() => {
    return state.legs.map(t => {
      return {
        leg_no: t.leg_no,
        checkpoint1_name: t.checkpoint1_name,
        checkpoint2_name: t.checkpoint2_name,
        end_time: t.end_time,
        type: t.is_tsetse ? 'tsetse' : (t.is_gauntlet ? 'gauntlet' : ''),
        time: t.elapsed_s/60,
        distance: t.distance_m,
        distance_multiple: t.distance_multiple,
        position:{position: t.leg_position, of: t.leg_entries},
        speed: t.speed
      }
    })
  })
  const checkins = computed(() => {
    return state.checkins.map(t => {
      return {
        checkin_number: t.checkin_number,
        sponsor_name: t.sponsor_name,
        checkin_timestamp: t.checkin_timestamp
      }
    })
  })

  //##################
  //FORMATTERS
  //##################
  const formatDistance = (value) => {
    if (value>1000) {
      return format(',.2r')(value/1000) + ' km'
    } else {
      return format(',.2r')(value) + ' m'
    }
  }
  const formatMultiple = (value) => {
    return format('.1f')(value) + 'x'
  }  
  const formatTime = (value) => {
    return DateTime.fromISO(value).toFormat('HH:mm')
  }
  const formatSecs = (value) => {
    return format('.0f')(value) + ' mins'
  }
  const formatSpeed = (value) => {
    return format('.2r')(value) + ' km/h'
  }
  const colorerGps = (value) => {
    return value == 'Not Processed' ? 'grey' :(value == 'No GPS' ? 'red' : (value == 'Complete' ? 'green' : 'orange'))
  }
  const formatPosition = (value) => {
    return value.position + ' of ' + value.of
  }
  const legsTableHeaders = [
    {title: 'No', align: 'start', sortable: false, key: 'leg_no'},
    {title: 'From', align: 'start', sortable: false, key: 'checkpoint1_name'},
    {title: 'To', align: 'start', sortable: false, key: 'checkpoint2_name'},
    {title: 'Checkin', align: 'start', sortable: false, key: 'end_time', formatter: formatTime},
    {title: 'Type', align: 'start', sortable: false, key: 'type'},
    {title: 'Time', align: 'start', sortable: false, key: 'time', formatter: formatSecs},
    {title: 'Distance', align: 'start', sortable: false, key: 'distance', formatter: formatDistance},
    {title: 'Multiple', align: 'start', sortable: false, key: 'distance_multiple', formatter: formatMultiple},
    {title: 'Speed', align: 'start', sortable: false, key: 'speed', formatter: formatSpeed},
    {title: 'Position', align: 'start', sortable: false, key: 'position', formatter: formatPosition},
  ]

  const checkinsTableHeaders = [
    {title: 'No', align: 'start', sortable: false, key: 'checkin_number'},
    {title: 'Time', align: 'start', sortable: false, key: 'checkin_timestamp', formatter: formatTime},
    {title: 'Checkpoint', align: 'start', sortable: false, key: 'sponsor_name'},
  ]  
</script>

<template>
  <v-container fluid>
    <v-alert
      :type="alerts.type"
      :title="alerts.title"
      :text="alerts.text"
      v-if="alerts.visible"
    ></v-alert>    
    <v-row>
      <v-col cols="12">
        <v-sheet v-if="state.entry" color="" class="d-flex border rounded px-3 py-3">
          <v-chip variant="elevated" class="mr-3 mt-1 text-h5" color="primary">{{ state.entry.car_no }}</v-chip> <span class="text-h4">{{ state.entry.entry_name }}</span>
          {{ state.entry.entry_id }}
          <v-spacer/>
            <v-chip class="mr-3 mt-2" variant="elevated" :color="colorerGps(resultState)">{{ resultState }}</v-chip>
            <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn class="mt-2" density="compact" icon="mdi-dots-vertical" v-bind="props"></v-btn>
            </template>

            <v-list>
              <v-list-item
                v-for="(item, i) in items"
                :key="i"
              >
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-sheet>
        <v-skeleton-loader type="heading" v-else />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="6" md="4">
        <v-sheet v-if="state.entry" color="yellow-lighten-4" class="border rounded px-3 py-3">
          <div class="my-3 font-weight-bold">Entry Record Card</div>
            <v-select
              label="Starting Checkpoint"
              density="compact"
              v-model="state.entry.starting_checkpoint_id"
              item-title="sponsor_name"
              item-value="checkpoint_id"
              v-if="state.checkpoints"
              :items="state.checkpoints"
              @update:modelValue="updateStartingCheckpointId"
            ></v-select> 
              <v-radio-group
                v-model="state.entry.complete_per_card"
                inline
                density="compact"
                @update:modelValue="updateCompletePerCard"
              >
                <template v-slot:label>
                  <div>Course complete?</div>
                </template>
                <v-radio
                  label="Complete"
                  value="true"
                ></v-radio>
                <v-radio
                  label="DNF"
                  value="false"
                ></v-radio>
              </v-radio-group>
        </v-sheet>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <div style="height:400px; width:400px">
          <l-map ref="map" :zoom="10" :use-global-leaflet="false" :center="[47.41322, -1.219482]">
            <l-tile-layer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              layer-type="base"
              name="OpenStreetMap"
            ></l-tile-layer>
          </l-map>
        </div>        
      </v-col>
    </v-row>
    <v-row v-if="state.entry">
      <template v-if="state.entry.leg_count > 0">
        <v-col cols="12">
        <v-card class="mx-auto">
          <v-card-text>
            <v-data-table
              v-if="state.legs"
              :headers="legsTableHeaders"
              :items="legs"
              item-value="name"
              items-per-page="-1"
              class="elevation-1"
              density="compact">
            <template 
              v-for="heder in legsTableHeaders.filter((h) => (h.hasOwnProperty('formatter')))" 
              v-slot:[`item.${heder.key}`]="{ _header, value }"
            >
                {{ heder.hasOwnProperty('formatter') ? heder.formatter(value) : value}}
            </template>
            <template #bottom></template>
            </v-data-table> 
          </v-card-text>
          <v-card-actions class="d-flex">
            <v-spacer/>
            <v-btn :enabled="!state.locked" @click="clearResult" color="primary" variant="tonal">Clear Result</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      </template>
      <template v-if="state.entry.checkins_calculated && state.entry.leg_count == 0">
        <v-col class="" cols="12" sm="9" md="6">
        <v-card class="mx-auto">
          <v-card-text>
            <v-data-table
              v-if="state.checkins"
              :headers="checkinsTableHeaders"
              :items="checkins"
              item-value="name"
              items-per-page="-1"
              class="elevation-1"
              density="compact">
            <template 
              v-for="heder in checkinsTableHeaders.filter((h) => (h.hasOwnProperty('formatter')))" 
              v-slot:[`item.${heder.key}`]="{ _header, value }"
            >
                {{ heder.hasOwnProperty('formatter') ? heder.formatter(value) : value}}
            </template>
            <template #bottom></template>
            </v-data-table>
          </v-card-text>
          <v-card-actions class="d-flex">
            <v-spacer/>
            <v-btn :enabled="!state.locked" @click="clearResult" color="primary" variant="tonal">Clear Result</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      </template>
    </v-row>
  </v-container>
</template>