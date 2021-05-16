<template>
    <v-card>
        <v-card-title>Valgt kunde</v-card-title>
        <br />
        <v-card-text v-if="!selectedUser">
            <v-row>
                <v-col>
                    <p> Velg en kunde </p>
                </v-col>
            </v-row>
        </v-card-text>
        <v-card-text v-if="selectedUser">
            <v-row>
                <v-col :cols="5">
                    <p class="font-weight-medium"> Navn </p>
                </v-col>
                <v-col>
                    <p class="font-weight-light"> {{ selectedUser.fullname }} </p>
                </v-col>
            </v-row>
            <v-row>
                <v-col :cols="5">
                    <p class="font-weight-medium"> Adresse </p>
                </v-col>
                <v-col>
                    <p class="font-weight-light"> {{ selectedUser.address }} </p>
                </v-col>
            </v-row>
            <v-row>
                <v-col :cols="5">
                    <p class="font-weight-medium"> Telefon </p>
                </v-col>
                <v-col>
                    <p class="font-weight-light"> {{ selectedUser.phone }} </p>
                </v-col>
            </v-row>
            <v-row>
                <v-col :cols="5">
                    <p class="font-weight-medium"> Epost </p>
                </v-col>
                <v-col>
                    <p class="font-weight-light"> {{ selectedUser.email }} </p>
                </v-col>
            </v-row>
            <v-row>
                <v-col :cols="5">
                    <p class="font-weight-medium"> Siste betalte levering </p>
                </v-col>
                <v-col>
                    <p class="font-weight-light"> {{selectedUser.lastDeliveryDate}} </p>
                </v-col>
            </v-row>
            <v-row>
                <v-col :cols="5">
                    <v-row>
                        <v-col>
                            <p class="font-weight-medium"> Ubetalte måltid i {{selectedMonth}} </p>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-btn @click="prev()">Forrige</v-btn>
                            <v-btn @click="next()">Neste</v-btn>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col>
                    <p class="font-weight-light"> {{unpaidDeliveries}} </p>
                </v-col>
            </v-row>
        </v-card-text>
        <v-card-actions v-if="selectedUser">
            <v-btn  @click="dialog = true" color="primary">Registrer betaling </v-btn>
            <v-dialog v-model="dialog" max-width="400" max-height="800">
                <v-card>
                    <v-card-title class="headline">
                        Registrer betaling
                    </v-card-title>
                    <v-card-text>
                        <p class="font-weight-medium">Navn</p>
                        <p class="font-weight-light">{{selectedUser.fullname}}</p> 
                        <v-text-field v-model="paidDeliveries" label="Betalte leveringer"></v-text-field>
                        <p class="font-weight-medium">Sett første leveringsdato: </p>
                        <v-date-picker
                            v-model="picker"
                            no-title
                            scrollable>
                        </v-date-picker>
                    </v-card-text>
                    <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="green darken-1"
                        text
                        @click="registerPayment()">
                        Registrer
                    </v-btn>
                    <v-btn
                        color="green darken-1"
                        text
                        @click="dialog = false">
                        Avbryt
                    </v-btn>
                    </v-card-actions>
                </v-card>
                </v-dialog>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import api from '../../api/api'
import * as interfaces from "../../../../../server/src/interfaces";

@Component
export default class CustomerPayment extends Vue {
    @Prop() selectedUser!:interfaces.UserSubscription | null; 
    private dialog = false;
    private picker = new Date().toISOString().substr(0, 10);
    private paidDeliveries = 0;
    private unpaidDeliveries = 0;
    private monthOffset = 1;
    get selectedMonth() {
        return this.toYearMonth(this.nextMonth());
    }
    @Watch("selectedUser")
    async onChange() {
        if (this.selectedUser != null) {
            this.updateUnpaidDeliveries();
        }
    }
    async updateUnpaidDeliveries() {
        if (this.selectedUser?.lastDeliveryDate) {
            let date = this.selectedUser.lastDeliveryDate;
            let lastDelivery = new Date(date);
            let selectedDate = new Date(this.nextMonth());
            if (selectedDate.getTime() < lastDelivery.getTime()) {
                if (selectedDate.getUTCMonth() == lastDelivery.getUTCMonth()
                    && selectedDate.getUTCFullYear() == lastDelivery.getUTCFullYear()) {
                    this.unpaidDeliveries = await api.getUnpaidDeliveries(this.selectedUser.userId, this.selectedMonth, this.selectedUser.lastDeliveryDate);
                } else {
                    this.unpaidDeliveries = 0; 
                }
            } else {
                this.unpaidDeliveries = await api.getUnpaidDeliveries(this.selectedUser.userId, this.selectedMonth);
            }
            this.paidDeliveries = this.unpaidDeliveries;
        }
    }

    nextMonth() {
        let now = new Date();
        return new Date(now.getFullYear(), now.getMonth()+this.monthOffset, 1);
    }

    toYearMonth(date:Date) {
        let monthNo = date.getMonth() + 1; 
        let month = monthNo.toString();
        if (monthNo < 10) {
            month = "0" + monthNo;
        }
        return date.getFullYear().toString() + "-" + month;  
    }

    async prev() {
        this.monthOffset --;
        this.updateUnpaidDeliveries();
    }
    async next() {
        this.monthOffset ++;
        this.updateUnpaidDeliveries();
    }

    async registerPayment() {
        let time = new Date(this.picker).toISOString();
        if (this.selectedUser?.userId) {
            await api.postNewDeliveries(time, this.paidDeliveries, this.selectedUser.userId);
            this.dialog = false;
        }
    }
    
}
</script>