import 'source-map-support/register'
import middy from 'middy';
import cors from '@middy/http-cors';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getAllDeliveriesFromAllSubscribers, getUserprofileFromDb, saveDeliveriesToDb, updateDeliveries } from './dbUtils'
import { getUserInfoFromEvent } from './auth/getUserFromJwt'
import { generateDeliveries } from './addDeliveries'
import { Delivery, Summary } from './interfaces';

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    let vendorId = getUserInfoFromEvent(event);
    let vendor = await getUserprofileFromDb(vendorId);
    if (!vendor.isVendor) {
        return {
            statusCode: 403,
            body: JSON.stringify( {message: "User " + vendorId + " is not a vendor"})
        };
    }
    if (event.httpMethod == "GET") {
        return getVendorDeliveries(event);
    }
    if (event.httpMethod == "PUT") {
        return putVendorDeliveries(event);
    }
    if (event.httpMethod == "POST") {
        return postVendorDeliveries(event);
    }
    return {
        statusCode: 405,
        body: '{ "message" : "Method not allowed" }'
    };
}

async function getVendorDeliveries(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    let vendorId = getUserInfoFromEvent(event);
    if (!event.queryStringParameters) {
        return {
            statusCode: 400,
            body: '{ "message" : "Missing parameter time" }'
        };
    }
    let start = event.queryStringParameters["start"];
    let end = event.queryStringParameters["end"];
    let summary = event.queryStringParameters["summary"];

    if (!vendorId) {
        return {
            statusCode: 400,
            body: '{ "message" : "Missing parameter vendorId" }'
        };
    }
    if (!start) {
        return {
            statusCode: 400,
            body: '{ "message" : "Missing parameter start time" }'
        };
    }
    if (!end) {
        return {
            statusCode: 400,
            body: '{ "message" : "Missing parameter end time" }'
        };
    }
    let deliveries = await getAllDeliveriesFromAllSubscribers(vendorId, start, end); 

    if (summary && summary == "true") {
        return {
            statusCode: 200,
            body: JSON.stringify(generateSummary(deliveries))
        }
    }
    
    return {
        statusCode: 200,
        body: JSON.stringify(deliveries)
    };
}
function generateSummary(deliveries: Delivery[]):Summary[] {
    let hash = new Map<string, Summary>();
    deliveries.forEach((del) => {
        let summary = hash.get(del.deliverytime);
        if (!summary) {
            summary = {
                menuId: del.menuId,
                date: del.deliverytime,
                count: 0,
                cancelled: 0
            }
            hash.set(del.deliverytime, summary);
        }
        summary.count++;
        if (del.cancelled) {
            summary.cancelled++;
        }
    });
    let array = [];
    for (let k of hash) {
        array.push(k[1]);
    }
    return array;
}

async function putVendorDeliveries(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    let vendorId = getUserInfoFromEvent(event);
    let body = JSON.parse(event.body);
    let deliveries = await updateDeliveries(vendorId, body);

    return {
        statusCode: 200,
        body: JSON.stringify(deliveries)
    };
}

async function postVendorDeliveries(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    let vendorId = getUserInfoFromEvent(event);
    
    if (!event.queryStringParameters) {
        return {
            statusCode: 400,
            body: '{ "message" : "Missing parameters date, no and userId" }'
        };
    }
    let date = event.queryStringParameters["startDate"];
    let no = event.queryStringParameters["no"];
    let userId = event.queryStringParameters["userId"];

    if (!vendorId) {
        return {
            statusCode: 400,
            body: '{ "message" : "Missing parameter vendorId" }'
        };
    }
    if (!date) {
        return {
            statusCode: 400,
            body: '{ "message" : "Missing parameter startDate" }'
        };
    }
    if (!userId) {
        return {
            statusCode: 400,
            body: '{ "message" : "Missing parameter userId" }'
        };
    }
    if (!no) {
        return {
            statusCode: 400,
            body: '{ "message" : "Missing parameter number of deliveries" }'
        };
    }
    if (!date.endsWith("Z")) {
        return {
            statusCode: 400,
            body: '{ "message" : "Parameter time must be YYYY-MM-DDTHH:MM:SS.MMMZ" }'
        };
    }
    let startDate = new Date(date);
    let noOfDeliveries = parseInt(no);

    if (isNaN(noOfDeliveries)) {
        return {
            statusCode: 400,
            body: '{ "message" : "Invalid format for number of deliveries" }'
        };
    }

        let deliveries = await generateDeliveries(startDate, userId, vendorId, noOfDeliveries);
        await saveDeliveriesToDb(deliveries);

        return {
            statusCode: 200,
            body: JSON.stringify(deliveries)
        };

}
export const mainHandler = middy(handler).use(cors());