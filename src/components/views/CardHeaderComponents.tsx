import {cn} from "../util/coreUtils";
import {BusStopIcon, StarBorderIcon, VehicleIcon} from "../shared/icons";
import { RouteMatch, StopMatch } from "../../js/updateState/DataModels";
import React, { useContext, useState } from "react";
import { OBA } from "../../js/oba";
import {useFavorite} from "../util/MiscStateComponent";
import { useHighlight } from "../util/MapHighlightingStateComponent";
import { ServiceAlertSvg } from "./ServiceAlertContainerComponent";
import {useNavigation} from "../../js/updateState/NavigationEffect";
import {RouteInterface, StopInterface} from "../../js/updateState/DataModels";
import { UnderlineOnFocusElement } from "../shared/common";



export function StopCardHeaderMany({ match}: { match: StopMatch}): JSX.Element{
    return <CardHeaderMany match={match} IconComponent={BusStopIcon }/>
}

export function RouteCardHeaderMany({ match, hasServiceAlert}: { match: RouteMatch, hasServiceAlert: boolean}): JSX.Element{
    return <CardHeaderMany match={match} color={match.color} IconComponent={VehicleIcon} hasServiceAlert={hasServiceAlert} IconClass="fill-mta-dark-blue"/>
}

export function IconOrFavorite({match, IconComponent, IconClass}:{match: RouteMatch|StopMatch, IconComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>, IconClass?: string}): JSX.Element{
    const {isFavorite} = useFavorite()

    let favorited = isFavorite(match)

    return(<>
        <IconComponent className={cn("icon w-5 h-5 mb-1", IconClass, { "hidden": favorited } )}/>
        <StarBorderIcon className={cn("icon w-5 h-5 mb-1", { "hidden": !favorited } )}/>
    </>)
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

    return (<button className={cn(`card-header collapse-trigger`)}
                    style={{ borderColor: color ? `#${color}` : "inherit" }}
                    onMouseEnter={() => highlightId(match.datumId)}
                    onMouseLeave={() => highlightId(null)}
                    aria-haspopup="true" aria-expanded="true"
                    aria-label={`Toggle ${match.datumId.split("_")[1]} ${match.datumName} open/close`}
            >
                
                <span className="card-title label flex items-center">
                    {hasServiceAlert?<ServiceAlertSvg/>:null}
                    <IconOrFavorite match={match} IconComponent={IconComponent} IconClass={IconClass}/>
                    {match.datumName}
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
            onMouseEnter={() => highlightId(match.datumId)}
            onMouseLeave={() => highlightId(null)}
        >
            <h3 className="card-title flex items-center">
                <IconComponent className={cn("icon w-5 h-5 mb-1", IconClass, { "hidden": favorited } )}/>
                <StarBorderIcon className={cn("icon w-5 h-5 mb-1", { "hidden": !favorited } )}/>
                {OBA.Config.noWidows(match.datumName)}
            </h3>
        </div>
    </>)
}





// todo: these are so close to generalized card headers that they should probably be refactored to use the same underlying component, but time constraints

function FavoriteReorderButtons({datumId, label}: {datumId: string, label: string}): JSX.Element{
    let {reorderFavorite} = useFavorite()
    const buttonClass = "flex items-center justify-center w-6 h-6 rounded-sm border-none bg-ui-gray text-mta-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-mta-dark-blue focus-visible:outline-offset-2"
    return (
        <div className="reorder-buttons flex flex-col justify-center shrink-0">
            <button
                type="button"
                onClick={() => reorderFavorite(datumId, -1)}
                aria-label={`Move ${label} up in favorites`}
                className={buttonClass}
            >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 5L20 17H4L12 5Z" fill="currentColor"/>
                </svg>
            </button>
            <button
                type="button"
                onClick={() => reorderFavorite(datumId, 1)}
                aria-label={`Move ${label} down in favorites`}
                className={buttonClass}
            >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 19L4 7H20L12 19Z" fill="currentColor"/>
                </svg>
            </button>
        </div>
    )
}

export const SelectableFavoriteRouteCard = ({routeMatch, showSort}:{routeMatch:RouteInterface, showSort:boolean}) =>{
    let {search} = useNavigation()
    {
        return(<React.Fragment>
            <div className={"card-wrapper flex flex-row items-stretch gap-1"}>
                {showSort && <FavoriteReorderButtons datumId={routeMatch.datumId} label={routeMatch.datumName}/>}
                <div className={`card route-card ${routeMatch.routeId}`} onClick={()=>search(routeMatch.routeId)}>
                    <button
                        className="group card-header link-header"
                        style={{ borderColor: "#" + routeMatch.color }}
                        tabIndex={0}
                    >
                        <UnderlineOnFocusElement variant="black" as={"h3"} className="card-title flex items-center">
                            <StarBorderIcon className="icon w-5 h-5 mb-[0.385rem]"/>
                            <VehicleIcon className="icon w-[1.125rem] h-[1.125rem] mb-1 fill-mta-dark-blue"/>
                            {OBA.Config.noWidows(routeMatch.routeTitle)}
                        </UnderlineOnFocusElement>
                    </button>
                </div>
            </div>
        </React.Fragment>)
    }
}

export const SelectableFavoriteStopCard = ({stopDatum, showSort}:{stopDatum:StopInterface, showSort:boolean}) =>{
    let {search} = useNavigation()
    return(<React.Fragment>
            <div className={"card-wrapper flex flex-row items-stretch gap-1"}>
                {showSort && <FavoriteReorderButtons datumId={stopDatum.datumId} label={stopDatum.datumName}/>}
                <div className={`card route-card ${stopDatum.id.split("_")[1]}`} onClick={()=>search(stopDatum.id.split("_")[1])}>
                    <button
                        className="group card-header link-header border-color-mta-dark-blue"
                        tabIndex={0}
                    >
                        <UnderlineOnFocusElement variant="black" as={"h3"} className="card-title flex items-center">
                            <StarBorderIcon className="icon w-5 h-5 mb-[0.4rem]"/>
                            <BusStopIcon className="icon w-5 h-6 mb-1"/>
                            {OBA.Config.noWidows(stopDatum.name)}</UnderlineOnFocusElement>
                    </button>
                </div>
            </div>
        </React.Fragment>)
}