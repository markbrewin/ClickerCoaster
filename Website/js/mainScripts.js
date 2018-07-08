var currentMoney = 50;
var currentGuests = 0;
var parkCapacity = 5;
var parkValue = 0;
var sharesAvailable = 100;

var parkRating = [
    '<i class="material-icons">star_border</i><i class="material-icons">star_border</i><i class="material-icons">star_border</i><i class="material-icons">star_border</i><i class="material-icons">star_border</i>',
    '<i class="material-icons">star_half</i><i class="material-icons">star_border</i><i class="material-icons">star_border</i><i class="material-icons">star_border</i><i class="material-icons">star_border</i>',
    '<i class="material-icons">star</i><i class="material-icons">star_border</i><i class="material-icons">star_border</i><i class="material-icons">star_border</i><i class="material-icons">star_border</i>',
    '<i class="material-icons">star</i><i class="material-icons">star_half</i><i class="material-icons">star_border</i><i class="material-icons">star_border</i><i class="material-icons">star_border</i>',
    '<i class="material-icons">star</i><i class="material-icons">star</i><i class="material-icons">star_border</i><i class="material-icons">star_border</i><i class="material-icons">star_border</i>',
    '<i class="material-icons">star</i><i class="material-icons">star</i><i class="material-icons">star_half</i><i class="material-icons">star_border</i><i class="material-icons">star_border</i>',
    '<i class="material-icons">star</i><i class="material-icons">star</i><i class="material-icons">star</i><i class="material-icons">star_border</i><i class="material-icons">star_border</i>',
    '<i class="material-icons">star</i><i class="material-icons">star</i><i class="material-icons">star</i><i class="material-icons">star_half</i><i class="material-icons">star_border</i>',
    '<i class="material-icons">star</i><i class="material-icons">star</i><i class="material-icons">star</i><i class="material-icons">star</i><i class="material-icons">star_border</i>',
    '<i class="material-icons">star</i><i class="material-icons">star</i><i class="material-icons">star</i><i class="material-icons">star</i><i class="material-icons">star_half</i>',
    '<i class="material-icons">star</i><i class="material-icons">star</i><i class="material-icons">star</i><i class="material-icons">star</i><i class="material-icons">star</i>'
];

//On Document Load

function loadSetUp() {
    if(typeof(Storage) !== "undefined") {
        if(localStorage.getItem("attractions") !== null){
            attractionsOwned = JSON.parse(localStorage.getItem("attractions"));
        }
        if(localStorage.getItem("staff") !== null){
            staffOwned = JSON.parse(localStorage.getItem("staff"));
        }
        if(localStorage.getItem("money") !== null){
            currentMoney = JSON.parse(localStorage.getItem("money"));
        }
        if(localStorage.getItem("guests") !== null){
            parkCapacity = JSON.parse(localStorage.getItem("guests"));
        }
        if(localStorage.getItem("shares") !== null){
            sharesAvailable = JSON.parse(localStorage.getItem("shares"));
        }
        if(localStorage.getItem("value") !== null){
            parkValue = JSON.parse(localStorage.getItem("value"));
        }
    } else {
        Materialize.toast('Cookies are disabled, this means your progress will not be saved.');
    }
    
    $('#mdlCookies').openModal();
    $('#splashscreen').delay(2500).fadeOut(2000);
    $("#changelog").load("changelog.html");
    $("#facilities").load("facilities.html");
    $("#rides").load("rides.html");
    $("#staff").load("staff.html");
    $("#merchandise").load("merchandise.html");
    $("#businessOverview").load("boardroom.html");

    window.setTimeout(function(){
        initialiseRides();
    }, 1000);
}

//Update Main

function updateMain(){
    currentMoney = Math.round(currentMoney);
    //var displayMoney = currentMoney.toLocaleString('en-US');
    $('#currentMoney').html(numberWithCommas(currentMoney));
    $('#currentGuests').html(currentGuests);
    $('#currentRating').html(calculateParkRating());
    $('.versionNumber').html(versionNumber);
    $('#parkValue').html(numberWithCommas(Math.round(parkValue)));
    $('#sharesAvailable').html(sharesAvailable);
    $('#parkCapacity').html(parkCapacity);
}

//Park Capacity check

function parkCapacityCheck(amount){
    if (amount > parkCapacity) {
        currentGuests = parkCapacity;
    }else if(amount < 0){
        currentGuests = 0;
    }
}

