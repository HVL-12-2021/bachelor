<template>
    <v-container>
        <v-row>
            <v-col>
                <h1 class="primary--text">Min profil</h1>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <h2>{{ fullname }}</h2>
            </v-col>
            <v-col>
                <v-btn class="mx-2" fab dark small color="primary">
                    <v-icon dark> mdi-pencil </v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <h3>{{ address }}</h3>
            </v-col>
            <v-col>
                <v-btn class="mx-2" fab dark small color="primary">
                    <v-icon dark> mdi-pencil </v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <h3>{{ phone }}</h3>
            </v-col>
            <v-col>
                <v-btn class="mx-2" fab dark small color="primary">
                    <v-icon dark> mdi-pencil </v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <h3>{{ email }}</h3>
            </v-col>
            <v-col>
                <v-btn class="mx-2" fab dark small color="primary">
                    <v-icon dark> mdi-pencil </v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <h3>Mine allergier: {{ allergies }}</h3>
            </v-col>
            <v-col>
                <v-btn class="mx-2" fab dark small color="primary">
                    <v-icon dark> mdi-pencil </v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-row>
        <v-col>
            <h3>Antall porsjoner: {{ noOfMeals }}</h3>
        </v-col>
            <v-col>
                <v-btn class="mx-2" fab dark small color="primary">
                    <v-icon dark> mdi-pencil </v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <h3>Valgt boks: {{ box }}</h3>
            </v-col>
            <v-col>
                <v-btn class="mx-2" fab dark small color="primary">
                    <v-icon dark> mdi-pencil </v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <h3>Leveringsdag: {{ schedule }}</h3>
            </v-col>
            <v-col>
                <v-btn class="mx-2" fab dark small color="primary">
                    <v-icon dark> mdi-pencil </v-icon>
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { MenuItems } from "../../../../server/src/interfaces";
import { getUserprofile, getUserSubscriptions } from "../api/api";

@Component
export default class CustomerProfile extends Vue {
    //Userprofile
    private fullname = "";
    private address = "";
    private phone = "";
    private email = "";
    private allergies: string[] = [];

    //Usersubscription
    private approved = false;
    private paused = false;
    private schedule: MenuItems[] = [];
    private noOfMeals = "";
    private box = "";


    async showUserProfile() {
        let userRes = await getUserprofile();
        if(userRes != null) {
            this.fullname = userRes.fullname;
            this.address = userRes.address;
            this.phone = userRes.phone;
            this.email = userRes.email;
            this.allergies = userRes.allergies;
        }

        //Må finnne en bedre måte å hente vendor på
        let vendor = "lunsj@hjul.no";
        let subscriptionRes = await getUserSubscriptions();
        if(subscriptionRes != null) {
        this.approved = subscriptionRes[0].approved;
        this.paused = subscriptionRes[0].paused;
        this.noOfMeals = subscriptionRes[0].noOfMeals.toString();
        this.box = subscriptionRes[0].box;
        this.schedule = subscriptionRes[0].schedule;
        }

    }

  beforeMount() {
        this.showUserProfile();
    }

}
</script>