import {AfterViewInit, Component, ElementRef} from '@angular/core';
import {Router, RouterEvent, RouteConfigLoadEnd, RouteConfigLoadStart} from '@angular/router';
import {UserService} from './services/user.service';
import {finalize} from 'rxjs/operators';
import {User} from './entity/User';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements AfterViewInit {
  title = 'QuizFight';
  loading: boolean;
  currentUser: User;
  imageSrc = '../assets/default_profile_picture.png';
  money = 0;

  constructor(private readonly elementRef: ElementRef,
              private readonly router: Router,
              public readonly userService: UserService) {
    this.loading = false;
    this.currentUser = userService.currentUserValue;
    if (this.currentUser != null) {
      this.loading = true;
      this.money = this.getMoney(this.currentUser.username);
      this.userService.getUserImage(this.currentUser.username).pipe(
        finalize(() => this.loading = false)
      ).subscribe((e) => {
        this.imageSrc = e.toString();
      }, () => this.imageSrc = '../assets/default_profile_picture.png');
    }

    router.events.subscribe((event: RouterEvent) => {
      if (event instanceof RouteConfigLoadStart) {
        this.loading = true;
      } else if (event instanceof RouteConfigLoadEnd) {
        this.loading = false;
      }
    });
  }

  getMoney(username: string): number {
    this.userService.getMoney(username).subscribe((result) => {
      this.money = result;
    });
    return -1;
  }

  ngAfterViewInit(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.background = '#3e3e3e';
  }
}
