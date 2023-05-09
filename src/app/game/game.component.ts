import { Component, inject } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  doc,
  docData,
  getFirestore,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent {
  pickCardAnimation = false;
  currentCard: string = '';
  game: Game;
  games$: Observable<any[]>; // prüfen wofür!
  games: Array<any>; // prüfen wofür!
  gameId: string;

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    public dialog: MatDialog
  ) {
    const itemCollection = collection(this.firestore, 'games');
    this.games$ = collectionData(itemCollection);
  }

  ngOnInit(): void {
    this.newGame();
    this.route.params.subscribe((params) => {
      console.log(params['id']);
      this.gameId = params['id'];

      this.loadGame(this.gameId);
    });
  }

  loadGame(gameId) {
    const gameRef: any = doc(this.firestore, 'games', gameId);
    this.games$ = docData(gameRef);
    this.games$.subscribe((game: any) => {
      console.log('mein Spiel', game);
      this.game.currentPlayer = game.currentPlayer;
      this.game.playedCards = game.playedCards;
      this.game.players = game.players;
      this.game.stack = game.stack;
      this.game.pickCardAnimation = game.pickCardAnimation;
      this.game.currentCard = game.currentCard;
    });
  }

  newGame() {
    this.game = new Game();
    // const gamesCollection = collection(this.firestore, 'games');
    // addDoc(gamesCollection, this.game.toJson());
  }

  takeCard() {
    if (this.game.stack.length == 0) {
      alert('game over');
    } else if (!this.pickCardAnimation) {
      this.game.currentCard = this.game.stack.pop();
      this.game.pickCardAnimation = true;

      this.game.currentPlayer++;
      this.game.currentPlayer =
        this.game.currentPlayer % this.game.players.length;
      // this.saveGame();

      setTimeout(() => {
        this.game.playedCards.push(this.game.currentCard);
        this.game.pickCardAnimation = false;
        this.saveGame();
      }, 1000);
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name && name.length > 0) {
        this.game.players.push(name);
      }
    });
  }

  saveGame() {
    const db = getFirestore();
    const docRef = doc(db, 'games', this.gameId);
    console.log('save game: ' + this.game.toJson());

    updateDoc(docRef, this.game.toJson()).then((res) => {
      console.log('Speichern erfolgreich! ', res);
    });
  }
}
