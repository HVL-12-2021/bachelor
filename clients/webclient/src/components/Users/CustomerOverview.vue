<template>
    <main>
        <v-row class="fill-height">
            <v-col>
                <v-sheet height="64">
                    <v-spacer></v-spacer>
                    <v-toolbar flat>
                        <v-btn
                            outlined
                            class="mr-4"
                            color="grey darken-2"
                            @click="setToday"
                        >
                            I dag
                        </v-btn>
                        <v-btn fab text stmall color="grey darken-2" @click="prev">
                            <v-icon small>mdi-chevron-left</v-icon>
                        </v-btn>
                        <v-btn fab text stmall color="grey darken-2" @click="next">
                            <v-icon small>mdi-chevron-right</v-icon>
                        </v-btn>
                        <v-toolbar-title v-if="$refs.calendar">
                            {{ $refs.calendar.title }}
                        </v-toolbar-title>
                    </v-toolbar>
                </v-sheet>
                <v-spacer></v-spacer>
                <v-sheet height="600">
                    <v-calendar
                        ref="calendar"
                        v-model="focus"
                        locale="no"
                        color="primary"
                        weekdays="1, 2, 3, 4, 5"
                        :events="events"
                        :now="today"
                        show-week
                        @click:event="showEvent"
                        @change="getEvents"
                    >
                    </v-calendar>
                </v-sheet>
            </v-col>
            <v-col>
                <v-card v-if="showCard && !selectedEvent.delivery.cancelled">
                    <v-card-title class="headline">
                        Kansellere levering
                    </v-card-title>
                    <v-card-text>
                        Er du sikker på at du ønsker å kansellere levering den
                        {{ this.selectedDate }}?
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="primary" @click="cancelDelivery()" >OK</v-btn>
                        <v-btn color="secondary" @click="showCard = false">Avbryt</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </main>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import api from "../../api/api";
import { Delivery, Userprofile } from "../../../../../server/src/interfaces";

@Component({})
export default class CustomerOverview extends Vue {
    private loading = false;
	@Prop() userprofile!: Userprofile;
    private today = new Date().toISOString().substr(0, 10);
    private focus = new Date().toISOString().substr(0, 10);
    private type = "month";
	private start: any | null = null;
	private end: any | null = null;
    private events: any[] = [];
    private showCard = false;
    private selectedEvent:any = null;
    private selectedDate = "";
    private dialog: boolean = false;

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


    async getEvents({ start, end }: { start: any; end: any }) {
        this.start = start;
        this.end = end;
        this.populateCalendar();
    }

    async populateCalendar() {
        let sub = await api.getUserSubscriptions();
        let schedule = sub[0].schedule;
        let events: any[] = [];
        if (this.start && this.end) {
            let deliveries = await api.getAllUsersDeliveries(this.start.date, this.end.date);
            if (deliveries) {
                deliveries.forEach((del) => {
                    const delStart = new Date(`${del.deliverytime.substring(0, 10)}T00:00:00`);
                    const delEnd = new Date(`${del.deliverytime.substring(0, 10)}T23:59:59`);
                    const menu = schedule.find(({ id }) => id == del.menuId);

                    events.push({
                        name: del.cancelled? "Kansellert" : menu!.menu,
                        start: delStart,
                        end: delEnd,
                        color: del.cancelled? "grey" : "green",
                        delivery: del
                    });
                });
                this.events = events;
            }
        }        
    }

    showEvent(event: any) {
        this.selectedEvent = event.event;
        this.selectedDate = event.day.date;
        this.showCard = true;
    }

    async cancelDelivery() {
        const deliveries: Delivery[] = [];
        deliveries.push(this.selectedEvent.delivery);
        if (!await api.cancelDeliveries(deliveries)) {
            alert ("Something went wrong");
        } else {
            this.populateCalendar();
            this.selectedEvent.delivery.cancelled = true;
        }
    }
}
</script>
