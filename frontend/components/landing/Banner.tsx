"use client"

import gsap from "gsap"
import TextLoop from "./TextLoop"

export default function Banner() {
    return (
        <TextLoop
            text="Secure ✦ Swift ✦ Smart"
            shape="wave"
            speed={90}
            direction="forward"
            separator="✦"
            curviness={90}
            tilt={0}
            fontSize={46}
            fontWeight={800}
            letterSpacing={2}
            uppercase
            ribbon
            ribbonColor="#00d2ff"
            ribbonWidth={86}
            edgeFade={0}
            cross={false}
            crossAngle={16}
            draggable={false}
            scrollBoost={0}
            outline={false}
            pauseOnHover
            outlineWidth={1.5}
        />
    )
}