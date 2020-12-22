import {Component, Input, OnInit} from '@angular/core';
import {User} from '../../../entity/User';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {UserService} from '../../../services/user.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.less']
})
export class ChangePasswordComponent implements OnInit {

  @Input() user: User;
  form: FormGroup;
  showError: boolean;
  errorMessage: string;
  currentUser: User;

  constructor(
    public activeModal: NgbActiveModal,
    private readonly formBuilder: FormBuilder,
    private readonly userService: UserService,
    private toastService: ToastrService
  ) {
    this.currentUser = userService.currentUserValue;
  }

  ngOnInit(): void {
    this.createForm();
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      oldPassword: ['', [Validators.required, Validators.maxLength(255), Validators.minLength(5)]],
      newPassword: ['', [Validators.required, Validators.maxLength(255), Validators.minLength(5)]],
      newPasswordRepeat: ['', [Validators.required, Validators.maxLength(255), Validators.minLength(5)]]
    });
  }

  public save(): void {
    if (this.form.get('newPasswordRepeat').value === this.form.get('newPassword').value) {
      this.userService.updatePassword(
        this.currentUser.username,
        this.form.get('oldPassword').value,
        this.form.get('newPassword').value).subscribe((f) => {
          this.activeModal.close('ok');
          this.toastService.success('Password changed!');
        }, (e) => {
        this.errorMessage = e.error.split('<!--').pop().split(' (500 Internal Server Error) -->');
        this.errorMessage = this.errorMessage.slice(0, -1);
        this.toastService.error(this.errorMessage);
        this.activeModal.close(null);
      });
    } else {
      this.errorMessage = 'Passwords doesn\'t match!';
      this.toastService.error(this.errorMessage);
      this.activeModal.close(null);
    }
  }

}
