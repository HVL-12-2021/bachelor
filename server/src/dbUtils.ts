import 'source-map-support/register'
import { DynamoDB } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Subscription, UserSubscription, Userprofile, Delivery, Vendor, VendorSubscription, Summary, MenuItems } from './interfaces';
import * as settings from '../../common/settings';

const database = new DynamoDB({ region: settings.REGION });
const documentClient = new DocumentClient({ region: settings.REGION });

export async function getSubscriptionFromDb(vendorId: string, userId: string): Promise<Subscription | undefined> {
    let subscriptionParams = {
        TableName: settings.TABLENAME,
        KeyConditionExpression: "#pk = :vendor and #sk = :userId",
        ExpressionAttributeNames: {
            "#pk": "pk",
            "#sk": "sk"
        },
        ExpressionAttributeValues: {
            ":vendor": "v#" + vendorId,
            ":userId": "u#" + userId
        }
    }
    let subscriptionResult = await documentClient.query(subscriptionParams).promise();
    if (subscriptionResult.Items.length == 0) {
        return undefined;
    }
    return {
            vendorId,
            userId,
            approved: subscriptionResult.Items[0].approved? subscriptionResult.Items[0].approved : false,
            paused: subscriptionResult.Items[0].paused,
            schedule: subscriptionResult.Items[0].schedule.values, 
            noOfMeals: subscriptionResult.Items[0].noOfMeals,
            box: subscriptionResult.Items[0].box
    };
    
}

export async function putSubscriptionInDb(subscription: Subscription, isVendor: boolean): Promise<Subscription> {
    let UpdateExpression = "set EntityType = :EntityType";
    let ExpressionAttributeValues: any = {
        ":EntityType": { S: 'Subscription' }
    }; 

    if (isVendor) {
        if (subscription.approved != undefined) {
            UpdateExpression += ", approved = :approved";
            ExpressionAttributeValues[":approved"] = { BOOL: subscription.approved };
        }
    } else {
        UpdateExpression += ", approved = if_not_exists(approved, :approved)";
        ExpressionAttributeValues[":approved"] = { BOOL: false };
    }    
    if (subscription.paused != undefined) {
        UpdateExpression += ", paused = :paused";
        ExpressionAttributeValues[":paused"] = { BOOL: subscription.paused };
    }
    if (subscription.schedule) {
        UpdateExpression += ", schedule = :schedule";
        ExpressionAttributeValues[":schedule"] = { SS: subscription.schedule };
    }
    if (subscription.noOfMeals) {
        UpdateExpression += ", noOfMeals = :noOfMeals";
        ExpressionAttributeValues[":noOfMeals"] = { N: subscription.noOfMeals.toString() };
    }
    if (subscription.box) {
        UpdateExpression += ", box = :box";
        ExpressionAttributeValues[":box"] = { S: subscription.box };
    }

    UpdateExpression += ", GSI1_pk = :userId";
    ExpressionAttributeValues[":userId"] = { S: "u#" + subscription.userId };

    UpdateExpression += ", GSI1_sk = :vendorId";
    ExpressionAttributeValues[":vendorId"] = { S: "v#" + subscription.vendorId };

    let params = {
        TableName: settings.TABLENAME,
        Key: {
            "pk": { S: "v#" + subscription.vendorId },
            "sk": { S: "u#" + subscription.userId }
        },
        UpdateExpression,
        ExpressionAttributeValues,
        ReturnValues: "ALL_NEW"
    };

    let dbItem = await database.updateItem(params).promise();
    return {
        vendorId: subscription.vendorId,
        userId: subscription.userId,
        approved: dbItem.Attributes.approved?.BOOL || false,
        paused: dbItem.Attributes.paused?.BOOL || false,
        schedule: dbItem.Attributes.schedule?.SS || [],
        noOfMeals: parseInt(dbItem.Attributes.noOfMeals.N),
        box: dbItem.Attributes.box.S
    };
}

export async function deleteSubscriptionInDb(vendorId: string, userId: string): Promise<void> {
    let params = {
        TableName: settings.TABLENAME,
        Key: {
            'pk': { S: 'v#' + vendorId },
            'sk': { S: 'u#' + userId }  
        }
    };
    await database.deleteItem(params).promise();
}

