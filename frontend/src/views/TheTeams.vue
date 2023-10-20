<script setup>
  import { reactive, inject, computed } from 'vue'
  //import { useRoute } from 'vue-router'
  import { format } from 'd3'
  
  const axiosPlain = inject('axiosPlain')

  //const route = useRoute()
  
  const state = reactive({
    teams: []
  })

  axiosPlain.get('/teams')
    .then(rows => {
      state.teams = rows.data      
    })


  const teams = computed(() => {
    return state.teams.map(t => {
      return {
        team_name: t.team_name,
        captain: t.captain,
        entry_count: t.entry_count,
        last_charge: t.last_charge,
        completed_count: t.completed_count,
        raised_dollars: t.raised_dollars,
        dollars_per_entry: t.dollars_per_entry
      }
    })
  })

  const formatCurrency = (value) => {
    return format(',.0f')(value)
  }

  const teamTableHeaders = [
    {title: 'Team', align: 'start', sortable: true, key: 'team_name'},
    {title: 'Captain', align: 'start', sortable: true, key: 'captain'},
    {title: 'Charges', align: 'start', sortable: true, key: 'entry_count'},
    {title: 'Completed', align: 'start', sortable: true, key: 'completed_count'},
    {title: 'Last Charge', align: 'start', sortable: true, key: 'last_charge'},
    {title: 'Dollars Raised', align: 'start', sortable: true, key: 'raised_dollars', formatter: formatCurrency},
    {title: 'Dollars Per Charge', align: 'start', sortable: true, key: 'dollars_per_entry',formatter: formatCurrency},
  ]

</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col class="" cols="12">
        <v-card v-if="state.teams" class="mx-auto">
          <v-data-table
            :headers="teamTableHeaders"
            :items="teams"
            item-value="name"
            items-per-page="-1"
            class="elevation-1"
            density="compact"
          >
          <template 
            v-for="heder in teamTableHeaders.filter((h) => (h.hasOwnProperty('formatter')))" 
            v-slot:[`item.${heder.key}`]="{ _header, value }"
          >
              {{ heder.hasOwnProperty('formatter') ? heder.formatter(value) : value}}
          </template>
          <template #bottom></template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>