import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import { LeafletMouseEvent, LeafletEventHandlerFnMap, Map } from "leaflet";

interface UseLongPressSearchProps {
  onLongPress: (e: LeafletMouseEvent) => void;
  pressDelay?: number; // milliseconds
}

export function useLongPressSearch({ onLongPress, pressDelay = 600 }: UseLongPressSearchProps) {
  const map = useMap();
  const [pressTimer, setPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!map) return;

    const startPress = (e: LeafletMouseEvent) => {
      const timer = setTimeout(() => {
        onLongPress(e);
      }, pressDelay);
      setPressTimer(timer);
    };

    const cancelPress = () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        setPressTimer(null);
      }
    };

    const events: Partial<LeafletEventHandlerFnMap> = {
      mousedown: startPress,
      mouseup: cancelPress,
      touchstart: startPress,
      touchend: cancelPress,
    };

    map.on(events);

    return () => {
      map.off(events);
    };
  }, [map, pressTimer, onLongPress, pressDelay]);
}