export async function getVendorFromDb(vendorId: string): Promise<Vendor> {
    let params = {
        TableName: settings.TABLENAME,
        KeyConditionExpression: "#pk = :vendorId and #sk = :vendorId",
        ExpressionAttributeNames: {
            "#pk": "pk",
            "#sk": "sk"
        },
        ExpressionAttributeValues: {
            ":vendorId": "v#" + vendorId
        }
    };
    let dbResult = await documentClient.query(params).promise();
    if (dbResult.Items.length == 0) {
        return undefined;
    }
    return {
        company: dbResult.Items[0].company,
        fullname: dbResult.Items[0].fullname,
        address: dbResult.Items[0].address,
        phone: dbResult.Items[0].phone,
        email: dbResult.Items[0].email,
        schedule: dbResult.Items[0].schedule
    };
}

export async function putVendorInDb(vendor: Vendor, vendorId: string): Promise<Vendor> {
    let params = {
        TableName: settings.TABLENAME,
        Item: {
            pk: "v#" + vendorId,
            sk: "v#" + vendorId,
            EntityType: "Vendor",
            company: vendor.company,
            fullname: vendor.fullname,
            address: vendor.address,
            phone: vendor.phone,
            email: vendor.email,
            schedule: vendor.schedule
        }
    }; 

    await documentClient.put(params).promise();
    return {
        company: vendor.company,
        fullname: vendor.fullname,
        address: vendor.address,
        phone: vendor.phone,
        email: vendor.email,
        schedule: vendor.schedule
    };
}

export async function deleteVendorInDb(vendorId: string): Promise<void> {
    let params = {
        TableName: settings.TABLENAME,
        Key: {
            'pk': { S: 'v#' + vendorId },
            'sk': { S: 'v#' + vendorId }
        }
    };
    await database.deleteItem(params).promise();
}

export async function getUserprofileFromDb(userId: string): Promise<Userprofile> {
    let params = {
        TableName: settings.TABLENAME,
        KeyConditionExpression: "#pk = :userId and #sk = :userId",
        ExpressionAttributeNames: {
            "#pk": "pk",
            "#sk": "sk"
        },
        ExpressionAttributeValues: {
            ":userId": "u#" + userId
        }
    };
    let dbResult = await documentClient.query(params).promise();
    if (dbResult.Items.length == 0) {
        return undefined;
    }
    return {
        fullname: dbResult.Items[0].fullname,
        address: dbResult.Items[0].address,
        phone: dbResult.Items[0].phone,
        email: dbResult.Items[0].email, 
        allergies: dbResult.Items[0].allergies,
        isVendor: dbResult.Items[0].isVendor
    };  
}

export async function putUserprofileInDb(userprofile: Userprofile, userId: string): Promise<Userprofile> {
    let params = {
        TableName: settings.TABLENAME,
        Item: {
            pk: "u#" + userId,
            sk: "u#" + userId,
            EntityType: "Userprofile", 
            fullname: userprofile.fullname, 
            address: userprofile.address, 
            phone: userprofile.phone, 
            email: userprofile.email, 
            allergies: userprofile.allergies,
            isVendor: userprofile.isVendor
        }
    };

    await documentClient.put(params).promise();
    return {
        fullname: userprofile.fullname,
        address: userprofile.address,
        phone: userprofile.phone,
        email: userprofile.email,
        allergies: userprofile.allergies,
        isVendor: userprofile.isVendor
    }
} 

export async function deleteUserprofileInDb(userId: string): Promise<void> {
    let params = {
        TableName: settings.TABLENAME,
        Key: {
            'pk': { S: 'u#' + userId },
            'sk': { S: 'u#' + userId }
        }
    };
    await database.deleteItem(params).promise();
}

