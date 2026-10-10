import { reverseGeocodeAsync } from 'expo-location';
import { useEffect,useState } from 'react';
import { Platform } from 'react-native';
import type { Point } from '../../contracts/domain';

/** Own foreground position only; provider failure leaves an honest generic area label. */
export function useLocality(position:Point|null) {
  const latitude=position?.latitude;const longitude=position?.longitude;
  const [locality,setLocality]=useState<{latitude:number;longitude:number;label:string}|null>(null);
  useEffect(()=>{
    if(latitude===undefined || longitude===undefined || Platform.OS==='web')return;
    let alive=true;
    void reverseGeocodeAsync({latitude,longitude}).then(addresses=>{
      const address=addresses[0];
      const parts=address?[address.city??address.district,address.region].filter((part):part is string=>!!part?.trim()):[];
      const label=[...new Set(parts)].join(', ');
      if(alive && label)setLocality({latitude,longitude,label});
    }).catch(()=>{/* Reverse geocoding is optional; never invent locality or safety. */});
    return ()=>{alive=false;};
  },[latitude,longitude]);
  return locality?.latitude===latitude && locality?.longitude===longitude?locality?.label:null;
}
