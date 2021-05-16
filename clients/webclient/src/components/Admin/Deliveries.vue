<template>
    <v-card>
        <v-card-title>Leveringer for {{date}}</v-card-title>
        <v-data-table
            :loading="loading"
            dense
            :headers="headers"
            :items="deliveryDetails"
            class="elevation-1">
            <template v-slot:item="{ item }">
                <tr :key="item.userId">
                    <td class ="handle" ><v-btn icon><v-icon small>mdi-cursor-move</v-icon></v-btn></td>
                    <td>{{item.fullname}}</td>
                    <td>{{item.address}}</td>
                    <td>{{item.phone}}</td>
                    <td>{{item.box}}</td>
                    <td>{{item.noOfMeals}}</td>
                    <td>{{item.allergies.toString()}}</td>
                    <td>{{item.cancelled? "Ja" : "Nei"}}</td>
                </tr>
            </template>
        </v-data-table>
        <v-card-actions class="justify-center">
            <v-btn color="primary" @click="cancelDeliveries">Kanseller alle</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import api from "../../api/api";
import {DeliveryDetail} from "../../../../../server/src/interfaces"
import { Prop, Watch } from 'vue-property-decorator';
import Sortable from 'sortablejs'

@Component({
	components: {},
})
export default class Deliveries extends Vue {
    private loading = false;
    @Prop() date!: string;
    private start = "";
    private end = "";
    private deliveryDetails:DeliveryDetail[] = [];
    @Watch("date", { immediate: true })
    async onDateChanged() {
        if (this.date) {
            let startDate = new Date(this.date+"T00:00:00");
            let endDate = new Date(this.date+"T23:59:59");
            let UTCStartDate = startDate.toISOString();
            let UTCEndDate = endDate.toISOString();
            this.loading = true;
            try {
                this.deliveryDetails = await api.getDeliveryDetails(UTCStartDate, UTCEndDate);
            } catch (err) {
                console.log(err);
            } finally {
                this.loading = false;
            }
        }
    }
    private headers = [
        {
            text: "",
            align: "left",
            sortable: false
        },
        {
          text: "Navn",
          align: 'start',
          sortable: true,
          value: "fullname",
        },
        { text: "Adresse", value: "address" },
        { text: "Telefon", value: "phone" },
        { text: "Boks", value: "box" },
        { text: "Antall", value: "noOfMeals" },
        { text: "Allergier", value: "allergies" },
        { text: "Kansellert", value: "cancelled" }
    ];

    mounted() {
        let table = document.querySelector(".v-data-table__wrapper tbody") as HTMLElement;
        const _self = this;
        if (table) {
            Sortable.create(table, {
                handle: ".handle",
                animation: 150,
                onEnd({newIndex, oldIndex}) {
                    const rowSelected = _self.deliveryDetails.splice(oldIndex!, 1)[0];
                    _self.deliveryDetails.splice(newIndex!, 0, rowSelected);
                }
            });
        }
    }

    async cancelDeliveries() {
        if (!await api.cancelDeliveries(this.deliveryDetails)) {
            alert ("Something went wrong");
        } else {
            this.$emit("update");
            this.deliveryDetails.forEach( del => {
                del.cancelled = true;
            });
        }
    }
}
</script>

<style scoped>
.handle {
    cursor: move !important;
    cursor: -webkit-grabbing !important;
}
</style>