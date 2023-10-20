<script setup>
  // import { onMounted } from 'vue'
  import { inject } from 'vue'
  import { reactive } from 'vue'
  
  const axiosPlain = inject('axiosPlain')

  const state = reactive({
    cars: []
  })

  axiosPlain.get('/cars')
    .then(rows => {
      state.cars = rows.data
    })
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col class="" cols="12" sm="6" md="4" v-for="car in state.cars" :key="car.car_id">
        <v-card class="mx-auto" prepend-icon="mdi-home">
          <template v-slot:title>{{ car.name }}</template>
          <v-card-text>
            {{ car.colour }} {{ car.year }} {{ car.make }} {{ car.model }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>