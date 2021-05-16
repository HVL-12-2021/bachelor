import { DateWithMenuId, WeekTime } from './interfaces'

export function getDeliveryDates(startDate: Date, weekTimes: WeekTime[], no:number):DateWithMenuId[] {
    let nextDelivery = nextDeliveryDate(startDate, weekTimes);

    let count = 0;
    let deliveryDates: DateWithMenuId[] = [];

    while (count < no) {
        deliveryDates.push(nextDelivery);
        nextDelivery = nextDeliveryDate(nextDelivery.date, weekTimes);
        count++;
    }
    return deliveryDates;
}

export function noOfDeliveriesInMonth(startDate: Date, weekTimes: WeekTime[]):number {
    let nextDelivery = nextDeliveryDate(startDate, weekTimes);
    let count = 0;

    while (nextDelivery.date.getUTCMonth() == startDate.getUTCMonth()) {
        nextDelivery = nextDeliveryDate(nextDelivery.date, weekTimes);
        count++;
    }
    return count;
}

export function nextDeliveryDate(date: Date, weekTimes: WeekTime[]): DateWithMenuId | null {
    if (weekTimes.length == 0) {
        return null;
    }
    let weekTime = toWeekTime(date);
    let i = 0;
    while (i < weekTimes.length && lessThanOrEqual(weekTimes[i], weekTime)) {
        i++;
    }
    const millisPerDay = 1000 * 3600 * 24;
    let delta = 0;
    let menuId = "";

    if (i == weekTimes.length) {
        delta = ((7 + weekTimes[0].day - weekTime.day) * millisPerDay) + (weekTimes[0].time - weekTime.time);
        menuId = weekTimes[0].menuId;
    } else {
        delta = ((weekTimes[i].day - weekTime.day) * millisPerDay) + (weekTimes[i].time - weekTime.time);
        menuId = weekTimes[i].menuId;
    }

    return { 
        date: new Date(date.getTime() + delta),
        menuId
    }
}

function lessThanOrEqual(wt1: WeekTime, wt2: WeekTime) {
    if (wt1.day == wt2.day) {
        return wt1.time <= wt2.time;
    }
    return wt1.day < wt2.day
}

export function toWeekTime(date: Date): WeekTime {
    return {
        day: date.getUTCDay(),
        time: date.getUTCHours() * 3600000 + date.getUTCMinutes() * 60000 + date.getUTCSeconds() * 1000 + date.getUTCMilliseconds()
    }
}


