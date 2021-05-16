<template>
    <v-form>
        <v-container>
            <v-row>
                <v-col>
                    <h1>Bestillingsforespørsel</h1>
                </v-col>
            </v-row>
            <v-row class="text-center">
                <v-col>
                    <v-text-field
                        label="Fornavn"
                        v-model="firstName"
                    ></v-text-field>
                </v-col>
                <v-col>
                    <v-text-field
                        label="Etternavn"
                        v-model="lastName"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row class="text-center">
                <v-col>
                    <v-text-field
                        label="Gateadresse"
                        v-model="address"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row class="text-center">
                <v-col cols="4">
                    <v-text-field
                        :rules="[numbers, postNoLength]"
                        label="Postnummer"
                        v-model="postNo"
                        required
                    ></v-text-field>
                </v-col>
                <v-col>
                    <v-text-field
                        label="Poststed"
                        v-model="postPlace"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row class="text-center">
                <v-col cols="4">
                    <v-text-field
                        :rules="[numbers, phoneNoLength]"
                        label="Telefonnummer"
                        v-model="phone"
                        required
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <h4>Antall porsjoner</h4>
            </v-row>
            <v-row>
                <v-chip-group
                    v-model="selectedNoOfMeals"
                    active-class="blue--text text--accent-4"
                    mandatory
                >
                    <v-chip
                        v-for="meal in meals"
                        v-bind:key="meal.no"
                        v-bind:value="meal.no"
                        v-model="meal.selected"
                        filter
                        outlined
                    >
                        {{ meal.no }}
                    </v-chip>
                </v-chip-group>
            </v-row>
            <v-row>
                <h4>Velg leveringsdager</h4>
            </v-row>
            <v-row>
                <v-chip-group
                    v-model="selectedDeliveryDays"
                    active-class="blue--text text--accent-4"
                    multiple
                >
                    <v-chip
                        v-for="deliveryDay in deliveryDays"
                        v-bind:key="deliveryDay.id"
                        v-bind:value="deliveryDay.id"
                        v-model="deliveryDay.selected"
                        filter
                        outlined
                    >
                        {{ deliveryDay.day + " " + deliveryDay.menu }}
                    </v-chip>
                </v-chip-group>
            </v-row>
            <v-row>
                <h4>Hvor mange leveringer ønsker du?</h4>
            </v-row>
            <v-row>
                <v-chip-group
                    v-model="selectedDeliveries"
                    active-class="blue--text text--accent-4"
                    mandatory
                >
                    <v-chip
                        v-for="delivery in deliveries"
                        v-bind:key="delivery.type"
                        v-model="delivery.selected"
                        filter
                        outlined
                    >
                        {{ delivery.type }}
                    </v-chip>
                </v-chip-group>
            </v-row>
            <v-row>
                <h4>Hvilken type bokser ønsker du?</h4>
            </v-row>
            <v-row>
                <v-chip-group
                    v-model="selectedBox"
                    active-class="blue--text text--accent-4"
                    mandatory
                >
                    <v-chip
                        v-for="box in boxes"
                        v-bind:key="box.type"
                        v-bind:value="box.type"
                        v-model="box.selected"
                        filter
                        outlined
                    >
                        {{ box.type }}
                    </v-chip>
                </v-chip-group>
            </v-row>
            <v-row>
                <h4>Har du noen allergier</h4>
            </v-row>
            <v-row>
                <v-chip-group
                    v-model="selectedAllergies"
                    active-class="blue--text text--accent-4"
                    multiple
                >
                    <v-chip
                        v-for="allergy in allergies"
                        v-bind:key="allergy.name"
                        v-bind:value="allergy.name"
                        v-model="allergy.selected"
                        filter
                        outlined
                    >
                        {{ allergy.name }}
                    </v-chip>
                </v-chip-group>
            </v-row>
            <v-row>
                <v-text-field
                    label="Annen informasjon du vil legge til?"
                    v-model="add"
                ></v-text-field>
            </v-row>
            <v-row>
                <v-col>
                    <v-btn @click="sendToDb" color="primary" class="ma-1"
                        >Send inn</v-btn
                    >
                    <v-btn @click="logout" color="secondary" class="ma-1"
                        >Avbryt</v-btn
                    >
                </v-col>
            </v-row>
        </v-container>
    </v-form>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import api from "../../api/api";
import { MenuItems, Vendor} from "../../../../../server/src/interfaces";

@Component
export default class CustomerOrder extends Vue {
    @Prop() loggedInUser!: string;
    private vendor: Vendor | null = null;
    private firstName = "";
    private lastName = "";
    private address = "";
    private postNo = 0;
    private postPlace = "";
    private phone = 0;
    private meals = [
        { no: 1, selected: false },
        { no: 2, selected: false },
        { no: 3, selected: false },
        { no: 4, selected: false },
        { no: 5, selected: false },
        { no: 6, selected: false },
        { no: 7, selected: false },
        { no: 8, selected: false },
        { no: 9, selected: false },
        { no: 10, selected: false },
    ];
    private selectedNoOfMeals = 1;
    private deliveryDays: MenuItems[] = [];
    private selectedDeliveryDays = [];
    private deliveries = [
        { type: "Abonnement (kr. 137 per levering)", selected: false },
        { type: "Ei enkelt levering 149 kr", selected: false },
    ];
    private selectedDeliveries = [];
    private boxes = [
        { type: "Engangsboks", selected: false },
        { type: "Gjenbruksbokser (depositum kr 218)", selected: false },
    ];
    private selectedBox = "";
    private allergies = [
        { name: "Gluten", selected: false },
        { name: "Skalldyr", selected: false },
        { name: "Egg", selected: false },
        { name: "Fisk", selected: false },
        { name: "Peanøtter", selected: false },
        { name: "Nøtter", selected: false },
        { name: "Melk", selected: false },
        { name: "Soya", selected: false },
        { name: "Selleri", selected: false },
        { name: "Sennep", selected: false },
        { name: "Sesam", selected: false },
        { name: "Svovel", selected: false },
        { name: "Lupin", selected: false },
        { name: "Bløtdyr", selected: false },
    ];
    private selectedAllergies = [];
    private add = "";

    // Rules:
    numbers(value: string) {
        return (
            !isNaN(parseInt(value)) || "Vennligst oppgi et gyldig postnummer"
        );
    }
    postNoLength(value: string) {
        return value.length == 4 || "Vennligst oppgi et gyldig postnummer";
    }
    phoneNoLength(value: string) {
        return value.length >= 8 || "Vennligst oppgi et gyldig telefonnummer";
    }

    logout() {
        this.$emit("logout");
    }

    async getVendor() {
        let vendors = await api.getAllVendors();
        this.vendor = vendors![0]
        if (this.vendor) {
            this.deliveryDays = this.vendor.schedule;
        }
    }

    async sendToDb() {
        let newUserprofile = {
            fullname: this.firstName + " " + this.lastName,
            address: this.address + " " + this.postNo + " " + this.postPlace,
            phone: this.phone.toString(),
            email: this.loggedInUser,
            allergies: this.selectedAllergies,
            isVendor: false,
        };

        let subscription = {
            vendorId: this.vendor!.vendorId!,
            userId: this.loggedInUser,
            approved: false,
            paused: false,
            schedule: this.selectedDeliveryDays,
            noOfMeals: this.selectedNoOfMeals,
            box: this.selectedBox,
        };
        await api.putUserprofile(newUserprofile);
        await api.putUserSubscription(subscription);
        this.$emit("newUserprofile", newUserprofile);
    }

    async created() {
        this.getVendor();
    }
}
</script>
