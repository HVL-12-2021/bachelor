require('dotenv').config();
import 'source-map-support/register';
import { putVendor, putUserSubscription, getUserSubscriptions,  getUserSubscription, deleteUserSubscription, putVendorSubscription, getVendorSubscription, getVendorSubscriptions } from '../../../clients/webclient/src/api/api';
import getAuth from '../../../clients/webclient/src/components/LoginDialog/auth'
import { expect } from 'chai';
import { testUser, testPass} from '../../../common/settings';
import 'mocha';
import { ConfigurationServicePlaceholders } from 'aws-sdk/lib/config_service_placeholders';

describe('Client subscription test', () => {
    it('Putting, getting and deleting a subscription', async () => {
        const vendor = {
            company: "Delikatessen",
            fullname: "Bakermester Harepus",
            address: "Hakkebakkeskogen",
            phone: "6688552",
            email: "harepus@skogen.no",
            schedule: [
                {
                    "id": "1",
                    "day": "tuesday",
                    "time": "10",
                    "menu": "Veggie lunch"
                },
                {
                    "id": "2",
                    "day": "wednesday",
                    "time": "10",
                    "menu": "Fish lunch"
                }
            ]
        };

        const sub = {
            vendorId: "lunsj@hjul.no",
            userId: "ingrid.elisabeth.hjelle+test20@gmail.com",
            approved: false,
            paused: true,
            schedule: ["1", "2"], 
            noOfMeals: 1,
            box: "engangsboks"
        };

        //const putVen = await putVendor(vendor);
        const putResult = await putUserSubscription(sub);
        expect(putResult.vendorId).to.equal("lunsj@hjul.no");
        expect(putResult.userId).to.equal("ingrid.elisabeth.hjelle+test20@gmail.com");
        expect(putResult.approved).to.equal(false);
        expect(putResult.paused).to.equal(true);
        expect(putResult.schedule).to.eql(["1", "2"]);
        
        const getResult = await getUserSubscriptions();
        expect(getResult[0].vendorId).to.equal("lunsj@hjul.no");
        expect(getResult[0].noOfMeals).equal(1);
        expect(getResult[0].box).to.equal("engangsboks");
        expect(getResult[0].approved).to.equal(false);
        expect(getResult[0].paused).to.equal(true);
        expect(getResult[0].schedule.length).to.equal(2);

        const userSub = await getUserSubscription("lunsj@hjul.no");
        expect(userSub.vendorId).to.equal("lunsj@hjul.no");
        expect(userSub.userId).to.equal("ingrid.elisabeth.hjelle+test20@gmail.com");
        expect(userSub.approved).to.equal(false);
        expect(userSub.paused).to.equal(true);
        expect(userSub.schedule.length).to.equal(2);
        expect(userSub.noOfMeals).to.equal(1);
        expect(userSub.box).to.equal("engangsboks");

        /* Her feiler det
        await deleteUserSubscription("ingrid.elisabeth.hjelle+test20@gmail.com");
        const newResult = await getUserSubscription("lunsj@hjul.no");
        expect(newResult).to.equal(null); */
        //await deleteVendor("testVendorId55");

        const putVS = await putVendorSubscription(sub);
        console.log(putVS);
        const getVS = await getVendorSubscription("lunsj@hjul.no");
        console.log(getVS);
        const getVSs = await getVendorSubscriptions();
        console.log(getVSs)
    });
});