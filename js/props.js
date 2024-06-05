import { AlignText } from '../../../src/constants.js';
import {egrados} from "./egrados.js";

export const props = [

  
  {

    name: 'Students',
    radius: 0.88,
    itemLabelRadius: 0.89,
    itemLabelRadiusMax: 0.15,
    itemLabelRotation: 0,
    itemLabelAlign: AlignText.right,
    itemLabelBaselineOffset: -0.13,
    itemLabelFont: 'Pragati Narrow',
    itemBackgroundColors: ['#c7160c', '#fff'],
    itemLabelColors: ['#fff', '#000'],
    rotationSpeedMax: 700,
    rotationResistance: -70,
    lineWidth: 0,
    overlayImage: './img/example-2-overlay.svg',
    items: egrados
  }


];