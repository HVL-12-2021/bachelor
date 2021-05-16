import axios from 'axios';
import { urlPrefix } from '../../../../common/settings'
import * as interfaces from '../../../../server/src/interfaces'
import getAuth from '../components/LoginDialog/auth'


export class Api {
    private apiAxios = axios.create();
    private jwtLastRefreshed = 0;

    async login(username: string, password: string) {
        const auth = getAuth();
        await auth.signIn(username, password);
        let jwtToken = (await auth.currentSession()).getIdToken().getJwtToken();
        this.setApiBearerToken(jwtToken);

    }

    async logout() {
        const auth = getAuth();
        await auth.signOut();
    }

    setApiBearerToken(token: string) {
        this.jwtLastRefreshed = Date.now();
        this.apiAxios = axios.create({
            headers: {
                common: {
                    Authorization: 'Bearer ' + token,
                },
            },
        });
    }

    async ensureFreshToken() {
        if (this.jwtLastRefreshed < (Date.now() - (1000 * 60))) {
            let Auth = getAuth();
            let jwtToken = (await Auth.currentSession()).getIdToken().getJwtToken();
            this.setApiBearerToken(jwtToken);
        }
    }

    async getUserprofile(): Promise<interfaces.Userprofile | null> {
        await this.ensureFreshToken();
        try {
            const userprofile = await this.apiAxios.get(urlPrefix + "/userprofile");
            return userprofile.data;
        } catch (error) {
            if (error.response.status == 404) {
                return null;
            }
            throw (error);
        }
    }

    async putUserprofile(userprofile: interfaces.Userprofile): Promise<interfaces.Userprofile> {
        await this.ensureFreshToken();
        const addedUser = await this.apiAxios.put(urlPrefix + "/userprofile", userprofile);
        return addedUser.data;
    }

    async deleteUserprofile() {
        await this.ensureFreshToken();
        await this.apiAxios.delete(urlPrefix + "/userprofile");
    }

    async getVendor(vendorId: string): Promise<interfaces.Vendor | null> {
        await this.ensureFreshToken();
        const url = urlPrefix + "/vendor?vendorId=" + encodeURIComponent(vendorId);
        try {
            const vendor = await this.apiAxios.get(url);
            return vendor.data;
        } catch (error) {
            if (error.response.status == 404) {
                return null;
            }
            throw (error);
        }
    }

    async putVendor(vendor: interfaces.Vendor, vendorId: string): Promise<interfaces.Vendor> {
        await this.ensureFreshToken();
        const url = urlPrefix + "/vendor?vendorId=" + encodeURIComponent(vendorId);
        const addedVendor = await this.apiAxios.put(url, vendor);
        return addedVendor.data;
    }

    async deleteVendor(vendorId: string) {
        await this.ensureFreshToken();
        const url = urlPrefix + "/vendor?vendorId=" + encodeURIComponent(vendorId);
        await this.apiAxios.delete(url);
    }

    async getAllVendors(): Promise<interfaces.Vendor[] | null> {
        await this.ensureFreshToken();
        const vendors = await this.apiAxios.get(urlPrefix + "/vendors");
        return vendors.data;

    }

    async getVendorSubscriptions(): Promise<interfaces.UserSubscription[]> {
        await this.ensureFreshToken();
        const result = await this.apiAxios.get(urlPrefix + "/v/subscriptions");
        return result.data;
    }

    async getUserSubscriptions(): Promise<interfaces.VendorSubscription[]> {
        await this.ensureFreshToken();
        const result = await this.apiAxios.get(urlPrefix + "/u/subscriptions");
        return result.data;
    }

    async getVendorSubscription(id: string): Promise<interfaces.Subscription | null> {
        await this.ensureFreshToken();
        try {
            const url = urlPrefix + "/v/subscription?userId=" + encodeURIComponent(id);
            const vendorSubscription = await this.apiAxios.get(url);
            return vendorSubscription.data;
        } catch (error) {
            if (error.response.status == 404) {
                return null;
            }
            throw (error);
        }
    }

    async putVendorSubscription(subscription: interfaces.Subscription): Promise<interfaces.Subscription | null> {
        await this.ensureFreshToken();
        try {
            const url = urlPrefix + "/v/subscription?userId=" + encodeURIComponent(subscription.userId);
            const addedSubscription = await this.apiAxios.put(url, subscription);
            return addedSubscription.data;
        } catch (error) {
            if (error.response.status == 403) {
                return null;
            }
            throw (error);
        }
    }

    async deleteVendorSubscription(id: string) {
        await this.ensureFreshToken();
        const url = urlPrefix + "/v/subscription?userId=" + encodeURIComponent(id);
        await this.apiAxios.delete(url);
    }

    async getUserSubscription(id: string): Promise<interfaces.Subscription | null> {
        await this.ensureFreshToken();
        try {
            const url = urlPrefix + "/u/subscription?vendorId=" + encodeURIComponent(id);
            const userSubscription = await this.apiAxios.get(url);
            return userSubscription.data;
        } catch (error) {
            if (error.response.status == 404) {
                return null;
            }
            throw (error);
        }
    }

