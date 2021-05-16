require('dotenv').config();
import 'source-map-support/register';
import { expect } from 'chai';
import 'mocha';
import { WeekTime } from '../../interfaces'
import { nextDeliveryDate, toWeekTime, noOfDeliveriesInMonth, getDeliveryDates } from '../../../../common/timeHandling'

describe('Date and time tests', () => {
    it('From date to WeekTime',  () => {
        let result:WeekTime = toWeekTime(new Date("2021-12-17T03:24:05.000Z"));
        expect(result.day).equal(5);
        expect(result.time).equal(3 * 1000 * 3600 + 24 * 60 * 1000 + 5*1000);
    });

    it('Find next weekTimes',  () => {
        let schedule: WeekTime[] = [{
            menuId: "2",
            day: 2,
            time: 1000
        },
        {
            menuId: "3",
            day: 3,
            time: 1000
        },
        {
            menuId: "41",
            day: 4,
            time: 1000
        },
        {
            menuId: "43",
            day: 4,
            time: 2000 
        }];
        let result = nextDeliveryDate(new Date("2021-11-17T03:24:05.000Z"), schedule);
        expect(result.menuId).equal("41");
        expect(result.date.getUTCDay()).equal(4);
        expect(result.date.getUTCDate()).equal(18);
        expect(result.date.getUTCMonth()).equal(10);
        expect(result.date.getUTCFullYear()).equal(2021);

        let wrap = nextDeliveryDate(new Date("2021-11-19T03:24:05.000Z"), schedule);
        expect(wrap.menuId).equal("2");
        expect(wrap.date.getUTCDay()).equal(2);
        expect(wrap.date.getUTCDate()).equal(23);
        expect(wrap.date.getUTCMonth()).equal(10);
        expect(wrap.date.getUTCFullYear()).equal(2021);
    });
    it('Find next weekTimes',  () => {
        let schedule: WeekTime[] = [{
            menuId: "2",
            day: 2,
            time: 1000
        }];
        let result = nextDeliveryDate(new Date("2021-05-03T03:24:05.000Z"), schedule);
        expect(result.menuId).equal("2");
        expect(result.date.getDay()).equal(2);
        expect(result.date.getDate()).equal(4);
        expect(result.date.getMonth()).equal(4);
        expect(result.date.getUTCFullYear()).equal(2021);

        let wrap = nextDeliveryDate(new Date("2021-05-05T03:24:05.000Z"), schedule);
        expect(result.menuId).equal("2")
        expect(wrap.date.getDay()).equal(2);
        expect(wrap.date.getDate()).equal(11);
        expect(wrap.date.getMonth()).equal(4);
        expect(wrap.date.getUTCFullYear()).equal(2021);
    });
    it('Count deliveries in a month',  () => {
        let schedule: WeekTime[] = [{
            day: 2,
            time: 1000*3600*6
        },
        {
            day: 3,
            time: 1000*3600*6
        },
        {
            day: 4,
            time: 1000*3600*6
        }];
        let result = noOfDeliveriesInMonth(new Date("2021-06-01T05:00:00.000Z"), schedule);
        expect(result).equal(14);
    });
    it('Find next delivery dates',  () => {
        let schedule: WeekTime[] = [{
            menuId: "2",
            day: 2,
            time: 1000
        },
        {
            menuId: "3",
            day: 3,
            time: 1000
        },
        {
            menuId: "41",
            day: 4,
            time: 1000
        },
        {
            menuId: "43",
            day: 4,
            time: 2000 
        }];
        let result = getDeliveryDates(new Date("2021-05-01T01:05:05.000Z"), schedule, 10);
        expect(result.length).equal(10);
        expect(result[0].date.getDay()).equal(2);
        expect(result[1].date.getDay()).equal(3);
        expect(result[2].date.getDay()).equal(4);
        expect(result[3].date.getDay()).equal(4);
        expect(result[4].date.getDay()).equal(2);
        expect(result[5].date.getDay()).equal(3);
        expect(result[6].date.getDay()).equal(4);
        expect(result[7].date.getDay()).equal(4);
        expect(result[0].menuId).equal("2");

        let result2 = getDeliveryDates(new Date("2021-05-01T00:00:05.000Z"), schedule, 5);
        expect(result2[0].date.getDay()).equal(2);

        let result3 = getDeliveryDates(new Date("2021-05-03T22:00:01.000Z"), schedule, 1);
        expect(result3[0].date.getDay()).equal(2);
    });
    it('Millisecond test',  () => {
        let schedule: WeekTime[] = [{
            menuId: "1",
            day: 1,
            time: 10
        },
        {
            menuId: "2",
            day: 2,
            time: 10
        }];
        let result = getDeliveryDates(new Date("2021-05-01T06:00:00.000Z"), schedule, 10);
        expect(result.length).equal(10);
        expect(result[0].date.getUTCDay()).equal(1);
        expect(result[1].date.getUTCDay()).equal(2);
        expect(result[2].date.getUTCDay()).equal(1);
        expect(result[3].date.getUTCDay()).equal(2);
        expect(result[4].date.getUTCDay()).equal(1);
        expect(result[5].date.getUTCDay()).equal(2);
        expect(result[6].date.getUTCDay()).equal(1);
        expect(result[7].date.getUTCDay()).equal(2);
        expect(result[0].menuId).equal("1");

    });
});

