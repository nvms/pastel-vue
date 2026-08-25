// Recognizable line icons for the nav stories, rendered via SideNav's #icon slot.
// Paths are Lucide-style (24x24 viewBox, stroked).
import { h } from "vue"

const path = (d) => h("path", { d })
const rect = (attrs) => h("rect", attrs)
const line = (attrs) => h("line", attrs)
const poly = (points) => h("polyline", { points })
const polygon = (points) => h("polygon", { points })

const sets = {
  home: () => [
    path("m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"),
    poly("9 22 9 12 15 12 15 22"),
  ],
  inbox: () => [
    path("M22 12h-6l-2 3h-4l-2-3H2"),
    path("M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"),
  ],
  overview: () => [
    rect({ width: 7, height: 9, x: 3, y: 3, rx: 1 }),
    rect({ width: 7, height: 5, x: 14, y: 3, rx: 1 }),
    rect({ width: 7, height: 9, x: 14, y: 12, rx: 1 }),
    rect({ width: 7, height: 5, x: 3, y: 16, rx: 1 }),
  ],
  intakes: () => [
    path("M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"),
    poly("10 17 15 12 10 7"),
    line({ x1: 15, x2: 3, y1: 12, y2: 12 }),
  ],
  recipes: () => [
    rect({ width: 20, height: 14, x: 2, y: 7, rx: 2 }),
    path("M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"),
  ],
  venues: () => [
    line({ x1: 3, x2: 21, y1: 22, y2: 22 }),
    line({ x1: 6, x2: 6, y1: 18, y2: 11 }),
    line({ x1: 10, x2: 10, y1: 18, y2: 11 }),
    line({ x1: 14, x2: 14, y1: 18, y2: 11 }),
    line({ x1: 18, x2: 18, y1: 18, y2: 11 }),
    polygon("12 2 20 7 4 7"),
  ],
  workflows: () => [
    rect({ width: 8, height: 8, x: 3, y: 3, rx: 2 }),
    path("M7 11v4a2 2 0 0 0 2 2h4"),
    rect({ width: 8, height: 8, x: 13, y: 13, rx: 2 }),
  ],
  forms: () => [
    path("M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"),
    path("M14 2v4a2 2 0 0 0 2 2h4"),
    path("M16 13H8"),
    path("M16 17H8"),
    path("M10 9H8"),
  ],
  kitchens: () => [
    path("M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"),
    line({ x1: 6, x2: 18, y1: 17, y2: 17 }),
  ],
  stations: () => [
    rect({ width: 18, height: 18, x: 3, y: 3, rx: 2 }),
    path("M3 9h18"),
    path("M9 21V9"),
  ],
  inventory: () => [
    path("m7.5 4.27 9 5.15"),
    path("M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"),
    path("m3.3 7 8.7 5 8.7-5"),
    path("M12 22V12"),
  ],
  schedules: () => [
    rect({ width: 18, height: 18, x: 3, y: 4, rx: 2 }),
    line({ x1: 16, x2: 16, y1: 2, y2: 6 }),
    line({ x1: 8, x2: 8, y1: 2, y2: 6 }),
    line({ x1: 3, x2: 21, y1: 10, y2: 10 }),
    path("M8 14h.01"),
    path("M12 14h.01"),
    path("M16 14h.01"),
  ],
  evaluations: () => [
    rect({ width: 8, height: 4, x: 8, y: 2, rx: 1 }),
    path("M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"),
    path("m9 14 2 2 4-4"),
  ],
}

export const NavIcon = (props) => h("svg", {
  width: props.size || 18,
  height: props.size || 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 1.8,
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
}, (sets[props.name] || (() => []))())

NavIcon.props = ["name", "size"]
