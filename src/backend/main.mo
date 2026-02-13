import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  public type UserProfile = {
    phoneNumber : Text;
    role : AccessControl.UserRole;
    createdAt : Time.Time;
    lastUpdated : Time.Time;
    lastKnownLocation : ?Location;
  };

  public type Location = {
    latitude : Float;
    longitude : Float;
    timestamp : Time.Time;
  };

  module UserProfile {
    public func compareByCreationTime(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      Int.compare(profile1.createdAt, profile2.createdAt);
    };
  };

  var profiles = Map.empty<Principal, UserProfile>();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profiles.get(user);
  };

  public query ({ caller }) func getAllProfilesByRole(role : AccessControl.UserRole) : async [UserProfile] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all profiles");
    };
    let filteredIter = profiles.values().filter(func(p : UserProfile) : Bool { p.role == role });
    filteredIter.toArray().sort(UserProfile.compareByCreationTime);
  };

  public shared ({ caller }) func saveCallerUserProfile(phoneNumber : Text, role : AccessControl.UserRole) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let now = Time.now();

    let profile : UserProfile = switch (profiles.get(caller)) {
      case (null) {
        {
          phoneNumber;
          role;
          createdAt = now;
          lastUpdated = now;
          lastKnownLocation = null;
        };
      };
      case (?existingProfile) {
        {
          phoneNumber;
          role;
          createdAt = existingProfile.createdAt;
          lastUpdated = now;
          lastKnownLocation = existingProfile.lastKnownLocation;
        };
      };
    };

    profiles.add(caller, profile);
  };

  public shared ({ caller }) func setLastKnownLocation(location : Location) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update location");
    };

    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found. Please create a profile first.") };
      case (?profile) {
        let updatedProfile = {
          profile with
          lastUpdated = Time.now();
          lastKnownLocation = ?location;
        };
        profiles.add(caller, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getLastKnownLocation() : async ?Location {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view location");
    };

    switch (profiles.get(caller)) {
      case (null) { null };
      case (?profile) { profile.lastKnownLocation };
    };
  };
};
