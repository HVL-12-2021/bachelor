<template>
    <v-container v-if="vendorProfile">
        <v-row>
            <v-col>
                <h2>Registrert informasjon</h2>
            </v-col>
        </v-row>
        <v-row>
            <v-col :xl="2" :lg="2" :md="2" :sm="2">
                <p class="font-weight-medium">Navn</p>
            </v-col>
            <v-col>
                <p class="font-weight-light"> {{ vendorProfile.fullname }} </p>
            </v-col>
        </v-row>
        <v-row>
            <v-col :xl="2" :lg="2" :md="2" :sm="2">
                <p class="font-weight-medium">Firmanavn</p>
            </v-col>
            <v-col>
                <p class="font-weight-light"> {{ vendorProfile.company }} </p>
            </v-col>
        </v-row>
        <v-row>
            <v-col :xl="2" :lg="2" :md="2" :sm="2">
                <p class="font-weight-medium">Adresse</p>
            </v-col>
            <v-col>
                <p class="font-weight-light"> {{ vendorProfile.address }} </p>
            </v-col>
        </v-row>
        <v-row>
            <v-col :xl="2" :lg="2" :md="2" :sm="2">
                <p class="font-weight-medium">Telefonnummer</p>
            </v-col>
            <v-col>
                <p class="font-weight-light"> {{ vendorProfile.phone }} </p>
            </v-col>
        </v-row>
        <v-row>
            <v-col :xl="2" :lg="2" :md="2" :sm="2">
                <p class="font-weight-medium">E-post</p>
            </v-col>
            <v-col>
                <p class="font-weight-light"> {{ vendorProfile.email }} </p>
            </v-col>
        </v-row>
        <v-row>
            <v-col :xl="2" :lg="2" :md="2" :sm="2">
                <p class="font-weight-medium">Leveringsplan</p>
            </v-col>
            <v-col>
                <div v-for="item in items" v-bind:key="item.id">
                    <p class="font-weight-light" > {{item.day + "  -  " + item.menu}} </p>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import api from "../../api/api";
import * as interfaces from "../../../../../server/src/interfaces"

@Component
export default class CustomerProfile extends Vue {
    private vendorProfile:interfaces.Vendor | null = null;
    private items: interfaces.MenuItems[] | null = [];
    
    async created() {
        const vendor = await api.getVendor(this.$store.getters.loggedInUser);
        this.vendorProfile = vendor;

        if (this.vendorProfile != null) {
            this.items = this.vendorProfile.schedule;
        }
    }
}

</script>