import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly userService: UserService
  ) { }

  public form: FormGroup;

  ngOnInit(): void {
    this.createForm();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(16)]],
      password: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]]
    });
  }

  formHasError(): boolean {
    return this.form.get('username').invalid || this.form.get('password').invalid;
  }

  login(): void {}

}
