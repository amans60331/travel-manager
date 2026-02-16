const { STATES } = require('./states');
const tools = require('./tools');
const { SYSTEM_PROMPT, TOOL_DEFINITIONS } = require('./prompts');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class AgentOrchestrator {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            console.warn('⚠️ GEMINI_API_KEY not set. Agent will use fallback responses.');
            this.llm = null;
        } else {
            const genAI = new GoogleGenerativeAI(apiKey);
            this.llm = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
                systemInstruction: SYSTEM_PROMPT
            });
            console.log('✅ Gemini LLM initialized with gemini-2.0-flash');
        }
    }

    async processMessage(session, userMessage) {
        if (session.state === STATES.IDLE) {
            session.state = STATES.COLLECT_REQUIREMENTS;
        }

        session.messages.push({
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        });

        // Always run extraction FIRST
        this.extractInfo(session, userMessage);

        console.log(`[Agent] State: ${session.state} | Collected:`, JSON.stringify(session.collectedInfo));

        // If LLM is available, use it
        if (this.llm) {
            try {
                return await this.llmResponse(session, userMessage);
            } catch (error) {
                console.error('LLM Error:', error.message);
                // Fallback to rule-based
                return await this.fallbackResponse(session, userMessage);
            }
        }

        // Otherwise use rule-based fallback
        return await this.fallbackResponse(session, userMessage);
    }

    async llmResponse(session, userMessage) {
        // Build history excluding current turn (Gemini startChat expects history BEFORE current turn)
        const histMessages = session.messages.slice(0, -1);
        const chatHistory = histMessages.slice(-10).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // Inject collected info context
        const contextMessage = this.buildContextInjection(session);
        const augmentedMessage = contextMessage
            ? `${userMessage}\n\n[STATE CONTEXT: ${contextMessage}]`
            : userMessage;

        const geminiTools = [{
            functionDeclarations: TOOL_DEFINITIONS.map(t => ({
                name: t.name,
                description: t.description,
                parameters: t.parameters
            }))
        }];

        const chat = this.llm.startChat({
            history: chatHistory,
            tools: geminiTools
        });

        console.log(`[LLM] Sending: "${userMessage}" with Context: ${contextMessage}`);

        let finalMessage = augmentedMessage;
        if (session.selectedDestination) {
            finalMessage += "\n\nCRITICAL INSTRUCTION: You MUST provide a detailed Day-by-Day Itinerary in your text response now. Focus on sightseeing and activities.";
        }

        let response = await chat.sendMessage(finalMessage);
        let result = response.response;

        // Handle tool calls (up to 5 rounds)
        let rounds = 0;
        while (result.candidates?.[0]?.content?.parts?.some(p => p.functionCall) && rounds < 5) {
            const functionCalls = result.candidates[0].content.parts.filter(p => p.functionCall);
            const functionResponses = [];

            for (const fc of functionCalls) {
                console.log(`[TOOL] Calling ${fc.functionCall.name}...`);
                const toolResult = await this.executeTool(fc.functionCall.name, fc.functionCall.args, session);
                functionResponses.push({
                    functionResponse: {
                        name: fc.functionCall.name,
                        response: toolResult
                    }
                });
            }

            response = await chat.sendMessage(functionResponses);
            result = response.response;
            rounds++;
        }

        const textParts = result.candidates?.[0]?.content?.parts?.filter(p => p.text) || [];
        const agentText = textParts.map(p => p.text).join('\n') || "I have prepared your plan! Let me know if you need any adjustments.";

        // Update state and rich content
        this.detectStateTransition(session, agentText);

        console.log(`[ORCHESTRATOR] Final Session State: ${session.state}, Destination: ${session.selectedDestination}`);
        const richContent = await this.buildRichContent(session, agentText);

        session.messages.push({
            role: 'assistant',
            content: agentText,
            richContent,
            timestamp: new Date()
        });

        return {
            text: agentText,
            richContent,
            state: session.state,
            collectedInfo: session.collectedInfo
        };
    }

    buildContextInjection(session) {
        const info = session.collectedInfo || {};
        const parts = [];
        if (info.budget) parts.push(`Budget: ₹${info.budget}`);
        if (info.origin) parts.push(`Origin: ${info.origin}`);
        if (info.startDate) parts.push(`Dates: ${info.startDate} to ${info.endDate}`);
        if (info.people) parts.push(`People: ${info.people}`);
        if (info.preference) parts.push(`Vibe: ${info.preference}`);

        const missing = [];
        if (!info.budget) missing.push('budget');
        if (!info.origin) missing.push('origin city');
        if (!info.startDate) missing.push('travel dates');
        if (!info.people) missing.push('number of people');

        if (session.selectedDestination) {
            return `YOU MUST PROVIDE A DETAILED DAY-BY-DAY ITINERARY TEXT, plus BUDGET BREAKDOWN AND BOOKING LINKS FOR ${session.selectedDestination.toUpperCase()}. User has already selected this destination. Do NOT suggest more cities. Current State: ${session.state}`;
        }

        if (missing.length === 0) {
            return `All info collected. User is from ${info.origin} with ₹${info.budget}. SUGGEST 3-4 specific cities now using getDestinations tool. Current State: ${session.state}`;
        }

        return `Incomplete info. Missing: ${missing.join(', ')}. Keep asking friendly questions. Current State: ${session.state}`;
    }

    // =====================================================
    // EXTRACTION LOGIC - Parses user message for travel info
    // =====================================================
    extractInfo(session, message) {
        if (!session.collectedInfo) session.collectedInfo = {};
        const info = session.collectedInfo;
        const lower = message.toLowerCase().trim();

        // 1. Budget Extraction
        if (!info.budget) {
            // First try specific currency patterns
            const budgetMatch = message.match(/(\d[\d,]*)\s*(?:k|K)/i)
                || message.match(/(\d[\d,]*)\s*(?:thousand|inr|INR|rupee|rs|₹)/i)
                || message.match(/(?:budget|spend|have|within)\s*(?:is|of|:)?\s*(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i)
                || message.match(/₹\s*(\d[\d,]*)/i);

            if (budgetMatch) {
                let amount = parseInt(budgetMatch[1].replace(/,/g, ''));
                if (amount < 1000 && (lower.includes('k') || lower.includes('thousand'))) amount *= 1000;
                if (amount >= 500) info.budget = amount;
            } else {
                // FALLBACK: If user just types a number like "15000" or "20000"
                const bareNumber = lower.match(/^(\d{4,6})$/);
                if (bareNumber) {
                    const n = parseInt(bareNumber[1]);
                    if (n >= 2000 && n <= 500000) info.budget = n;
                }
            }
        }

        // 2. Date Extraction
        if (!info.startDate) {
            const monthsMap = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };

            // Pattern: 20-25 Feb or 20 to 25 Feb
            const rangeRevMatch = message.match(/(\d{1,2})\s*(?:-|to|till)\s*(\d{1,2})\s*([a-z]{3,})/i);
            // Pattern: 20 Feb to 25 Feb
            const rangeFullMatch = message.match(/(\d{1,2})\s*([a-z]{3,})\s*(?:-|to|till)\s*(\d{1,2})\s*([a-z]{3,})/i);

            const currentYear = new Date().getFullYear();
            if (rangeFullMatch) {
                const mon1 = monthsMap[rangeFullMatch[2].toLowerCase().substring(0, 3)];
                const mon2 = monthsMap[rangeFullMatch[4].toLowerCase().substring(0, 3)];
                if (mon1 && mon2) {
                    info.startDate = `${currentYear}-${mon1}-${rangeFullMatch[1].padStart(2, '0')}`;
                    info.endDate = `${currentYear}-${mon2}-${rangeFullMatch[3].padStart(2, '0')}`;
                }
            } else if (rangeRevMatch) {
                const mon = monthsMap[rangeRevMatch[3].toLowerCase().substring(0, 3)];
                if (mon) {
                    info.startDate = `${currentYear}-${mon}-${rangeRevMatch[1].padStart(2, '0')}`;
                    info.endDate = `${currentYear}-${mon}-${rangeRevMatch[2].padStart(2, '0')}`;
                }
            }

            if (info.startDate && info.endDate) {
                const start = new Date(info.startDate);
                const end = new Date(info.endDate);
                if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                    info.days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
                }
            }
        }

        // 3. People Extraction (CAREFUL - only match when contextually appropriate)
        if (!info.people) {
            // Explicit patterns first
            const explicitPeople = message.match(/(\d+)\s*(?:person|people|pax|traveler|traveller|member|guest)/i);
            if (explicitPeople) {
                info.people = parseInt(explicitPeople[1]);
            } else if (/\b(?:solo|alone|myself|just me|only me)\b/i.test(lower)) {
                info.people = 1;
            } else if (/\b(?:couple|us two|me and my)\b/i.test(lower)) {
                info.people = 2;
            } else {
                // If the ENTIRE message is just a small number (1-10), it's likely answering "how many people"
                const bareNumber = lower.match(/^(\d+)$/);
                if (bareNumber) {
                    const n = parseInt(bareNumber[1]);
                    if (n >= 1 && n <= 15) info.people = n;
                }
                // Also match number words
                const wordMap = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
                const wordMatch = lower.match(/^(one|two|three|four|five|six)$/);
                if (wordMatch) info.people = wordMap[wordMatch[1]];
            }
        }

        // 4. Origin Extraction
        if (!info.origin) {
            const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Bengaluru', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad', 'Chandigarh', 'Lucknow', 'Ahmedabad', 'Jaipur', 'Goa', 'Udaipur', 'Kochi', 'Nagpur', 'Indore', 'Bhopal', 'Surat', 'Vadodara', 'Noida', 'Gurgaon'];
            for (const city of cities) {
                if (lower.includes(city.toLowerCase())) {
                    info.origin = city === 'Bengaluru' ? 'Bangalore' : city;
                    break;
                }
            }
        }

        // 5. Preference Extraction
        if (!info.preference) {
            const prefMap = {
                'beach': ['beach', 'sea', 'ocean', 'coast', 'water'],
                'mountains': ['mountain', 'hill', 'snow', 'trek', 'himalaya', 'cold'],
                'culture': ['culture', 'heritage', 'temple', 'history', 'palace', 'fort', 'spiritual'],
                'adventure': ['adventure', 'rafting', 'bungee', 'sport', 'thrill', 'wildlife'],
                'mix': ['mix', 'anything', 'open', 'surprise']
            };
            for (const [pref, keywords] of Object.entries(prefMap)) {
                if (keywords.some(k => lower.includes(k))) {
                    info.preference = pref;
                    break;
                }
            }
        }

        // 6. Destination Selection
        // Expanded list to cover more of the 100 cities we will add
        const potentialDestinations = [
            'Manali', 'Kasol', 'Rishikesh', 'Jaipur', 'Goa', 'Udaipur', 'Mcleodganj', 'Varanasi', 'Pondicherry', 'Mussoorie',
            'Tosh', 'Dharamshala', 'Shimla', 'Munnar', 'Ooty', 'Darjeeling', 'Leh', 'Ladakh', 'Hampi', 'Alleppey', 'Kochi',
            'Coorg', 'Agra', 'Delhi', 'Mumbai', 'Srinagar', 'Gulmarg', 'Pahalgam', 'Jaisalmer', 'Jodhpur', 'Pushkar',
            'Gangtok', 'Shillong', 'Tawang', 'Ziro', 'Cherrapunji', 'Kaziranga', 'Majuli', 'Varkala', 'Wayanad', 'Gokarna',
            'Mysore', 'Kodaikanal', 'Rameswaram', 'Madurai', 'Mahabalipuram', 'Kanyakumari', 'Thanjavur', 'Amritsar',
            'Khajuraho', 'Orchha', 'Gwalior', 'Bhopal', 'Indore', 'Pachmarhi', 'Nashik', 'Aurangabad', 'Lonavala',
            'Mahabaleshwar', 'Ajanta', 'Ellora', 'Kolkata', 'Darjeeling', 'Kalimpong', 'Sundarbans', 'Digha', 'Puri',
            'Konark', 'Bhubaneswar', 'Chilika', 'Nainital', 'Almora', 'Ranikhet', 'Auli', 'Kedarnath', 'Badrinath',
            'Haridwar', 'Dehradun', 'Lansdowne', 'Valley of Flowers', 'Spiti', 'Kaza', 'Chisul', 'Nubra', 'Turtuk',
            'Kargil', 'Drass', 'Sonamarg', 'Yusmarg', 'Doodhpathri', 'Gurez', 'Patnitop', 'Bhaderwah', 'Katra'
        ];

        for (const dest of potentialDestinations) {
            const destLower = dest.toLowerCase();
            // Check if the message actually contains this city
            if (lower.includes(destLower)) {
                // CRITICAL FIX: Ensure this isn't just the user saying "from Delhi"

                // 1. If we already know the origin, and this city IS the origin, ignore it.
                if (info.origin && info.origin.toLowerCase() === destLower) continue;

                // 2. formatting check: look for "from [city]" or "start [city]"
                const fromPattern = new RegExp(`(?:from|start|leaving|departure)\\s+(?:in\\s+)?${destLower}`, 'i');
                if (fromPattern.test(lower)) continue;

                // If we already have this destination selected and it's the same, no need to update
                if (session.selectedDestination && session.selectedDestination.toLowerCase() === destLower) continue;

                // UPDATE DESTINATION
                session.selectedDestination = dest;
                // Clear old breakdown so we regenerate it for the new place
                session.budgetBreakdown = null;
                console.log(`[ORCHESTRATOR] Destination explicitly detected/switched to: ${dest}`);
                break;
            }
        }

        session.collectedInfo = info;
    }

    // =====================================================
    // STATE TRANSITION
    // =====================================================
    detectStateTransition(session, agentText) {
        const text = agentText ? agentText.toLowerCase() : "";
        const info = session.collectedInfo || {};

        console.log(`[ORCHESTRATOR] Current State: ${session.state}, Destination: ${session.selectedDestination}`);

        // 1. If destination is selected, move to DESTINATION_SELECTED or beyond
        if (session.selectedDestination) {
            if (session.state === STATES.COLLECT_REQUIREMENTS || session.state === STATES.VALIDATE_BUDGET || session.state === STATES.PROPOSE_DESTINATIONS) {
                session.state = STATES.DESTINATION_SELECTED;
                console.log(`[ORCHESTRATOR] State updated to DESTINATION_SELECTED`);
            }
        }

        // 2. Requirement gathering to Validate
        if (session.state === STATES.COLLECT_REQUIREMENTS && info.budget && info.origin && info.startDate && info.people) {
            session.state = STATES.VALIDATE_BUDGET;
        }

        // 3. Propose destinations if not selected yet
        if (!session.selectedDestination && (session.state === STATES.COLLECT_REQUIREMENTS || session.state === STATES.VALIDATE_BUDGET) &&
            (text.includes('here are') || text.includes('suggest') || text.includes('options') || text.includes('recommend'))) {
            session.state = STATES.PROPOSE_DESTINATIONS;
        }

        // 4. Move to Build Plan once we show details or links
        if (session.selectedDestination && (text.includes('breakdown') || text.includes('₹') || text.includes('plan') || text.includes('itinerary') || text.includes('|') || text.includes('link'))) {
            session.state = STATES.BUILD_PLAN;
            console.log(`[ORCHESTRATOR] State updated to BUILD_PLAN`);
        }
    }

    // =====================================================
    // TOOL EXECUTION
    // =====================================================
    async executeTool(name, args, session) {
        try {
            switch (name) {
                case 'validateBudget': {
                    const result = tools.validateBudget(args);
                    session._budgetTier = result.budgetTier;
                    return result;
                }
                case 'getDestinations': return await tools.getDestinations(args);
                case 'getDestinationDetails': return await tools.getDestinationDetails(args.destinationName);
                case 'buildBudgetBreakdown': {
                    const result = await tools.buildBudgetBreakdown(args);
                    if (result) session.budgetBreakdown = result;
                    return result;
                }
                case 'generateBookingLinks': return tools.generateBookingLinks(args);
                case 'generateTravelLinks': return tools.generateTravelLinks(args);
                case 'generateLocalLinks': return tools.generateLocalLinks(args);
                default: return { error: `Unknown tool: ${name}` };
            }
        } catch (err) {
            return { error: err.message };
        }
    }

    // =====================================================
    // CHAT HISTORY BUILDER
    // =====================================================
    buildChatHistory(session) {
        return (session.messages || []).slice(-10).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));
    }

    // =====================================================
    // RICH CONTENT BUILDER (for UI cards)
    // =====================================================
    async buildRichContent(session, agentText) {
        const rich = { type: 'text' };
        const info = session.collectedInfo || {};

        // If a destination is selected...
        if (session.selectedDestination) {
            // DECISION LOGIC: Should we show the full plan card?
            // Only show it if the agent is actually presenting the plan, not just chatting.
            // unique keywords that appear when we generate the plan
            const isPlanContext = /breakdown|budget|links|itinerary|plan/i.test(agentText || '');

            // Or if we haven't generated a breakdown yet, we probably should show it (first time)
            const isFirstTime = !session.budgetBreakdown;

            if (isPlanContext || isFirstTime) {
                rich.type = 'fullPlan';

                // Ensure breakdown exists
                const breakdown = session.budgetBreakdown || await tools.buildBudgetBreakdown({
                    destination: session.selectedDestination,
                    origin: info.origin || 'Delhi',
                    days: info.days || 5,
                    people: info.people || 1,
                    budget: info.budget || 20000
                });
                // Save it to session so we don't recalc every time (unless necessary)
                session.budgetBreakdown = breakdown;
                rich.budgetBreakdown = breakdown;

                rich.links = {
                    booking: tools.generateBookingLinks({
                        city: session.selectedDestination,
                        checkin: info.startDate || '2026-02-20',
                        checkout: info.endDate || '2026-02-25',
                        // Ensure maxPricePerNight has a fallback if breakdown is null
                        maxPricePerNight: (breakdown?.maxStayPerNight) || 2000,
                        people: info.people || 1
                    }),
                    travel: tools.generateTravelLinks({
                        from: info.origin || 'Delhi',
                        to: session.selectedDestination,
                        date: info.startDate || '2026-02-20'
                    }),
                    local: tools.generateLocalLinks({ city: session.selectedDestination })
                };
                return rich;
            }
        }

        if (session.state === STATES.PROPOSE_DESTINATIONS && !session.selectedDestination) {
            const month = info.startDate ? new Date(info.startDate).toLocaleString('en', { month: 'short' }) : 'Feb';
            const dests = (await tools.getDestinations({
                origin: info.origin || 'Delhi',
                month,
                budgetTier: session._budgetTier || 'budget',
                preference: info.preference || 'mix'
            })).slice(0, 10);

            if (dests.length > 0) {
                rich.type = 'destinations';
                rich.destinations = dests;
            }
        }
        return rich;
    }

    // =====================================================
    // FALLBACK (Rule-based when LLM is unavailable)
    // =====================================================
    async fallbackResponse(session, message) {
        const info = session.collectedInfo || {};
        let text = '';
        let richContent = { type: 'text' };

        // Handle simple greetings
        if (/^(hi|hello|hey|hola|namaste)[\!\?\s]*$/i.test(message.trim())) {
            text = "Hello! 👋 I'm TravelGenie — your AI travel buddy for India!\n\nTo get started, tell me:\n1️⃣ Your **budget** (e.g. 20k INR)\n2️⃣ **Where** you're travelling from\n3️⃣ **When** you want to go (e.g. 20-25 Feb)\n\nOr just describe your dream trip and I'll figure it out! ✨";
            session.messages.push({ role: 'assistant', content: text, richContent, timestamp: new Date() });
            return { text, richContent, state: session.state, collectedInfo: info };
        }

        // Check what's missing
        const missing = [];
        if (!info.budget) missing.push('💰 **Total budget** (e.g. 20k, ₹15000)');
        if (!info.origin) missing.push('📍 **Starting city** (e.g. Delhi, Pune, Mumbai)');
        if (!info.startDate || !info.endDate) missing.push('📅 **Travel dates** (e.g. 20-25 Feb)');
        if (!info.people) missing.push('👥 **Number of people** (e.g. 1, 2, solo, couple)');

        // If we have some info but not all
        if (missing.length > 0) {
            const collected = [];
            if (info.budget) collected.push(`Budget: ₹${info.budget.toLocaleString()}`);
            if (info.origin) collected.push(`From: ${info.origin}`);
            if (info.startDate) collected.push(`Dates: ${info.startDate} to ${info.endDate}`);
            if (info.people) collected.push(`People: ${info.people}`);
            if (info.preference) collected.push(`Vibe: ${info.preference}`);

            if (collected.length > 0) {
                text = `Got it! Here's what I have so far:\n✅ ${collected.join('\n✅ ')}\n\nI still need:\n${missing.join('\n')}\n\nPlease share these details!`;
            } else {
                text = `I'd love to help! I just need a few things to plan your trip:\n${missing.join('\n')}\n\nTell me in one go or one by one — both work! 😊`;
            }
            session.messages.push({ role: 'assistant', content: text, richContent, timestamp: new Date() });
            return { text, richContent, state: session.state, collectedInfo: info };
        }

        // ALL INFO COLLECTED → Show destinations
        if (info.days === undefined || isNaN(info.days)) {
            const start = new Date(info.startDate);
            const end = new Date(info.endDate);
            info.days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
        }

        if (session.selectedDestination) {
            // Destination is selected, show budget breakdown
            const breakdown = await tools.buildBudgetBreakdown({
                destination: session.selectedDestination,
                origin: info.origin || 'Delhi',
                days: info.days || 5,
                people: info.people || 1,
                budget: info.budget || 20000
            });
            session.budgetBreakdown = breakdown;
            session.state = STATES.BUILD_PLAN;

            const bookingLinks = tools.generateBookingLinks({
                city: session.selectedDestination,
                checkin: info.startDate || '2026-02-25',
                checkout: info.endDate || '2026-03-01',
                maxPricePerNight: breakdown?.maxStayPerNight || 1500,
                people: info.people || 1
            });
            const travelLinks = tools.generateTravelLinks({
                from: info.origin || 'Delhi',
                to: session.selectedDestination,
                date: info.startDate || '2026-02-25'
            });
            const localLinks = tools.generateLocalLinks({ city: session.selectedDestination });

            text = `Great choice! **${session.selectedDestination}** is a fantastic pick! 🎉\n\nI've generated a detailed budget breakdown and booking links for your trip below. You fits within the budget!`;

            richContent = {
                type: 'fullPlan',
                budgetBreakdown: breakdown,
                links: { booking: bookingLinks, travel: travelLinks, local: localLinks }
            };

            session.messages.push({ role: 'assistant', content: text, richContent, timestamp: new Date() });
            return { text, richContent, state: session.state, collectedInfo: info };
        }

        // Show destination options
        const validation = tools.validateBudget({ budget: info.budget, days: info.days, people: info.people, origin: info.origin });
        session._budgetTier = validation.budgetTier;
        session.state = STATES.PROPOSE_DESTINATIONS;

        const month = info.startDate ? new Date(info.startDate).toLocaleString('en', { month: 'short' }) : 'Feb';
        const dests = (await tools.getDestinations({ origin: info.origin, month, budgetTier: validation.budgetTier, preference: info.preference || 'mix' })).slice(0, 10);

        text = `Nice! ${validation.analysis}\n\n`;
        text += `### 🏔️ Best Options Under ₹${info.budget.toLocaleString()} from ${info.origin}:\n\n`;
        dests.forEach((d, i) => {
            text += `${i + 1}️⃣ **${d.name}** (${d.state})\n`;
            text += `• ~₹${d.avgDailyCost}/day • ${d.type}\n`;
            text += `• ${d.highlights.slice(0, 3).join(' • ')}\n\n`;
        });
        text += `👉 Which one catches your eye? Tell me and I'll build a complete plan!`;

        richContent = { type: 'destinations', destinations: dests };

        session.messages.push({ role: 'assistant', content: text, richContent, timestamp: new Date() });
        return { text, richContent, state: session.state, collectedInfo: info };
    }
}

module.exports = AgentOrchestrator;
