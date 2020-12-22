import {Component, Input, OnInit} from '@angular/core';
import {User} from '../../../entity/User';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {UserService} from '../../../services/user.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-user-details-edit-modal',
  templateUrl: './user-details-edit-modal.component.html',
  styleUrls: ['./user-details-edit-modal.component.less']
})
export class UserDetailsEditModalComponent implements OnInit {

  @Input() user: User;
  form: FormGroup;

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
      email: [this.user.email, [Validators.required, Validators.email, Validators.maxLength(255)]],
    });
  }

  save(): void {
    this.userService.updateUser(
      this.user.username,
      this.form.get('email').value,
      this.user.money,
      this.user.allTimeCorrect,
      this.user.gamesPlayed,
      this.user.gamesWon).subscribe(() => {
      this.toastService.success('Successfully saved!');
      this.activeModal.close('ok');
    }, (e) => {
      this.activeModal.close(null);
      this.toastService.error(e.error.split('<!--').pop().split(' (500 Internal Server Error) -->').slice(0, -1));
    });
  }

}
