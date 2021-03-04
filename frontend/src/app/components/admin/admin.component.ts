import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {User} from '../../entity/User';
import {UserService} from '../../services/user.service';
import {Title} from '@angular/platform-browser';
import {MatPaginator} from '@angular/material/paginator';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {UserEditModalComponent} from '../modals/user-edit-modal/user-edit-modal.component';
import {ToastrService} from 'ngx-toastr';
import {finalize} from 'rxjs/operators';
import {Game} from "../../entity/Game";
import {GameService} from "../../services/game.service";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.less']
})
export class AdminComponent implements OnInit {

  users: User[];
  userList: User[];
  currentUser: User;
  isAdmin: boolean;
  loading = true;
  currentGames: Game[];
  @ViewChild('adminPaginator', {static: false}) adminPaginator: MatPaginator;
  public adminStartIndex;
  public adminEndIndex;


  constructor(
    private readonly title: Title,
    private readonly userService: UserService,
    private readonly modalService: NgbModal,
    private readonly toastService: ToastrService,
    private readonly gameService: GameService
  ) {
    this.currentUser = userService.currentUserValue;
    this.getUsers();
    this.title.setTitle('QuizFight - Administration');
    this.adminStartIndex = 0;
    this.adminEndIndex = 20;
    this.getIsAdmin();
    this.getAllGames();
  }

  ngOnInit(): void {}

  getAllGames(): void {
    this.gameService.getAllGames().subscribe((result) => {
      this.currentGames = result;
    });
  }

  getUsers(): void {
    this.userService.getAllUser(this.currentUser).subscribe((result) => {
      this.users = result;
    });
  }

  public pageChange(event): void {
    this.adminStartIndex = event.pageIndex * event.pageSize;
    this.adminEndIndex = this.adminStartIndex + event.pageSize;
    if (this.adminEndIndex > this.users.length) {
      this.adminEndIndex = this.users.length;
    }
  }

  openEditingModal(user: User): void {
    const modalRef = this.modalService.open(UserEditModalComponent);
    modalRef.componentInstance.user = user;
    modalRef.closed.subscribe(() => {
      this.users = null;
      this.getUsers();
    });
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure, you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe(() => {
        this.toastService.success('User successfully deleted!');
        this.users = null;
        this.getUsers();
      }, () => { this.toastService.error('An error ocurred!'); });
    }
  }

  deleteGame(id: number): void {
    if (confirm('Are you sure, you want to delete this game?')) {
      this.gameService.deleteGame(id).subscribe();
      this.toastService.success('Game successfully deleted!');
      this.currentGames = null;
      this.getAllGames();
    }
  }

  getIsAdmin(): boolean {
    this.loading = true;
    this.userService.isAdmin(this.currentUser).pipe(
      finalize(() => { this.loading = false; })
    ).subscribe((result) => {
      this.isAdmin = result;
    });
    return this.isAdmin;
  }
}
