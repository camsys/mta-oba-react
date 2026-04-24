declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*/oba";
declare module "*/util/errorBoundary";
declare module "./js/updateState/SiriStopEffects" {
  export const siriGetVehiclesForStopViewEffect: (stopId: string, cardType: any) => void;
}