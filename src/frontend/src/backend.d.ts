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
    shopId: string;
    ownerId: Principal;
    expiryDate: Time;
    createdAt: Time;
    description?: string;
    isActive: boolean;
    updateId: string;
    shopName: string;
    image?: ExternalBlob;
    location: GeoPoint;
}
export interface UserProfile {
    lastKnownLocation?: Location;
    name?: string;
    createdAt: Time;
    role: UserRole;
    lastUpdated: Time;
    phoneNumber: string;
}
export type Time = bigint;
export interface ShopUpdate {
    title: string;
    expiredAt?: Time;
    shopId: string;
    ownerId: Principal;
    expiryDate: Time;
    createdAt: Time;
    description?: string;
    isActive: boolean;
    updateId: string;
    image?: ExternalBlob;
    location: GeoPoint;
}
export type NotificationId = string;
export interface Notification {
    id: NotificationId;
    shopId: string;
    createdAt: Time;
    recipient: Principal;
    distance: number;
    isActive: boolean;
    shopUpdateId: string;
}
export interface Shop {
    shopImage: ExternalBlob;
    shopId: string;
    ownerId: Principal;
    createdAt: Time;
    lastUpdated: Time;
    isOpen: boolean;
    address: string;
    shopName: string;
    category: string;
    location: GeoPoint;
}
export interface GeoPoint {
    latitude: number;
    longitude: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acknowledgeNotifications(notificationIds: Array<NotificationId>): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createShopUpdate(shopId: string, title: string, description: string | null, image: ExternalBlob | null, expiryDate: Time): Promise<string>;
    deleteShopUpdate(updateId: string): Promise<void>;
    favoriteShop(shopId: string): Promise<void>;
    getAllActiveShopUpdates(): Promise<Array<ShopUpdate>>;
    getAllProfilesByRole(role: UserRole): Promise<Array<UserProfile>>;
    getAllShopUpdatesForShop(shopId: string): Promise<Array<ShopUpdate>>;
    getAllShops(): Promise<Array<Shop>>;
    getAllUsers(): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomerFavorites(): Promise<Array<Shop>>;
    getCustomerHomeFeed(referenceLat: number, referenceLon: number): Promise<Array<FeedShopUpdate>>;
    getExpiredUpdatesForShop(shopId: string): Promise<Array<ShopUpdate>>;
    getLastKnownLocation(): Promise<Location | null>;
    getOtpChallenge(phoneNumber: string): Promise<string>;
    getPendingNotifications(): Promise<Array<Notification>>;
    getShopById(shopId: string): Promise<Shop | null>;
    getShopOpenStatus(shopId: string): Promise<boolean>;
    getShopUpdate(updateId: string): Promise<ShopUpdate | null>;
    getShopsByOwner(ownerId: Principal): Promise<Array<Shop>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isShopFavoritedByCaller(shopId: string): Promise<boolean>;
    registerShop(shopName: string, category: string, address: string, location: GeoPoint, shopImage: ExternalBlob): Promise<Shop>;
    saveCallerUserProfile(name: string | null, phoneNumber: string, role: UserRole): Promise<void>;
    setLastKnownLocation(location: Location): Promise<void>;
    setShopOpenStatus(shopId: string, isOpen: boolean): Promise<void>;
    unfavoriteShop(shopId: string): Promise<void>;
    updateShop(shopId: string, shopName: string, category: string, address: string, location: GeoPoint, shopImage: ExternalBlob): Promise<Shop>;
    updateShopUpdate(updateId: string, title: string, description: string | null, image: ExternalBlob | null, expiryDate: Time): Promise<void>;
    verifyOtpToken(phoneNumber: string, code: string): Promise<void>;
}
