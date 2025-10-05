/**
 * Effects are found by cross referencing the effect data structure in the
 * support card data with what is written on their page in game tora. Basically,
 * trust me, bro.
 */
export enum EffectType {
    FriendshipBonus = 1,
    MoodEffect = 2,
    SpeedBonus = 3,
    StaminaBonus = 4,
    PowerBonus = 5,
    GutsBonus = 6,
    WitBonus = 7,
    TrainingEffectiveness = 8,
    InitialSpeed = 9,
    InitialStamina = 10,
    InitialPower = 11,
    InitialGuts = 12,
    InitialWit = 13,
    InitialFriendshipGauge = 14,
    RaceBonus = 15,
    FanBonus = 16,
    HintLevels = 17,
    HintFrequency = 18,
    SpecialtyPriority = 19,
    UnknownEffect20 = 20,
    UnknownEffect21 = 21,
    UnknownEffect22 = 22,
    UnknownEffect23 = 23,
    UnknownEffect24 = 24,
    EventRecovery = 25,
    EventEffectiveness = 26,
    FailureProtection = 27,
    EnergyCostReduction = 28,
    UnknownEffect29 = 29,
    SkillPointBonus = 30,
    WitFriendshipRecovery = 31,
}

export function getEffectName(id: number): string {
    if (Object.values(EffectType).includes(id as EffectType)) {
        return EffectType[id as EffectType] as string;
    }
    return `Unknown Effect ${id}`;
}

export function getEffectId(effectType: EffectType): number {
    return effectType;
}
