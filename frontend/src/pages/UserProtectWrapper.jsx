import { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { UserDataContext } from '../context/UserDataContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const UserProtectWrapper = ({
    children
}) => {
    const token = localStorage.getItem('token')
    const navigate = useNavigate()
    const { setUser } = useContext(UserDataContext)
    const [ isLoading, setIsLoading ] = useState(true)
    useEffect(() => {
        if (!token) {
            // If no token, allow default user (forever logged in)
            setIsLoading(false);
            return;
        }

        axios.get(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(response => {
            if (response.status === 200) {
                setUser(response.data)
                setIsLoading(false)
            }
        })
            .catch(err => {
                console.log(err)
                localStorage.removeItem('token')
                setIsLoading(false);
            })
    }, [ token, navigate, setUser ])

    if (isLoading) {
        return (
            <div>Loading...</div>
        )
    }

    return (
        <>
            {children}
        </>
    )
}
UserProtectWrapper.propTypes = {
    children: PropTypes.node.isRequired
}

export default UserProtectWrapper