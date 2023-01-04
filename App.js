import { API_KEY } from '@env'
import * as Location from 'expo-location'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const normalize = (size) => {
  if (SCREEN_WIDTH > 400) {
    return size + 22
  }
  return size
}

const iconst = {
  Clouds: <Ionicons name='cloud' size={normalize(68)} color='white' />,
  Rain: <Ionicons name='rainy' size={normalize(68)} color='white' />,
  Clear: <Ionicons name='sunny' size={normalize(68)} color='white' />,
  Snow: <Ionicons name='snow' size={normalize(68)} color='white' />,
  Thunderstorm: (
    <Ionicons name='thunderstorm' size={normalize(68)} color='white' />
  ),
  Drizzle: <Ionicons name='rainy' size={normalize(68)} color='white' />,
}

export default function App() {
  const [city, setCity] = useState('Loading....')
  const [days, setDays] = useState([])
  const [ok, setOk] = useState(true)

  const getWeather = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync()
    if (!granted) {
      setOk(false)
    }

    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 })

    const location = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false },
    )

    setCity(location[0].city)

    const response = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=alerts&appid=${API_KEY}&units=metric`,
    )

    const json = await response.json()
    json && setDays(json.daily)
  }

  useEffect(() => {
    getWeather()
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}
      >
        {days.length === 0 ? (
          <View style={styles.day}>
            <ActivityIndicator
              color='white'
              size='large'
              style={{ marginTop: 10 }}
            />
          </View>
        ) : (
          days.map((day, index) => (
            <View key={`day${index}`} style={styles.day}>
              <View style={styles.icon}>
                <Text style={styles.temp}>
                  {parseFloat(day.temp.day).toFixed(1)}
                </Text>
                {iconst[day.weather[0].main] || (
                  <MaterialCommunityIcons
                    name='weather-tornado'
                    size={normalize(68)}
                    color='white'
                  />
                )}
              </View>
              <Text style={styles.description}>{day.weather[0].main}</Text>
              <Text style={styles.tinyText}>{day.weather[0].description}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#AAC4FF',
  },
  city: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityName: {
    fontSize: normalize(60),
    fontWeight: '600',
    color: 'white',
  },
  weather: {},
  day: {
    width: SCREEN_WIDTH,
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  temp: {
    marginTop: 50,
    fontSize: normalize(100),
    color: 'white',
    fontWeight: '600',
  },
  icon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  description: {
    marginTop: -10,
    fontSize: normalize(30),
    color: 'white',
    fontWeight: '500',
  },
  tinyText: {
    marginTop: -5,
    fontSize: normalize(25),
    color: 'white',
    fontWeight: '500',
  },
})
