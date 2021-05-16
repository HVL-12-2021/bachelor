<template>
    <v-container>
        <v-card>
            <v-card-title>
                Kunder med aktiv abonnement
                <v-spacer></v-spacer>
                <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Søk"
                    single-line
                    hide-details
                ></v-text-field>
            </v-card-title>
            <v-data-table
                dense
                :headers="headers"
                :items="activeUsers"
                item-key="userId"
                :search="search"
                class="elevation-1">
            </v-data-table>
        </v-card>
        <br />
        <v-card>
            <v-card-title>
                Kunder med abonnement på pause
                <v-spacer></v-spacer>
                <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Søk"
                    single-line
                    hide-details
                ></v-text-field>
            </v-card-title>
            <v-data-table
                dense
                :headers="headers"
                :items="pausedUsers"
                item-key="userId"
                :search="search"
                class="elevation-1">
            </v-data-table>
        </v-card>
        <br />
        <v-card v-if="unapprovedUsers.length > 0">
            <v-card-title>
                Kunder til godkjenning
                <v-spacer></v-spacer>
                <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Søk"
                    single-line
                    hide-details
                ></v-text-field>
            </v-card-title>
            <v-data-table
                :headers="headersExtra"
                :items="unapprovedUsers"
                :search="search"
                class="elevation-1"
                >
            <template v-slot:[`item.controls`]="props">
                <v-btn class="mx-2" fab dark small color="green" @click="approve(props.item)">
                    <v-icon dark>mdi-checkbox-marked-circle-outline</v-icon>
                </v-btn>
            </template>
            </v-data-table>
        </v-card>
    </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import api from "../../api/api";
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { UserSubscription } from '../../../../../server/src/interfaces';

@Component({
	components: {
	},
})
export default class AdminCustomers extends Vue {
    @Prop() loggedInUser!: string;
    private users: UserSubscription[] = []
    get activeUsers() {
        return this.users.filter((user) => {
            return user.approved && !user.paused;
        });
    }
    get pausedUsers() {
        return this.users.filter((user) => {
            return user.approved && user.paused;
        });
    }
    get unapprovedUsers() {
        return this.users.filter((user) => {
            return !user.approved;
        });
    }
    private search = "";
    private headers = [
        {
          text: "Navn",
          align: 'start',
          sortable: true,
          value: "fullname",
        },
        { text: "Adresse", value: "address" },
        { text: "Telefon", value: "phone" },
        { text: "Epost", value: "email" },
        { text: "Boks", value: "box" },
        { text: "Antall", value: "noOfMeals" },
        { text: "Allergier", value: "allergies" },
        { text: "Leveringsdager", value: "days" }
    ];
    private headersExtra = [
        {
          text: "Navn",
          align: 'start',
          sortable: true,
          value: "fullname",
        },
        { text: "Adresse", value: "address" },
        { text: "Telefon", value: "phone" },
        { text: "Epost", value: "email" },
        { text: "Boks", value: "box" },
        { text: "Antall", value: "noOfMeals" },
        { text: "Allergier", value: "allergies" },
        { text: "Leveringsdager", value: "days" },
        { text: "", value: "controls", sortable: false }
    ];

    async created() {
        let users = await api.getVendorSubscriptions();
        this.users = users.map((user) => {
            return {
                ...user, 
                days: this.deliveryDays(user)
            }
        });
    }

    deliveryDays(item: UserSubscription) {
        return item.schedule.map((menuItem) => {
            return menuItem.day;
        });
    }

    async approve(item: UserSubscription) {
        try {
            await api.updateApproval(item.userId, true);
            item.approved = true;
        } catch (err) {
            alert("Noe gikk galt, prøv igjen senere.");
            console.log(err);
        }
    }
}
</script>