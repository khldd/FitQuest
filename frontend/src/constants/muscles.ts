import { Muscle } from '@/types/muscle';

/**
 * Detailed anatomically accurate muscle paths for a realistic human figure
 * ViewBox: 0 0 400 700 (allows for proper head-to-toe proportions)
 * 
 * Front view: Realistic chest, abs, arms, shoulders, legs
 * Back view: Realistic back muscles, glutes, hamstrings
 */

export const MUSCLES: Muscle[] = [
    // ============= FRONT VIEW =============

    // Chest (Pectorals) - Realistic pec shape
    {
        id: 'chest',
        name: 'Chest',
        group: 'chest',
        view: 'front',
        path: 'M145,150 Q160,145 175,148 Q185,150 195,155 L200,165 Q195,180 185,188 Q170,195 155,188 Q145,180 142,165 L145,150 Z M255,150 Q240,145 225,148 Q215,150 205,155 L200,165 Q205,180 215,188 Q230,195 245,188 Q255,180 258,165 L255,150 Z',
        cx: 200,
        cy: 165,
    },

    // Shoulders (Deltoids) - Rounded shoulder caps
    {
        id: 'shoulders',
        name: 'Shoulders',
        group: 'shoulders',
        view: 'front',
        path: 'M110,145 Q100,150 98,165 Q100,180 112,185 Q125,180 130,165 Q128,150 118,145 L110,145 Z M290,145 Q300,150 302,165 Q300,180 288,185 Q275,180 270,165 Q272,150 282,145 L290,145 Z',
        cx: 200,
        cy: 165,
    },

    // Biceps - Natural arm muscle curve
    {
        id: 'biceps',
        name: 'Biceps',
        group: 'arms',
        view: 'front',
        path: 'M115,190 Q108,195 108,210 Q110,225 118,230 Q128,225 130,210 Q128,195 120,190 L115,190 Z M285,190 Q292,195 292,210 Q290,225 282,230 Q272,225 270,210 Q272,195 280,190 L285,190 Z',
        cx: 200,
        cy: 210,
    },

    // Forearms
    {
        id: 'forearms',
        name: 'Forearms',
        group: 'arms',
        view: 'front',
        path: 'M112,235 L108,290 Q107,295 110,298 L118,298 Q120,295 118,290 L115,235 L112,235 Z M288,235 L292,290 Q293,295 290,298 L282,298 Q280,295 282,290 L285,235 L288,235 Z',
        cx: 200,
        cy: 265,
    },

    // Abs (6-pack) - Defined rectus abdominis
    {
        id: 'abs',
        name: 'Abs',
        group: 'abs',
        view: 'front',
        path: 'M170,200 L230,200 L228,220 L172,220 Z M172,225 L228,225 L226,245 L174,245 Z M174,250 L226,250 L224,270 L176,270 Z M176,275 L224,275 L220,295 L180,295 Z',
        cx: 200,
        cy: 247,
    },

    // Obliques - Side abs
    {
        id: 'obliques',
        name: 'Obliques',
        group: 'abs',
        view: 'front',
        path: 'M165,210 Q155,220 152,240 L165,260 L170,220 L165,210 Z M235,210 Q245,220 248,240 L235,260 L230,220 L235,210 Z',
        cx: 200,
        cy: 235,
    },

    // Quadriceps - Front thigh muscles with definition
    {
        id: 'quads',
        name: 'Quadriceps',
        group: 'legs',
        view: 'front',
        path: 'M155,310 L175,310 L172,420 Q170,440 168,460 L158,460 Q160,440 160,420 L155,310 Z M225,310 L245,310 L245,420 Q245,440 242,460 L232,460 Q235,440 235,420 L225,310 Z',
        cx: 200,
        cy: 385,
    },

    // Calves
    {
        id: 'calves',
        name: 'Calves',
        group: 'legs',
        view: 'front',
        path: 'M160,465 Q155,490 158,510 Q162,520 168,515 Q172,495 168,470 L160,465 Z M240,465 Q245,490 242,510 Q238,520 232,515 Q228,495 232,470 L240,465 Z',
        cx: 200,
        cy: 490,
    },

    // ============= BACK VIEW =============

    // Upper Back (Traps) - Trapezius muscle
    {
        id: 'traps',
        name: 'Traps',
        group: 'back',
        view: 'back',
        path: 'M165,125 L200,145 L235,125 Q240,135 238,150 L222,165 L178,165 L162,150 Q160,135 165,125 Z',
        cx: 200,
        cy: 145,
    },

    // Lats (Latissimus Dorsi) - Wing-like back muscles
    {
        id: 'lats',
        name: 'Lats',
        group: 'back',
        view: 'back',
        path: 'M140,180 Q130,185 128,200 Q130,230 145,255 L165,245 L172,210 L165,180 L140,180 Z M260,180 Q270,185 272,200 Q270,230 255,255 L235,245 L228,210 L235,180 L260,180 Z',
        cx: 200,
        cy: 217,
    },

    // Lower Back
    {
        id: 'lower_back',
        name: 'Lower Back',
        group: 'back',
        view: 'back',
        path: 'M170,260 L230,260 L225,295 L175,295 Z',
        cx: 200,
        cy: 277,
    },

    // Rear Delts (Back shoulders)
    {
        id: 'rear_delts',
        name: 'Rear Delts',
        group: 'shoulders',
        view: 'back',
        path: 'M118,150 Q105,155 102,170 Q105,185 118,188 Q130,183 132,168 Q130,155 120,150 L118,150 Z M282,150 Q295,155 298,170 Q295,185 282,188 Q270,183 268,168 Q270,155 280,150 L282,150 Z',
        cx: 200,
        cy: 169,
    },

    // Triceps - Back of arms
    {
        id: 'triceps',
        name: 'Triceps',
        group: 'arms',
        view: 'back',
        path: 'M120,195 Q110,200 108,215 Q112,228 122,232 Q132,228 132,215 Q130,200 125,195 L120,195 Z M280,195 Q290,200 292,215 Q288,228 278,232 Q268,228 268,215 Q270,200 275,195 L280,195 Z',
        cx: 200,
        cy: 213,
    },

    // Glutes - Natural rounded shape
    {
        id: 'glutes',
        name: 'Glutes',
        group: 'legs',
        view: 'back',
        path: 'M165,300 Q155,310 155,325 Q158,340 170,345 L185,340 L192,322 L185,305 L165,300 Z M235,300 Q245,310 245,325 Q242,340 230,345 L215,340 L208,322 L215,305 L235,300 Z',
        cx: 200,
        cy: 322,
    },

    // Hamstrings - Back thigh muscles
    {
        id: 'hamstrings',
        name: 'Hamstrings',
        group: 'legs',
        view: 'back',
        path: 'M160,350 L175,350 L172,450 Q170,465 165,460 L158,460 Q160,445 160,430 L160,350 Z M225,350 L240,350 L240,430 Q240,445 242,460 L235,460 Q232,465 230,450 L225,350 Z',
        cx: 200,
        cy: 405,
    },
];
