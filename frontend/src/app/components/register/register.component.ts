import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.less']
})
export class RegisterComponent implements OnInit {

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
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(16)]],
      password: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]]
    });
  }

  login(): void {}
}
