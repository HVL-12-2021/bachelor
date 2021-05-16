import 'source-map-support/register'
import middy from 'middy';
import cors from '@middy/http-cors';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getUserInfoFromEvent } from './auth/getUserFromJwt';
import { getSubscriptionFromDb, getVendorFromDb } from './dbUtils';
import { noOfDeliveriesInMonth } from '../../common/timeHandling';
import { scheduleToWeekTimes } from '../../common/addDeliveries';
import { MenuItems } from './interfaces';

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    let vendorId = getUserInfoFromEvent(event);
    
    if (!event.queryStringParameters) {
        return {
            statusCode: 400,
            body: '{ "message" : "Missing parameter userId, start time or month" }'
        };
    }
    let userId = event.queryStringParameters["userId"];
    let afterDate = event.queryStringParameters["afterDate"];
    let yearMonth = event.queryStringParameters["yearMonth"];

    if (!userId) {
        return {
            statusCode: 400,
            body: '{ "message" : "Missing parameter userId" }'
        };
    }
    if (!yearMonth) {
        return {
            statusCode: 400,
            body: '{ "message" : "Missing parameter yearMonth" }'
        };
    }
    if (!afterDate) {
        afterDate = yearMonth + "-01"
    }
    
    let vendor = await getVendorFromDb(vendorId);
    if (!vendor) {
        return {
            statusCode: 500,
            body: '{ "message": "Could not find vendor in DB" }'
        }
    }
    let sub = await getSubscriptionFromDb(vendorId, userId);
    let schedule:MenuItems[] = sub.schedule.map((subId) => {
        return vendor.schedule.find(({id}) => id == subId);
    }); 
    let weekTimes = scheduleToWeekTimes(schedule);
    let result = await noOfDeliveriesInMonth(new Date(afterDate), weekTimes);

    return {
        statusCode: 200,
        body: JSON.stringify({
            no: result
        })
    };
}

export const mainHandler = middy(handler).use(cors());