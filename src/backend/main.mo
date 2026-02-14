import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import List "mo:core/List";
import Random "mo:core/Random";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

(with migration = Migration.run)
actor {
  public type UserProfile = {
    name : ?Text;
    phoneNumber : Text;
    role : AccessControl.UserRole;
    createdAt : Time.Time;
    lastUpdated : Time.Time;
    lastKnownLocation : ?Location;
  };

  module UserProfile {
    public func compareByCreationTime(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      Int.compare(profile1.createdAt, profile2.createdAt);
    };
  };

  public type Location = {
    latitude : Float;
    longitude : Float;
    timestamp : Time.Time;
  };

  public type Shop = {
    shopId : Text;
    ownerId : Principal;
    shopName : Text;
    category : Text;
    address : Text;
    location : GeoPoint;
    shopImage : Storage.ExternalBlob;
    isOpen : Bool;
    createdAt : Time.Time;
    lastUpdated : Time.Time;
  };

  public type GeoPoint = {
    latitude : Float;
    longitude : Float;
  };

  public type ShopUpdate = {
    updateId : Text;
    shopId : Text;
    ownerId : Principal;
    title : Text;
    description : ?Text;
    image : ?Storage.ExternalBlob;
    createdAt : Time.Time;
    expiryDate : Time.Time;
    location : GeoPoint;
    isActive : Bool;
    expiredAt : ?Time.Time;
  };

  public type FeedShopUpdate = {
    updateId : Text;
    shopId : Text;
    ownerId : Principal;
    shopName : Text;
    shopCategory : Text;
    title : Text;
    description : ?Text;
    image : ?Storage.ExternalBlob;
    createdAt : Time.Time;
    expiryDate : Time.Time;
    location : GeoPoint;
    isActive : Bool;
  };

  type OTPEntry = {
    code : Text;
    expiry : Time.Time;
    verified : Bool;
  };

  type FeedShopUpdateWithDistance = {
    feedUpdate : FeedShopUpdate;
    distance : Float;
  };

  module FeedShopUpdateWithDistance {
    public func compareForSorting(a : FeedShopUpdateWithDistance, b : FeedShopUpdateWithDistance) : Order.Order {
      switch (Float.compare(a.distance, b.distance)) {
        case (#equal) {
          Int.compare(b.feedUpdate.createdAt, a.feedUpdate.createdAt);
        };
        case (other) { other };
      };
    };
  };

  type NotificationId = Text;
  type Notification = {
    id : NotificationId;
    recipient : Principal;
    shopUpdateId : Text;
    shopId : Text;
    distance : Float;
    isActive : Bool;
    createdAt : Time.Time;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var profiles = Map.empty<Principal, UserProfile>();
  var otpChallenges = Map.empty<Text, OTPEntry>();
  var shops = Map.empty<Text, Shop>();
  var shopUpdates = Map.empty<Text, ShopUpdate>();
  var customerFavorites = Map.empty<Principal, Set.Set<Text>>();
  var notifications = Map.empty<Text, Notification>();

  include MixinStorage();

  system func postupgrade() {
    expireShopUpdates();
  };

  func expireShopUpdates() {
    let currentTime = Time.now();

    let updatedShopUpdates = Map.empty<Text, ShopUpdate>();

    for ((updateId, shopUpdate) in shopUpdates.entries()) {
      let shouldBeExpired = shopUpdate.isActive and (currentTime > shopUpdate.expiryDate);

      let updated = {
        shopUpdate with
        isActive = if (shouldBeExpired) { false } else {
          shopUpdate.isActive;
        };
        expiredAt = if (shouldBeExpired) { ?currentTime } else {
          shopUpdate.expiredAt;
        };
      };

      updatedShopUpdates.add(updateId, updated);
    };

    shopUpdates := updatedShopUpdates;
  };

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

  public query ({ caller }) func getAllUsers() : async [UserProfile] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };

    let filteredUsersIter = profiles.values().filter(
      func(_profile) { true }
    );
    filteredUsersIter.toArray().sort(UserProfile.compareByCreationTime);
  };

  public shared ({ caller }) func saveCallerUserProfile(
    name : ?Text,
    phoneNumber : Text,
    role : AccessControl.UserRole,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let now = Time.now();

    let profile : UserProfile = switch (profiles.get(caller)) {
      case (null) {
        // New profile: use the role from access control system, not from parameter
        let actualRole = AccessControl.getUserRole(accessControlState, caller);
        {
          name;
          phoneNumber;
          role = actualRole;
          createdAt = now;
          lastUpdated = now;
          lastKnownLocation = null;
        };
      };
      case (?existingProfile) {
        // Existing profile: preserve the existing role, ignore the role parameter
        // Only admins can change roles via assignRole function
        {
          name;
          phoneNumber;
          role = existingProfile.role;
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
    let random = Random.crypto();
    let code = await* random.intRange(100000, 1000000);
    let codeText = code.toText();
    let entry = {
      code = codeText;
      expiry = Time.now() + (5 * 60 * 1000000000);
      verified = false;
    };

    otpChallenges.add(phoneNumber, entry);

    codeText;
  };

  public shared ({ caller }) func verifyOtpToken(phoneNumber : Text, code : Text) : async () {
    // No authorization check - this is part of the authentication flow
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

  public shared ({ caller }) func registerShop(
    shopName : Text,
    category : Text,
    address : Text,
    location : GeoPoint,
    shopImage : Storage.ExternalBlob,
  ) : async Shop {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register shops");
    };

    let shopId = shops.size().toText();
    let now = Time.now();

    let shop : Shop = {
      shopId;
      ownerId = caller;
      shopName;
      category;
      address;
      location;
      shopImage;
      isOpen = false;
      createdAt = now;
      lastUpdated = now;
    };

    shops.add(shopId, shop);
    shop;
  };

  public query ({ caller }) func getShopById(shopId : Text) : async ?Shop {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view shops");
    };
    shops.get(shopId);
  };

  public query ({ caller }) func getShopsByOwner(ownerId : Principal) : async [Shop] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view shops");
    };
    shops.values().toArray().filter(func(shop) { shop.ownerId == ownerId });
  };

  public query ({ caller }) func getAllShops() : async [Shop] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view shops");
    };
    shops.values().toArray();
  };

  public shared ({ caller }) func updateShop(
    shopId : Text,
    shopName : Text,
    category : Text,
    address : Text,
    location : GeoPoint,
    shopImage : Storage.ExternalBlob,
  ) : async Shop {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update shops");
    };

    switch (shops.get(shopId)) {
      case (null) { Runtime.trap("Shop not found. Please register a shop first.") };
      case (?existingShop) {
        // Verify ownership: only the shop owner or an admin can update
        if (existingShop.ownerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own shop");
        };

        let updatedShop = {
          existingShop with
          shopName;
          category;
          address;
          location;
          shopImage;
          lastUpdated = Time.now();
        };
        shops.add(shopId, updatedShop);
        updatedShop;
      };
    };
  };

  public shared ({ caller }) func setShopOpenStatus(shopId : Text, isOpen : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update shop status");
    };

    switch (shops.get(shopId)) {
      case (null) { Runtime.trap("Shop not found.") };
      case (?shop) {
        // Strict check: Only the actual owner principal can update open/closed status
        if (caller != shop.ownerId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the shop owner or admin can change status");
        };
        let updatedShop = {
          shop with
          isOpen;
        };
        shops.add(shopId, updatedShop);
      };
    };
  };

  public query ({ caller }) func getShopOpenStatus(shopId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view shop status");
    };
    switch (shops.get(shopId)) {
      case (null) { Runtime.trap("Shop not found") };
      case (?shop) { shop.isOpen };
    };
  };

  public shared ({ caller }) func createShopUpdate(
    shopId : Text,
    title : Text,
    description : ?Text,
    image : ?Storage.ExternalBlob,
    expiryDate : Time.Time,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only shop owners can create updates");
    };

    // Verify ownership: caller must own the shop they're creating an update for
    let shop = switch (shops.get(shopId)) {
      case (null) { Runtime.trap("Shop not found with given ID") };
      case (?validShop) { validShop };
    };

    if (caller != shop.ownerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only create updates for your own shop");
    };

    let updateId = (shopUpdates.size() + 1).toText();
    let now = Time.now();

    let newShopUpdate : ShopUpdate = {
      updateId;
      shopId;
      ownerId = caller;
      title;
      description;
      image;
      createdAt = now;
      expiryDate;
      location = shop.location;
      isActive = true;
      expiredAt = null;
    };

    shopUpdates.add(updateId, newShopUpdate);

    handleNotificationEnqueuing(shopId, updateId, newShopUpdate);
    updateId;
  };

  func createNotification(recipient : Principal, shopUpdateId : Text, shopId : Text, distance : Float) : Notification {
    let notificationId = (notifications.size() + 1).toText();
    {
      id = notificationId;
      recipient;
      shopUpdateId;
      shopId;
      distance;
      isActive = true;
      createdAt = Time.now();
    };
  };

  func handleNotificationEnqueuing(shopId : Text, _updateId : Text, shopUpdate : ShopUpdate) {
    if (not (shopUpdate.isActive and (shopUpdate.expiryDate > Time.now()))) {
      return;
    };

    if (CountHelper.getShopNotificationCount(notifications, shopId, Time.now()) >= 3) {
      return;
    };

    let eligibleCustomers = List.empty<Principal>();
    for ((ownerId, profile) in profiles.entries()) {
      if (profile.role == #user) {
        ProfileHelper.addEligibleCustomer(eligibleCustomers, ownerId, profile, shopUpdate.location);
      };
    };

    for (customer in eligibleCustomers.values()) {
      let distance = geoCalc(customer, shopUpdate.location);
      let notification = createNotification(customer, shopUpdate.updateId, shopId, distance);
      notifications.add(notification.id, notification);
    };
  };

  public query ({ caller }) func getPendingNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view notifications");
    };

    // Filter notifications to only return those belonging to the caller
    notifications.values().toArray().filter(func(notification : Notification) : Bool {
      notification.recipient == caller and notification.isActive
    });
  };

  public shared ({ caller }) func acknowledgeNotifications(notificationIds : [NotificationId]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can acknowledge notifications");
    };

    for (notificationId in notificationIds.values()) {
      switch (notifications.get(notificationId)) {
        case (null) { () };
        case (?notification) {
          // Verify ownership: caller must be the recipient of the notification
          if (notification.recipient != caller) {
            Runtime.trap("Unauthorized: Can only acknowledge your own notifications");
          };
          handleNotificationAcknowledge(notificationId, notification);
        };
      };
    };
  };

  func handleNotificationAcknowledge(notificationId : NotificationId, notification : Notification) {
    let updatedNotification = {
      notification with
      isActive = false;
    };

    notifications.add(notificationId, updatedNotification);
  };

  public query ({ caller }) func getShopUpdate(updateId : Text) : async ?ShopUpdate {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view shop updates");
    };

    let currentTime = Time.now();

    switch (shopUpdates.get(updateId)) {
      case (null) { null };
      case (?update) {
        // Allow access if: caller owns the shop OR update is active and not expired
        let shop = shops.get(update.shopId);
        let isOwner = switch (shop) {
          case (null) { false };
          case (?s) { s.ownerId == caller or AccessControl.isAdmin(accessControlState, caller) };
        };

        let isActiveAndValid = update.isActive and (currentTime <= update.expiryDate);

        if (isOwner or isActiveAndValid) {
          ?update
        } else {
          null
        };
      };
    };
  };

  public query ({ caller }) func getAllShopUpdatesForShop(shopId : Text) : async [ShopUpdate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view shop updates");
    };

    // Verify ownership: only shop owner or admin can see all updates (including expired)
    let shop = switch (shops.get(shopId)) {
      case (null) { Runtime.trap("Shop not found") };
      case (?s) { s };
    };

    if (caller != shop.ownerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view all updates for your own shop");
    };

    let filtered : [?ShopUpdate] = shopUpdates.values().toArray().map(
      func(su) {
        if (su.shopId == shopId) { ?su } else { null };
      }
    );

    filtered.filter(func(x) { x != null }).map(
      func(x) { switch (x) { case (?v) { v }; case (null) { Runtime.trap("Unexpected null in filtered array") } } }
    );
  };

  public query ({ caller }) func getAllActiveShopUpdates() : async [ShopUpdate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view shop updates");
    };
    let currentTime = Time.now();
    let filtered = shopUpdates.values().toArray().filter(
      func(su) { su.isActive and (currentTime <= su.expiryDate) }
    );
    filtered;
  };

  public shared ({ caller }) func updateShopUpdate(
    updateId : Text,
    title : Text,
    description : ?Text,
    image : ?Storage.ExternalBlob,
    expiryDate : Time.Time,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only shop owners can update posts");
    };

    switch (shopUpdates.get(updateId)) {
      case (null) { Runtime.trap("ShopUpdate not found.") };
      case (?update) {
        // Verify ownership: caller must own the shop this update belongs to
        let shop = switch (shops.get(update.shopId)) {
          case (null) { Runtime.trap("Shop not found") };
          case (?validShop) { validShop };
        };

        if (caller != shop.ownerId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own shop's posts");
        };
        updateShopUpdateInternal(updateId, update, title, description, image, expiryDate);
      };
    };
  };

  func updateShopUpdateInternal(
    updateId : Text,
    originalUpdate : ShopUpdate,
    title : Text,
    description : ?Text,
    image : ?Storage.ExternalBlob,
    expiryDate : Time.Time,
  ) {
    let newUpdate : ShopUpdate = {
      originalUpdate with
      title;
      description;
      image;
      expiryDate;
      isActive = true;
      createdAt = Time.now();
      expiredAt = null;
    };

    shopUpdates.add(updateId, newUpdate);
  };

  public shared ({ caller }) func deleteShopUpdate(updateId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only shop owners can delete posts");
    };

    switch (shopUpdates.get(updateId)) {
      case (null) { Runtime.trap("ShopUpdate not found.") };
      case (?update) {
        // Verify ownership: caller must own the shop this update belongs to
        let shop = switch (shops.get(update.shopId)) {
          case (null) { Runtime.trap("Shop not found") };
          case (?validShop) { validShop };
        };

        if (caller != shop.ownerId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own shop's posts");
        };

        shopUpdates.remove(updateId);
      };
    };
  };

  public query ({ caller }) func getCustomerHomeFeed(referenceLat : Float, referenceLon : Float) : async [FeedShopUpdate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access the home feed");
    };

    let referenceCoordinates : GeoPoint = {
      latitude = referenceLat;
      longitude = referenceLon;
    };

    let currentTime = Time.now();

    // Filtering and mapping updates
    let filteredUpdates = (shopUpdates.values().toArray()).map(
      func(update) {
        let (shopName, shopCategory) = switch (shops.get(update.shopId)) {
          case (null) { ("", "") };
          case (?shop) { (shop.shopName, shop.category) };
        };

        {
          updateId = update.updateId;
          shopId = update.shopId;
          ownerId = update.ownerId;
          shopName;
          shopCategory;
          title = update.title;
          description = update.description;
          image = update.image;
          createdAt = update.createdAt;
          expiryDate = update.expiryDate;
          location = update.location;
          isActive = update.isActive;
        };
      }
    );

    // Populating filteredWithDistance using a for loop
    var filteredWithDistance = ([] : [FeedShopUpdateWithDistance]);
    for (update in filteredUpdates.values()) {
      let distance = calcDistance(referenceCoordinates.latitude, referenceCoordinates.longitude, update.location.latitude, update.location.longitude);
      // Only include active and unexpired updates within 3km
      if (update.isActive and currentTime <= update.expiryDate and distance <= 3.0) {
        filteredWithDistance := filteredWithDistance.concat([{ feedUpdate = update; distance }]);
      };
    };

    filteredWithDistance.sort(FeedShopUpdateWithDistance.compareForSorting).map(
      func(item) { item.feedUpdate }
    );
  };

  func geoCalc(_customer : Principal, location : GeoPoint) : Float {
    calcDistance(location.latitude, location.longitude, location.latitude, location.longitude);
  };

  func calcDistance(lat1 : Float, lon1 : Float, lat2 : Float, lon2 : Float) : Float {
    let toRadians : (Float) -> Float = func(deg) { deg * 3.14159265359 / 180.0 };
    let dLat = toRadians(lat2 - lat1);
    let dLon = toRadians(lon2 - lon1);

    let a = (
      (1.0 - Float.cos(dLat)) / 2.0 +
      Float.cos(toRadians(lat1)) * Float.cos(toRadians(lat2)) *
      (1.0 - Float.cos(dLon)) / 2.0
    ) ** 0.5;

    let earthRadius = 6371.0;
    2.0 * earthRadius * a;
  };

  public shared ({ caller }) func favoriteShop(shopId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can favorite shops");
    };

    switch (shops.get(shopId)) {
      case (null) { Runtime.trap("Shop not found") };
      case (_shop) {
        let _favorites = switch (customerFavorites.get(caller)) {
          case (null) {
            let newSet = Set.empty<Text>();
            newSet.add(shopId);
            customerFavorites.add(caller, newSet);
            newSet;
          };
          case (?set) {
            set.add(shopId);
            set;
          };
        };
      };
    };
  };

  public shared ({ caller }) func unfavoriteShop(shopId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can unfavorite shops");
    };

    switch (customerFavorites.get(caller)) {
      case (null) { Runtime.trap("No favorites found for caller") };
      case (?set) {
        set.remove(shopId);
      };
    };
  };

  public query ({ caller }) func getCustomerFavorites() : async [Shop] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get favorites");
    };

    switch (customerFavorites.get(caller)) {
      case (null) { [] };
      case (?set) {
        let iter = set.values();
        let shopIter = iter.map(func(id) { shops.get(id) });
        let filtered = shopIter.filter(func(x) { x != null });
        filtered.map(func(x) { switch (x) { case (?v) { v }; case (null) { Runtime.trap("Unexpected null in filtered array") } } }).toArray();
      };
    };
  };

  public query ({ caller }) func isShopFavoritedByCaller(shopId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check favorites");
    };

    switch (customerFavorites.get(caller)) {
      case (null) { false };
      case (?set) { set.contains(shopId) };
    };
  };

  module CountHelper {
    public func getShopNotificationCount(notifications : Map.Map<Text, Notification>, shopId : Text, currentTime : Time.Time) : Nat {
      let today = currentTime / (24 * 60 * 60 * 1000000000); // Convert to number of days since epoch
      var count = 0;
      for (notification in notifications.values()) {
        if (notification.shopId == shopId) {
          let notificationDay = notification.createdAt / (24 * 60 * 60 * 1000000000);
          if (notificationDay == today) {
            count += 1;
          };
        };
      };
      count;
    };
  };

  module ProfileHelper {
    public func addEligibleCustomer(eligibleCustomers : List.List<Principal>, ownerId : Principal, profile : UserProfile, location : GeoPoint) {
      switch (profile.lastKnownLocation) {
        case (?lastLoc) {
          let distance = geoCalc(ownerId, location);
          if (distance <= 3.0) {
            eligibleCustomers.add(ownerId);
          };
        };
        case (null) {};
      };
    };
  };
};

