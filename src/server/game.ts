import {
  DuplicatePlayer,
  InvalidTurn,
  InvalidWord,
  PlayerNotFound,
  SpymasterExists,
  WordAlreadyRevealed,
} from "../shared/error";
import { TurnResultData } from "../shared/events";
import { Player, Team, TeamResult, Word, WordKind } from "../shared/types";
import { DAILY_DOMAIN } from "./env";

export enum GameState {
  Unknown = 0,
  Pending,
  Playing,
  Ended,
}

export class Game {
  readonly id: string;
  readonly name: string;
  readonly dailyRoomURL: string;
  readonly dailyRoomName: string;
  state: GameState;
  readonly wordSet: Word[];
  players: Player[] = [];

  private team1SpymasterID: string;
  private team2SpymasterID: string;
  currentTurn: Team;
  teamResults: { [key in Team]?: TeamResult } = {
    team1: {
      team: Team.Team1,
      wordsLeft: 9,
      isAssassinated: false,
    },
    team2: {
      team: Team.Team2,
      wordsLeft: 9,
      isAssassinated: false,
    },
  };

  constructor(
    name: string,
    roomURL: string,
    roomName: string,
    wordSet: Word[]
  ) {
    this.state = GameState.Pending;
    this.name = name;
    this.dailyRoomURL = roomURL;
    this.wordSet = wordSet;
    this.dailyRoomName = roomName;
    this.id = `${DAILY_DOMAIN}-${roomName}`;
  }

  addPlayer(playerID: string, team: Team) {
    // See if this player is already on one of the teams
    for (let i = 0; i < this.players.length; i++) {
      const p = this.players[i];
      if (p.id === playerID) {
        throw new DuplicatePlayer(p.id, p.team);
      }
    }
    const p = new Player(playerID, team);
    this.players.push(p);
  }

  removePlayer(playerID: string) {
    for (let i = 0; i < this.players.length; i++) {
      const p = this.players[i];
      if (p.id === playerID) {
        this.players.splice(i, 1);
        return;
      }
    }
    throw new PlayerNotFound(playerID);
  }

  setSpymaster(id: string): Player {
    let player: Player = null;
    // First, find this player in our player list
    for (let i = 0; i < this.players.length; i++) {
      const p = this.players[i];
      if (p.id === id) {
        player = p;
        break;
      }
    }
    if (!player) {
      throw new PlayerNotFound(id);
    }
    const team = player.team;
    if (team === Team.Team1) {
      if (!this.team1SpymasterID) {
        this.team1SpymasterID = id;
        player.isSpymaster = true;
        return player;
      }
      throw new SpymasterExists(player.team);
    }

    if (team === Team.Team2) {
      if (!this.team2SpymasterID) {
        this.team2SpymasterID = id;
        player.isSpymaster = true;
        return player;
      }
      throw new SpymasterExists(player.team);
    }

    throw new Error(`player team unrecognized: ${player.team}`);
  }

  spymastersReady(): boolean {
    return !!(this.team1SpymasterID && this.team2SpymasterID);
  }

  nextTurn() {
    if (!this.currentTurn || this.currentTurn === Team.Team2) {
      this.currentTurn = Team.Team1;
      return;
    }
    this.currentTurn = Team.Team2;
  }

  selectWord(wordVal: string, playerID: string): TurnResultData {
    // Check if user selected word on their own team
    let word: Word;

    // First, confirm that this is actually a valid word in our game
    for (let i = 0; i < this.wordSet.length; i++) {
      const w = this.wordSet[i];
      if (wordVal === w.word) {
        if (w.isRevealed) {
          throw new WordAlreadyRevealed(w.word);
        }
        word = w;
        break;
      }
    }

    if (!word) {
      throw new InvalidWord(wordVal);
    }

    // Find the given player:
    let player: Player;
    for (let i = 0; i < this.players.length; i++) {
      const p = this.players[i];
      if (p.id === playerID) {
        player = p;
        break;
      }
    }
    if (!player) {
      throw new PlayerNotFound(playerID);
    }

    word.isRevealed = true;

    // Check if this player is allowed to even select a word
    if (player.team !== this.currentTurn) {
      throw new InvalidTurn();
    }

    const teamRes = this.teamResults[player.team];

    if (
      (word.kind === WordKind.Team1 && player.team === Team.Team1) ||
      (word.kind === WordKind.Team2 && player.team === Team.Team2)
    ) {
      teamRes.wordsLeft--;
    } else if (word.kind === WordKind.Assassin) {
      teamRes.isAssassinated = true;
    } else if (word.kind !== WordKind.Neutral) {
      teamRes.wordsLeft--;
    }

    return <TurnResultData>{
      team: player.team,
      lastRevealedWord: word,
    };
  }

  getRevealedWordVals(): string[] {
    const revealed: string[] = [];
    for (let i = 0; i < this.wordSet.length; i++) {
      const w = this.wordSet[i];
      if (w.isRevealed) {
        revealed.push(w.word);
      }
    }
    return revealed;
  }
}
