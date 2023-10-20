<script setup>
  import { reactive, inject, watch, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { format } from 'd3'
  
  const axiosPlain = inject('axiosPlain')

  const route = useRoute()
  
  const state = reactive({
    charge: {},
    entries: []
  })

  watch(
    () => route.params.charge_ref,
    newChargeRef => {
      axiosPlain.get('/charge/' + newChargeRef)
        .then(rows => {
          state.charge = rows.data
          return axiosPlain.get('/charge/' + state.charge.charge_ref + '/entries')
        })
        .then(rows => {
          state.entries = rows.data
        })
    }, { immediate: true }
  )

  function getState(en) {
    console.log(en)
    if (en.no_gps) {
      return 'No GPS'
    }
    if (!en.checkins_calculated || !en.checkins_consistent) {
      return 'Not Processed'
    }
    if (en.completed) {
      return 'Complete'
    }
    return 'DNF ' + (en.checkpoint_count-1) + ' of ' + state.charge.checkpoint_count
  }

  const entries = computed(() => {
    return state.entries.map(e => {
      return {
        car_no: e.car_no,
        entry_name: e.entry_name,
        class: e.class,
        raised_dollars: e.raised_dollars,
        no_gps: e.no_gps,
        dist_real: e.no_gps ? 0 : e.dist_real/1000,
        dist_competition: e.no_gps ? 0 : e.dist_competition/1000,
        result_state: getState(e)
      }
    })
  })

  const formatCurrency = (value) => {
    return format(',.0f')(value)
  }
  const formatDistance = (value) => {
    return value > 0 ? format(',.3r')(value) : ' - '
  }
  const colorerGps = (value) => {
    return value == 'Not Processed' ? 'grey' :(value == 'No GPS' ? 'red' : (value == 'Complete' ? 'green' : 'orange'))
  }

  const entryTableHeaders = [
    {title: 'No', align: 'start', sortable: true, key: 'car_no'},
    {title: 'Team', align: 'start', sortable: true, key: 'entry_name'},
    {title: 'Class', align: 'start', sortable: true, key: 'class'},
    {title: 'Pledge $', align: 'end', sortable: true, key: 'raised_dollars', formatter: formatCurrency},
    {title: 'Actual km', align: 'end', sortable: true, key: 'dist_real', formatter: formatDistance},
    {title: 'Competition km', align: 'end', sortable: true, key: 'dist_competition', formatter: formatDistance},
    {title: 'Result', align: 'middle', sortable: true, key: 'result_state', colorer: colorerGps}
  ]
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col class="" cols="12">
        <v-card v-if="state.charge" class="mx-auto">
          <v-card-title>{{ state.charge.charge_name }}</v-card-title>
          <v-data-table

          :headers="entryTableHeaders"
            :items="entries"
            item-value="name"
            items-per-page="-1"
            class="elevation-1"
            density="compact"
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

          <template #bottom></template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>