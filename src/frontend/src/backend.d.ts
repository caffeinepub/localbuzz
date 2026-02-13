import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Location {
    latitude: number;
    longitude: number;
    timestamp: Time;
}
export type Time = bigint;
export interface UserProfile {
    lastKnownLocation?: Location;
    createdAt: Time;
    role: UserRole;
    lastUpdated: Time;
    phoneNumber: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllProfilesByRole(role: UserRole): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLastKnownLocation(): Promise<Location | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(phoneNumber: string, role: UserRole): Promise<void>;
    setLastKnownLocation(location: Location): Promise<void>;
}
