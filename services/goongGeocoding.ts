import axios from 'axios';
import { readFileSync } from 'fs';

const goongJson = JSON.parse(readFileSync("apis-auth/goong-admin.json", "utf-8"));

export async function reverseGeocodingToAddress(latitude, longitude) {
    let geoObject = (await axios.get(`https://rsapi.goong.io/Geocode?latlng=${latitude},${longitude}&api_key=${goongJson.api_key}`,
        {
            headers: {
                "User-Agent": "E14VN Server | https://github.com/E14VN"
            }
        }
    )).data;

    return geoObject.results[0].formatted_address;
}