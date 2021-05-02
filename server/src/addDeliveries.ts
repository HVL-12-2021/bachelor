import 'source-map-support/register'
import { Delivery, WeekTime } from './interfaces';
import { getDeliveryDates } from './timeHandling'
import { getSubscriptionsForUser } from './dbUtils'

export async function generateDeliveries(EarliestStartDate: Date, userId: string, vendor: string, noOfDeliveries: number): Promise<Delivery[]> {
    let subscriptions = await getSubscriptionsForUser(userId);
    if (!subscriptions) {
        throw "User " + userId + " does not exist"
    }
    let subscription =  subscriptions.find( ({vendorId}) => vendorId == vendor);
    if (!subscription) {
        throw "User " + userId + " has no subscription for vendor " + vendor;
    }

    let menuItems = subscription.schedule;

    let weekTimes:WeekTime[] = menuItems.map((item) => { 
        return {
            menuId: item.id,
            day: dayStringToInt(item.day),
            time: parseInt(item.time)
        }
    });

    let deliveryDates = getDeliveryDates(EarliestStartDate, weekTimes, noOfDeliveries);
    return deliveryDates.map((date) => {
        return {
            vendorId: vendor,
            userId,
            deliverytime: date.date.toISOString(),
            menuId: date.menuId!,
            cancelled: false
        }
    });
}

function dayStringToInt(day: string) {
    switch(day) {
        case 'Søndag':
            return 0;
        case 'Mandag':
            return 1;
        case 'Tirsdag':
            return 2;
        case 'Onsdag':
            return 3;
        case 'Torsdag':
            return 4;
        case 'Fredag':
            return 5;
        case 'Lørdag':
            return 6;
    }
    return -1;
}