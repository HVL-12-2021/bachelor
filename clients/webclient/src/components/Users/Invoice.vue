<template>
	<v-container>
        <v-row>
            <v-col :xl="2" :lg="3">
                <p class="font-weight-medium"> Siste levering i denne perioden: </p>
            </v-col>
            <v-col v-if="$store.getters.subscription">
                <p class="font-weight-regular"> {{ localPresentation(lastPaid)}} </p>
            </v-col>
            <v-col v-else>
                <p class="font-weight-regular"> Det er ikke registrert betaling for leveranser i denne perioden. </p>
            </v-col>
        </v-row>
        <v-row>
            <v-col :xl="2" :lg="3">
                <p class="font-weight-medium"> Neste faktura må betales innen: </p>
            </v-col>
            <v-col v-if="$store.getters.subscription">
                <p class="font-weight-regular"> {{localPresentation(nextInvoice)}} </p>
            </v-col>
            <v-col v-else>
                <p class="font-weight-regular"> Du vil få tilsendt faktura for neste periode så snart abonnementet ditt er blitt godkjent. </p>
            </v-col>
        </v-row>
	</v-container>
</template>

<script lang="ts">
import { toLocalPresentation } from "../../utils/utils";
import Vue from 'vue';
import Component from 'vue-class-component';

@Component

export default class CustomerInvoice extends Vue {
    get lastPaid() {
        if (this.$store.getters.subscription?.lastDeliveryDate) {
            return this.$store.getters.subscription.lastDeliveryDate;
        } 
        return "";
    }
    get nextInvoice() {
        if (this.$store.getters.subscription) {
            let dateForLastDelivery = new Date(this.lastPaid);
            dateForLastDelivery.setMonth(dateForLastDelivery.getMonth() + 1, 1);
            let nextInvoiceDate = new Date(dateForLastDelivery);
            if (this.$store.getters.subscription.paused == true) {
                return "Abonnementet ditt er satt på pause. Du vil ikke få ny faktura før abonnementet startes igjen."
            } else {
                return nextInvoiceDate.toISOString().substr(0,10);
            }
        }
        return "";
    }

    localPresentation(time: string) {
        return toLocalPresentation(time);
    }
}
</script>