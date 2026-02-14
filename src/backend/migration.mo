import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type OldShopUpdate = {
    updateId : Text;
    shopId : Text;
    ownerId : Principal.Principal;
    title : Text;
    description : ?Text;
    image : ?Storage.ExternalBlob;
    createdAt : Time.Time;
    expiryDate : Time.Time;
    location : { latitude : Float; longitude : Float };
    isActive : Bool;
  };

  type OldActor = {
    profiles : Map.Map<Principal.Principal, { name : ?Text; phoneNumber : Text; role : { #admin; #user; #guest }; createdAt : Time.Time; lastUpdated : Time.Time; lastKnownLocation : ?{ latitude : Float; longitude : Float; timestamp : Time.Time } }>;
    otpChallenges : Map.Map<Text, { code : Text; expiry : Time.Time; verified : Bool }>;
    shops : Map.Map<Text, { shopId : Text; ownerId : Principal.Principal; shopName : Text; category : Text; address : Text; location : { latitude : Float; longitude : Float }; shopImage : Storage.ExternalBlob; isOpen : Bool; createdAt : Time.Time; lastUpdated : Time.Time }>;
    shopUpdates : Map.Map<Text, OldShopUpdate>;
    customerFavorites : Map.Map<Principal.Principal, Set.Set<Text>>;
    notifications : Map.Map<Text, { id : Text; recipient : Principal.Principal; shopUpdateId : Text; shopId : Text; distance : Float; isActive : Bool; createdAt : Time.Time }>;
  };

  // New ShopUpdate type with expiredAt field
  type NewShopUpdate = {
    updateId : Text;
    shopId : Text;
    ownerId : Principal.Principal;
    title : Text;
    description : ?Text;
    image : ?Storage.ExternalBlob;
    createdAt : Time.Time;
    expiryDate : Time.Time;
    location : { latitude : Float; longitude : Float };
    isActive : Bool;
    expiredAt : ?Time.Time;
  };

  type NewActor = {
    profiles : Map.Map<Principal.Principal, { name : ?Text; phoneNumber : Text; role : { #admin; #user; #guest }; createdAt : Time.Time; lastUpdated : Time.Time; lastKnownLocation : ?{ latitude : Float; longitude : Float; timestamp : Time.Time } }>;
    otpChallenges : Map.Map<Text, { code : Text; expiry : Time.Time; verified : Bool }>;
    shops : Map.Map<Text, { shopId : Text; ownerId : Principal.Principal; shopName : Text; category : Text; address : Text; location : { latitude : Float; longitude : Float }; shopImage : Storage.ExternalBlob; isOpen : Bool; createdAt : Time.Time; lastUpdated : Time.Time }>;
    shopUpdates : Map.Map<Text, NewShopUpdate>;
    customerFavorites : Map.Map<Principal.Principal, Set.Set<Text>>;
    notifications : Map.Map<Text, { id : Text; recipient : Principal.Principal; shopUpdateId : Text; shopId : Text; distance : Float; isActive : Bool; createdAt : Time.Time }>;
  };

  public func run(old : OldActor) : NewActor {
    let newShopUpdates : Map.Map<Text, NewShopUpdate> = old.shopUpdates.map<Text, OldShopUpdate, NewShopUpdate>(
      func(_updateId, oldShopUpdate) {
        { oldShopUpdate with expiredAt = null };
      }
    );
    { old with shopUpdates = newShopUpdates };
  };
};
