<script setup>
  import { onCreated } from 'vue'

  onCreated(() => {
    console.log(`the component is now mounted.`)
  })
</script>
<template>
  <v-container fluid>
    <v-row>
      <v-col class="" cols="12">
        <v-card>
        <v-card-title>Charges</v-card-title>
        <v-card-text>

        </v-card-text>
      </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>