import { useState } from 'react'
import PropTypes from 'prop-types'
import { UserDataContext } from './UserDataContext'


const DEFAULT_USER = {
    _id: 'forever-user-id',
    fullname: { firstname: 'Forever', lastname: 'User' },
    email: 'forever@user.com',
};

const getStoredUser = () => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : DEFAULT_USER;
    } catch {
        return DEFAULT_USER;
    }
};

const UserContext = ({ children }) => {
    const [user, setUserState] = useState(getStoredUser());

    // Custom setter to sync with localStorage
    const setUser = (userObj) => {
        setUserState(userObj);
        if (userObj) {
            localStorage.setItem('user', JSON.stringify(userObj));
        } else {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    };

    return (
        <UserDataContext.Provider value={{ user, setUser }}>
            {children}
        </UserDataContext.Provider>
    );
};

UserContext.propTypes = {
    children: PropTypes.node.isRequired
}

export default UserContext