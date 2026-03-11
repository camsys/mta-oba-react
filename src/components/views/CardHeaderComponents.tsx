import {cn} from "../util/coreUtils";
import {BusStopIcon, StarBorderIcon, VehicleIcon} from "../shared/icons";
import { RouteMatch, StopMatch } from "../../js/updateState/DataModels";
import React, { useContext, useState } from "react";
import { OBA } from "../../js/oba";
import {useFavorite} from "../util/MiscStateComponent";
import { useHighlight } from "../util/MapHighlightingStateComponent";
import { ServiceAlertSvg } from "./ServiceAlertContainerComponent";



export function StopCardHeaderMany({ match}: { match: StopMatch}): JSX.Element{
    return <CardHeaderMany match={match} IconComponent={BusStopIcon }/>
}

export function RouteCardHeaderMany({ match, hasServiceAlert}: { match: RouteMatch, hasServiceAlert: boolean}): JSX.Element{
    return <CardHeaderMany match={match} color={match.color} IconComponent={VehicleIcon} hasServiceAlert={hasServiceAlert} IconClass="fill-mta-dark-blue"/>
}

export function CardHeaderMany({ match, color, IconComponent,hasServiceAlert, IconClass}: { 
        match: RouteMatch|StopMatch, 
        color?: string, 
        IconComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>,
        hasServiceAlert?: boolean,
        IconClass?: string
     }): JSX.Element{
    
    
    const { highlightId } = useHighlight();
    const {isFavorite} = useFavorite()

    let favorited = isFavorite(match)

    return (<button className={cn(`card-header collapse-trigger`, { favorite: favorited })}
                    style={{ borderColor: color ? `#${color}` : "inherit" }}
                    onMouseEnter={() => highlightId(match.id)}
                    onMouseLeave={() => highlightId(null)}
                    aria-haspopup="true" aria-expanded="true"
                    aria-label={`Toggle ${match.id.split("_")[1]} ${match.name} open/close`}
            >
                {hasServiceAlert?<ServiceAlertSvg/>:null}
                <span className="card-title label">
                    <IconComponent className={cn("icon w-5 h-5 mb-1", IconClass, { "hidden": favorited } )}/>
                    <StarBorderIcon className={cn("icon w-5 h-5 mb-1", { "hidden": !favorited } )}/>
                    {match.name}
                </span>
            </button>)
}

export function StopCardHeader({ match}: { match: StopMatch}): JSX.Element{
    return <CardHeader match={match} IconComponent={BusStopIcon }/>
}

export function RouteCardHeader({ match}: { match: RouteMatch}): JSX.Element{
    return <CardHeader match={match} color={match.color} IconComponent={VehicleIcon } IconClass="fill-mta-dark-blue"/>
}


export function CardHeader({ match, color, IconComponent, IconClass}: { 
        match: RouteMatch|StopMatch, 
        color?: string, 
        IconComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>,
        IconClass?: string
     }): JSX.Element{
    const { highlightId } = useHighlight();
    const {isFavorite} = useFavorite()

    let favorited = isFavorite(match)

    return(<>
        <div
            className={cn(`card-header`, { favorite: favorited })}
            style={{ borderColor: color ? `#${color}` : "inherit" }}
            onMouseEnter={() => highlightId(match.id)}
            onMouseLeave={() => highlightId(null)}
        >
            <h3 className="card-title">
                <IconComponent className={cn("icon w-5 h-5 mb-1", IconClass, { "hidden": favorited } )}/>
                <StarBorderIcon className={cn("icon w-5 h-5 mb-1", { "hidden": !favorited } )}/>
                {OBA.Config.noWidows(match.name)}
            </h3>
        </div>
    </>)
}