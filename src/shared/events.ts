import { Player, Team, TeamResult, Word, WordKind } from "./types";

export const joinTeamEventName = "join-team";
export interface JoinTeamData {
  gameID: string;
  sessionID: string;
  teamID: Team;
}

export const joinedTeamEventName = "joined-team";
export interface JoinedTeamData {
  sessionID: string;
  teamID: Team;
  currentTurn: Team;
}

export const gameDataDumpEventName = "game-data-dump";
export interface GameData {
  gameID: string;
  players: Player[];
  currentTurn: Team;
  revealedWordVals: string[];
  scores: { [key in Team]?: TeamResult };
}

export const joinGameEventName = "join-game";
export interface JoinGameData {
  gameID: string;
}

export const becomeSpymasterEventName = "become-spymaster";
export interface BecomeSpymasterData {
  gameID: string;
  sessionID: string;
}

export const newSpymasterEventName = "new-spymaster";
export interface SpymasterData {
  spymasterID: string;
  teamID: Team;
}

export const nextTurnEventName = "next-turn";
export interface TurnData {
  currentTurn: Team;
}

export const errorEventName = "srv-error";

export const wordSelectedEventName = "word-selected";
export interface SelectedWordData {
  gameID: string;
  wordValue: string;
  playerID: string;
}

export const turnResultEventName = "turn-result";
/*export interface TurnResultData {
  turnResult: TurnResult;
} */
export interface TurnResultData {
  team: Team;
  lastRevealedWord: Word;
  /* wordsLeft: number; */
  /* isAssassinated: boolean; */
}

export const leaveGameEventName = "leave-game";
