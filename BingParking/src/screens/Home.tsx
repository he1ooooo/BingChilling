import { Image, PermissionsAndroid, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Geolocation from 'react-native-geolocation-service';
import notifee from '@notifee/react-native';
import MapViewDirections from 'react-native-maps-directions';
import { useEffect, useRef, useState } from "react";
import IonIcons from 'react-native-vector-icons/Ionicons';
import MapView, { Marker } from "react-native-maps";
import { t } from "../utils/style";
import { useUserCont } from '../contexts/userCont';
import Modal from 'react-native-modal';
import { google_api } from "../../env";

//       const sendNotifcation = async({title , body}: any) => {
//         await notifee.displayNotification({
//           title: title,
//           body: body,
//           ios: {
//             foregroundPresentationOptions: {
//               badge: true,
//               sound: true,
//               banner: true,
//               list: true,
//             },
//           },
//         });
//       }; 

export const HomeScreen = ({ navigation }: any) => {
  const useLoc = useUserCont();
  const mapsRef = useRef<any>('');
  const [rc, setRc] = useState<boolean>(false);
  const [id, setId] = useState<any | null>(null);
  // const [org, setOrg] = useState<any>({ latitude: 36.1871635, longitude: -120.8211910 });
  const [des, setDes] = useState<any>({ latitude: 37.3318456, longitude: -122.0296002 });
  const [lan, setLan] = useState<any | number>(0);
  const [lon, setLon] = useState<any | number>(0);
  const [selectedParking, setSelectedParking] = useState<boolean>(false);
  const user = useUserCont();

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      await Geolocation.requestAuthorization("whenInUse");
      Geolocation.getCurrentPosition(position => {
        useLoc?.setCurrentLocation(position.coords);
      },
        error => console.log(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      )
    } 
    else {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      if(granted == 'granted') {    
        Geolocation.getCurrentPosition(position => {
            useLoc?.setCurrentLocation(position.coords); 
          },
          error => console.log(error),
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
       }; 
    };
  };

  useEffect(() => {
    useLoc?.currentLocation != null ? mapsRef?.current?.animateToRegion(useLoc?.currentLocation, 1000) : useLoc?.currentLocation;
    requestLocationPermission();
  }, [useLoc?.currentLocation]);

  useEffect(() => {
    setLan(Number(((des?.latitude - useLoc?.currentLocation?.latitude) / 3).toFixed(6)));
    setLon(Number(((des?.longitude - useLoc?.currentLocation?.longitude) / 3).toFixed(6)));
    if (useLoc?.currentLocation?.latitude != des?.latitude && rc) {
      console.log(lan, lon);
      setId(setTimeout(() => {
        return useLoc?.setCurrentLocation({ ...useLoc?.currentLocation, latitude: (useLoc?.currentLocation?.latitude + lan), longitude: (useLoc?.currentLocation?.longitude + lon)});
      }, 1000));
    };

    return () => { clearTimeout(id) };
  }, [useLoc?.currentLocation, des, rc]);

  return (
    <View style={styles.container}>
      {useLoc?.currentLocation ? <>
        <MapView
        style={styles.map}
        zoomControlEnabled={true}
        zoomEnabled={true}
        showsUserLocation={true}
        ref={mapsRef}
        initialRegion={{
          latitude: useLoc?.currentLocation?.latitude,
          longitude: useLoc?.currentLocation?.longitude,
          latitudeDelta: useLoc?.currentLocation?.latitude,
          longitudeDelta: useLoc?.currentLocation?.longitude,
        }}>
        <Marker coordinate={useLoc?.currentLocation} title="You" onPress={() => console.log('darsan')}/>
        <Marker coordinate={des} title="Park Location"/>
        <MapViewDirections
          origin={useLoc?.currentLocation}
          destination={des}
          apikey={google_api}
          strokeColor='red'
          strokeWidth={2}
          mode='DRIVING'
          onReady={(res) => {
            console.log(`Distance: ${Math.floor(res?.distance)} , Duration: ${Math.floor(res?.duration)}`)
            if (res?.distance == 0 && res?.duration == 0) {
              console.log('Reached!');
              return clearTimeout(id);
            }
          }} />
        <Marker coordinate={useLoc?.currentLocation} />
      </MapView>
      <View style={[t`w-full h-full flex absolute bottom-5 right-5 justify-end items-end`]} pointerEvents="box-none">
        <View style={[t`flex-row justify-between w-[120px]`]}>
          <View style={t`${user?.user?.type?.S == 'Owner' ? 'flex' : 'hidden'}`}>
          <TouchableOpacity onPress={() => navigation.navigate('ParkAdd')} style={[t`border-[1px] rounded-10 border-[#4448AE] bg-[#4448AE] w-[50px] h-[50px] flex justify-center items-center`]}>
            <IonIcons name='md-add-sharp' color='white' size={25} />
          </TouchableOpacity>
          </View>
          <TouchableOpacity style={[t`border-[1px] rounded-10 border-[#4448AE] bg-[#4448AE] w-[50px] h-[50px] flex justify-center items-center`]} onPress={requestLocationPermission}>
            <IonIcons name='locate' color='white' size={25} />
          </TouchableOpacity>
        </View>
      </View>
      <Modal isVisible={selectedParking}
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}><View style={[t`w-full h-full bg-white rounded-[30px] flex items-center`]}>
          <Image
            style={[t`h-[200px] w-[200px] mt-[100px] flex items-center`]}
            source={require('../assets/parking.jpg')}
          /><View style={t`w-[320px] flex-col h-[200px] justify-between`}>
            <Text style={t`text-[30px]`}>Name </Text>
            <Text style={t`text-[30px]`}>Address : Address</Text>
            <Text style={t`text-[30px]`}>Cost per hour : Cost₮</Text>
            <Text style={t`text-[30px]`}>Phone : Phone</Text>
          </View>
          <View style={[t`w-full h-full z-1 flex items-center justify-end absolute`]}>
            <TouchableOpacity
              style={[
                t`bg-[#9C9FF0] w-[320px] h-[58px] rounded-[10px] flex items-center mb-[20px] justify-center`,
              ]}
              onPress={() => {
                setSelectedParking(false) , setRc(true);
              }}>
              <Text style={[t`text-white`]}>Reserve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                t`bg-[#EDEFFF] w-[320px] h-[58px] rounded-[10px] flex items-center mb-[30px] justify-center`,
              ]}
              onPress={() => {
                setSelectedParking(false);
              }}>
              <Text style={[t`text-[#4448AE]`]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={t`flex flex-row absolute top-[24px] right-[14px]`}>
        <TouchableOpacity style={t`flex flex-col justify-center items-center rounded-full bg-white w-[52px] h-[52px]`} onPress={() => navigation?.navigate('Search')}>
          <IonIcons name="search-outline" size={24} color={"#4448AE"} />
        </TouchableOpacity>
        <TouchableOpacity style={t`flex flex-col justify-center items-center rounded-full bg-white w-[52px] h-[52px] ml-[10px]`} onPress={() => navigation?.navigate('Notif')}>
          <IonIcons name="notifications-outline" size={24} color={"#4448AE"} />
        </TouchableOpacity>
      </View>
      </> : <View><Text>Loading...</Text></View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50
  },
  map: {
    flex: 1
  },
  autocompleteContainer: {
    flex: 0,
    position: 'absolute',
    width: '100%',
    zIndex: 1
  },
});

export default HomeScreen;