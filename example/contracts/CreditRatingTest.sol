// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract CreditRatingTest {
    uint256 public defaultCollateralFactor = 60; // Default collatoral factor (User can borrow at max 60% of supplied collatoral)

    struct CreditProfile {
        address id; // Unique identifier for each user profile
        uint256 amountOfDefaults; // Amount of defaults a user has
        uint256 creationDate; // Could possibly use this to calculate length of credit history
        uint256 accountBalance; // in Wei
        uint256 borrowAmount; // % amount that user can borrow
    }

    // Basis for a user credit profile (maps address to struct)
    mapping(address => CreditProfile) public userCreditRating;

    modifier haveProfile() {
        require(
            userCreditRating[msg.sender].id == msg.sender,
            "Need to create a Credit Profile"
        );
        _;
    }

    // Allows user to create a credit profile
    function createProfile() public {
        // Checks if user already a credit profile
        require(
            userCreditRating[msg.sender].id != msg.sender,
            "Already created Credit Profile"
        );

        userCreditRating[msg.sender] = CreditProfile(
            msg.sender,
            0,
            block.timestamp,
            msg.sender.balance,
            defaultCollateralFactor
        );
    }

    // Updates user credit profile to reflect a default
    function defaultLoan() public haveProfile {
        userCreditRating[msg.sender].amountOfDefaults++;
        updateBorrowAmount();
    }

    // Updates user credit profile to reflect a user's borrow amount if they defaulted a certain number of times
    function updateBorrowAmount() internal haveProfile {
        if (userCreditRating[msg.sender].amountOfDefaults >= 2) {
            userCreditRating[msg.sender].borrowAmount =
                defaultCollateralFactor -
                10;
        } else if (userCreditRating[msg.sender].amountOfDefaults > 0) {
            userCreditRating[msg.sender].borrowAmount =
                defaultCollateralFactor -
                5;
        }
    }

    // Gets borrow amount for a specific user from their credit profile
    function getBorrowAmount() public view haveProfile returns (uint256) {
        return userCreditRating[msg.sender].borrowAmount;
    }
}
