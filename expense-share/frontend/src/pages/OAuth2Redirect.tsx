import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/services/api'

export default function OAuth2Redirect() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((state) => state.setAuth)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    const error = params.get('error')

    if (token) {
      localStorage.setItem('token', token)
      authApi.getCurrentUser()
        .then((response) => {
          setAuth(response.data, token)
          navigate('/dashboard')
        })
        .catch((err) => {
          console.error('Failed to get user info:', err)
          navigate('/login')
        })
    } else if (error) {
      console.error('OAuth2 error:', error)
      navigate('/login')
    } else {
      navigate('/login')
    }
  }, [location, navigate, setAuth])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Authenticating...</div>
    </div>
  )
}
