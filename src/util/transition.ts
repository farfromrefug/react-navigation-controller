

export enum type  {
  NONE,
  PUSH_LEFT,
  PUSH_RIGHT,
  PUSH_UP,
  PUSH_DOWN,
  COVER_LEFT,
  COVER_RIGHT,
  COVER_UP,
  COVER_DOWN,
  REVEAL_LEFT,
  REVEAL_RIGHT,
  REVEAL_UP,
  REVEAL_DOWN
}

export function isPush (t) {
  return t === type.PUSH_LEFT ||
         t === type.PUSH_RIGHT ||
         t === type.PUSH_UP ||
         t === type.PUSH_DOWN
}

export function isCover (t) {
  return t === type.COVER_LEFT ||
         t === type.COVER_RIGHT ||
         t === type.COVER_UP ||
         t === type.COVER_DOWN
}

export function isReveal (t) {
  return t === type.REVEAL_LEFT ||
         t === type.REVEAL_RIGHT ||
         t === type.REVEAL_UP ||
         t === type.REVEAL_DOWN
}
