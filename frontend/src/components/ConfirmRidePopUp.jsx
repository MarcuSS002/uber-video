import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const ConfirmRidePopUp = (props) => {
    const [otp, setOtp] = useState('');
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Authentication required. Please log in.');
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/rides/start-ride`,
                { rideId: props.ride._id, otp },   // ✅ send in body, not params
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200) {
                props.setConfirmRidePopupPanel(false);
                props.setRidePopupPanel(false);
                navigate('/captain-riding', { state: { ride: props.ride } });
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to start ride. Please try again.');
        }
    };

    return (
        <form onSubmit={submitHandler}>
            <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                required
            />
            <button type="submit">Start Ride</button>
        </form>
    );
};
ConfirmRidePopUp.propTypes = {
    ride: PropTypes.shape({
        _id: PropTypes.string.isRequired,
    }).isRequired,
    setConfirmRidePopupPanel: PropTypes.func.isRequired,
    setRidePopupPanel: PropTypes.func.isRequired,
};

export default ConfirmRidePopUp;
