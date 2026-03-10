import React from 'react';
import {ChangeViewButton, ChangeViewButtonProps} from "./common";
import {useNavigation} from "../../js/updateState/NavigationEffect";
import {cn} from "../util/coreUtils";
import {FavoritesIconElement, VehicleIconElement, ListIconElement, ShuttleIconElement} from "./icons";


// outline of turning these buttons into decorators of the ChangeViewButton, which would be more reusable and composable. 
// The idea is that each preset button would add text/values but still expose base properties






const FavoritesButton = (props  : ChangeViewButtonProps) => {
  const { favoritesSearch } = useNavigation();
  return (
  <ChangeViewButton
    {...props}
    iconElement={<FavoritesIconElement fill="white" className={cn("", props.iconClassName)} />}
    text="Favorites"
    onClick={()=>favoritesSearch()}
    className={cn("bg-mta-green", props.className)}
    textClassName={cn("", props.textClassName)}
  />
)
}




const NearMeButton = (props: ChangeViewButtonProps) => {
  const { search } = useNavigation();
  return (
    <ChangeViewButton 
      {...props}
      text={props.text ? props.text : "Routes & Stops Near Me"}
      iconElement={<VehicleIconElement fill="white" className={cn("", props.iconClassName)} />}
      onClick={() => search('near me')}
      className={cn("bg-mta-blue", props.className)}
      textClassName={cn("", props.textClassName)}
    />
  )
}

const AllRoutesButton = (props: ChangeViewButtonProps) => {
  const {allRoutesSearch } = useNavigation();
  return (
    <ChangeViewButton 
      {...props}
      text="All Routes Available" 
      className={cn("bg-mta-blue", props.className)}
      iconElement={<ListIconElement fill="white" className={cn("", props.iconClassName)} />}
      onClick={() => {allRoutesSearch()}}
      textClassName={cn("", props.textClassName)}
    />
  )
}


const ShuttleButton = (props: ChangeViewButtonProps) => {
  const { search } = useNavigation();
  return (
    <ChangeViewButton 
      {...props}
      text="Shuttle Buses" 
      className={cn("bg-shuttle-gray", props.className)}
      iconElement={<ShuttleIconElement fill="white" className={cn("", props.iconClassName)} />}
      onClick={() => search('shuttles')}
      textClassName={cn("", props.textClassName)}
    />
  )
}

export {FavoritesButton,NearMeButton,AllRoutesButton,ShuttleButton}