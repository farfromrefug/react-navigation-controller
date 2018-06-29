export declare enum type {
    NONE = 0,
    PUSH_LEFT = 1,
    PUSH_RIGHT = 2,
    PUSH_UP = 3,
    PUSH_DOWN = 4,
    COVER_LEFT = 5,
    COVER_RIGHT = 6,
    COVER_UP = 7,
    COVER_DOWN = 8,
    REVEAL_LEFT = 9,
    REVEAL_RIGHT = 10,
    REVEAL_UP = 11,
    REVEAL_DOWN = 12,
}
export declare function isPush(t: any): boolean;
export declare function isCover(t: any): boolean;
export declare function isReveal(t: any): boolean;
