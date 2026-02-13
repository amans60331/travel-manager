const STATES = {
    IDLE: 'IDLE',
    COLLECT_REQUIREMENTS: 'COLLECT_REQUIREMENTS',
    VALIDATE_BUDGET: 'VALIDATE_BUDGET',
    PROPOSE_DESTINATIONS: 'PROPOSE_DESTINATIONS',
    DESTINATION_SELECTED: 'DESTINATION_SELECTED',
    BUILD_PLAN: 'BUILD_PLAN',
    GENERATE_LINKS: 'GENERATE_LINKS',
    FINAL_ITINERARY: 'FINAL_ITINERARY'
};

const STATE_TRANSITIONS = {
    [STATES.IDLE]: {
        next: [STATES.COLLECT_REQUIREMENTS],
        description: 'User starts conversation'
    },
    [STATES.COLLECT_REQUIREMENTS]: {
        next: [STATES.VALIDATE_BUDGET],
        description: 'Collecting origin, people, preferences',
        requiredFields: ['budget', 'startDate', 'endDate', 'origin', 'people', 'preference']
    },
    [STATES.VALIDATE_BUDGET]: {
        next: [STATES.PROPOSE_DESTINATIONS],
        description: 'Checking budget feasibility'
    },
    [STATES.PROPOSE_DESTINATIONS]: {
        next: [STATES.DESTINATION_SELECTED],
        description: 'Showing destination options'
    },
    [STATES.DESTINATION_SELECTED]: {
        next: [STATES.BUILD_PLAN],
        description: 'User picked a destination'
    },
    [STATES.BUILD_PLAN]: {
        next: [STATES.GENERATE_LINKS],
        description: 'Building budget breakdown'
    },
    [STATES.GENERATE_LINKS]: {
        next: [STATES.FINAL_ITINERARY],
        description: 'Generating booking and travel links'
    },
    [STATES.FINAL_ITINERARY]: {
        next: [STATES.IDLE],
        description: 'Final itinerary delivered'
    }
};

module.exports = { STATES, STATE_TRANSITIONS };
