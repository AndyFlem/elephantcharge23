<script setup>
  import { ref, reactive, inject, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { DateTime } from 'luxon'

  
  const axiosPlain = inject('axiosPlain')
  const route = useRoute()

  const state = reactive({
    chargeId: null,
    charge: null
  })
  
  const chargeFormShow = ref(false)

  watch(
    () => route.params.charge_id,
    chargeId => {
      state.chargeId = parseInt(chargeId)
      axiosPlain.get('/charge/' + chargeId)
          .then(rows => {
            state.charge = rows.data
          })
    }, { immediate: true }
  )

</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" class="pb-0">
        <v-card v-if="state.charge" elevation="0" border rounded>
            <v-card-title class="d-flex pb-0">
              <span class="text-h4">{{ state.charge.charge_name }}</span>
            </v-card-title>
            <v-card-text class="pt-1 pb-1">
              {{ DateTime.fromISO(state.charge.charge_date).toFormat('ccc d LLL y') }} {{ DateTime.fromISO(state.charge.start_time).toFormat('HH:mm') }}-{{ DateTime.fromISO(state.charge.end_time).toFormat('HH:mm') }}, <i>{{ state.charge.location }}.</i>
            </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>