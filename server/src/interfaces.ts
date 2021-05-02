export interface Subscription {
    vendorId: string,
    userId: string,
    approved: boolean,
    paused: boolean,
    schedule: string[],
    noOfMeals: number,
    box: string
}

export interface Userprofile {
    fullname: string,
    address: string,
    phone: string,
    email: string, 
    allergies: string[], 
    isVendor: boolean
}

export interface UserSubscription {
    vendorId: string,
    userId: string,
    approved: boolean,
    paused: boolean,
    schedule: MenuItems[],
    noOfMeals: number,
    box: string,
    fullname: string,
    address: string,
    phone: string,
    email: string, 
    allergies: string[]
}

export interface VendorSubscription {
    vendorId: string,
    company: string,
    approved: boolean,
    paused: boolean,
    schedule: MenuItems[],
    noOfMeals: number,
    box: string
}

export interface Delivery {
    vendorId: string,
    userId: string,
    deliverytime: string,
    menuId: string,
    cancelled: boolean
}

export interface Vendor {
    company: string,
    fullname: string,
    address: string,
    phone: string,
    email: string,
    schedule: MenuItems[]
}

export interface MenuItems {
    id: string,
    time: string,
    menu: string,
    day: string
}

export interface WeekTime {
    menuId?: string,
    day: number,
    time: number
}

export interface DateWithMenuId {
    date: Date,
    menuId?: string
}