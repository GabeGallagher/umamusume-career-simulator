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
