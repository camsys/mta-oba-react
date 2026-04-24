declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*/oba";
declare module "*/util/errorBoundary.js";
declare module "*/views/RefreshComponent.js";
declare module "*/js/updateState/NavigationEffect.js";
declare module "*/js/updateState/DataModels.js"
declare module "*/pageStructure/SideBar"
declare module "./components/util/RunScriptAfterRender" {
  import React from 'react';
  export const RunScriptAfterRender: (
    WrappedComponent: React.ComponentType<any>,
    scriptSrc: string
  ) => (props: any) => JSX.Element;
  export const ScriptForAfterCollapsible: string;
}
declare module "./js/updateState/SiriEffects" {
  export const siriGetVehiclesForRoutesEffect: (routeId: string, cardType: any) => void;
  export const siriGetVehiclesForVehicleViewEffect: (routeId: string, vehicleId: string, cardType: any) => void;
}
declare module "./js/updateState/SiriStopEffects" {
  export const siriGetVehiclesForStopViewEffect: (stopId: string, cardType: any) => void;
}