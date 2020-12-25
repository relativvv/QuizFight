import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../../services/user.service';
import {Title} from '@angular/platform-browser';
import {ToastrService} from 'ngx-toastr';
import {Router} from "@angular/router";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.less']
})
export class ResetPasswordComponent implements OnInit {

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
      token: ['', [Validators.required, Validators.minLength(25), Validators.maxLength(25)]],
      password: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]]
    });
  }

  requestReset(): void {
    if (this.form.get('password').value !== this.form.get('confirmPassword').value) {
      this.toastService.error('Passwords doesn\'t match!');
      return;
    }

    this.userService.resetPassword(this.form.get('token').value, this.form.get('password').value).subscribe(() => {
      this.router.navigate(['/login']);
      this.toastService.success('Success, you can now login!');
    }, () => { this.toastService.error('An error ocurred!'); });
  }

}
