import { Component, OnInit } from '@angular/core';
import {UserService} from '../../services/user.service';
import {User} from '../../entity/User';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {finalize} from 'rxjs/operators';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.less']
})
export class UserDetailsComponent implements OnInit {

  currentUser: User;
  errorMessage: string;
  showError = false;
  showSuccess = false;
  form: FormGroup;
  imageSrc: string;
  selectedFile: any;
  selectedFileBase64: string;
  loading: boolean;
  money: number;

  constructor(public readonly userService: UserService, private readonly titleService: Title, private readonly formBuilder: FormBuilder) {
    this.currentUser = userService.currentUserValue;
    if (this.currentUser != null) {
      this.loading = true;
      this.money = this.getMoney(this.currentUser.username);
      this.userService.getUserImage(this.currentUser.username).pipe(
        finalize(() => this.loading = false)
      ).subscribe((e) => {
        this.imageSrc = e.toString();
      });
    }
  }

  ngOnInit(): void {
    this.titleService.setTitle('QuizFight - Userdetails');
    this.createForm();
    this.registerChanges();
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
      alert('invalid format');
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
    alert('Profile picture changed!');
    (document.getElementById('picture') as HTMLInputElement).value = null;
    location.reload();
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      oldPassword: ['', [Validators.required, Validators.maxLength(255), Validators.minLength(5)]],
      newPassword: ['', [Validators.required, Validators.maxLength(255), Validators.minLength(5)]],
      newPasswordRepeat: ['', [Validators.required, Validators.maxLength(255), Validators.minLength(5)]]
    });
  }

  public changePw(): void {
    if (this.form.get('newPasswordRepeat').value === this.form.get('newPassword').value) {
      this.userService.updatePassword(
        this.currentUser.username,
        this.form.get('oldPassword').value,
        this.form.get('newPassword').value).subscribe((f) => {
        console.log(f);
        this.showSuccess = true;
      }, (e) => { this.showError = true; this.errorMessage = e.error.split('<!--').pop().split(' (500 Internal Server Error) -->');
                  this.errorMessage = this.errorMessage.slice(0, -1); console.log(e); });
      this.form.reset();
    } else {
      this.showError = true;
      this.errorMessage = 'Passwords doesn\'t match!';
    }
  }

  getMoney(username: string): number {
    this.loading = true;
    this.userService.getMoney(username).pipe(
    ).subscribe((result) => {
      this.money = result;
      this.loading = false;
    });
    return -1;
  }

  public registerChanges(): void {
    this.form.valueChanges.subscribe((e) => {
      this.showSuccess = false;
      this.showError = false;
    });
  }

  changePassword(): void {

  }

  uploadImage(): void {

  }
}