//For purchasing rides
function purchaseAttraction(attraction) {
    if(attractionsOwned.hasOwnProperty(attraction)){
        var rideName = attractionsOwned[attraction];
        
        ga('send', {
          hitType: 'event',
          eventCategory: rideName.name,
          eventAction: 'PurchaseRequest',
          eventLabel:  rideName.fullName + ' purchase requested'
        });
        
        
        if(currentMoney >= rideName.costNext){
            ga('send', {
              hitType: 'event',
              eventCategory: rideName.name,
              eventAction: 'Purchased',
              eventLabel:  rideName.fullName + ' purchased'
            });
            
            rideName.amountOwned += 1;
            currentMoney -= rideName.costNext;
            parkValue += rideName.costNext;
            parkCapacity += rideName.addCapacity;
            
            rideName.costNext += Math.floor(rideName.costBase*Math.pow(1.3,rideName.amountOwned));
            
            if(rideName.amountOwned % 100 === 0){
                rideName.addMoney *= 2.5;
                
                Materialize.toast('Additional money for the ' + rideName.fullName + ' has been increased!', 4000);
            }else if(rideName.amountOwned % 50 === 0){
                rideName.addMoney *= 1.6;
                
                Materialize.toast('Additional money for the ' + rideName.fullName + ' has been increased!', 4000);
            }else if(rideName.amountOwned % 25 === 0){
                rideName.duration /= 2;
                
                if(rideName.durationRemaining > rideName.duration){
                    rideName.durationRemaining = rideName.duration;
                }
                
                Materialize.toast('Ride duration of the ' + rideName.fullName + ' has been halved!', 4000);
            }
            
            if(rideName.amountOwned === 10){
                 rideName.duration /= 2;
                
                if(rideName.durationRemaining > rideName.duration){
                    rideName.durationRemaining = rideName.duration;
                }
                
                Materialize.toast('Ride duration of the ' + rideName.fullName + ' has been halved!', 4000);
            }
            
            $('#next' + rideName.name + 'Cost').html(numberWithCommas(rideName.costNext));
            $('#' + rideName.name +'Count').html(rideName.amountOwned);
        }else{
            Materialize.toast('That costs &Phi;' + numberWithCommas(rideName.costNext) + ', you only have &Phi;' + numberWithCommas(currentMoney) + '.', 4000);
        }
    }
}

function purchaseStaff(staff) {
    ga('send', {
      hitType: 'event',
      eventCategory: 'Staff',
      eventAction: 'PurchaseRequest',
      eventLabel: 'Staff purchase requested'
    });
    if(staffOwned.hasOwnProperty(staff)){
        var staffName = staffOwned[staff];
        
        if(currentMoney >= staffName.costNext){
            ga('send', {
              hitType: 'event',
              eventCategory: 'Staff',
              eventAction: 'Purchased',
              eventLabel: 'Staff purchased',
              eventValue: currentMoney
            });
            staffName.amountOwned += 1;
            currentMoney -= staffName.costNext;
            
            staffName.costNext += Math.floor(staffName.costBase*Math.pow(1.8,staffName.amountOwned));
            
            $('#' + staffName.name + 'Cost').html(numberWithCommas(staffName.costNext));
            $('#' + staffName.name +'Count').html(staffName.amountOwned);
            
            if(staffName.name == "operator"){
                if(staffName.amountOwned < Object.keys(attractionsOwned).length){
                    for(var ride in attractionsOwned){
                        if(attractionsOwned.hasOwnProperty(ride)){
                            var rideName = attractionsOwned[ride];
                            
                            if(rideName.operatorOwned === 0){
                                rideName.operatorOwned += 1;
                                rideName.operating = true;
                                
                                break;
                            }
                        }
                    }
                } else {
                    var randRide;
                    var count = 0;
                    
                    if(attractionsOwned.playarea.amountOwned > 0){
                        while(true){
                            for (var randomRide in attractionsOwned){
                                if (Math.random() < 1/++count){
                                    randRide = randomRide;
                                }
                            }
                            
                            var randRideName = attractionsOwned[randRide];
                            
                            if(randRideName.amountOwned > 0){
                                randRideName.addMoney += randRideName.addMoney * 0.3;
                                randRideName.operatorOwned += 1;
                                
                                Materialize.toast('The additional money of ' + randRideName.fullName + ' has been increased!', 4000);
                                
                                break;
                            }
                        }
                    }
                }
            }
        }else{
            Materialize.toast('That costs &Phi;' + numberWithCommas(staffName.costNext) + ', you only have &Phi;' + numberWithCommas(currentMoney) + '.', 4000);
        }
    }
}

