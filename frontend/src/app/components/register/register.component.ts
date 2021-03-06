import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../services/user.service';
import {User} from '../../entity/User';
import {Title} from '@angular/platform-browser';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.less']
})
export class RegisterComponent implements OnInit {

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly userService: UserService,
    private readonly titleService: Title,
    private readonly toastService: ToastrService
  ) { }

  public form: FormGroup;
  public errorMessage: string;
  private user: User;
  public loading: boolean;

  ngOnInit(): void {
    this.createForm();
    this.titleService.setTitle('QuizFight - Register');
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(16)]],
      password: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]]
    });
  }

  register(): void {
    if (this.form.valid) {
      if (this.form.get('password').value === this.form.get('confirmPassword').value) {
        this.user = {
          isAdmin: false,
          username: this.form.get('username').value,
          email: this.form.get('email').value,
          password: this.form.get('password').value,
          image: '../../../assets/default_profile_picture.png',
          money: 0,
          allTimeCorrect: 0,
          gamesPlayed: 0,
          gamesWon: 0,
          resetToken: null
        };

        this.loading = true;
        this.userService.registerUser(this.user).subscribe((result) => {
          this.user = result;
          localStorage.setItem('currentUser', JSON.stringify(this.user));
          window.location.href = '/';
          this.userService.currentUserObject.next(this.user);
          this.toastService.success('Successfully registered!');
        }, (e) => {
          this.loading = false;
          this.errorMessage = e.error.split('<!--').pop().split(' (500 Internal Server Error) -->');
          this.errorMessage = this.errorMessage.slice(0, -1);
          this.toastService.error(this.errorMessage);
        });
      } else {
        this.loading = false;
        this.errorMessage = 'Passwords doesn\'t match!';
        this.toastService.error(this.errorMessage);
      }
    }
  }
}
