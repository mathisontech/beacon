import { usgsEarthquakes } from "./usgs-earthquakes";
import { nwsAlerts } from "./nws-alerts";
import { nifcFires } from "./nifc-fires";

export { usgsEarthquakes, nwsAlerts, nifcFires };

export const naturalFeeds = [usgsEarthquakes, nwsAlerts, nifcFires];
