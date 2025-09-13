import { useContext, useEffect, useState } from 'react'
import { CaptainContext } from '../context/CaptainContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import PropTypes from 'prop-types'

const CaptainProtectWrapper = ({ children }) => {
    const token = localStorage.getItem('token')
    const navigate = useNavigate()
    const { setCaptain } = useContext(CaptainContext)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!token) {
            navigate('/captain-login')
            return
        }

        axios.get(`${import.meta.env.VITE_BASE_URL}/captains/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                if (response.status === 200) {
                    setCaptain(response.data.captain)
                    setIsLoading(false)
                }
            })
            .catch(() => {   
                localStorage.removeItem('token')
                navigate('/captain-login')
            })
    }, [token, navigate, setCaptain]) 

    if (isLoading) {
        return <div>Loading...</div>
    }

    return <>{children}</>
}
CaptainProtectWrapper.propTypes = {
    children: PropTypes.node.isRequired,
}

export default CaptainProtectWrapper;
