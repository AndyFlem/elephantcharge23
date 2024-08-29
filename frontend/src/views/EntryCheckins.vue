<script setup>
  import { reactive, inject, watch } from 'vue'

  const axiosPlain = inject('axiosPlain')
  const format = inject('format')

  const props = defineProps({
    entry: Object,
    charge: Object
  })

  const state = reactive({
    checkins: null,
  })  

  watch(() => props.entry, () => { 
    if (props.entry.entry_id) { getCheckins() }
  },{immediate: true})

  function getCheckins() {
    return axiosPlain.get('/entry/' + props.entry.entry_id + '/checkins')
      .then(rows => state.checkins = rows.data)
  }

  const checkinsTableHeaders = [
    {title: 'No', align: 'start', sortable: false, key: 'checkin_number'},
    {title: 'Time', align: 'start', sortable: false, key: 'checkin_timestamp', formatter: format.time},
    {title: 'Checkpoint', align: 'start', sortable: false, key: 'sponsor_name'},
  ]  
</script>

<template>
  <v-col class="" cols="12" sm="9" md="6">
    <v-card v-if="!props.entry.checkins_consistent===false">
        <v-card-text class="text-red">
          {{ props.entry.checkins_inconsistent_message }}
        </v-card-text>
      </v-card>

      <v-data-table
        v-if="state.checkins"
        :headers="checkinsTableHeaders"
        :items="state.checkins"
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
  </v-col>
</template>