import Int "mo:base/Int";
import Text "mo:base/Text";

import Array "mo:base/Array";
import Order "mo:base/Order";

actor {
  stable var highScores : [(Text, Int)] = [];

  public func addHighScore(name : Text, score : Int) : async () {
    highScores := Array.sort(
      Array.append(highScores, [(name, score)]),
      func(a : (Text, Int), b : (Text, Int)) : Order.Order {
        if (a.1 < b.1) { #greater }
        else if (a.1 > b.1) { #less }
        else { #equal }
      }
    );
    if (highScores.size() > 10) {
      highScores := Array.subArray(highScores, 0, 10);
    };
  };

  public query func getHighScores() : async [(Text, Int)] {
    highScores
  };
}
