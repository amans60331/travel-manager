import React from 'react';
import LinkButton from '../../UI/LinkButton/LinkButton';
import BudgetBreakdown from '../BudgetBreakdown/BudgetBreakdown';
import DestinationCard from '../DestinationCard/DestinationCard';
import './RichContent.css';

const RichContent = ({ richContent, onDestinationSelect, selectedDestination }) => {
    if (!richContent || richContent.type === 'text' || richContent.type === 'welcome') return null;

    if (richContent.type === 'destinations' && richContent.destinations?.length > 0) {
        return (
            <div className="destination-cards">
                {richContent.destinations.map((dest, i) => (
                    <DestinationCard
                        key={i}
                        destination={dest}
                        selected={selectedDestination === dest.name}
                        onSelect={onDestinationSelect}
                    />
                ))}
            </div>
        );
    }

    if (richContent.type === 'budgetBreakdown' && richContent.budgetBreakdown) {
        return <BudgetBreakdown breakdown={richContent.budgetBreakdown} />;
    }

    if (richContent.type === 'fullPlan') {
        return (
            <div className="full-plan">
                {richContent.budgetBreakdown && (
                    <BudgetBreakdown breakdown={richContent.budgetBreakdown} />
                )}

                {richContent.links?.booking && (
                    <div className="link-section">
                        <div className="link-section__title">🏨 Book Accommodation</div>
                        <div className="link-buttons">
                            <LinkButton href={richContent.links.booking.bookingCom} icon="🌐" label="Booking.com" />
                            <LinkButton href={richContent.links.booking.makeMyTrip} icon="✈️" label="MakeMyTrip" />
                            <LinkButton href={richContent.links.booking.goibibo} icon="🏨" label="Goibibo" />
                            <LinkButton href={richContent.links.booking.hostelworld} icon="🎒" label="Hostelworld" />
                        </div>
                    </div>
                )}

                {richContent.links?.travel && (
                    <div className="link-section">
                        <div className="link-section__title">🚌 Book Travel</div>
                        <div className="link-buttons">
                            <LinkButton href={richContent.links.travel.redBus} icon="🚌" label="RedBus" />
                            <LinkButton href={richContent.links.travel.irctc} icon="🚂" label="IRCTC" />
                            <LinkButton href={richContent.links.travel.googleFlights} icon="✈️" label="Google Flights" />
                            <LinkButton href={richContent.links.travel.ixigo} icon="🎫" label="Ixigo" />
                        </div>
                    </div>
                )}

                {richContent.links?.local && (
                    <div className="link-section">
                        <div className="link-section__title">📍 Local Essentials</div>
                        <div className="link-buttons">
                            <LinkButton href={richContent.links.local.food} icon="🍽️" label="Restaurants" />
                            <LinkButton href={richContent.links.local.scootyRental} icon="🛵" label="Scooty Rental" />
                            <LinkButton href={richContent.links.local.sightseeing} icon="🗺️" label="Sightseeing" />
                            <LinkButton href={richContent.links.local.cafes} icon="☕" label="Cafes" />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return null;
};

export default RichContent;
