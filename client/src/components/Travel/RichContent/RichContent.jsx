import React from 'react';
import LinkButton from '../../UI/LinkButton/LinkButton';
import BudgetBreakdown from '../BudgetBreakdown/BudgetBreakdown';
import DestinationCard from '../DestinationCard/DestinationCard';
import './RichContent.css';

const RichContent = ({ richContent, onDestinationSelect, selectedDestination }) => {
    if (!richContent || richContent.type === 'text' || richContent.type === 'welcome') return null;

    if (richContent.type === 'destinations' && richContent.destinations?.length > 0) {
        return (
            <div className="rich-content">
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
            </div>
        );
    }

    if (richContent.type === 'budgetBreakdown' && richContent.budgetBreakdown) {
        return (
            <div className="rich-content">
                <BudgetBreakdown breakdown={richContent.budgetBreakdown} />
            </div>
        );
    }

    if (richContent.type === 'fullPlan') {
        return (
            <div className="rich-content rich-content__full-plan">
                {richContent.budgetBreakdown && (
                    <BudgetBreakdown breakdown={richContent.budgetBreakdown} />
                )}

                {richContent.links?.booking && (
                    <div className="link-section">
                        <div className="link-section__title">🏨 Book Accommodation</div>
                        <div className="link-buttons">
                            {richContent.links.booking.bookingCom && <LinkButton href={richContent.links.booking.bookingCom} icon="🌐" label="Booking.com" />}
                            {richContent.links.booking.hostelworld && <LinkButton href={richContent.links.booking.hostelworld} icon="🎒" label="Hostelworld" />}
                            {richContent.links.booking.skyscannerHotels && <LinkButton href={richContent.links.booking.skyscannerHotels} icon="🏨" label="Skyscanner" />}
                        </div>
                    </div>
                )}

                {richContent.links?.travel && (
                    <div className="link-section">
                        <div className="link-section__title">🚌 Book Travel</div>
                        <div className="link-buttons">
                            {richContent.links.travel.redBus && <LinkButton href={richContent.links.travel.redBus} icon="🚌" label="RedBus" />}
                            {richContent.links.travel.googleFlights && <LinkButton href={richContent.links.travel.googleFlights} icon="✈️" label="Google Flights" />}
                            {richContent.links.travel.skyscannerFlights && <LinkButton href={richContent.links.travel.skyscannerFlights} icon="🛫" label="Skyscanner Flights" />}
                            {richContent.links.travel.twelveGo && <LinkButton href={richContent.links.travel.twelveGo} icon="🌏" label="12Go" />}
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
