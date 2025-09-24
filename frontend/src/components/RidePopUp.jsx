import PropTypes from 'prop-types';

const RidePopUp = ({ ride, setRidePopupPanel }) => {

    if (!ride) {
        return null; // Don't render if ride is not available
    }

    const pickup = ride.pickup?.display_name || ride.pickup;
    const destination = ride.destination?.display_name || ride.destination;
    const distance = ride.distance_km || ride.distance;
    const duration = ride.duration_min || ride.duration;
    const fare = ride.fare;
    const user = ride.user;

    return (
        <div>
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                setRidePopupPanel(false)
            }}><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>

            {user ? (
                 <h3 className='text-2xl font-semibold mb-5'>New Ride Available!</h3>
            ) : (
                <h3 className='text-2xl font-semibold mb-5'>Ride Details</h3>
            )}


            <div className='flex gap-2 justify-between flex-col items-center'>
                <div className='w-full mt-5'>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-user-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>Pickup</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{pickup}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>Destination</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{destination}</p>
                        </div>
                    </div>
                    {distance && duration && (
                        <div className='flex items-center gap-5 p-3 border-b-2'>
                            <i className="ri-route-line"></i>
                            <div>
                                <h3 className='text-lg font-medium'>Distance & Time</h3>
                                <p className='text-sm -mt-1 text-gray-600'>{distance} km, {duration} min</p>
                            </div>
                        </div>
                    )}
                    {fare && (
                        <div className='flex items-center gap-5 p-3'>
                            <i className="ri-currency-line"></i>
                            <div>
                                <h3 className='text-lg font-medium'>Fare</h3>
                                <p className='text-sm -mt-1 text-gray-600'>₹{fare}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

RidePopUp.propTypes = {
    setRidePopupPanel: PropTypes.func.isRequired,
    ride: PropTypes.object
};

export default RidePopUp;