<script setup>
  import { ref, reactive, inject, watch, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { format } from 'd3'
  import { DateTime } from 'luxon'

  import ChargeForm from './ChargeForm.vue'  
  
  const axiosPlain = inject('axiosPlain')
  const route = useRoute()
  const router = useRouter()
  const state = reactive({
    charge: null,
    entries: []
  })
  const chargeForm = ref(false)

  watch(
    () => route.params.charge_ref,
    newChargeRef => {
      axiosPlain.get('/charge/' + newChargeRef)
        .then(rows => {
          state.charge = rows.data
          state.charge.charge_date = DateTime.fromISO(state.charge.charge_date)
          state.charge.start_time = DateTime.fromISO(state.charge.start_time)
          state.charge.end_time = DateTime.fromISO(state.charge.end_time)
          
          return axiosPlain.get('/charge/' + state.charge.charge_ref + '/entries')
        })
        .then(rows => {
          state.entries = rows.data
        })
    }, { immediate: true }
  )

  const entries = computed(() => {
    return state.entries.map(e => {
      return {
        car_no: e.car_no,
        entry_name: {entry_name: e.entry_name, car_no: e.car_no},
        class: e.class,
        raised_dollars: e.raised_dollars,
        no_gps: e.no_gps,
        distance_total: e.no_gps ? 0 : e.distance_total/1000,
        distance_total_competition: e.no_gps ? 0 : e.distance_total_competition/1000,
        processing_status: {processing_status: e.processing_status, result_status: e.result_status},
        result_status: {processing_status: e.processing_status, result_status: e.result_status, distance_total_competition: e.no_gps ? 0 : e.distance_total_competition/1000}
      }
    })
  })

  const formatCurrency = (value) => {
    return format(',.0f')(value)
  }
  const formatDistance = (value) => {
    return value > 0 ? format(',.3r')(value) : ' - '
  }
  const colorProcessingStatus = (value) => {
    if (value.processing_status == 'LEGS'){
      return 'green'
    } else {
      if (value.processing_status == 'NOT_PROCESSED') {
        return 'grey'
      } else {
        return 'orange'
      }
    }    
  }
  const formatProcessingStatus = (value) => {
    if (value.processing_status == 'LEGS'){
      return 'Processed'
    } else {
      if (value.processing_status == 'NOT_PROCESSED') {
        return 'No GPS'
      } else {
        return 'Processing'
      }
    }
  }
  const processingStatusSortInt = (value) => {
    if (value.processing_status == 'LEGS'){
      return 1
    } else {
      if (value.processing_status == 'NOT_PROCESSED') {
        return 3
      } else {
        return 2
      }
    }
  }

  const colorResultStatus = (value) => {
    if (value.result_status == 'COMPLETE') {
      return 'green'
    } else {
      if (value.result_status) {
        return 'orange'
      } else {
        return 'grey'
      }
    }
  }
  const formatResultStatus = (value) => {
    if (value.result_status) {
      if (value.result_status == 'COMPLETE') {
        return 'Complete'
      } else {
        return value.result_status + ' of ' + state.charge.checkpoint_count
      }
    } else {
      return 'No Result'
    }
  }
  const resultStatusSortInt = (value) => {
    if (value.result_status) {
      if (value.result_status == 'COMPLETE') { return value.distance_total_competition } else { return 2000 }
    } else { return 3000 }
  }

  const entryTableHeaders = [
    {title: 'No', align: 'start', sortable: true, key: 'car_no'},
    {title: 'Team', align: 'start', sortable: true, key: 'entry_name'},
    {title: 'Class', align: 'start', sortable: true, key: 'class'},
    {title: 'Pledge $', align: 'end', sortable: true, key: 'raised_dollars', formatter: formatCurrency},
    {title: 'Actual km', align: 'end', sortable: true, key: 'distance_total', formatter: formatDistance},
    {title: 'Competition km', align: 'end', sortable: true, key: 'distance_total_competition', formatter: formatDistance},
    {title: 'Status', align: 'middle', sortable: true, key: 'processing_status'},
    {title: 'Result', align: 'middle', sortable: true, key: 'result_status'}
  ]

  function chargeUpdated(charge) {
    //state.charge = charge
  }
  function deleteCharge() {
    axiosPlain.delete(`/charge/${state.charge.charge_ref}`)
      .then(() => {
        // Redirect to charges list
        router.push({name: 'Charges'})
      })
      .catch(err => {alert('error', 'Error', JSON.stringify(err.message))})
  }  
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" class="pb-0">
        <v-card v-if="state.charge" elevation="0" border rounded>
            <ChargeForm :charge-ref="state.charge.charge_ref" :dialog="chargeForm" @charge-updated="chargeUpdated" />

            <v-card-title class="d-flex pb-0">
              <span class="text-h4">{{ state.charge.charge_name }}</span>
              <v-spacer/>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn class="mt-2" density="compact" icon="mdi-dots-vertical" v-bind="props"></v-btn>
                </template>
                <v-list>
                  <v-list-item>
                      <v-btn @click="chargeForm=true">Edit charge</v-btn>
                  </v-list-item>
                  <v-list-item>
                      <v-btn @click="deleteCharge">Delete charge</v-btn>
                  </v-list-item>
                </v-list>
              </v-menu>              
            </v-card-title>
            <v-card-text class="pt-1 pb-1">
              {{ state.charge.charge_date.toFormat('ccc d LLL y') }} {{ state.charge.start_time.toFormat('HH:mm') }}-{{ state.charge.end_time.toFormat('HH:mm') }}, <i>{{ state.charge.location }}.</i>
            </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="" cols="12">
        <v-card v-if="state.charge" class="mx-auto">
          <v-data-table
            :headers="entryTableHeaders"
            :items="entries"
            item-value="name"
            items-per-page="-1"
            class="elevation-1"
            density="compact"
            :custom-key-sort="{
              'result_status': (a,b) => resultStatusSortInt(a)-resultStatusSortInt(b),
              'processing_status': (a,b) => processingStatusSortInt(a)-processingStatusSortInt(b)
              }"
          >
          <template 
            v-for="heder in entryTableHeaders.filter((h) => (h.hasOwnProperty('formatter') || h.hasOwnProperty('colorer')))" 
            v-slot:[`item.${heder.key}`]="{ _header, value }"
          >
            <v-chip v-bind:key="heder.key" v-if="heder.hasOwnProperty('colorer')" :color="heder.colorer(value)">
              {{ heder.hasOwnProperty('formatter') ? heder.formatter(value) : value}}
            </v-chip>
            <template v-else>
              {{ heder.hasOwnProperty('formatter') ? heder.formatter(value) : value}}
            </template>         
          </template>
          <template v-slot:[`item.entry_name`]="{ value }">
            <router-link :to="{name: 'Entry', params: {charge_ref: state.charge.charge_ref, car_no: value.car_no }}">{{ value.entry_name }}</router-link>
          </template> 
          <template v-slot:[`item.processing_status`]="{ value }">
            <v-chip :color="colorProcessingStatus(value)">
              {{ formatProcessingStatus(value) }}
            </v-chip>            
          </template>   
          <template v-slot:[`item.result_status`]="{ value }">
            <v-chip :color="colorResultStatus(value)">
              {{ formatResultStatus(value) }}
            </v-chip>            
          </template>   
          <template #bottom></template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>