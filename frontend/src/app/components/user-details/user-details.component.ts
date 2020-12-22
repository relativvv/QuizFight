import { Component, OnInit } from '@angular/core';
import {UserService} from '../../services/user.service';
import {User} from '../../entity/User';
import {FormBuilder, FormGroup} from '@angular/forms';
import {finalize} from 'rxjs/operators';
import {Title} from '@angular/platform-browser';
import {ToastrService} from 'ngx-toastr';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {UserDetailsEditModalComponent} from '../modals/user-details-edit-modal/user-details-edit-modal.component';
import {ChangePasswordComponent} from '../modals/change-password/change-password.component';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.less']
})
export class UserDetailsComponent implements OnInit {

  currentUser: User;
  form: FormGroup;
  imageSrc: string;
  selectedFile: any;
  selectedFileBase64: string;
  loading: boolean;
  rank: number;

  constructor(
    public readonly userService: UserService,
    private readonly titleService: Title,
    private readonly toastService: ToastrService,
    private readonly modalService: NgbModal) {
    this.currentUser = userService.currentUserValue;
    if (this.currentUser != null) {
      this.loading = true;
      this.userService.getUserImage(this.currentUser.username).pipe(
        finalize(() => this.loading = false)
      ).subscribe((e) => {
        this.imageSrc = e.toString();
      });
    }
  }

  ngOnInit(): void {
    this.titleService.setTitle('QuizFight - Userdetails');
    this.userService.getRank(this.currentUser.id).subscribe((ans) => {
      this.rank = ans;
    });
  }

  public picked(event): void {
    const file: File = event.target.files[0];
    this.selectedFile = file;
    this.handleInputChange(file);
  }

  handleInputChange(files): void {
    const file = files;
    const pattern = /image-*/;
    const reader = new FileReader();

    if (!file.type.match(pattern)) {
      this.toastService.error('The file has an invalid format');
      this.selectedFile = null;
      (document.getElementById('picture') as HTMLInputElement).value = null;
      return;
    }
    reader.onloadend = this._handleReaderLoaded.bind(this);
    reader.readAsDataURL(file);
  }

  _handleReaderLoaded(e): void {
    const reader = e.target;
    this.selectedFileBase64 = 'data:image/png;base64,' + reader.result.substr(reader.result.indexOf(',') + 1);
  }

  public submitImage(): void {
    this.userService.uploadProfilePicture(this.selectedFileBase64).subscribe();
    this.imageSrc = this.selectedFileBase64;
    this.toastService.success('Profile picture changed!');
    (document.getElementById('picture') as HTMLInputElement).value = null;
  }

  public deleteUser(): void {
    if (confirm('Are you sure, you want to delete this User?')) {
      this.userService.deleteUser(this.currentUser.id).subscribe(() => {
        this.userService.logout();
        this.toastService.success('User deleted');
      }, () => {
        this.toastService.error('An error ocurred');
      });
    }
  }

  openEditingModal(user: User): void {
    const modalRef = this.modalService.open(UserDetailsEditModalComponent);
    modalRef.componentInstance.user = user;
    modalRef.closed.subscribe(() => {
      this.currentUser = this.userService.currentUserValue;
    });
  }

  openPasswordChangeModal(user: User): void {
    const modalRef = this.modalService.open(ChangePasswordComponent);
    modalRef.componentInstance.user = user;
    modalRef.closed.subscribe(() => {
      this.currentUser = this.userService.currentUserValue;
    });
  }
}
