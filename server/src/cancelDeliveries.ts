import 'source-map-support/register'
import middy from 'middy';
import cors from '@middy/http-cors';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { cancelDeliveries } from './dbUtils'
import { getUserInfoFromEvent } from './auth/getUserFromJwt'

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    let userId = getUserInfoFromEvent(event);
    let body = JSON.parse(event.body);

    await cancelDeliveries(userId, body);

    return {
        statusCode: 200,
        body: '{ "message" : "Cancellation succeeded" }'
    };
}

export const mainHandler = middy(handler).use(cors());