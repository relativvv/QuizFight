import {AfterViewInit, Component, ElementRef} from '@angular/core';
import {Router, RouterEvent, RouteConfigLoadEnd, RouteConfigLoadStart} from '@angular/router';
import {UserService} from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements AfterViewInit {
  title = 'frontend';
  loading: boolean;

  constructor(private readonly elementRef: ElementRef,
              private readonly router: Router,
              public readonly userService: UserService) {
    this.loading = false;

    router.events.subscribe((event: RouterEvent) => {
      if (event instanceof RouteConfigLoadStart) {
        this.loading = true;
      } else if (event instanceof RouteConfigLoadEnd) {
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.background = '#3e3e3e';
  }
}