    async putUserSubscription(subscription: interfaces.Subscription): Promise<interfaces.Subscription | null> {
        await this.ensureFreshToken();
        try {
            const url = urlPrefix + "/u/subscription?vendorId=" + encodeURIComponent(subscription.vendorId);
            const addedSubscription = await this.apiAxios.put(url, subscription);
            return addedSubscription.data;
        } catch (error) {
            if (error.response.status == 403) {
                return null;
            }
            throw (error);
        }
    }

    async deleteUserSubscription(id: string) {
        await this.ensureFreshToken();
        const url = urlPrefix + "/u/subscription?vendorId=" + encodeURIComponent(id);
        await this.apiAxios.delete(url);
    }

    async updateApproval(userId: string, approved: boolean) {
        await this.ensureFreshToken();
        const body = {
            approved
        };
        await this.apiAxios.patch(urlPrefix + "/v/subscription?userId=" + encodeURIComponent(userId), body);
    }

    async getAllVendorsDeliveries(startDate: string, endDate: string): Promise<interfaces.Delivery[] | null> {
        await this.ensureFreshToken();

        try { 
            let url = urlPrefix + "/v/deliveries?start=" + encodeURIComponent(startDate) + "&end=" + endDate;
            const deliveries = await this.apiAxios.get(url);
            return deliveries.data;
        } catch (error) {
            if (error.response.status == 404) {
                return null;
            }
            throw (error);
        }
    }

    async getAllVendorsDeliveriesSummary(startDate: string, endDate: string): Promise<interfaces.Summary[] | null> {
        await this.ensureFreshToken();

        try { 
            let url = urlPrefix + "/v/deliveries?start=" + encodeURIComponent(startDate) + "&end=" + endDate + "&summary=true";
            const deliveries = await this.apiAxios.get(url);
            return deliveries.data;
        } catch (error) {
            if (error.response.status == 404) {
                return null;
            }
            throw (error);
        }
    }

    async updateDeliveries(deliveries:interfaces.Delivery[]): Promise<interfaces.Delivery[]> {
        await this.ensureFreshToken();
        let changedDeliveries = await this.apiAxios.put(urlPrefix + "/v/deliveries", deliveries);
        return changedDeliveries.data;
    }

    async postNewDeliveries(startDate: string, no: number, userId: string): Promise<interfaces.Delivery[]> {
        await this.ensureFreshToken();
        const url = urlPrefix + "/v/deliveries?startDate=" + startDate + "&no=" + no + "&userId=" + encodeURIComponent(userId);
        const addedDeliveries = await this.apiAxios.post(url);
        return addedDeliveries.data;
    }

    async getAllUsersDeliveries(startDate: string, endDate: string): Promise<interfaces.Delivery[] | null> {
        await this.ensureFreshToken();

        try {
            const deliveries = await this.apiAxios.get(urlPrefix + "/u/deliveries?start=" + startDate + "&end=" + endDate);
            return deliveries.data;
        } catch (error) {
            if (error.response.status == 404) {
                return null;
            }
            throw (error);
        }
    }

    async getDelivery(vendorId: string, userId: string, time: string): Promise<interfaces.Delivery | null> {
        await this.ensureFreshToken();
        try {
            const url = urlPrefix + "/delivery?vendorId=" + encodeURIComponent(vendorId) + "&userId=" + encodeURIComponent(userId) + "&time=" + time;
            const delivery = await this.apiAxios.get(url);
            return delivery.data;
        } catch (error) {
            if (error.response.status == 404) {
                return null;
            }
            throw (error);
        }
    }

    async putDelivery(vendorId: string, userId: string, delivery: interfaces.Delivery): Promise<interfaces.Delivery> {
        await this.ensureFreshToken();
        const url = urlPrefix + "/delivery?vendorId=" + encodeURIComponent(vendorId) + "&userId=" + encodeURIComponent(userId);
        const newDelivery = await this.apiAxios.put(url, delivery);
        return newDelivery.data;
    }

    async deleteDelivery(vendorId: string, userId: string, time: string) {
        await this.ensureFreshToken();
        const url = urlPrefix + "/delivery?vendorId=" + encodeURIComponent(vendorId) + "&userId=" + encodeURIComponent(userId) + "&time=" + time;
        await this.apiAxios.delete(url);
    }

    async getUnpaidDeliveries(userId: string, yearMonth: string, afterDate?: string): Promise<number> {
        await this.ensureFreshToken();

        let url = urlPrefix + "/unpaidDeliveries?userId=" + encodeURIComponent(userId) + "&yearMonth=" + yearMonth;
        if (afterDate) {
            url += "&afterDate=" + afterDate
        }

        const response = await this.apiAxios.get(url);
        return parseInt(response.data.no);
    }
    
    async getDeliveryDetails(start: string, end: string): Promise<interfaces.DeliveryDetail[]> {
        await this.ensureFreshToken();
        const response = await this.apiAxios.get(urlPrefix + "/v/deliveryDetails?start=" + start + "&end=" + end);
        return response.data;
    }

    async cancelDeliveries(deliveries: interfaces.Delivery[]): Promise<boolean> {
        await this.ensureFreshToken();
        const response = await this.apiAxios.post(urlPrefix + "/cancelDeliveries", deliveries);
        return response.status == 200;
    }
}
let api = new Api();
export default api;


