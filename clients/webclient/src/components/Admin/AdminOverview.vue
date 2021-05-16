<template>
    <main>
        <v-row>
            <v-col>
                <v-sheet height="64">
                    <v-spacer />
                    <v-toolbar flat>
                        <v-btn outlined @click="setToday"> I dag </v-btn>
                        <v-btn fab text small @click="prev">
                            <v-icon small>mdi-chevron-left</v-icon>
                        </v-btn>
                        <v-btn fab text small @click="next">
                            <v-icon small>mdi-chevron-right</v-icon>
                        </v-btn>
                        <v-toolbar-title v-if="$refs.calendar">
                            {{ $refs.calendar.title }}
                        </v-toolbar-title>
                    </v-toolbar>
                </v-sheet>
                <v-spacer />
                <v-sheet height="600">
                    <v-calendar
                        ref="calendar"
                        v-model="focus"
                        locale="no"
                        color="primary"
                        weekdays="1, 2, 3, 4, 5"
                        show-week
                        :now="today"
                        :events="events"
                        @click:event="showDeliveries"
                        @change="getEvents"
                    >
                    </v-calendar>
                </v-sheet>
            </v-col>
            <v-col>
                <Deliveries v-if="showList" :date="selectedDate" @update="deliveriesUpdated" />
            </v-col>
        </v-row>
    </main>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import Deliveries from './Deliveries.vue'
import  api from "../../api/api";
import {Userprofile} from '../../../../../server/src/interfaces'
import { Prop } from 'vue-property-decorator';

@Component({
	components: {
        Deliveries
    },
})
export default class AdminOverview extends Vue {
    @Prop() userprofile!: Userprofile;
    private today = new Date().toISOString().substr(0, 10);
	private focus = new Date().toISOString().substr(0, 10);
	private type = "month";
	private start: any | null = null;
	private end: any | null = null;
    private events: any[] = [];
    private showList = false;
    private selectedDate = "";

    mounted() {
		this.focus = "";
	}
	viewDay(day: any) {
		this.focus = day.date;
		this.type = "day";
	}
	setToday() {
		this.focus = "";
	}
	prev() {
		(this.$refs.calendar as any).prev();
	}
	next() {
		(this.$refs.calendar as any).next();
	}

    async getEvents( {start, end}:{start:any, end:any} ) {
        this.start = start;
		this.end = end;
        this.populateCalendar();
    }

    async populateCalendar() {
        const vendor = await api.getVendor(this.userprofile!.email);
        let schedule = vendor!.schedule;
        let events: any[] = [];
        if (this.start && this.end) {
            let deliveries = await api.getAllVendorsDeliveriesSummary(this.start.date, this.end.date);
            if (deliveries) {
                deliveries.forEach(del => {
                    const delStart = new Date(`${del.date.substring(0,10)}T00:00:00`);
                    const delEnd = new Date(`${del.date.substring(0,10)}T23:59:59`);
                    const menu = schedule.find(({id}) => id == del.menuId);

                    events.push({
                        name: menu!.menu + ": " + (del.count-del.cancelled) + "/" + del.count,
                        start: delStart,
                        end: delEnd, 
                        color: (del.count == del.cancelled)? "grey" : "green" 
                    });
                });
                this.events = events;
            }
        }
    }

    showDeliveries(event:any) {
        this.selectedDate = event.day.date;
        this.showList = true;
    }

    deliveriesUpdated() {
        this.populateCalendar();
    }
}
</script>
