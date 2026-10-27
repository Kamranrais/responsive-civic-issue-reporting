import { useState, useEffect } from 'react'

export function useGeolocation() {
  const [coords, setCoords] = useState(null)  // { lat, lng }
  const [address, setAddress] = useState('')
  const [gpsError, setGpsError] = useState(null)
  const [locating, setLocating] = useState(false)

  async function reverseGeocode(lat, lng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en-IN' } }
      )
      const data = await res.json()
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }
  }

  async function locateUser() {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.')
      return
    }
    setLocating(true)
    setGpsError(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setCoords({ lat, lng })
        const addr = await reverseGeocode(lat, lng)
        setAddress(addr)
        setLocating(false)
      },
      (err) => {
        setGpsError(
          err.code === 1
            ? 'Location permission denied. Please allow access or pick location on the map.'
            : 'Unable to determine location. Please pick on the map.'
        )
        setLocating(false)
      },
      { timeout: 10000, maximumAge: 30000 }
    )
  }

  async function setManualCoords(lat, lng) {
    setCoords({ lat, lng })
    const addr = await reverseGeocode(lat, lng)
    setAddress(addr)
    setGpsError(null)
  }

  return { coords, address, gpsError, locating, locateUser, setManualCoords, setAddress }
}
