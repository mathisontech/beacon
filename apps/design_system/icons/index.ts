/**
 * Beacon Icon Library
 *
 * Categories:
 *   weather  - daily conditions (sun, cloud, rain, snow, wind, etc.)
 *   vibe     - mood/check-in faces and symbols
 *   hazard   - per-hazard-type warnings (flood, fire, earthquake, etc.)
 *   help     - requesting resources (orange) and offering resources (purple)
 *   common   - general UI (pins, arrows, check, bell, people, etc.)
 *
 * Containers:
 *   IconCircle   - round badge (sidebar, lists)
 *   IconTeardrop - map pin marker
 *   IconZone     - pill label for zones
 */

// Weather
export {
  Sunny, PartlyCloudy, Cloudy, Rain, HeavyRain,
  Thunderstorm, Snow, Wind, Fog, Hot, Cold, Hail,
} from "./weather";

// Vibe checks
export {
  VibeGreat, VibeGood, VibeOkay, VibeWorried, VibeBad, VibeUnsafe,
  Heart, ThumbsUp, CheckIn,
} from "./vibe";

// Hazards
export {
  Flood, Hurricane, Tsunami, StormSurge,
  Wildfire, HighFireRisk,
  Earthquake, Landslide, Volcano, Sinkhole,
  Tornado, HighWind,
  ExtremeHeat, ExtremeCold, Blizzard,
  PowerOutage, Hazmat, AirQuality, AlertTriangle,
} from "./hazard";

// Help - requesting
export {
  NeedHelp, NeedWater, NeedFood, NeedMedical,
  NeedShelter, NeedTransport, NeedPower, NeedRescue, Trapped,
} from "./help";

// Help - offering
export {
  OfferShelter, OfferRide, OfferFood, OfferMedical,
  OfferSupplies, OfferSnowTires, OfferGenerator, VolunteerHand,
} from "./help";

// Common UI
export {
  MapPin, Navigation, Check, X, ChevronRight, ChevronDown,
  Bell, Eye, People, Person, Message, Share, Settings,
  Clock, Shield, Info, ArrowRight,
} from "./common";

// Containers
export { IconCircle, IconTeardrop, IconZone } from "./containers";