export async function getSubscriptionsForVendor(vendorId: string): Promise<UserSubscription[]> {
    let subscriptionParams = {
        TableName: settings.TABLENAME,
        KeyConditionExpression: "#pk = :vendor and begins_with(#sk, :prefix)",
        ExpressionAttributeNames: {
            "#pk": "pk",
            "#sk": "sk"
        },
        ExpressionAttributeValues: {
            ":vendor": "v#" + vendorId,
            ":prefix": "u#"
        }
    };

    let dbResult = await documentClient.query(subscriptionParams).promise();
    if (dbResult.Items.length == 0) {
        return [];
    }
    

    let subscriptions = dbResult.Items.map((item) => {
        return {
            vendorId,
            userId: item.sk,
            approved: item.approved,
            paused:item.paused,
            schedule: item.schedule.values,
            noOfMeals: item.noOfMeals,
            box: item.box
        }
    });

    let keys = dbResult.Items.map((item) => {
        return {
            "pk": item.sk,         // her må sk fra subscription brukes for å finne
            "sk": item.sk          // userprofile sin composite key
        }
    });

    let userSubscriptionParams = {
        RequestItems: {
            [settings.TABLENAME]: {
                Keys: keys,
                ProjectionExpression: "sk, fullname, address, phone, email, allergies"
            }
        }
    };

    let users = await documentClient.batchGet(userSubscriptionParams).promise();
    let subshash = new Map<string, Subscription>();

    subscriptions.forEach((sub) => {
        subshash.set(sub.userId, sub);
    });

    let vendorParams = {
        TableName: settings.TABLENAME,
        KeyConditionExpression: "#pk = :vendor and #sk = :vendor",
        ExpressionAttributeNames: {
            "#pk": "pk",
            "#sk": "sk"
        },
        ExpressionAttributeValues: {
            ":vendor": "v#" + vendorId
        }
    }
    let vendorResult = await documentClient.query(vendorParams).promise();
    if (vendorResult.Items.length == 0) {
        return undefined;
    }
    let vendorSchedule = vendorResult.Items[0].schedule;

    let result:UserSubscription[] = users.Responses[settings.TABLENAME].map(user => {
        let sub = subshash.get(user.sk);
        let userSchedule = vendorSchedule.filter((item) => sub.schedule.includes(item.id));
        return {
            vendorId: sub.vendorId,
            userId: sub.userId.substr(2),
            approved: sub.approved,
            paused: sub.paused,
            schedule: userSchedule,
            noOfMeals: sub.noOfMeals,
            box: sub.box,
            fullname: user.fullname,
            address: user.address,
            phone: user.phone,
            email: user.email,
            allergies: user.allergies
        }
    });
    return result;
}

export async function getSubscriptionsForUser(userId: string): Promise<VendorSubscription[]> {
    let params = {
        TableName: settings.TABLENAME,
        IndexName: "GSI1",
        KeyConditionExpression: "#GSI1_pk = :user and begins_with(#GSI1_sk, :prefix)",
        ExpressionAttributeNames: {
            "#GSI1_pk": "GSI1_pk",
            "#GSI1_sk": "GSI1_sk"
        },
        ExpressionAttributeValues: {
            ":user": "u#" + userId,
            ":prefix": "v#"
        }
    };

    let dbResult = await documentClient.query(params).promise();
    if (dbResult.Items.length == 0) {
        return undefined;
    }
    let subs:Subscription[] = dbResult.Items.map((item) => {
        return {
            vendorId: item.pk,
            userId,
            approved: item.approved,
            paused: item.paused,
            schedule: item.schedule.values,
            noOfMeals: item.noOfMeals,
            box: item.box
        }
    });

    let keys = dbResult.Items.map((item) => {
        return {
            "pk": item.pk,
            "sk": item.pk
        }
    }); 
    let params2 = {
        RequestItems: {
            [settings.TABLENAME]: {
                Keys: keys,
                ProjectionExpression: "pk, company, schedule"
            }
        }
    };
    let vendors = await documentClient.batchGet(params2).promise();
    let subhash = new Map<String, Subscription>();

    subs.forEach((sub) => {
        subhash.set(sub.vendorId, sub);
    });



    let result:VendorSubscription[] = vendors.Responses[settings.TABLENAME].map((vendor) => {
        let sub = subhash.get(vendor.pk);
        let menuHash = new Map<string, MenuItems>();
        vendor.schedule.forEach((item:MenuItems) => {
            menuHash.set(item.id, item);
        });
        let subSchedule: MenuItems[]= [];
        sub.schedule.forEach((item) => {
            subSchedule.push(menuHash.get(item));
        });
        
        return {
            vendorId: sub.vendorId.substr(2),
            company: vendor.company,
            approved: sub.approved,
            paused: sub.paused,
            schedule: subSchedule,
            noOfMeals: sub.noOfMeals,
            box: sub.box
        }
    });
    return result;
}

