<script setup>
  // import { onMounted } from 'vue'
  import { inject, reactive} from 'vue'
  import { parseISO } from 'date-fns'
  import { format } from 'd3'
  import { DateTime } from 'luxon'
  import ChargeForm from './ChargeForm.vue'
  import router from '@/router'

  const axiosPlain = inject('axiosPlain')

  const state = reactive({
    charges: []
  })

  axiosPlain.get('/charges')
    .then(rows => {
      state.charges = rows.data.map(c=> {
        c.charge_date = parseISO(c.charge_date)
        return c
      }).sort((a,b) => b.charge_date - a.charge_date)
    })

  const formatCurrency = (value) => {
    return format(',.0f')(value)
  }
  const formatDate = (value) => {
    return DateTime.fromJSDate(value).toFormat('d LLL y')
  }
  const formatStatus = (value) => {
    if (value.charge_complete && value.result_complete) {
      return 'Complete'
    }
    if (value.charge_complete && !value.result_complete) {
      return 'Processing'
    }
    return 'Future'
  }
  const colorStatus = (value) => {
    if (value.charge_complete && value.result_complete) {
      return 'green'
    }
    if (value.charge_complete && !value.result_complete) {
      return 'orange'
    }
    return 'grey'
  }  
  const chargesTableHeaders = [
    {title: '', align: 'start', sortable: true, key: 'charge_ref' },
    {title: 'Charge', align: 'start', sortable: true, key: 'charge_link' },
    {title: 'Date', align: 'start', sortable: true, key: 'charge_date', formatter: formatDate},
    {title: 'Status', align: 'start', sortable: true, key: 'status'},
    {title: 'Entries', align: 'start', sortable: true, key: 'entry_count' },
    {title: 'New Teams', align: 'start', sortable: true, key: 'new_teams_count' },
    {title: 'Completed', align: 'start', sortable: true, key: 'completed' },
    {title: 'Raised', align: 'start', sortable: true, key: 'raised_dollars', formatter: formatCurrency },
    {title: 'Raised per Entry', align: 'start', sortable: true, key: 'dollars_per_entry', formatter: formatCurrency },
  ]  

  function chargeCreated(charge) {
    router.push({name: 'Charge', params: {charge_id: charge.charge_id}})
  }
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col class="" cols="12">
        <v-card v-if="state.charges" class="mx-auto">
          <v-data-table
            :headers="chargesTableHeaders"
            :items="state.charges"
            item-value="name"
            items-per-page="-1"
            class="elevation-1"
            density="compact"
            :custom-key-sort="{'completed': (a,b) => a.pct-b.pct}"
          >
          <template 
            v-for="heder in chargesTableHeaders.filter((h) => (h.hasOwnProperty('formatter')))" 
            v-slot:[`item.${heder.key}`]="{ value }"
          >
              {{ heder.hasOwnProperty('formatter') ? heder.formatter(value) : value}}
          </template>
          <template v-slot:[`item.charge_link`]="{  item }">
              <router-link :to="'/charge/' + item.charge_id">{{ item.charge_name }}</router-link>
          </template>
          <template v-slot:[`item.completed`]="{ item }">
              {{ item.count }} ({{ format(',.0%')(item.pct) }})
          </template>
          <template v-slot:[`item.status`]="{ item }">
            <v-chip :color="colorStatus(item)">
              {{ formatStatus(item) }}
            </v-chip>            
          </template>
          <template v-slot:[`item.charge_ref`]="{ index }">
            {{index+1}}
          </template>          
          <template #bottom></template>
          </v-data-table>
          <v-card-actions class="d-flex">
            <v-spacer/>
            <ChargeForm @charge-created="chargeCreated">
              <template #activator="{ activate }">
                <v-btn color="primary" @click="activate">Add Charge</v-btn>
              </template>
            </ChargeForm>          
          </v-card-actions>          
        </v-card>        
      </v-col>
    </v-row>
  </v-container>
</template>