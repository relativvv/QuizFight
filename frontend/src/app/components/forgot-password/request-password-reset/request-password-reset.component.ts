import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../../services/user.service';
import {Title} from '@angular/platform-browser';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-request-password-reset',
  templateUrl: './request-password-reset.component.html',
  styleUrls: ['./request-password-reset.component.less']
})
export class RequestPasswordResetComponent implements OnInit {

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly userService: UserService,
    private readonly titleService: Title,
    private readonly toastService: ToastrService,
    private readonly router: Router
  ) { }

  public form: FormGroup;
  public loading: boolean;

  ngOnInit(): void {
    this.createForm();
    this.titleService.setTitle('QuizFight - Reset password');
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    });
  }

  requestReset(): void {
    this.loading = true;
    this.userService.sendResetMail(this.form.get('email').value).pipe(
      finalize(() => { this.loading = false; })
    ).subscribe(() => {
      this.router.navigate(['/resetpassword']);
      this.toastService.success('Mail sent, check your inbox!');
      this.loading = false;
    }, () => {
      this.toastService.error('An error ocurred');
      this.loading = false;
    });
  }

}
