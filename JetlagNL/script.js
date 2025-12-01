document.getElementById("askButton").addEventListener("click", answerQuestion);
document.getElementById("GuesseButton").addEventListener("click", GuesseCity);

const AirportPin = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/9922/9922064.png',
    iconSize: [32, 32],      // grootte van de icon
    iconAnchor: [16, 32],    // punt dat exact op de locatie staat
    popupAnchor: [0, -32]    // positie van popup t.o.v. icon
});
const StationPin = L.icon({
    iconUrl: 'https://www.bordenstift.nl/wp-content/uploads/2018/11/NS-logo-rond.png',
    iconSize: [32, 32],      // grootte van de icon
    iconAnchor: [16, 32],    // punt dat exact op de locatie staat
    popupAnchor: [0, -32]    // positie van popup t.o.v. icon
}); 
const ThemeparkPin = L.icon({
    iconUrl: 'Themepark.png',
    iconSize: [32, 32],      // grootte van de icon
    iconAnchor: [16, 32],    // punt dat exact op de locatie staat
    popupAnchor: [0, -32]    // positie van popup t.o.v. icon
}); 

//create Map
const key = 'hONND70ZnmXTTP4XOnck';
const map = L.map('map',{
        maxBounds: [[53.66, 3], [50.66, 7.1]],
        maxBoundsViscosity: 1.0, 
    }).setView([52.2018052, 5.4360145,8.21], 8); //starting position
