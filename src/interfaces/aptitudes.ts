export type AptitudeGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface SurfaceAptitudes {
    turf: AptitudeGrade;
    dirt: AptitudeGrade;
}

export interface DistanceAptitudes {
    sprint: AptitudeGrade;
    mile: AptitudeGrade;
    medium: AptitudeGrade;
    long: AptitudeGrade;
}

export interface StrategyAptitudes {
    frontRunner: AptitudeGrade;
    paceChaser: AptitudeGrade;
    lateSurger: AptitudeGrade;
    endCloser: AptitudeGrade;
}

export interface Aptitudes {
    surface: SurfaceAptitudes;
    distance: DistanceAptitudes;
    strategy: StrategyAptitudes;
}

// Convert from array when loading data:
// const aptArray = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'A', 'B', 'C']; // from scraped data
// const aptitudes: Aptitudes = {
//     surface: { turf: aptArray[0], dirt: aptArray[1] },
//     distance: { sprint: aptArray[2], mile: aptArray[3], medium: aptArray[4], long: aptArray[5] },
//     strategy: { frontRunner: aptArray[6], paceChaser: aptArray[7], lateSurger: aptArray[8], endCloser: aptArray[9] }
// };