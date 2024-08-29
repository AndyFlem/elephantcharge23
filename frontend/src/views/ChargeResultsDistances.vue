<script setup>
  import { inject, reactive} from 'vue'

  const axiosPlain = inject('axiosPlain')

  const props = defineProps({
    charge: Object,
    category: String,
    class: String
  })

  const state = reactive({
    results: null
  })

  axiosPlain.get('/charges')
    .then(rows => {

    })

const resultTableHeaders = [
    {title: '', align: 'start', sortable: true, key: 'charge_ref' },

  ]  

</script>

<template>
  <v-data-table
    :headers="resultTableHeaders"
    :items="state.results"
    item-value="name"
    items-per-page="-1"
    class="elevation-1"
    density="compact"
  >
    <template 
      v-for="heder in formatters" 
      v-slot:[`item.${heder.key}`]="{ _header, value }"
    >
      {{ heder.formatter(value) }}
    </template>
    <template v-slot:[`item.entry_name`]="{ item }">
      <router-link :to="{name: 'Entry', params: {entry_id: item.entry_id }}">{{ item.entry_name }}</router-link>
    </template> 


    <template #bottom></template>      
  </v-data-table>
</template>