function operateAttraction(attraction){
    if(attractionsOwned.hasOwnProperty(attraction)){
        var rideName = attractionsOwned[attraction];
        
        if(!rideName.operating){
            rideName.operating = true;
            
            ga('send', {
              hitType: 'event',
              eventCategory: rideName.name,
              eventAction: 'Operated',
              eventLabel: rideName.fullName + ' operated'
            });
        }
    }
}

function resetProgress(attractionData, attractionDataTwo) {
    if(attractionData <= 0){
        progress = 0;
        $('#' + attractionDataTwo + 'Progress').width(progress + "%");
    }
}

//Calculate Additional Money
function calcAdditionMoney(){
    var calcMoney = 0;
    
    for(var ride in attractionsOwned){
        if(attractionsOwned.hasOwnProperty(ride)){
            var rideName = attractionsOwned[ride];
            
            if(rideName.amountOwned > 0 & rideName.operating === true){
                rideName.durationRemaining -= 1;
                
                var progress = Math.round((100 / rideName.duration) * (rideName.duration - rideName.durationRemaining));
                $('#' + rideName.name +'Progress').width(progress + "%");
                
                setTimeout(resetProgress(rideName.durationRemaining, rideName.name), 1000);
                
                if(rideName.durationRemaining <= 0){
                    calcMoney += rideName.amountOwned * rideName.addMoney;
                    
                    rideName.durationRemaining = rideName.duration;
                    if(rideName.operatorOwned === 0){
                        rideName.operating = false;
                    }
                }
            }
        }
    }
    
    return calcMoney;
}

function calcAdditionGuest(){
    var calcGuest = 0;
    
    for(var ride in attractionsOwned){
        if(attractionsOwned.hasOwnProperty(ride)){
            var rideName = attractionsOwned[ride];
            calcGuest += rideName.amountOwned * rideName.addGuest;
        }
    }
    
    var randGuestChance = Math.floor(Math.random() * 10) + 1; 
    var randGuestAmount = Math.floor(Math.random() * Math.round(calcGuest * 0.25)) + 1;
    
    if (randGuestChance < 5) {
        return 0;
    } else if (randGuestChance >= 5 && randGuestChance <= 8) {
        return randGuestAmount;
    } else {
        return randGuestAmount * -1;
    }
}


var guestCounter = 0;
var saveCounter = 0;

window.setInterval(function(){
    var additionMoney = calcAdditionMoney();
    
    if (guestCounter === 10) {
        var additionGuest = calcAdditionGuest();
        
        currentGuests += additionGuest;
    
        parkCapacityCheck(currentGuests);
        guestCounter = 0;
    } else {
        guestCounter += 1;
    }
    
    if (saveCounter === 500) {
        localStorage.setItem("attractions", JSON.stringify(attractionsOwned));
        localStorage.setItem("staff", JSON.stringify(staffOwned));
        localStorage.setItem("money", JSON.stringify(currentMoney));
        localStorage.setItem("guests", JSON.stringify(parkCapacity));
        localStorage.setItem("shares", JSON.stringify(sharesAvailable));
        localStorage.setItem("value", JSON.stringify(parkValue));
        
        Materialize.toast("Progress saved!", 2500);
        saveCounter = 0;
    } else {
        saveCounter++;
    }
    
    currentMoney += additionMoney;
    
    updateMain();
}, 100);

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function sellShare() {
    var sellSharePrice = (parkValue * 0.1) * 1.3;
    currentMoney = currentMoney + sellSharePrice;
    parkValue = parkValue * 1.2;
    sharesAvailable -= 10;
    updateMain();
    if (sharesAvailable <= 50) {
        alert('Fancy "you sold your park screen"');
    }
}

function buyShare() {
    if(sharesAvailable < 100){
        var buySharePrice = (parkValue * 0.1) * 1.4;
        if(currentMoney >= buySharePrice) {
            currentMoney -= buySharePrice;
            parkValue *= 0.8;
            sharesAvailable += 10;
            updateMain();
        } else {
            Materialize.toast('You dont have enough moolah, that costs &Phi;' + numberWithCommas(buySharePrice), 4000);
        }
    }
}

function calculateParkRating() {
    var parkRatingVal = 0;
    var numberRides = 0;
    var amountOwned = 0;
    var operatorsOwned = 0;
    
    for(var ride in attractionsOwned){
        if(attractionsOwned.hasOwnProperty(ride)){
            rideName = attractionsOwned[ride];
            
            numberRides += 1;
            amountOwned += rideName.amountOwned;
            operatorsOwned += rideName.operatorOwned;
        }
    }

    parkRatingVal = (10 * (amountOwned * 0.01) + (operatorsOwned * 0.001));
    parkRatingVal = Math.round(parkRatingVal);
    return(parkRating[parkRatingVal]);
    
}