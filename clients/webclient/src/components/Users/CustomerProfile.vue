<template>
    <v-container v-if="subscription">
        <div v-if="showUserprofile">
            <v-row>
                <v-col :cols="5">
                    <h1 class="primary--text">Min profil</h1>
                </v-col>
                <v-col>
                    <v-btn
                        v-if="showUserprofile"
                        color="primary"
                        @click="sendToCustomerOrder"
                    >
                        <v-icon left>mdi-pencil</v-icon>Endre profil
                    </v-btn>
                </v-col>
            </v-row>
            <v-row>
                <v-col :cols="2">
                    <p class="font-weight-black">Navn</p>
                </v-col>
                <v-col>
                    <p class="font-weight-light">
                        {{ userprofile.fullname }}
                    </p>
                </v-col>
            </v-row>
            <v-row>
                <v-col :cols="2">
                    <p class="font-weight-black">Adresse</p>
                </v-col>
                <v-col>
                    <p class="font-weight-light">{{ userprofile.address }}</p>
                </v-col>
            </v-row>
            <v-row>
                <v-col :cols="2">
                    <p class="font-weight-black">Telefonnummer</p>
                </v-col>
                <v-col>
                    <p class="font-weight-light">{{ userprofile.phone }}</p>
                </v-col>
            </v-row>
            <v-row>
                <v-col :cols="2">
                    <p class="font-weight-black">Epost</p>
                </v-col>
                <v-col>
                    <p class="font-weight-light">{{ userprofile.email }}</p>
                </v-col>
            </v-row>
            <v-row>
                <v-col :cols="2">
                    <p class="font-weight-black">
                        <label for="allergylist">Mine allergier</label>
                    </p>
                </v-col>
                <v-col>
                    <p
                        class="font-weight-light"
                        v-for="allergy in allergies"
                        :key="allergy"
                        id="allergylist"
                    >
                        {{ allergy }}
                    </p>
                </v-col>
            </v-row>
            <v-row>
                <v-col :cols="2">
                    <p class="font-weight-black">Antall porsjoner</p>
                </v-col>
                <v-col>
                    <p class="font-weight-light">
                        {{ subscription.noOfMeals }}
                    </p>
                </v-col>
            </v-row>
            <v-row>
                <v-col :cols="2">
                    <p class="font-weight-black">Valgt boks</p>
                </v-col>
                <v-col>
                    <p class="font-weight-light">{{ subscription.box }}</p>
                </v-col>
            </v-row>
            <v-row>
                <v-col :cols="2">
                    <p class="font-weight-black">Leveringsdag</p>
                </v-col>
                <v-col>
                    <p
                        class="font-weight-light"
                        v-for="item in items"
                        v-bind:key="item.id"
                    >
                        {{ item.day + "  -  " + item.menu }}
                    </p>
                </v-col>
            </v-row>
            <v-row>
                <v-btn @click="dialog = true" color="primary">
                    {{ this.buttonText }}
                </v-btn>
                <v-dialog v-model="dialog" persistent max-width="300">
                    <v-card>
                        <v-card-title class="headline">
                            {{ this.buttonText }}
                        </v-card-title>
                        <v-card-text> {{ this.dialogText }} </v-card-text>
                        <v-btn
                            color="green darken-1"
                            text
                            @click="toggleSubscriptionPause()"
                        >
                            OK
                        </v-btn>
                        <v-btn
                            color="green darken-1"
                            text
                            @click="dialog = false"
                        >
                            Avbryt
                        </v-btn>
                    </v-card>
                </v-dialog>
            </v-row>
        </div>
        <div v-if="editUserprofile">
            <v-row>
                <v-col :cols="5">
                    <v-btn
                        v-if="editUserprofile"
                        color="secondary"
                        @click="cancel"
                    >
                        Avbryt
                    </v-btn>
                </v-col>
                <v-col>
                    <CustomerOrder :loggedInUser="loggedInUser" />
                </v-col>
            </v-row>
        </div>
    </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import {
    MenuItems,
    Userprofile,
    VendorSubscription,

} from "../../../../../server/src/interfaces";
import CustomerOrder from "./CustomerOrder.vue";
import { Prop } from "vue-property-decorator";
import api from "../../api/api";

@Component({
    components: {
        CustomerOrder,
    },
})
export default class CustomerProfile extends Vue {
    @Prop() userprofile!: Userprofile;
    @Prop() loggedInUser!: string;
    private subscription: VendorSubscription | null = null;
    private items: MenuItems[] | null = [];
    private allergies = this.userprofile.allergies;
    private editUserprofile: boolean = false;
    private showUserprofile: boolean = true;
    private dialog: boolean = false;

    sendToCustomerOrder() {
        this.editUserprofile = true;
        this.showUserprofile = false;
    }

    cancel() {
        this.editUserprofile = false;
        this.showUserprofile = true;
    }

    async created() {
        const subs = await api.getUserSubscriptions();
        if (subs != null && subs.length > 0) {
            this.items = subs[0].schedule;
            this.subscription = subs[0];
        }
    }

    async toggleSubscriptionPause() {
        this.dialog = false;
        if (this.subscription) {
            let sub = await api.getUserSubscription(this.subscription.vendorId);
            if (sub) {
                this.subscription.paused = !this.subscription.paused;
                sub.paused = this.subscription.paused;
                await api.putUserSubscription(sub);
            }
        }
    }

    get buttonText() {
        if (this.subscription?.paused) {
            return "Aktiver abonnement";
        } 
        return "Pause abonnement";
    }

    get dialogText() {
        if (this.subscription?.paused) {
            return "Du aktiverer nå ditt abonnement igjen";
        } 
        return "Du setter nå ditt abonnement på pause";
    }

}
</script>