L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${key}`,{ tileSize: 512, zoomOffset: -1, minZoom: 8,maxzoom: 19, crossOrigin: true}).addTo(map);


//Fill in the Location field
const dropdown = document.getElementById("location");
var cityMarkers = [];
let currentProvince = "";
let optgroup;

City.forEach((City, index) => {
    if (City.province !== currentProvince) {
        currentProvince = City.province;
        optgroup = document.createElement("optgroup");
        optgroup.label = currentProvince;
        dropdown.appendChild(optgroup);
    }

    const optionElement = document.createElement("option");
    optionElement.value = index; 
    optionElement.textContent = City.name;
    dropdown.appendChild(optionElement);

    //Pin toevoegen per station
    const marker = L.marker([City.latitude, City.longitude], {icon: StationPin}).addTo(map);
    marker.bindPopup(City.name);
    cityMarkers[City.name] = marker;

    // Klik op marker → selecteert automatisch die stad in dropdown
    marker.on("click", () => { dropdown.value = index;});
});

Airports.forEach((Airport) => {
    //Pin toevoegen per station
    const marker = L.marker([Airport.latitude, Airport.longitude], {icon:AirportPin}).addTo(map);
    marker.bindPopup(Airport.name);
});
Themeparks.forEach((Themepark) => {
    //Pin toevoegen per station
    const marker = L.marker([Themepark.latitude, Themepark.longitude], {icon:ThemeparkPin}).addTo(map);
    marker.bindPopup(Themepark.name);
});

function closestThemeparkForCities() {
    let result = {};

    City.forEach(city => {
        let closestThemepark = null;
        let shortestDistance = Infinity;

        Themeparks.forEach(Themepark => {
            const dist = distanceBetweenPoints(
                city.latitude,
                city.longitude,
                Themepark.latitude,
                Themepark.longitude
            );

            if (dist < shortestDistance) {
                shortestDistance = dist;
                closestThemepark = Themepark;
            }
        });

        result[city.name] = {
            Themepark: closestThemepark.name,
            distanceKm: shortestDistance
        };
    });

    return result;
}
var closestThemeparks = closestThemeparkForCities();

function closestAirportForCities() {
    let result = {};

    City.forEach(city => {
        let closestAirport = null;
        let shortestDistance = Infinity;

        Airports.forEach(airport => {
            const dist = distanceBetweenPoints(
                city.latitude,
                city.longitude,
                airport.latitude,
                airport.longitude
            );

            if (dist < shortestDistance) {
                shortestDistance = dist;
                closestAirport = airport;
            }
        });

        result[city.name] = {
            airport: closestAirport.name,
            distanceKm: shortestDistance
        };
    });

    return result;
}
var closestAirport = closestAirportForCities();

function RemoveCityMarker(name){
    map.removeLayer(cityMarkers[name]);
    cityMarkers.splice(cityMarkers[name], 1);
}

const HidePlace = Math.round(Math.random()*City.length -1);

function distanceBetweenPoints(lat1, lon1, lat2, lon2) {
    R = 6371; // Aarde straal in km
    dLat = (lat2 - lat1) * Math.PI / 180;
    dLon = (lon2 - lon1) * Math.PI / 180;

    a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // afstand in km
}
function questionLongitude(hidePlace, location){
    if(hidePlace.longitude <= location.longitude){
        L.rectangle([[-180,location.longitude],[180,180]] ).addTo(map);
        for (const cityName in cityMarkers) {
            index = City.findIndex(c => c.name === cityName);
            if(City[index].longitude > location.longitude){
                RemoveCityMarker(cityName);
            }    
        }
        return "De locatie is ten westen van je";
    }
    else if (hidePlace.longitude >= location.longitude) {        
        L.rectangle([[-180,location.longitude],[180,-180]] ).addTo(map);
        for (const cityName in cityMarkers) {
            index = City.findIndex(c => c.name === cityName);
            if(City[index].longitude < location.longitude){
                RemoveCityMarker(cityName);
            }    
        }
        return "De locatie is ten oosten van je";
    }
    else
        return "Oeps er ging iets fout met je Longitude";
}
function questionLatitude(hidePlace, location){
    if(hidePlace.latitude <= location.latitude){
        L.rectangle([[location.latitude,-180],[180,180]] ).addTo(map);
        for (const cityName in cityMarkers) {
            index = City.findIndex(c => c.name === cityName);
            if(City[index].latitude > location.latitude){
                RemoveCityMarker(cityName);
            }    
        }
        return "De locatie is ten zuiden van je"
    }
    else if (hidePlace.latitude >= location.latitude) {
        L.rectangle([[-180,-180],[location.latitude,180]] ).addTo(map);
        for (const cityName in cityMarkers) {
            index = City.findIndex(c => c.name === cityName);
            if(City[index].latitude < location.latitude){
                RemoveCityMarker(cityName);
            }    
        }
        return "De locatie is ten Noorden van je"
    }
    else
        return "Oeps er ging iets fout met je Latitude"
}
function questionRadius(hidePlace, location, radius){
    distance = distanceBetweenPoints(hidePlace.latitude, hidePlace.longitude, location.latitude, location.longitude);
    if(distance <= radius){
        //L.circle([location.latitude,location.longitude], {radius: (radius * 1000)}).addTo(map)
        new L.Donut([location.latitude,location.longitude],{radius: 99999999,innerRadius: radius* 1000,innerRadiusAsPercent: false,}).addTo(map);
        for (const cityName in cityMarkers) {
            index = City.findIndex(c => c.name === cityName);
            tempDistance = distanceBetweenPoints(City[index].latitude, City[index].longitude, location.latitude, location.longitude);
            if(tempDistance > radius){
                RemoveCityMarker(cityName);
            }    
        }

        return "De locatie is in een radius van " + radius;
    }
    else if (distance >= radius) {
        L.circle([location.latitude,location.longitude], {radius: (radius * 1000)}).addTo(map)
        for (const cityName in cityMarkers) {
            index = City.findIndex(c => c.name === cityName);
            tempDistance = distanceBetweenPoints(City[index].latitude, City[index].longitude, location.latitude, location.longitude);
            if(tempDistance < radius){
                RemoveCityMarker(cityName);
            }    
        }
        return "De locatie is NIET in een radius van " + radius;
    }
    else
        return "Oeps er ging iets fout met je radius";
}
function questionAltitude(hidePlace, location){
    if(hidePlace.altitude <= location.altitude){
        for (const cityName in cityMarkers) {
            index = City.findIndex(c => c.name === cityName);
            if(City[index].altitude > location.altitude){
                RemoveCityMarker(cityName);
            }    
        }
        return "De locatie is Lager gelegen dan jij"
    }
    else if (hidePlace.altitude >= location.altitude) {
        for (const cityName in cityMarkers) {
            index = City.findIndex(c => c.name === cityName);
            if(City[index].altitude < location.altitude){
                RemoveCityMarker(cityName);
            }    
        }
        return "De locatie is Hoger gelegen dan jij"
    }
    else
        return "Oeps er ging iets fout met je Altitude"
}
function questionProvince(hidePlace, location){
    if(hidePlace.province == location.province){
        for (const cityName in cityMarkers) {
            index = City.findIndex(c => c.name === cityName);
            if(City[index].province != location.province){
                RemoveCityMarker(cityName);
            }    
        }
        return "De locatie is in dezelfde Provincie als jij"
    }
    else if (hidePlace.province != location.province) {
        for (const cityName in cityMarkers) {
            index = City.findIndex(c => c.name === cityName);
            if(City[index].province == location.province){
                RemoveCityMarker(cityName);
            }    
        }
        return "De locatie is NIET in dezelfde Provincie als jij"
    }
    else
        return "Oeps er ging iets fout met je provincie"
}
function questionAirport(hidePlace, location){
    var AirportGuesse = closestAirport[location.name].airport;
    if(AirportGuesse == closestAirport[hidePlace.name].airport){
        for (const cityName in cityMarkers) {
            index = City.findIndex(c => c.name === cityName);
            if(AirportGuesse != closestAirport[cityName].airport){
                RemoveCityMarker(cityName);
            }    
        }
        return "De dichsbijzijnde luchthaven is hetzelfde als die van jou"
    }
    else if (AirportGuesse != closestAirport[hidePlace.name].airport) {
        for (const cityName in cityMarkers) {
            index = City.findIndex(c => c.name === cityName);
            if(AirportGuesse == closestAirport[cityName].airport){
                RemoveCityMarker(cityName);
            }     
        }
        return "De dichsbijzijnde luchthaven is NIET hetzelfde als die van jou"
    }
    else
        return "Oeps er ging iets fout met je Airport"
}
function questionThemepark(hidePlace, location){
    var ThemeparkGuesse = closestThemeparks[location.name].Themepark;
    if(ThemeparkGuesse == closestThemeparks[hidePlace.name].Themepark){
        for (const cityName in cityMarkers) {
            index = City.findIndex(c => c.name === cityName);
            if(ThemeparkGuesse != closestThemeparks[cityName].Themepark){
                RemoveCityMarker(cityName);
            }    
        }
        return "De dichsbijzijnde attractiepark is hetzelfde als die van jou"
    }
    else if (ThemeparkGuesse != closestThemeparks[hidePlace.name].Themepark) {
        for (const cityName in cityMarkers) {
            index = City.findIndex(c => c.name === cityName);
            if(ThemeparkGuesse == closestThemeparks[cityName].Themepark){
                RemoveCityMarker(cityName);
            }     
        }
        return "De dichsbijzijnde attractiepark is NIET hetzelfde als die van jou"
    }
    else
        return "Oeps er ging iets fout met je Airport"
}
function questionHanze(hidePlace){
    if(hidePlace.hanze == "Y"){
        for (const cityName in cityMarkers) {
            index = City.findIndex(c => c.name === cityName);
            if(City[index].hanze != "Y"){
                RemoveCityMarker(cityName);
            }    
        }
        return "De stad was inderdaad een Hanze stad";
    }
    else if(hidePlace.hanze == "N"){
        for (const cityName in cityMarkers) {
            index = City.findIndex(c => c.name === cityName);
            if(City[index].hanze != "N"){
                RemoveCityMarker(cityName);
            }    
        }
        return "De stad was geen een Hanze stad";
    }
    else
        return "Oeps er ging iets fout met je HanzeStad"
}
function questionGlazenhuis(hidePlace){
    if(hidePlace.glazenHuis == "Y"){
        for (const cityName in cityMarkers) {
            index = City.findIndex(c => c.name === cityName);
            if(City[index].glazenHuis != "Y"){
                RemoveCityMarker(cityName);
            }    
        }
        return "Het Glazen huis is inderdaad hier geweest";
    }
    else if(hidePlace.glazenHuis == "N"){
        for (const cityName in cityMarkers) {
            index = City.findIndex(c => c.name === cityName);
            if(City[index].glazenHuis != "N"){
                RemoveCityMarker(cityName);
            }    
        }
        return "Het Glazen huis is hier niet geweest";
    }
    else
        return "Oeps er ging iets fout met je Glazenhuis"
}
function questionLandskampioen(hidePlace){
    if(hidePlace.landskampioen == "Y"){
        for (const cityName in cityMarkers) {
            index = City.findIndex(c => c.name === cityName);
            if(City[index].landskampioen != "Y"){
                RemoveCityMarker(cityName);
            }    
        }
        return "De stad heeft ooit de landskampioenen gehad";
    }
    else if(hidePlace.landskampioen == "N"){
        for (const cityName in cityMarkers) {
            index = City.findIndex(c => c.name === cityName);
            if(City[index].landskampioen != "N"){
                RemoveCityMarker(cityName);
            }    
        }
        return "De stad heeft nog nooit een landskampioenen gehad";
    }
    else
        return "Oeps er ging iets fout met je landskampioenen"
}
function questionDierentuin(hidePlace){
    if(hidePlace.dierentuin == "Y"){
        for (const cityName in cityMarkers) {
            index = City.findIndex(c => c.name === cityName);
            if(City[index].dierentuin != "Y"){
                RemoveCityMarker(cityName);
            }    
        }
        return "De plaats heeft inderdaad een dierentuin!";
    }
    else if(hidePlace.dierentuin == "N"){
        for (const cityName in cityMarkers) {
            index = City.findIndex(c => c.name === cityName);
            if(City[index].dierentuin != "N"){
                RemoveCityMarker(cityName);
            }    
        }
        return "De plaats heeft helaas geen dierentuin!";
    }
    else
        return "Oeps er ging iets fout met je dierntuin"
}

function answerQuestion() {
    const question = document.getElementById("questionSelect").value;
    const location = document.getElementById("location").value;
    const answerBox = document.getElementById("answer");
    if(location == ""){
        answerBox.textContent = "Kies eerst een stad uit het menu.";
    }
    else{
        
        switch (question) {
            case "":
                answerBox.textContent = "Kies eerst een vraag uit het menu.";            
                break;
            case "name":
                answerBox.textContent = "Je stad is: " + City[HidePlace].name;           
                break;
            case "establish":
                answerBox.textContent = "Je stad is opgericht in de " + (Math.floor(City[HidePlace].establish / 100) +1)  + "e eeuw";           
                break;
            case "longitude":
                answerBox.textContent = questionLongitude(City[HidePlace], City[location]);           
                break;
            case "latitude":
                answerBox.textContent = questionLatitude(City[HidePlace], City[location]);           
                break;
            case "Radius10":
                answerBox.textContent = questionRadius(City[HidePlace], City[location], 10);           
                break;
            case "Radius25":
                answerBox.textContent = questionRadius(City[HidePlace], City[location], 25);           
                break;
            case "Radius50":
                answerBox.textContent = questionRadius(City[HidePlace], City[location], 50);           
                break;
            case "Radius75":
                answerBox.textContent = questionRadius(City[HidePlace], City[location], 75);           
                break;
            case "Radius100":
                answerBox.textContent = questionRadius(City[HidePlace], City[location], 100);           
                break;
            case "Altitude":
                answerBox.textContent = questionAltitude(City[HidePlace], City[location]);           
                break;
            case "Province":
                answerBox.textContent = questionProvince(City[HidePlace], City[location]);           
                break;
            case "Airport":
                answerBox.textContent = questionAirport(City[HidePlace], City[location]);           
                break;
            case "Themepark":
                answerBox.textContent = questionThemepark(City[HidePlace], City[location]);           
                break;
            case "Hanze":
                answerBox.textContent = questionHanze(City[HidePlace]);           
                break;
            case "GlazenHuis":
                answerBox.textContent = questionGlazenhuis(City[HidePlace]);           
                break;
            case "Landskampioen":
                answerBox.textContent = questionLandskampioen(City[HidePlace]);           
                break;
            case "Dierentuin":
                answerBox.textContent = questionDierentuin(City[HidePlace]);           
                break;
            default:
                answerBox.textContent = answers[question] || "Geen antwoord gevonden.";
                break;
        }    
        const usedOption = document.getElementById("questionSelect").querySelector(`option[value="${question}"]`);
        usedOption.disabled = true;          // maakt de vraag niet meer kiesbaar

        // reset of inputs
        document.getElementById("questionSelect").value = "";
        document.getElementById("location").value = "";
    }
}
function GuesseCity(){
    const location = document.getElementById("location").value;
    if (HidePlace == location){
            alert("Gefeliciteerd het was: "+ City[location].name );
        }
    else{
        alert("Helaas het was niet: "+ City[location].name );
        RemoveCityMarker(City[location].name);
    }
}



//L.rectangle([[53.55,3.3],[50.72,7.2964464]] ).addTo(map);
//L.circle([51.692195,5.2964464], {radius: 50000}).addTo(map) // Draw cicrle
//var donut = new L.Donut([51.692195,5.2964464],{radius: 99999999,innerRadius: 10000,innerRadiusAsPercent: false,}).addTo(map);