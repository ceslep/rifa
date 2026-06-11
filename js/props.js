import { AlignText } from '../src/constants.js';
import {egrados} from "./egrados.js";

export const props = [
  {
    name: 'Students',
    radius: 0.9,
    itemLabelRadius: 0.9,
    itemLabelRadiusMax: 0.15,
    itemLabelRotation: 0,
    itemLabelAlign: AlignText.right,
    itemLabelBaselineOffset: -0.13,
    itemLabelFont: 'Pragati Narrow',
    itemLabelFontSizeMax: 42,
    // Esmeralda / crema / jade / oro alternados — look festivo y refinado
    itemBackgroundColors: ['#047857', '#fef9c3', '#065f46', '#eab308'],
    itemLabelColors: ['#fef9c3', '#052e23', '#fde68a', '#052e23'],
    borderColor: '#eab308',
    borderWidth: 6,
    lineColor: 'rgba(5, 46, 35, 0.35)',
    lineWidth: 1,
    rotationSpeedMax: 700,
    rotationResistance: -70,
    overlayImage: './img/example-2-overlay.svg',
    items: egrados
  }
];