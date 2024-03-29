<template>
    <v-container>
        <v-row>
            <v-col :xl="6">
                <v-sheet>
                    <v-spacer />
                    <v-toolbar flat>
                        <v-btn 
                            outlined 
                            class="mr-4"
                            @click="setToday"
                        > 
                            I dag 
                        </v-btn>
                        <v-btn 
                            fab 
                            text 
                            small 
                            class="mr-4"
                            @click="prev"
                        >
                            <v-icon small>mdi-chevron-left</v-icon>
                        </v-btn>
                        <v-btn 
                            fab 
                            text 
                            small 
                            class="mr-4"
                            @click="next"
                        >
                            <v-icon small>mdi-chevron-right</v-icon>
                        </v-btn>
                        <v-toolbar-title v-if="$refs.calendar">
                            {{ $refs.calendar.title.charAt(0).toUpperCase() + $refs.calendar.title.slice(1) }}
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
            <v-dialog v-model="showList">
                <Deliveries :date="selectedDate" @update="deliveriesUpdated" @close="showList=false" />
            </v-dialog>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import Deliveries from './Deliveries.vue';
import api from "../../api/api";

@Component({
	components: {
        Deliveries
    },
})

export default class AdminCalendar extends Vue {
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
        const vendor = await api.getVendor(this.$store.getters.loggedInUser);
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