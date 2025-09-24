import { useRef, useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import FinishRide from '../components/FinishRide';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import LiveTracking from '../components/LiveTracking';
import { SocketContext } from '../context/SocketContext'; // assuming you have this for captain's location

const CaptainRiding = () => {
    const [finishRidePanel, setFinishRidePanel] = useState(false);
    const finishRidePanelRef = useRef(null);
    const location = useLocation();
    const rideData = location.state?.ride;
    const { socket } = useContext(SocketContext);
    const [captainLocation, setCaptainLocation] = useState(null);

    useEffect(() => {
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCaptainLocation({ lat: latitude, lng: longitude });
                    if (socket) {
                        socket.emit('locationUpdate', {
                            rideId: rideData?._id,
                            lat: latitude,
                            lng: longitude,
                        });
                    }
                },
                (error) => console.error(error),
                { enableHighAccuracy: true }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, [socket, rideData]);

    useGSAP(() => {
        if (finishRidePanel) {
            gsap.to(finishRidePanelRef.current, { transform: 'translateY(0)' });
        } else {
            gsap.to(finishRidePanelRef.current, { transform: 'translateY(100%)' });
        }
    }, [finishRidePanel]);

    const pickupCoords = rideData?.pickupCoordinates;
    const destinationCoords = rideData?.destinationCoordinates;

    return (
        <div className='h-screen relative flex flex-col'>
            <div className='fixed p-6 top-0 flex items-center justify-between w-screen z-10'>
                <img className='w-16' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
                <Link to='/captain-home' className='h-10 w-10 bg-white flex items-center justify-center rounded-full'>
                    <i className="text-lg font-medium ri-logout-box-r-line"></i>
                </Link>
            </div>

            <div className='h-[70vh]'>
                {pickupCoords && destinationCoords && (
                    <LiveTracking
                        pickup={pickupCoords}
                        destination={destinationCoords}
                        captainLocation={captainLocation}
                    />
                )}
            </div>

            <div className='h-[30vh] p-6 bg-yellow-400 flex items-center justify-between relative'
                onClick={() => setFinishRidePanel(true)}
            >
                <h5 className='p-1 text-center w-[90%] absolute top-0'><i className="text-3xl text-gray-800 ri-arrow-up-wide-line"></i></h5>
                <h4 className='text-xl font-semibold'>{'4 KM away'}</h4>
                <button className='bg-green-600 text-white font-semibold p-3 px-10 rounded-lg'>Complete Ride</button>
            </div>

            <div ref={finishRidePanelRef} className='fixed w-full z-[500] bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                <FinishRide
                    ride={rideData}
                    setFinishRidePanel={setFinishRidePanel}
                />
            </div>
        </div>
    );
};

export default CaptainRiding;