export async function getUsersDeliveries(userId: string, startDate: string, endDate: string): Promise<Delivery[]> {
    let params = {
        TableName: settings.TABLENAME,
        IndexName: "GSI2",
        KeyConditionExpression: "#GSI2_pk = :user and #GSI2_sk BETWEEN :prefix1 and :prefix2",
        ExpressionAttributeNames: {
            "#GSI2_pk": "GSI2_pk",
            "#GSI2_sk": "GSI2_sk"
        },
        ExpressionAttributeValues: {
            ":user": "u#" + userId,
            ":prefix1": startDate,
            ":prefix2": endDate
        }
    };

    let dbResult = await documentClient.query(params).promise();

    let deliveries = dbResult.Items.map((del) => {
        return {
            userId,
            deliverytime: del.deliverytime,
            menuId: del.menuId,
            cancelled: del.cancelled
        }
    });
    return deliveries;
}

export async function getDeliveryFromDb(vendorId: string, userId: string, time: string): Promise<Delivery> {
    let params = {
        TableName: settings.TABLENAME,
        KeyConditionExpression: "#pk = :vendor and begins_with(#sk, :prefix)",
        ExpressionAttributeNames: {
            "#pk": "pk",
            "#sk": "sk"
        },
        ExpressionAttributeValues: {
            ":vendor": "v#" + vendorId,
            ":prefix": "d#" + time + "#u#" + userId
        }
    };
    let dbResult = await documentClient.query(params).promise();
    if (dbResult.Items.length == 0) {
        return undefined;
    }
    return {
        vendorId,
        userId,
        deliverytime: dbResult.Items[0].deliverytime,
        menuId: dbResult.Items[0].menuId,
        cancelled: dbResult.Items[0].cancelled
    };
}

export async function putDeliveryInDb(vendorId: string, userId: string, delivery: Delivery): Promise<Delivery> {
    let UpdateExpression = "set EntityType = :EntityType";
    let ExpressionAttributeValues: any = {
        ":EntityType": { S: "Delivery"}
    }

    if (delivery.userId != undefined) {
        UpdateExpression += ", userId = :userId";
        ExpressionAttributeValues[":userId"] = { S: delivery.userId};
    }

    if (delivery.cancelled != undefined) {
        UpdateExpression += ", cancelled = :cancelled";
        ExpressionAttributeValues[":cancelled"] = { BOOL: delivery.cancelled};
    }

    if (delivery.menuId != undefined) {
        UpdateExpression += ", menuId = :menuId";
        ExpressionAttributeValues[":menuId"] = { S: delivery.menuId};
    }

    if (delivery.deliverytime != undefined) {
        UpdateExpression += ", deliverytime = :time";
        ExpressionAttributeValues[":time"] = { S: delivery.deliverytime};
    }

    UpdateExpression += ", GSI2_pk = :userId";
    ExpressionAttributeValues[":userId"] = { S: "u#" + delivery.userId};

    UpdateExpression += ", GSI2_sk = :deliverytime";
    ExpressionAttributeValues[":deliverytime"] = { S: delivery.deliverytime};

    UpdateExpression += ", GSI1_pk = :userAndVendor";
    ExpressionAttributeValues[":userAndVendor"] = { S: "u#" + delivery.userId + "#v#" + delivery.vendorId};

    UpdateExpression += ", GSI1_sk = :deliverytime";
    ExpressionAttributeValues[":deliverytime"] = { S: delivery.deliverytime};

    let params = {
        TableName: settings.TABLENAME,
        Key: {
            "pk": { S: "v#" + vendorId },
            "sk": { S: "d#" + delivery.deliverytime + "#u#" + userId}
        },
        UpdateExpression,
        ExpressionAttributeValues,
        ReturnValues: "ALL_NEW"
    };

    let dbItem = await database.updateItem(params).promise();
    return {
        vendorId,
        userId,
        deliverytime: dbItem.Attributes.deliverytime.S,
        menuId: dbItem.Attributes.menuId.S,
        cancelled: dbItem.Attributes.cancelled.BOOL
    }
}

