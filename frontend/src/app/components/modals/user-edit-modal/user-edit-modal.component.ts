import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {User} from '../../../entity/User';
import {UserService} from '../../../services/user.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-user-edit-modal',
  templateUrl: './user-edit-modal.component.html',
  styleUrls: ['./user-edit-modal.component.less']
})
export class UserEditModalComponent implements OnInit {

  @Input() user: User;
  form: FormGroup;
  showError: boolean;
  errorMessage: string;

  constructor(
    public activeModal: NgbActiveModal,
    private readonly formBuilder: FormBuilder,
    private readonly userService: UserService,
    private toastService: ToastrService
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      username: [this.user.username, [Validators.required, Validators.minLength(3), Validators.maxLength(16)]],
      email: [this.user.email, [Validators.required, Validators.email, Validators.maxLength(255)]],
      money: [this.user.money, [Validators.required, Validators.min(0), Validators.max(99999)]],
      allTimeCorrect: [this.user.allTimeCorrect, [Validators.required, Validators.min(0), Validators.max(99999)]],
      gamesPlayed: [this.user.gamesPlayed, [Validators.required, Validators.min(0), Validators.max(99999)]],
      gamesWon: [this.user.gamesWon, [Validators.required, Validators.min(0), Validators.max(99999)]]
    });
  }

  save(): void {
    this.userService.updateUser(
      this.form.get('username').value,
      this.form.get('email').value,
      this.form.get('money').value,
      this.form.get('allTimeCorrect').value,
      this.form.get('gamesPlayed').value,
      this.form.get('gamesWon').value).subscribe(() => {
        this.toastService.success('Successfully saved!');
        this.activeModal.close('ok');
    }, () => { this.toastService.error('An error ocurred!'); });
  }
}
