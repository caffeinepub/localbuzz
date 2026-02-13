import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Random "mo:core/Random";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";



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

  public type OTPEntry = {
    code : Text;
    expiry : Time.Time;
    verified : Bool;
  };

  var profiles = Map.empty<Principal, UserProfile>();
  var otpChallenges = Map.empty<Text, OTPEntry>();

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

  public shared ({ caller }) func getOtpChallenge(phoneNumber : Text) : async Text {
    let random = Random.crypto(); // Create instance only when needed
    let code = await* random.intRange(100000, 1000000);
    let codeText = code.toText();
    let entry = {
      code = codeText;
      expiry = Time.now() + (5 * 60 * 1000000000); // 5 minutes in nanoseconds
      verified = false;
    };

    otpChallenges.add(phoneNumber, entry);

    codeText;
  };

  public shared ({ caller }) func verifyOtpToken(phoneNumber : Text, code : Text) : async () {
    switch (otpChallenges.get(phoneNumber)) {
      case (null) { Runtime.trap("OTP not found for this number") };
      case (?otp) {
        if (Time.now() > otp.expiry) {
          switch (otpChallenges.get(phoneNumber)) {
            case (null) { Runtime.trap("Entry not found") };
            case (_entry) {
              otpChallenges.remove(phoneNumber);
              Runtime.trap("OTP has expired. Please request a new one.");
            };
          };
        };
        if (code != otp.code) {
          Runtime.trap("Incorrect OTP code");
        };

        let newEntry = { otp with verified = true };
        otpChallenges.add(phoneNumber, newEntry);
      };
    };
  };

  // Shops collection extension
  public type Shop = {
    name : Text;
    category : Text;
    address : Text;
    latitude : Float;
    longitude : Float;
    image : Storage.ExternalBlob;
    owner : Principal;
    createdAt : Time.Time;
    lastUpdated : Time.Time;
  };

  let shops = Map.empty<Principal, Shop>();

  include MixinStorage();

  public shared ({ caller }) func registerShop(
    name : Text,
    category : Text,
    address : Text,
    latitude : Float,
    longitude : Float,
    image : Storage.ExternalBlob,
  ) : async Shop {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register shops");
    };

    let now = Time.now();
    let shop : Shop = {
      name;
      category;
      address;
      latitude;
      longitude;
      image;
      owner = caller;
      createdAt = now;
      lastUpdated = now;
    };

    shops.add(caller, shop);
    shop;
  };

  public query ({ caller }) func getShop(owner : Principal) : async ?Shop {
    shops.get(owner);
  };

  public query ({ caller }) func getAllShops() : async [Shop] {
    shops.values().toArray();
  };

  public shared ({ caller }) func updateShop(
    name : Text,
    category : Text,
    address : Text,
    latitude : Float,
    longitude : Float,
    image : Storage.ExternalBlob,
  ) : async Shop {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update shops");
    };

    switch (shops.get(caller)) {
      case (null) { Runtime.trap("Shop not found. Please register a shop first.") };
      case (?existingShop) {
        // Verify ownership: only the shop owner or an admin can update
        if (existingShop.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own shop");
        };

        let updatedShop = {
          existingShop with
          name;
          category;
          address;
          latitude;
          longitude;
          image;
          lastUpdated = Time.now();
        };
        shops.add(caller, updatedShop);
        updatedShop;
      };
    };
  };
};