export async function deleteDeliveryInDb(vendorId: string, userId: string, time: string): Promise<void> {
    let params = {
        TableName: settings.TABLENAME,
        Key: {
            "pk": { S: "v#" + vendorId },
            "sk": { S: "d#"+ time + "#u#" + userId }
        }
    };
    await database.deleteItem(params).promise();
}

export async function saveDeliveriesToDb(deliveries: Delivery[]): Promise<void> {
    let dels = [];
    for (let i = 0; i < deliveries.length; i++) {
        dels.push({
            PutRequest: {
                Item: {
                    EntityType: "Delivery",
                    pk: "v#" + deliveries[i].vendorId,
                    sk: "d#" + deliveries[i].deliverytime + "#u#" + deliveries[i].userId,
                    deliverytime: deliveries[i].deliverytime,
                    menuId: deliveries[i].menuId,
                    cancelled: deliveries[i].cancelled,
                    GSI2_pk: "u#" + deliveries[i].userId,
                    GSI2_sk: deliveries[i].deliverytime,
                    GSI1_pk: "u#" + deliveries[i].userId + "#v#" + deliveries[i].vendorId,
                    GSI1_sk: deliveries[i].deliverytime
                }
            }
        });
        if (dels.length == 25) {
            let params = {
                RequestItems: {
                    [settings.TABLENAME]: dels
                }
            };
            let result = await documentClient.batchWrite(params).promise();
            dels = [];
            // TODO: Sjekke for Unprocessed items på result, og legge evt feilede objekter inn igjen i dels. 
            // result.UnprocessedItems
        } 
    }
    if (dels.length > 0) {
        let params = {
            RequestItems: {
                [settings.TABLENAME]: dels
            }
        };
        let result = await documentClient.batchWrite(params).promise();
        // TODO: Sjekke for Unprocessed items på result, og legge evt feilede objekter inn igjen i dels. 
        // result.UnprocessedItems
    }
}

export async function getAllDeliveriesFromAllSubscribers(vendorId: string, startTime: string, endTime: string): Promise<Delivery[] | Summary[]> {
    let endDate = new Date(endTime);
    endDate.setDate(endDate.getDate() + 1);
    let nextDay = endDate.toISOString().substr(0, 10);
    
    let params = {
        TableName: settings.TABLENAME,
        KeyConditionExpression: "#pk = :vendor and #sk BETWEEN :start and :end",
        ExpressionAttributeNames: {
            "#pk": "pk",
            "#sk": "sk"
        },
        ExpressionAttributeValues: {
            ":vendor": "v#" + vendorId,
            ":start": "d#" + startTime,
            ":end": "d#" + nextDay
        }
    };
    let dbResult = await documentClient.query(params).promise();

    let deliveries = dbResult.Items.map((del) => {
        return {
            vendorId,
            userId: del.GSI2_pk.substr(2),
            deliverytime: del.deliverytime, 
            menuId: del.menuId,
            cancelled: del.cancelled
        }
    });
    return deliveries;
}

export async function findLatestDelivery(vendorId: string, userId: string):Promise<Delivery | null> {
    let params = {
        TableName: settings.TABLENAME,
        IndexName: "GSI1",
        Limit: 1,
        ScanIndexForward: false,
        KeyConditionExpression: "#GSI1_pk = :userAndVendor",
        ExpressionAttributeNames: {
            "#GSI1_pk": "GSI1_pk"
        },
        ExpressionAttributeValues: {
            ":userAndVendor": "u#" + userId + "#v#" + vendorId
        }
    };

    let dbResult = await documentClient.query(params).promise();
    if (dbResult.Count < 1) {
        return null;
    }

    return {
        vendorId,
        userId,
        deliverytime: dbResult.Items[0].deliverytime, 
        menuId: dbResult.Items[0].menuId,
        cancelled: dbResult.Items[0].cancelled
    }
} 
