import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../services/user.service';
import {Title} from '@angular/platform-browser';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {

  public loading: boolean;
  public errorMessage: string;
  public form: FormGroup;

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly userService: UserService,
    private readonly titleService: Title,
    private readonly toastService: ToastrService
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.titleService.setTitle('QuizFight - Login');
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(16)]],
      password: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]]
    });
  }

  login(): void {
    if (this.form.valid) {
      const username = this.form.get('username').value;
      const password = this.form.get('password').value;
      this.loading = true;
      this.userService.loginUser(username, password).subscribe(() => {
        window.location.href = '/';
        this.toastService.success('Successfully logged in!');
      }, (e) => {
         this.loading = false;
         this.errorMessage = e.error.split('<!--').pop().split(' (500 Internal Server Error) -->');
         this.errorMessage = this.errorMessage.slice(0, -1); console.log(e);
         this.toastService.error(this.errorMessage);
      });
    }
  }
}
