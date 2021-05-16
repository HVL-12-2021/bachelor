import 'source-map-support/register'
import middy from 'middy';
import cors from '@middy/http-cors';
import { APIGatewayProxyResult } from 'aws-lambda'
import { getAllVendors } from './dbUtils';

async function handler(): Promise<APIGatewayProxyResult> {

    let vendors = await getAllVendors();

    return {
        statusCode: 200,
        body: JSON.stringify(vendors)
    };
}

export const mainHandler = middy(handler).use(cors());