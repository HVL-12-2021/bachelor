import 'source-map-support/register'
import middy from 'middy';
import cors from '@middy/http-cors';
import { APIGatewayProxyResult } from 'aws-lambda'
import { getSingleVendorFromDb } from './dbUtils';


async function handler(): Promise<APIGatewayProxyResult> {

    let vendor = await getSingleVendorFromDb();

    if (vendor) {
        return {
            statusCode: 200,
            body: JSON.stringify(vendor)
        };
    } else {
        return {
            statusCode: 404,
            body: '{"message": "No vendor in database"}'
        }
    }
}

export const mainHandler = middy(handler).use(cors());