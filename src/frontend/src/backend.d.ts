import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Location {
    latitude: number;
    longitude: number;
    timestamp: Time;
}
export interface FeedShopUpdate {
    title: string;
    shopCategory: string;
    shopId: Principal;
    expiryDate: Time;
    shopLocation: Location;
    description?: string;
    updateId: string;
    timestamp: Time;
    shopName: string;
    image?: ExternalBlob;
}
export type Time = bigint;
export interface Shop {
    latitude: number;
    owner: Principal;
    name: string;
    createdAt: Time;
    lastUpdated: Time;
    longitude: number;
    address: string;
    category: string;
    image: ExternalBlob;
}
export interface UserProfile {
    lastKnownLocation?: Location;
    createdAt: Time;
    role: UserRole;
    lastUpdated: Time;
    phoneNumber: string;
}
export interface ShopUpdate {
    title: string;
    shopId: Principal;
    expiryDate: Time;
    shopLocation: Location;
    description?: string;
    timestamp: Time;
    image?: ExternalBlob;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createShopUpdate(shopId: Principal, title: string, description: string | null, image: ExternalBlob | null, expiryDate: Time): Promise<string>;
    deleteShopUpdate(updateId: string): Promise<void>;
    getAllActiveShopUpdates(): Promise<Array<ShopUpdate>>;
    getAllProfilesByRole(role: UserRole): Promise<Array<UserProfile>>;
    getAllShopUpdatesForShop(shopId: Principal): Promise<Array<ShopUpdate>>;
    getAllShops(): Promise<Array<Shop>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomerHomeFeed(): Promise<Array<FeedShopUpdate>>;
    getLastKnownLocation(): Promise<Location | null>;
    getOtpChallenge(phoneNumber: string): Promise<string>;
    getShop(owner: Principal): Promise<Shop | null>;
    getShopUpdate(updateId: string): Promise<ShopUpdate | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerShop(name: string, category: string, address: string, latitude: number, longitude: number, image: ExternalBlob): Promise<Shop>;
    saveCallerUserProfile(phoneNumber: string, role: UserRole): Promise<void>;
    setLastKnownLocation(location: Location): Promise<void>;
    updateShop(name: string, category: string, address: string, latitude: number, longitude: number, image: ExternalBlob): Promise<Shop>;
    updateShopUpdate(updateId: string, title: string, description: string | null, image: ExternalBlob | null, expiryDate: Time): Promise<void>;
    verifyOtpToken(phoneNumber: string, code: string): Promise<void>;
}
