const mongoose = require('mongoose');
const Destination = require('../models/Destination');
const destinationsData = require('../data/destinations.json');

/**
 * Helper to fetch destinations from DB or fallback to JSON
 */
async function fetchDestinations(query = {}) {
    if (mongoose.connection.readyState === 1) {
        try {
            const results = await Destination.find(query).lean();
            if (results && results.length > 0) return results;
        } catch (e) {
            console.error('DB Fetch failed, falling back to JSON:', e.message);
        }
    }

    // Fallback logic for local JSON
    return destinationsData.filter(dest => {
        for (const [key, value] of Object.entries(query)) {
            if (key === 'name' && dest.name.toLowerCase() !== value.toLowerCase()) return false;
            if (key === 'type' && dest.type !== value) return false;
            // Add other filter mappings if needed
        }
        return true;
    });
}

function validateBudget({ budget, days, people, origin }) {
    const perPersonPerDay = budget / (people * days);
    let tier = 'impossible';
    if (perPersonPerDay >= 3000) tier = 'comfortable';
    else if (perPersonPerDay >= 2000) tier = 'moderate';
    else if (perPersonPerDay >= 1200) tier = 'budget';
    else if (perPersonPerDay >= 800) tier = 'very_tight';

    return {
        feasible: tier !== 'impossible',
        budgetTier: tier,
        perPersonPerDay: Math.round(perPersonPerDay),
        totalPerPerson: Math.round(budget / people),
        analysis: tier === 'impossible'
            ? `₹${budget} for ${people} people over ${days} days is ₹${Math.round(perPersonPerDay)}/person/day — not feasible for most trips.`
            : `₹${budget} for ${people} person(s) over ${days} days gives ₹${Math.round(perPersonPerDay)}/person/day — ${tier} tier travel.`
    };
}

async function getDestinations({ origin, month, budgetTier, preference }) {
    const tierMaxDaily = { 'very_tight': 1600, 'budget': 2200, 'moderate': 3000, 'comfortable': 99999 };
    const maxDaily = tierMaxDaily[budgetTier] || 2200;

    let allDestinations = await fetchDestinations();

    let filtered = allDestinations.filter(dest => {
        const inSeason = dest.bestSeasons.includes(month);
        const affordable = dest.avgDailyCost <= maxDaily;
        const reachable = dest.reachableFrom.some(r => r.city.toLowerCase() === origin.toLowerCase());
        const matchesPreference = !preference || preference === 'mix' || dest.type === preference;
        return inSeason && affordable && matchesPreference;
    });

    filtered.sort((a, b) => a.avgDailyCost - b.avgDailyCost);

    return filtered.map(dest => {
        const travelInfo = dest.reachableFrom.find(r => r.city.toLowerCase() === origin.toLowerCase());
        return {
            name: dest.name,
            type: dest.type,
            state: dest.state,
            avgDailyCost: dest.avgDailyCost,
            highlights: dest.highlights,
            description: dest.description,
            travelFromOrigin: travelInfo || { city: origin, note: 'Multi-leg travel needed' },
            reachable: !!travelInfo
        };
    });
}

async function getDestinationDetails(destinationName) {
    const results = await fetchDestinations({ name: destinationName });
    return results[0] || null;
}

function generateBookingLinks({ city, checkin, checkout, maxPricePerNight, people }) {
    const encodedCity = encodeURIComponent(city);
    const guests = people || 1;
    // Standard Booking.com search URL (more reliable than specific parameters)
    const bookingUrl = `https://www.booking.com/searchresults.html?ss=${encodedCity}&checkin=${checkin}&checkout=${checkout}&group_adults=${guests}&no_rooms=1&group_children=0`;

    return {
        bookingCom: bookingUrl,
        hostelworld: `https://www.hostelworld.com/s?q=${encodedCity}&dateFrom=${checkin}&dateTo=${checkout}&guests=${guests}`,
        skyscannerHotels: `https://www.skyscanner.co.in/hotels/search?entity_id=${encodedCity}&checkin=${checkin}&checkout=${checkout}&adults=${guests}&rooms=1`
    };
}

function generateTravelLinks({ from, to, date }) {
    const encodedFrom = encodeURIComponent(from);
    const encodedTo = encodeURIComponent(to);
    return {
        redBus: `https://www.redbus.in/bus-tickets/${from.toLowerCase()}-to-${to.toLowerCase()}?fromCityName=${encodedFrom}&toCityName=${encodedTo}&onward=${date}`,
        googleFlights: `https://www.google.com/travel/flights?q=flights+from+${encodedFrom}+to+${encodedTo}+on+${date}`,
        skyscannerFlights: `https://www.skyscanner.co.in/transport/flights/${from.substring(0, 3).toLowerCase()}/${to.substring(0, 3).toLowerCase()}/${date.slice(2).replace(/-/g, '')}`, // Approximate airport codes
        twelveGo: `https://12go.asia/en/travel/${from.toLowerCase()}/${to.toLowerCase()}?date=${date}`
    };
}

function generateLocalLinks({ city }) {
    const encodedCity = encodeURIComponent(city);
    return {
        food: `https://www.google.com/maps/search/restaurants+in+${encodedCity}/@?sort=rating`,
        scootyRental: `https://www.google.com/maps/search/scooty+rental+in+${encodedCity}/`,
        sightseeing: `https://www.google.com/maps/search/tourist+places+in+${encodedCity}/`,
        cafes: `https://www.google.com/maps/search/cafes+in+${encodedCity}/`,
        atm: `https://www.google.com/maps/search/ATM+in+${encodedCity}/`
    };
}

async function buildBudgetBreakdown({ destination, origin, days, people, budget }) {
    const dest = await getDestinationDetails(destination);
    if (!dest) return null;

    const travelInfo = dest.reachableFrom.find(r => r.city.toLowerCase() === origin.toLowerCase());
    const cheapestTravel = travelInfo
        ? Math.min(...[travelInfo.busAvg, travelInfo.trainAvg, travelInfo.flightAvg].filter(Boolean)) * 2 * people
        : 3000 * people;

    const nights = days - 1;
    const stayCost = Math.round((budget - cheapestTravel) * 0.35);
    const foodCost = dest.localData.avgMealCost * 3 * days * people;
    const commuteCost = Math.min(dest.localData.scootyCostPerDay || 500, dest.localData.taxiCostPerDay || 1500) * Math.ceil(days * 0.6);

    const allocated = cheapestTravel + stayCost + foodCost + commuteCost;
    const buffer = budget - allocated;

    return {
        travel: cheapestTravel,
        stay: stayCost,
        food: foodCost,
        commute: commuteCost,
        buffer: Math.max(buffer, 0),
        total: budget,
        maxStayPerNight: Math.round(stayCost / (nights || 1)),
        transportNote: travelInfo
            ? `Cheapest: ${travelInfo.busAvg ? 'Bus' : 'Train'} at ₹${Math.min(...[travelInfo.busAvg, travelInfo.trainAvg].filter(Boolean))}/person`
            : 'Multi-leg needed',
        withinBudget: allocated <= budget
    };
}

module.exports = {
    validateBudget,
    getDestinations,
    getDestinationDetails,
    generateBookingLinks,
    generateTravelLinks,
    generateLocalLinks,
    buildBudgetBreakdown
};
