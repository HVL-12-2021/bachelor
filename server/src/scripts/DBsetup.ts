require('dotenv').config();
import 'source-map-support/register';
import { putSubscriptionInDb, putUserprofileInDb, putVendorInDb, saveDeliveriesToDb } from '../dbUtils';
import {dbUser1, dbUser2, dbUser3, dbUser4, dbUser5, dbVendor} from '../../../common/settings'
import { generateDeliveries } from '../addDeliveries';

const userprofile1 = {
    fullname: "Ole Olsen",
    address: "Smauet 110 5000 Sentrum",
    phone: "12345678",
    email: dbUser1,
    allergies: ["melk"],
    isVendor: false
}
const userprofile2 = {
    fullname: "Olga Karidotter",
    address: "Sollien 8 5001 Lien",
    phone: "23456789",
    email: dbUser2,
    allergies: [],
    isVendor: false
}
const userprofile3 = {
    fullname: "Stig Hugo",
    address: "Lauvstien 31 5000 Sentrum",
    phone: "34567890",
    email: dbUser3,
    allergies: ["løk, svovel"],
    isVendor: false
}
const userprofile4 = {
    fullname: "Katy Sekken",
    address: "Oppoverbakken 17 5000 Sentrum",
    phone: "45678901",
    email: dbUser4,
    allergies: ["gluten"],
    isVendor: false
}
const userprofile5 = {
    fullname: "Jan Jankovich",
    address: "Lykkegata 8 5002 Øvreåsen",
    phone: "56789012",
    email: dbUser5,
    allergies: [],
    isVendor: false
}
const userprofileVendor = {
    fullname: "Helene Haare",
    address: "Hakkebakken 2 5003 Skogen",
    phone: "67890123",
    email: dbVendor,
    allergies: [],
    isVendor: true
}

export async function addUsersToDb() {
    await putUserprofileInDb(userprofile1, dbUser1);
    await putUserprofileInDb(userprofile2, dbUser2);
    await putUserprofileInDb(userprofile3, dbUser3);
    await putUserprofileInDb(userprofile4, dbUser4);
    await putUserprofileInDb(userprofile5, dbUser5);
    await putUserprofileInDb(userprofileVendor, dbVendor);
}

const vendor = {
    company: "Delikatessen",
    fullname: "Bakermester Harepus",
    address: "Hakkebakkeskogen",
    phone: "6688552",
    email: dbVendor,
    schedule: [
        {
            "id": "2",
            "day": "Tirsdag",
            "time": "1000",
            "menu": "Lunsj"
        },
        {
            "id": "3",
            "day": "Onsdag",
            "time": "1000",
            "menu": "Lunsj"
        },
        {
            "id": "41",
            "day": "Torsdag",
            "time": "1000",
            "menu": "Lunsj med fisk"
        }
    ]
};

export async function addVendorToDb() {
    await putVendorInDb(vendor, dbVendor)
}

const sub1 = {
    vendorId: dbVendor,
    userId: dbUser1,
    approved: true,
    paused: false,
    schedule: ["2", "3"], 
    noOfMeals: 1,
    box: "Engangsboks"
}
const sub2 = {
    vendorId: dbVendor,
    userId: dbUser2,
    approved: true,
    paused: false,
    schedule: ["2"], 
    noOfMeals: 1,
    box: "Gjenbruksboks"
}
const sub3 = {
    vendorId: dbVendor,
    userId: dbUser3,
    approved: true,
    paused: false,
    schedule: ["41"], 
    noOfMeals: 1,
    box: "Engangsboks"
}
const sub4 = {
    vendorId: dbVendor,
    userId: dbUser4,
    approved: true,
    paused: false,
    schedule: ["3"], 
    noOfMeals: 1,
    box: "Engangsboks"
}
const sub5 = {
    vendorId: dbVendor,
    userId: dbUser5,
    approved: true,
    paused: false,
    schedule: ["2", "41"], 
    noOfMeals: 1,
    box: "Gjenbruksboks"
}

export async function addSubsToDb() {
    await putSubscriptionInDb(sub1, false);
    await putSubscriptionInDb(sub2, false);
    await putSubscriptionInDb(sub3, false);
    await putSubscriptionInDb(sub4, false);
    await putSubscriptionInDb(sub5, false);
}

export async function addDeliveriesToDb() {
    let date = new Date("2021-05-01");
    let deliveries1 = await generateDeliveries(date, dbUser1, dbVendor, 8);
    await saveDeliveriesToDb(deliveries1);
    let deliveries2 = await generateDeliveries(date, dbUser2, dbVendor, 4);
    await saveDeliveriesToDb(deliveries2);
    let deliveries3 = await generateDeliveries(date, dbUser3, dbVendor, 4);
    await saveDeliveriesToDb(deliveries3);
    let deliveries4 = await generateDeliveries(date, dbUser4, dbVendor, 4);
    await saveDeliveriesToDb(deliveries4);
    let deliveries5 = await generateDeliveries(date, dbUser5, dbVendor, 8);
    await saveDeliveriesToDb(deliveries5);
}
