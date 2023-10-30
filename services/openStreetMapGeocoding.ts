import axios from 'axios';

export async function reverseGeocodingToISO3166(latitude, longitude) {
    let geoObject = (await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2&zoom=5`,
        {
            headers: {
                "User-Agent": "E14VN Server | https://github.com/E14VN"
            }
        }
    )).data;

    return geoObject.address["ISO3166-2-lvl4"];
}